import { scaleType, type ScaleType } from '@fretdex/fretkit';
import { describe, expect, it } from 'vitest';
import { cardTitle } from '#lib/url/routes.ts';
import { brightnessRow, chordLabel, numeralLabel, parentLine, tappedLine } from './card';

function type(id: string): ScaleType {
    const found = scaleType(id);
    if (!found) throw new Error(`No scale ${id}`);
    return found;
}

describe('the scale card', () => {
    it('SCL-5.1 names a mode’s parent scale and key', () => {
        expect(parentLine('D', type('dorian'))).toBe('D Dorian is the 2nd mode of C major.');
        expect(parentLine('A#', type('dorian'))).toBe('A♯ Dorian is the 2nd mode of G♯ major.');
        expect(parentLine('G', type('ionian'))).toBe('G Ionian is the major scale, the 1st mode of G major.');
        expect(parentLine('C', type('major'))).toBeUndefined();
    });

    it('SCL-5.2 lists the seven modes on the root, each spelled as its picker offers it', () => {
        expect(brightnessRow('D', 'auto').map(cardTitle)).toEqual([
            'D Lydian',
            'D Ionian',
            'D Mixolydian',
            'D Dorian',
            'D Aeolian',
            'D Phrygian',
            'D Locrian'
        ]);
        const row = brightnessRow('A#', 'auto').map(cardTitle);
        expect(row).toContain('B♭ Lydian');
        expect(row).toContain('A♯ Phrygian');
    });

    it('SCL-5.3 shows chord names and numerals with ♭ ♯ and °', () => {
        expect(chordLabel('B', 'dim')).toBe('B°');
        expect(chordLabel('B', 'm7b5')).toBe('Bm7♭5');
        expect(chordLabel('Bb', 'maj7')).toBe('B♭maj7');
        expect(numeralLabel('bIII')).toBe('♭III');
        expect(numeralLabel('#iv°')).toBe('♯iv°');
    });

    it('DIAG-1.6 names a tapped fret, in the scale or not', () => {
        const cell = { string: 3, fret: 0, midi: 55, note: 'G3', code: '4P', interval: '4', degree: 4 };
        expect(tappedLine({ string: 3, fret: 0, midi: 55, note: 'G3', cell })).toBe('G3 · string 3, open · 4');
        expect(tappedLine({ string: 2, fret: 2, midi: 61, note: 'C#4' })).toBe(
            'C♯4 · string 2, fret 2 · not in the scale'
        );
    });
});
