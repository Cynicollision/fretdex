/**
 * The scheduler everything that keeps time runs on: scale runs (AUD-3), progression loops (AUD-5), the click and
 * count-in (AUD-1.5) and the metronome (MET). A timer wakes it every `interval` and it hands over each event due in
 * the next `lookahead`, with its time on the audio clock, to be played at exactly that time. An event's time is
 * worked out from the beat it falls on, never by adding up gaps, so a loop doesn't drift however long it plays
 * (AUD-5.2, MET-1.6).
 */

/** What the scheduler reads the time from: an `AudioContext`, in seconds. */
export interface Clock {
    readonly currentTime: number;
}

/** What wakes the scheduler: `setInterval` and `clearInterval` by default. */
export interface Timer {
    start(tick: () => void, ms: number): unknown;
    stop(handle: unknown): void;
}

/** Something that happens on a beat: `beat` counts from 0 at the track's start, in beats (a quarter note at 4/4). */
export interface TrackEvent<E> {
    readonly beat: number;
    readonly event: E;
}

/** What to play: events in order of their beat, over `length` beats, played once or looped. */
export interface Track<E> {
    readonly events: readonly TrackEvent<E>[];
    readonly length: number;
    readonly loop: boolean;
}

export interface PlayOptions<E> {
    /** Beats per minute. */
    readonly bpm: number;
    /** Called for each event, ahead of `time` (on the audio clock), which is when it should sound. */
    readonly onevent: (event: E, time: number) => void;
    /** Called once a track that doesn't loop has handed over its last event and its length has passed. */
    readonly onend?: () => void;
    /** When the first beat falls, on the audio clock; a short way after now by default. */
    readonly at?: number;
}

export interface Playback {
    /** Changes the tempo from the next event on, without a jump in the beat. */
    setTempo(bpm: number): void;
    /** Stops handing over events. Events already handed over are the caller's to cancel. */
    stop(): void;
    readonly playing: boolean;
}

export interface SchedulerOptions {
    /** How far ahead events are handed over, in seconds. */
    readonly lookahead?: number;
    /** How often the scheduler wakes, in milliseconds. */
    readonly interval?: number;
    /** An event this late, in seconds, is skipped rather than played late, as after the tab was asleep. */
    readonly late?: number;
    readonly timer?: Timer;
}

/** How long after now a track's first beat falls by default, so it isn't already late. */
const START_DELAY = 0.05;

const INTERVAL_TIMER: Timer = {
    start: (tick, ms) => setInterval(tick, ms),
    stop: handle => clearInterval(handle as ReturnType<typeof setInterval>)
};

interface Running {
    readonly track: Track<unknown>;
    readonly options: PlayOptions<unknown>;
    /** The tempo's anchor: the beat, and its time, from which later beats are worked out. */
    anchorBeat: number;
    anchorTime: number;
    secondsPerBeat: number;
    /** The next event to hand over: its index in the track, and which time round the loop. */
    next: number;
    round: number;
    playing: boolean;
}

export class Scheduler {
    readonly #clock: Clock;
    readonly #lookahead: number;
    readonly #interval: number;
    readonly #late: number;
    readonly #timer: Timer;
    #handle: unknown;
    #running: Running[] = [];

    constructor(clock: Clock, options: SchedulerOptions = {}) {
        this.#clock = clock;
        this.#lookahead = options.lookahead ?? 0.1;
        this.#interval = options.interval ?? 25;
        this.#late = options.late ?? 0.05;
        this.#timer = options.timer ?? INTERVAL_TIMER;
    }

    /** Plays a track; any already playing carry on, so the metronome can play under a run. */
    play<E>(track: Track<E>, options: PlayOptions<E>): Playback {
        checkTempo(options.bpm);
        if (!(track.length > 0)) throw new Error('A track needs a length');
        const running: Running = {
            track,
            options: options as PlayOptions<unknown>,
            anchorBeat: 0,
            anchorTime: options.at ?? this.#clock.currentTime + START_DELAY,
            secondsPerBeat: 60 / options.bpm,
            next: 0,
            round: 0,
            playing: true
        };
        this.#running.push(running);
        this.#tick();
        if (running.playing && this.#handle === undefined) {
            this.#handle = this.#timer.start(() => this.#tick(), this.#interval);
        }
        return {
            setTempo: bpm => {
                checkTempo(bpm);
                // The next event's beat keeps its time; later beats follow at the new tempo.
                const beat = nextBeat(running);
                running.anchorTime = timeOf(running, beat);
                running.anchorBeat = beat;
                running.secondsPerBeat = 60 / bpm;
            },
            stop: () => this.#finish(running, false),
            get playing() {
                return running.playing;
            }
        };
    }

    /** Hands over every event due before now plus the lookahead, for every track playing. */
    #tick(): void {
        const now = this.#clock.currentTime;
        const until = now + this.#lookahead;
        for (const running of [...this.#running]) {
            while (running.playing) {
                const beat = nextBeat(running);
                const time = timeOf(running, beat);
                if (time >= until) break;
                const event = running.track.events[running.next];
                if (event === undefined) {
                    // Past the last event: a loop goes round again, and a track that doesn't ends with its length.
                    if (running.track.loop && running.track.events.length > 0) {
                        running.round += 1;
                        running.next = 0;
                        continue;
                    }
                    if (time <= now) this.#finish(running, true);
                    break;
                }
                running.next += 1;
                if (time >= now - this.#late) running.options.onevent(event.event, Math.max(time, now));
            }
        }
    }

    #finish(running: Running, ended: boolean): void {
        if (!running.playing) return;
        running.playing = false;
        this.#running = this.#running.filter(other => other !== running);
        if (this.#running.length === 0 && this.#handle !== undefined) {
            this.#timer.stop(this.#handle);
            this.#handle = undefined;
        }
        if (ended) running.options.onend?.();
    }
}

/** The beat of the next event to hand over, counted from the track's start across loops; its end when past the last. */
function nextBeat(running: Running): number {
    const event = running.track.events[running.next];
    return running.round * running.track.length + (event?.beat ?? running.track.length);
}

function timeOf(running: Running, beat: number): number {
    return running.anchorTime + (beat - running.anchorBeat) * running.secondsPerBeat;
}

function checkTempo(bpm: number): void {
    if (!(bpm > 0) || !Number.isFinite(bpm)) throw new Error(`No tempo of ${String(bpm)} bpm`);
}
