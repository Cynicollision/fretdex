import { describe, expect, it } from 'vitest';
import { AudioEngine } from './engine';
import type { Track } from './scheduler';

/** Just enough of an `AudioContext` to see what the engine starts, stops and sets. */
class FakeParam {
    value = 1;
    readonly targets: [number, number][] = [];
    setTargetAtTime(value: number, at: number) {
        this.targets.push([value, at]);
        this.value = value;
    }
    cancelScheduledValues() {}
}

class FakeNode {
    connect<T>(node: T): T {
        return node;
    }
    disconnect() {}
}

class FakeGain extends FakeNode {
    readonly gain = new FakeParam();
}

class FakeSource extends FakeNode {
    buffer: { midi?: number } | null = null;
    started: number | undefined;
    stopped: number | undefined;
    onended: (() => void) | null = null;
    gain: FakeGain | undefined;
    override connect<T>(node: T): T {
        if (node instanceof FakeGain) this.gain = node;
        return node;
    }
    start(when: number) {
        this.started = when;
    }
    stop(when: number) {
        this.stopped = when;
    }
}

class FakeContext {
    currentTime = 1;
    readonly sampleRate = 8000;
    state = 'suspended';
    resumed = 0;
    readonly sources: FakeSource[] = [];
    readonly gains: FakeGain[] = [];
    readonly destination = new FakeNode();
    resume() {
        this.resumed += 1;
        this.state = 'running';
        return Promise.resolve();
    }
    createGain() {
        const gain = new FakeGain();
        this.gains.push(gain);
        return gain;
    }
    createDynamicsCompressor() {
        const param = () => new FakeParam();
        return Object.assign(new FakeNode(), {
            threshold: param(),
            knee: param(),
            ratio: param(),
            attack: param(),
            release: param()
        });
    }
    createBufferSource() {
        const source = new FakeSource();
        this.sources.push(source);
        return source;
    }
    createBuffer(_channels: number, length: number) {
        return { length, copyToChannel() {} };
    }
}

function engine() {
    const contexts: FakeContext[] = [];
    const audio = new AudioEngine({
        createContext: () => {
            const context = new FakeContext();
            contexts.push(context);
            return context as unknown as AudioContext;
        }
    });
    return { audio, contexts, context: () => contexts[0] };
}

describe('AudioEngine', () => {
    it('AUD-1.1 makes no audio context until the first sound, then starts it', () => {
        const { audio, contexts, context } = engine();
        audio.setVolume(50, false);
        expect(contexts).toHaveLength(0);
        expect(audio.started).toBe(false);

        audio.play({ midi: 40, voice: 'guitar' });

        expect(contexts).toHaveLength(1);
        expect(context()?.resumed).toBe(1);
        expect(context()?.sources[0]?.started).toBe(1);

        audio.play({ midi: 41, voice: 'guitar' });
        expect(contexts).toHaveLength(1);
    });

    it('AUD-1.2 sets the master volume, quieter toward the bottom, and mutes', () => {
        const { audio, context } = engine();
        audio.setVolume(50, false);
        audio.play({ midi: 40, voice: 'bass' });
        const master = context()?.gains[0];
        expect(master?.gain.value).toBe(0.25);

        audio.setVolume(100, false);
        expect(master?.gain.value).toBe(1);
        audio.setVolume(100, true);
        expect(master?.gain.value).toBe(0);
    });

    it('AUD-1.3 a tapped note cuts the one on its string and leaves other strings ringing', () => {
        const { audio, context } = engine();
        audio.play({ midi: 40, voice: 'guitar', channel: 'string:6' });
        audio.play({ midi: 45, voice: 'guitar', channel: 'string:5' });
        audio.play({ midi: 42, voice: 'guitar', channel: 'string:6' });

        const [low, fifth, again] = context()?.sources ?? [];
        expect(low?.stopped).toBeDefined();
        expect(low?.gain?.gain.targets.at(-1)?.[0]).toBe(0);
        expect(fifth?.stopped).toBeUndefined();
        expect(again?.stopped).toBeUndefined();
    });

    it('AUD-1.3 starting a run stops the taps, and a tap stops the run', () => {
        const { audio, context } = engine();
        const track: Track<number> = {
            events: [0, 1, 2, 3].map(beat => ({ beat: beat / 2, event: 60 + beat })),
            length: 2,
            loop: false
        };
        audio.play({ midi: 40, voice: 'guitar', channel: 'string:6' });
        const tap = context()?.sources[0];

        const run = audio.run(track, { bpm: 120, note: midi => ({ midi, voice: 'guitar' }) });

        expect(tap?.stopped).toBeDefined();
        expect(run.playing).toBe(true);
        // The first event is handed over at once, ahead of its time.
        const first = context()?.sources[1];
        expect(first?.started).toBeCloseTo(1.05, 9);

        audio.play({ midi: 52, voice: 'guitar', channel: 'string:4' });

        expect(run.playing).toBe(false);
        expect(first?.stopped).toBeDefined();
    });

    it('MET-2.2 a run played under others is neither stopped by them nor stops them', () => {
        const { audio, context } = engine();
        const click: Track<number> = { events: [{ beat: 0, event: 84 }], length: 1, loop: true };
        audio.play({ midi: 40, voice: 'guitar', channel: 'string:6' });
        const metronome = audio.run(click, { bpm: 60, under: true, note: midi => ({ midi, voice: 'piano' }) });

        audio.play({ midi: 45, voice: 'guitar', channel: 'string:5' });

        expect(context()?.sources[0]?.stopped).toBeUndefined();
        expect(metronome.playing).toBe(true);
        audio.stopAll();
        expect(metronome.playing).toBe(false);
    });
});
