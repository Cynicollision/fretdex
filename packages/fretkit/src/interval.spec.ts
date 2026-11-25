import { describe, expect, it } from 'vitest';
import { intervalLabel, intervalName, intervalSemitones } from './interval';

describe('intervalName', () => {
    it('THY-1.4 names an interval by its spelling', () => {
        expect(intervalName('3m')).toBe('b3');
        expect(intervalName('2A')).toBe('#2');
        expect(intervalSemitones('2A')).toBe(intervalSemitones('3m'));
        expect(intervalName('4A')).toBe('#4');
        expect(intervalName('5d')).toBe('b5');
        expect(intervalName('7d')).toBe('bb7');
        expect(intervalName('1P')).toBe('1');
        expect(intervalName('7M')).toBe('7');
    });

    it('names compound intervals by their number', () => {
        expect(intervalName('9m')).toBe('b9');
        expect(intervalName('9A')).toBe('#9');
        expect(intervalName('11A')).toBe('#11');
        expect(intervalName('13m')).toBe('b13');
    });

    it('refuses what is not a rising interval', () => {
        for (const read of [intervalName, intervalLabel, intervalSemitones]) {
            expect(() => read('3P'), read.name).toThrow();
            expect(() => read('-3m'), read.name).toThrow();
            expect(() => read(''), read.name).toThrow();
        }
    });
});

describe('intervalLabel', () => {
    it('THY-1.5 shows accidentals as ♯ ♭ 𝄪 𝄫', () => {
        expect(intervalLabel('3m')).toBe('♭3');
        expect(intervalLabel('4A')).toBe('♯4');
        expect(intervalLabel('7d')).toBe('𝄫7');
        expect(intervalLabel('5P')).toBe('5');
    });
});
