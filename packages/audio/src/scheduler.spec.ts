import { describe, expect, it } from 'vitest';
import { Scheduler, type Timer, type Track } from './scheduler';

/** A clock and timer the test moves by hand: each `advance` steps the time and wakes the scheduler as a timer would. */
function fakeTime() {
    let now = 0;
    let tick: (() => void) | undefined;
    let interval = 0;
    const timer: Timer = {
        start: (callback, ms) => {
            tick = callback;
            interval = ms;
            return 1;
        },
        stop: () => {
            tick = undefined;
        }
    };
    return {
        clock: {
            get currentTime() {
                return now;
            }
        },
        timer,
        /** Moves the clock on by `seconds`, waking the scheduler at its interval. */
        advance(seconds: number) {
            const end = now + seconds;
            while (now < end - 1e-12) {
                now = Math.min(end, now + interval / 1000);
                tick?.();
            }
        },
        /** Moves the clock on without waking the scheduler, as when a tab sleeps. */
        jump(seconds: number) {
            now += seconds;
        },
        get waking() {
            return tick !== undefined;
        }
    };
}

/** Eighth notes up an octave and back, as a scale run plays (AUD-3.1). */
const RUN: Track<string> = {
    events: ['C', 'D', 'E', 'F', 'G', 'A', 'B', 'C'].map((event, i) => ({ beat: i / 2, event })),
    length: 4,
    loop: false
};

const BAR: Track<number> = { events: [0, 1, 2, 3].map(beat => ({ beat, event: beat })), length: 4, loop: true };

describe('Scheduler', () => {
    it('hands over each event ahead of time with its time on the audio clock', () => {
        const time = fakeTime();
        const scheduler = new Scheduler(time.clock, { timer: time.timer, lookahead: 0.1 });
        const heard: [string, number, number][] = [];
        let ended = false;
        scheduler.play(RUN, {
            bpm: 120,
            at: 1,
            onevent: (event, at) => heard.push([event, at, time.clock.currentTime]),
            onend: () => (ended = true)
        });

        time.advance(4);

        expect(heard.map(([event]) => event)).toEqual(['C', 'D', 'E', 'F', 'G', 'A', 'B', 'C']);
        // At 120 bpm an eighth note is a quarter of a second.
        heard.forEach(([, at], i) => expect(at).toBeCloseTo(1 + i * 0.25, 9));
        // Each was handed over before it was due, and no more than the lookahead and an interval ahead.
        for (const [, at, handedAt] of heard) {
            expect(handedAt).toBeLessThan(at);
            expect(at - handedAt).toBeLessThanOrEqual(0.1 + 0.025 + 1e-9);
        }
        expect(ended).toBe(true);
        expect(time.waking).toBe(false);
    });

    it('AUD-5.2 and MET-1.6 keep a loop on the beat for ten minutes, with no drift', () => {
        const time = fakeTime();
        const scheduler = new Scheduler(time.clock, { timer: time.timer });
        const times: number[] = [];
        scheduler.play(BAR, { bpm: 97, at: 0.5, onevent: (_, at) => times.push(at) });

        time.advance(600);

        const beats = Math.floor(((600 - 0.5) * 97) / 60);
        expect(times.length).toBeGreaterThanOrEqual(beats);
        times.forEach((at, beat) => expect(at).toBeCloseTo(0.5 + (beat * 60) / 97, 9));
    });

    it('AUD-1.6 changes tempo from the next beat without a jump', () => {
        const time = fakeTime();
        const scheduler = new Scheduler(time.clock, { timer: time.timer, lookahead: 0.1 });
        const times: number[] = [];
        const playback = scheduler.play(BAR, { bpm: 60, at: 0, onevent: (_, at) => times.push(at) });

        time.advance(2.5);
        // Beats 0, 1 and 2 have been handed over at 60 bpm.
        expect(times).toEqual([0, 1, 2]);
        playback.setTempo(120);
        time.advance(2);

        expect(times.slice(0, 6)).toEqual([0, 1, 2, 3, 3.5, 4]);
    });

    it('stops handing over events when stopped, and plays two tracks at once', () => {
        const time = fakeTime();
        const scheduler = new Scheduler(time.clock, { timer: time.timer });
        const run: string[] = [];
        const click: number[] = [];
        const metronome = scheduler.play(BAR, { bpm: 60, at: 0, onevent: event => click.push(event) });
        const playback = scheduler.play(RUN, { bpm: 60, at: 0, onevent: event => run.push(event) });

        time.advance(1.2);
        playback.stop();
        time.advance(3);

        expect(playback.playing).toBe(false);
        expect(run).toEqual(['C', 'D', 'E']);
        expect(click).toEqual([0, 1, 2, 3, 0]);
        expect(time.waking).toBe(true);
        metronome.stop();
        expect(time.waking).toBe(false);
    });

    it('skips events it wakes too late for, rather than playing them in a burst', () => {
        const time = fakeTime();
        const scheduler = new Scheduler(time.clock, { timer: time.timer });
        const times: number[] = [];
        scheduler.play(BAR, { bpm: 60, at: 0, onevent: (_, at) => times.push(at) });

        time.advance(0.5);
        // The tab sleeps for three seconds, with no timer, then wakes.
        time.jump(3);
        time.advance(0.6);

        expect(times).toEqual([0, 4]);
    });

    it('refuses a tempo that is not positive', () => {
        const time = fakeTime();
        const scheduler = new Scheduler(time.clock, { timer: time.timer });
        expect(() => scheduler.play(BAR, { bpm: 0, onevent: () => {} })).toThrow();
    });
});
