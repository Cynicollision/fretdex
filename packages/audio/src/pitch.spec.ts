import { describe, expect, it } from 'vitest';
import { midiToFrequency } from './pitch';

describe('midiToFrequency', () => {
    it('THY-4.1 tunes A4 to 440 Hz', () => {
        expect(midiToFrequency(69)).toBe(440);
    });

    it('doubles the frequency each octave in equal temperament', () => {
        expect(midiToFrequency(81)).toBe(880);
        expect(midiToFrequency(57)).toBe(220);
        expect(midiToFrequency(60)).toBeCloseTo(261.626, 3);
        // The bass's low E (E1) and the guitar's low E (E2)
        expect(midiToFrequency(28)).toBeCloseTo(41.203, 3);
        expect(midiToFrequency(40)).toBeCloseTo(82.407, 3);
    });
});
