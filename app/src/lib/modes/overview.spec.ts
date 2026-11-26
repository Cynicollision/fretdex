import { scaleType } from '@fretdex/fretkit';
import { describe, expect, it } from 'vitest';
import { STEP_STRIP, characteristicLine, modeRows, overviewKey, parentKey, rowPosition, stepSlice } from './overview';

const STANDARD = ['E2', 'A2', 'D3', 'G3', 'B3', 'E4'];
const DADGAD = ['D2', 'A2', 'D3', 'G3', 'A3', 'D4'];
const BASS = ['E1', 'A1', 'D2', 'G2'];

/** The overview's row for a degree of a major key, 1 to 7. */
function row(key: string, degree: number) {
    const found = modeRows(key)[degree - 1];
    if (!found) throw new Error(`No row ${String(degree)}`);
    return found;
}

function type(id: string) {
    const found = scaleType(id);
    if (!found) throw new Error(`No scale ${id}`);
    return found;
}

describe('modeRows', () => {
    it('MODE-1.1 lists the seven modes of a major scale by degree, spelled as the scale spells them', () => {
        const rows = modeRows('C');
        expect(rows.map(row => `${row.numeral} ${row.card.root} ${row.card.scale.id}`)).toEqual([
            'I C ionian',
            'ii D dorian',
            'iii E phrygian',
            'IV F lydian',
            'V G mixolydian',
            'vi A aeolian',
            'viiø B locrian'
        ]);
        expect(modeRows('Db').map(row => row.card.root)).toEqual(['Db', 'Eb', 'F', 'Gb', 'Ab', 'Bb', 'C']);
    });

    it('MODE-1.1 gives every row the same notes', () => {
        const notes = (degree: number) => [...row('A', degree).set.notes].sort();
        for (let degree = 2; degree <= 7; degree++) expect(notes(degree)).toEqual(notes(1));
    });
});

describe('rowPosition', () => {
    it("MODE-1.12 shows each mode's 3-notes-per-string pattern from its root on the lowest string", () => {
        for (const mode of modeRows('C')) {
            const position = rowPosition(mode, STANDARD, 'guitar', 0);
            const id = mode.card.scale.id;
            expect(position?.kind, id).toBe('nps');
            const lowest = position?.cells.filter(cell => cell.string === 6) ?? [];
            expect(lowest, id).toHaveLength(3);
            expect(lowest[0]?.degree, id).toBe(1);
            expect(position?.cells, id).toHaveLength(18);
        }
        expect(rowPosition(row('C', 2), STANDARD, 'guitar', 0)).toMatchObject({ from: 10 });
    });

    it('MODE-1.12 works in other tunings, and on bass takes the one-octave box from the lowest string', () => {
        expect(rowPosition(row('G', 1), DADGAD, 'guitar', 0)?.kind).toBe('nps');
        const box = rowPosition(row('G', 1), BASS, 'bass', 0);
        expect(box).toMatchObject({ kind: 'bass', number: 1, octaves: 1, rootString: 4 });
    });

    it('MODE-1.12 moves up with a capo', () => {
        const open = rowPosition(row('C', 3), STANDARD, 'guitar', 0);
        const capo = rowPosition(row('C', 3), STANDARD, 'guitar', 2);
        expect(open?.from).toBe(0);
        expect(capo?.from).toBeGreaterThanOrEqual(2);
    });
});

describe('stepSlice', () => {
    it('MODE-1.14 lights each mode one step further along the major scale', () => {
        const slices = modeRows('C').map(mode => {
            const slice = stepSlice(mode);
            return STEP_STRIP.slice(slice.from, slice.to + 1).join(' ');
        });
        expect(slices).toEqual([
            'W W H W W W H',
            'W H W W W H W',
            'H W W W H W W',
            'W W W H W W H',
            'W W H W W H W',
            'W H W W H W W',
            'H W W H W W W'
        ]);
        expect(STEP_STRIP).toHaveLength(13);
    });
});

describe('characteristicLine', () => {
    it('MODE-1.13 names the characteristic note, with no "was"', () => {
        expect(modeRows('C').map(characteristicLine)).toEqual([
            '♮4 characteristic',
            '♮6 characteristic',
            '♭2 characteristic',
            '♯4 characteristic',
            '♭7 characteristic',
            '♭6 characteristic',
            '♭5 characteristic'
        ]);
    });
});

describe('the key', () => {
    it("MODE-1.10 opens on the current key's parent major, or C", () => {
        expect(overviewKey(null, 'auto')).toBe('C');
        expect(overviewKey({ root: 'D', mode: 'dorian' }, 'auto')).toBe('C');
        expect(overviewKey({ root: 'A', mode: 'minor' }, 'auto')).toBe('C');
        expect(overviewKey({ root: 'E', mode: 'major' }, 'auto')).toBe('E');
        expect(overviewKey({ root: 'F#', mode: 'minor' }, 'auto')).toBe('A');
    });

    it("MODE-1.10 spells a parent the key picker wouldn't offer as it would", () => {
        expect(parentKey('G#', type('dorian'), 'auto')).toBe('F#');
        expect(parentKey('A#', type('phrygian'), 'auto')).toBe('F#');
        expect(parentKey('D#', type('aeolian'), 'auto')).toBe('F#');
        expect(parentKey('B', type('locrian'), 'auto')).toBe('C');
        // A♯ Dorian's parent would be G♯ major, with F𝄪.
        expect(parentKey('A#', type('dorian'), 'auto')).toBe('Ab');
    });
});
