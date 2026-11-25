import { describe, expect, it } from 'vitest';
import { INTERVALS, intervalLabel, intervalName, intervalSemitones, intervalSlug, parseIntervalSlug } from './interval';

describe('INTERVALS', () => {
    it('INT-1.1 lists unison to the octave, then the 9th, 11th and 13th, in order of size', () => {
        expect(INTERVALS.map(interval => intervalName(interval.code)).join(' ')).toBe(
            '1 b2 2 #2 b3 3 4 #4 b5 5 #5 b6 6 bb7 b7 7 8 b9 9 #9 11 #11 b13 13'
        );
        const semitones = INTERVALS.map(interval => intervalSemitones(interval.code));
        expect(semitones).toEqual([...semitones].sort((a, b) => a - b));
    });
});

describe('intervalSlug and parseIntervalSlug', () => {
    it('INT-1.2 writes sharps as s in URLs and reads every listed interval back', () => {
        expect(intervalSlug('4A')).toBe('s4');
        expect(intervalSlug('3m')).toBe('b3');
        expect(intervalSlug('7d')).toBe('bb7');
        for (const interval of INTERVALS) expect(parseIntervalSlug(intervalSlug(interval.code))).toBe(interval);
    });

    it('APP-3.4 accepts # for s', () => {
        expect(parseIntervalSlug('#4')?.code).toBe('4A');
    });

    it('APP-3.5 reads nothing it does not list', () => {
        for (const slug of ['', '3m', 'b4', 's3', '15', 'bbb7', 'x', '#']) {
            expect(parseIntervalSlug(slug), slug).toBeUndefined();
        }
    });
});

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
