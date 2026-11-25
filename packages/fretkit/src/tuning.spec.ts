import { describe, expect, it } from 'vitest';
import { fretMidi, openStrings, parseTuning, stringIndex, stringNumber, TUNINGS, tuningSlug } from './tuning';

const standard = ['E2', 'A2', 'D3', 'G3', 'B3', 'E4'];

describe('TUNINGS', () => {
    it('THY-3.1 lists open strings with octaves, lowest first', () => {
        expect(TUNINGS.guitar[0]?.strings).toEqual(standard);
        expect(TUNINGS.bass[0]?.strings).toEqual(['E1', 'A1', 'D2', 'G2']);
    });

    it('CTX-1.3 has the built-in tunings, every string spelled with an octave', () => {
        expect(TUNINGS.guitar.map(t => t.name)).toEqual([
            'Standard',
            'Drop D',
            'DADGAD',
            'Open G',
            'Open D',
            'Half-step down'
        ]);
        expect(TUNINGS.bass.map(t => t.name)).toEqual(['Standard', 'Drop D', 'Half-step down']);
        for (const tuning of [...TUNINGS.guitar, ...TUNINGS.bass]) {
            expect(parseTuning(tuningSlug(tuning.strings)), tuning.name).toEqual(tuning.strings);
        }
    });
});

describe('parseTuning and tuningSlug', () => {
    it('reads and writes a custom tuning as its pitches', () => {
        expect(parseTuning('D2-A2-D3-G3-A3-D4')).toEqual(['D2', 'A2', 'D3', 'G3', 'A3', 'D4']);
        expect(parseTuning('D2-A2-D3-Fs3-A3-D4')).toEqual(['D2', 'A2', 'D3', 'F#3', 'A3', 'D4']);
        expect(tuningSlug(['D2', 'A2', 'D3', 'F#3', 'A3', 'D4'])).toBe('D2-A2-D3-Fs3-A3-D4');
    });

    it('THY-3.2 takes 4 to 8 strings, each with an octave', () => {
        expect(parseTuning('B0-E1-A1-D2-G2')).toHaveLength(5);
        expect(parseTuning('B1-E2-A2-D3-G3-B3-E4')).toHaveLength(7);
        expect(parseTuning('F#1-B1-E2-A2-D3-G3-B3-E4')).toHaveLength(8);
        expect(parseTuning('E1-A1-D2')).toBeUndefined();
        expect(parseTuning('C1-F#1-B1-E2-A2-D3-G3-B3-E4')).toBeUndefined();
        expect(parseTuning('E2-A2-D3-G3-B3-E')).toBeUndefined();
        expect(parseTuning('E2-A2-D3-G3-B3-Q4')).toBeUndefined();
    });

    it('takes open strings up to G7, so every fret to 24 has a MIDI number', () => {
        expect(parseTuning('E2-A2-D3-G3-B3-G7')).toHaveLength(6);
        expect(parseTuning('E2-A2-D3-G3-B3-Gs7')).toBeUndefined();
        expect(parseTuning('E2-A2-D3-G3-B3-G9')).toBeUndefined();
    });
});

describe('string numbers', () => {
    it('THY-3.4 numbers strings from the highest-pitched', () => {
        expect(stringNumber(5, 6)).toBe(1);
        expect(stringNumber(0, 6)).toBe(6);
        expect(stringNumber(0, 4)).toBe(4);
        expect(stringIndex(1, 6)).toBe(5);
        expect(stringIndex(6, 6)).toBe(0);
    });
});

describe('openStrings and fretMidi', () => {
    it('THY-4.1 sounds at the real pitch: the low E string is E2, though guitar music writes it an octave higher', () => {
        expect(openStrings(standard)).toEqual([40, 45, 50, 55, 59, 64]);
        expect(openStrings(TUNINGS.bass[0]?.strings ?? [])).toEqual([28, 33, 38, 43]);
    });

    it('THY-3.5 raises every open string by the capo', () => {
        expect(openStrings(standard, 2)).toEqual([42, 47, 52, 57, 61, 66]);
    });

    it('THY-3.2 finds a fret on any string of any tuning', () => {
        // String 6, fret 5 is A2; string 1, fret 12 is E5.
        expect(fretMidi(standard, 6, 5)).toBe(45);
        expect(fretMidi(standard, 1, 12)).toBe(76);
        expect(fretMidi(['B1', 'E2', 'A2', 'D3', 'G3', 'B3', 'E4'], 7, 0)).toBe(35);
        expect(fretMidi(standard, 7, 0)).toBeUndefined();
    });

    it('THY-3.5 plays the capo fret as the open string, and nothing below it', () => {
        expect(fretMidi(standard, 6, 2, 2)).toBe(42);
        expect(fretMidi(standard, 6, 2, 2)).toBe(openStrings(standard, 2)[0]);
        expect(fretMidi(standard, 6, 5, 2)).toBe(fretMidi(standard, 6, 5));
        expect(fretMidi(standard, 6, 1, 2)).toBeUndefined();
    });

    it('gives nothing for a fret off the neck, and refuses a capo off it', () => {
        expect(fretMidi(standard, 6, -1)).toBeUndefined();
        expect(fretMidi(standard, 6, 25)).toBeUndefined();
        expect(fretMidi(standard, 6, 24)).toBe(64);
        expect(fretMidi(standard, 6, 2.5)).toBeUndefined();
        expect(fretMidi(standard, 0, 0)).toBeUndefined();
        expect(() => fretMidi(standard, 6, 0, -2)).toThrow();
        expect(() => fretMidi(standard, 6, 12, 12)).toThrow();
        expect(() => openStrings(standard, -1)).toThrow();
    });
});
