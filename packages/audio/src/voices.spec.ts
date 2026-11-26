import { describe, expect, it } from 'vitest';
import { midiToFrequency } from './pitch';
import { NOTE_SECONDS, PEAK, VOICES, renderNote, type Voice } from './voices';

const RATES = [44100, 48000];

/** The fundamental of a stretch of samples, by autocorrelation with a parabola fitted round the best lag. */
function pitchOf(samples: Float32Array, sampleRate: number, near: number): number {
    const from = Math.floor(0.15 * sampleRate);
    const window = Math.min(samples.length - from - sampleRate / 20, Math.floor(0.25 * sampleRate));
    // Normalized, so the note's decay over the window doesn't pull the peak toward shorter lags.
    const correlate = (lag: number) => {
        let sum = 0;
        let a = 0;
        let b = 0;
        for (let i = from; i < from + window; i++) {
            const x = samples[i] ?? 0;
            const y = samples[i + lag] ?? 0;
            sum += x * y;
            a += x * x;
            b += y * y;
        }
        return sum / Math.sqrt(a * b);
    };
    // Search a little either side of the expected period, so an octave error shows as a wrong answer.
    const expected = sampleRate / near;
    let best = 0;
    let bestValue = -Infinity;
    for (let lag = Math.floor(expected * 0.9); lag <= Math.ceil(expected * 1.1); lag++) {
        const value = correlate(lag);
        if (value > bestValue) {
            bestValue = value;
            best = lag;
        }
    }
    const before = correlate(best - 1);
    const after = correlate(best + 1);
    const shift = (0.5 * (before - after)) / (before - 2 * bestValue + after);
    return sampleRate / (best + shift);
}

function cents(actual: number, expected: number): number {
    return 1200 * Math.log2(actual / expected);
}

function peak(samples: Float32Array, from = 0, to = samples.length): number {
    let max = 0;
    for (let i = from; i < to; i++) max = Math.max(max, Math.abs(samples[i] ?? 0));
    return max;
}

// Guitar from its low E (E2) to the 24th fret of its high E (E6); bass from E1 to its 24th fret on G (G4); the
// keyboard's two octaves from C3, and beyond.
const RANGES: Record<Voice, number[]> = {
    guitar: [40, 45, 52, 59, 64, 71, 76, 88],
    bass: [28, 33, 38, 43, 55, 67],
    piano: [48, 60, 69, 72, 84]
};

describe('renderNote', () => {
    for (const voice of VOICES) {
        it(`AUD-7.1 and THY-4.1 sound ${voice} notes at their pitch, within 2 cents`, () => {
            for (const rate of RATES) {
                for (const midi of RANGES[voice]) {
                    const frequency = midiToFrequency(midi);
                    const samples = renderNote(voice, midi, rate);
                    expect(
                        Math.abs(cents(pitchOf(samples, rate, frequency), frequency)),
                        `${voice} ${midi} at ${rate}`
                    ).toBeLessThan(2);
                }
            }
        });

        it(`AUD-7.1 renders a ${voice} note that peaks at PEAK, decays, and ends in silence`, () => {
            const rate = 48000;
            for (const midi of RANGES[voice]) {
                const samples = renderNote(voice, midi, rate);
                expect(samples.length).toBe(Math.round(NOTE_SECONDS[voice] * rate));
                expect(samples.every(Number.isFinite)).toBe(true);
                expect(peak(samples)).toBeCloseTo(PEAK, 5);
                // Quieter in its last half second than its first.
                const second = rate / 2;
                expect(peak(samples, samples.length - second)).toBeLessThan(peak(samples, 0, second) * 0.6);
                expect(Math.abs(samples.at(-1) ?? 1)).toBe(0);
            }
        });
    }

    it('AUD-7.1 plays a note the same way every time', () => {
        expect(renderNote('guitar', 52, 48000)).toEqual(renderNote('guitar', 52, 48000));
    });

    it('AUD-7.1 rings a guitar low string longer than a high one', () => {
        const rate = 48000;
        const at = (samples: Float32Array, second: number) =>
            peak(samples, Math.round(second * rate), Math.round((second + 0.1) * rate));
        const low = renderNote('guitar', 40, rate);
        const high = renderNote('guitar', 76, rate);
        expect(at(low, 2) / at(low, 0.1)).toBeGreaterThan(at(high, 2) / at(high, 0.1));
    });
});
