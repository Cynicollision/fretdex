// The audio engine against the browser's real Web Audio, rendered offline: the package's own tests run in Node, with
// a stand-in for the audio context. In the component project because that's the one with a browser.
import { AudioEngine, type Voice } from '@fretdex/audio';
import { describe, expect, it } from 'vitest';

const RATE = 48000;

function offline(seconds: number) {
    const context = new OfflineAudioContext({ numberOfChannels: 1, length: seconds * RATE, sampleRate: RATE });
    const engine = new AudioEngine({ createContext: () => context as unknown as AudioContext });
    return { context, engine };
}

function peak(samples: Float32Array, from = 0, to = samples.length): number {
    let max = 0;
    for (let i = from; i < to; i++) max = Math.max(max, Math.abs(samples[i] ?? 0));
    return max;
}

describe('the audio engine in a browser', () => {
    for (const voice of ['guitar', 'bass', 'piano'] satisfies Voice[]) {
        it(`AUD-7.1 plays a ${voice} note through Web Audio`, async () => {
            const { context, engine } = offline(1);
            engine.setVolume(100, false);
            engine.play({ midi: voice === 'bass' ? 33 : 57, voice });

            const samples = (await context.startRendering()).getChannelData(0);

            expect(peak(samples)).toBeGreaterThan(0.1);
        });
    }

    it('AUD-1.2 plays nothing when muted', async () => {
        const { context, engine } = offline(1);
        engine.setVolume(100, true);
        engine.play({ midi: 57, voice: 'guitar' });

        expect(peak((await context.startRendering()).getChannelData(0))).toBe(0);
    });

    it('AUD-1.3 rings six strings together without clipping', async () => {
        const { context, engine } = offline(1);
        engine.setVolume(100, false);
        [40, 47, 52, 56, 59, 64].forEach((midi, i) =>
            engine.play({ midi, voice: 'guitar', channel: `string:${String(6 - i)}` })
        );

        const samples = (await context.startRendering()).getChannelData(0);

        expect(peak(samples)).toBeGreaterThan(0.3);
        expect(peak(samples)).toBeLessThanOrEqual(1);
    });
});
