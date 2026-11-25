import { describe, expect, it } from 'vitest';
import { mapScale } from './fretboard';
import { scaleType, spellScale } from './scale';

const standard = ['E2', 'A2', 'D3', 'G3', 'B3', 'E4'];

function scale(root: string, id: string) {
    const type = scaleType(id);
    if (!type) throw new Error(`No scale ${id}`);
    return spellScale(root, type);
}

describe('mapScale', () => {
    it('finds every note of the scale in the range, spelled as the scale spells it', () => {
        const cells = mapScale(standard, scale('F#', 'major'), { from: 0, to: 2 });
        // On the low E string, fret 1 is the 7th, spelled E# (THY-1.1), and fret 2 the root; the open E isn't in F# major.
        expect(cells.filter(cell => cell.string === 6)).toEqual([
            { string: 6, fret: 1, midi: 41, note: 'E#2', interval: '7', degree: 7 },
            { string: 6, fret: 2, midi: 42, note: 'F#2', interval: '1', degree: 1 }
        ]);
        // The B string has the open B (the 4th) and C# at fret 2 (the 5th); fret 1's C isn't in F# major.
        expect(cells.filter(cell => cell.string === 2).map(cell => `${String(cell.fret)}:${cell.note}`)).toEqual([
            '0:B3',
            '2:C#4'
        ]);
        expect(cells.find(cell => cell.string === 1 && cell.fret === 1)?.note).toBe('E#4');
    });

    it('names each note by its interval and degree', () => {
        const cells = mapScale(standard, scale('A', 'minor-pentatonic'), { from: 5, to: 8 });
        expect(cells.filter(cell => cell.string === 6).map(cell => [cell.fret, cell.interval, cell.degree])).toEqual([
            [5, '1', 1],
            [8, 'b3', 2]
        ]);
    });

    it('THY-3.2 works on any tuning', () => {
        const bass = mapScale(['E1', 'A1', 'D2', 'G2'], scale('C', 'major'), { from: 0, to: 12 });
        expect(Math.max(...bass.map(cell => cell.string))).toBe(4);
        const sevenString = mapScale(['B1', 'E2', 'A2', 'D3', 'G3', 'B3', 'E4'], scale('C', 'major'), {
            from: 0,
            to: 0
        });
        expect(sevenString.map(cell => cell.note)).toEqual(['E4', 'B3', 'G3', 'D3', 'A2', 'E2', 'B1']);
    });

    it('THY-3.5 shows only the frets from the capo up, sounding as they would without it', () => {
        const withCapo = mapScale(standard, scale('A', 'major'), { from: 0, to: 7 }, 2);
        const without = mapScale(standard, scale('A', 'major'), { from: 2, to: 7 });
        expect(withCapo).toEqual(without);
        expect(Math.min(...withCapo.map(cell => cell.fret))).toBe(2);
    });

    it('stops a range at the nut and at fret 24', () => {
        const cells = mapScale(standard, scale('E', 'minor-pentatonic'), { from: -3, to: 30 });
        expect(Math.min(...cells.map(cell => cell.fret))).toBe(0);
        expect(Math.max(...cells.map(cell => cell.fret))).toBe(24);
    });

    it('lists highest string first, then up the neck', () => {
        const cells = mapScale(standard, scale('C', 'major'), { from: 0, to: 3 });
        const order = cells.map(cell => cell.string * 100 + cell.fret);
        expect(order).toEqual([...order].sort((a, b) => a - b));
    });
});
