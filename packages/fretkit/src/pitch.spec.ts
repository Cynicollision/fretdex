import { describe, expect, it } from 'vitest';
import { pitchClass } from './pitch';

describe('pitchClass', () => {
    it('keeps a pitch class within the octave as it is', () => {
        expect(pitchClass(0)).toBe(0);
        expect(pitchClass(11)).toBe(11);
    });

    it('wraps semitones above and below the octave', () => {
        expect(pitchClass(12)).toBe(0);
        expect(pitchClass(40)).toBe(4);
        expect(pitchClass(-1)).toBe(11);
        expect(pitchClass(-25)).toBe(11);
    });
});
