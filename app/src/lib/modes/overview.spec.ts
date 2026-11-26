import { mapScale, TUNINGS } from '@fretdex/fretkit';
import { describe, expect, it } from 'vitest';
import { ghosts, markedInterval, modeRows, modeWindow, rowMarks } from './overview';

const STANDARD = ['E2', 'A2', 'D3', 'G3', 'B3', 'E4'];
const BASS = ['E1', 'A1', 'D2', 'G2'];

describe('modeRows', () => {
    it('MODE-1.1 lists the seven modes on the root, brightest first', () => {
        expect(modeRows('D', 'auto').map(row => row.card.scale.id)).toEqual([
            'lydian',
            'ionian',
            'mixolydian',
            'dorian',
            'aeolian',
            'phrygian',
            'locrian'
        ]);
        expect(modeRows('D', 'auto').find(row => row.card.scale.id === 'dorian')?.set.notes).toEqual([
            'D',
            'E',
            'F',
            'G',
            'A',
            'B',
            'C'
        ]);
    });

    it('MODE-1.1 spells each row as the brightness row does, so A♯ has B♭ Lydian', () => {
        const roots = modeRows('A#', 'auto').map(row => row.card.root);
        expect(roots[0]).toBe('Bb');
        expect(roots).toContain('A#');
    });

    it('MODE-1.9 gives each row its characteristic note and what changed from the row above', () => {
        const rows = modeRows('C', 'auto');
        expect(rows[0]?.change).toBeUndefined();
        expect(rows.map(row => row.characteristic)).toEqual(['4A', '4P', '7m', '6M', '6m', '2m', '5d']);
        expect(rows.map(row => row.change?.to)).toEqual([undefined, '4P', '7m', '3m', '6m', '2m', '5d']);
    });
});

describe('modeWindow', () => {
    it('MODE-1.1 starts a fret below the root on the lowest string', () => {
        expect(modeWindow(STANDARD, 'D', 0)).toEqual({ from: 9, to: 14 });
        expect(modeWindow(STANDARD, 'G', 0)).toEqual({ from: 2, to: 7 });
        expect(modeWindow(STANDARD, 'F', 0)).toEqual({ from: 0, to: 5 });
        expect(modeWindow(BASS, 'A', 0)).toEqual({ from: 4, to: 9 });
    });

    it('MODE-1.1 starts at the nut or the capo when the root is there', () => {
        expect(modeWindow(STANDARD, 'E', 0)).toEqual({ from: 0, to: 5 });
        expect(modeWindow(STANDARD, 'F#', 2)).toEqual({ from: 2, to: 7 });
        expect(modeWindow(STANDARD, 'E', 2)).toEqual({ from: 11, to: 16 });
        expect(modeWindow(TUNINGS.guitar[1]?.strings ?? STANDARD, 'D', 0).from).toBe(0);
    });

    it('MODE-1.1 is the same for every row, so only the changed note moves', () => {
        const window = modeWindow(STANDARD, 'A', 0);
        const rows = modeRows('A', 'auto');
        for (let i = 1; i < rows.length; i++) {
            const above = rows[i - 1];
            const row = rows[i];
            if (!above || !row) continue;
            const key = (cell: { string: number; fret: number }) => `${String(cell.string)}:${String(cell.fret)}`;
            const was = new Set(mapScale(STANDARD, above.set, window).map(key));
            const now = new Set(mapScale(STANDARD, row.set, window).map(key));
            const gone = [...was].filter(cell => !now.has(cell));
            const added = [...now].filter(cell => !was.has(cell));
            expect(gone.length, row.card.scale.id).toBeGreaterThan(0);
            expect(added.length, row.card.scale.id).toBeLessThanOrEqual(gone.length);
        }
    });
});

describe('ghosts', () => {
    it('MODE-1.9 marks where the changed note was, a fret above where it is now', () => {
        const window = modeWindow(STANDARD, 'C', 0);
        const ionian = modeRows('C', 'auto')[1];
        if (!ionian) throw new Error('No Ionian');
        const fours = mapScale(STANDARD, ionian.set, window).filter(cell => cell.code === '4P');
        const marks = ghosts(ionian, STANDARD, window, 0);
        expect(marks.length).toBeGreaterThan(0);
        for (const mark of marks) {
            expect(fours).toContainEqual(expect.objectContaining({ string: mark.string, fret: mark.fret - 1 }));
            expect(mark.fret).toBeLessThanOrEqual(window.to);
        }
    });

    it('MODE-1.9 has none for Lydian, the first row', () => {
        const lydian = modeRows('C', 'auto')[0];
        if (!lydian) throw new Error('No Lydian');
        expect(ghosts(lydian, STANDARD, modeWindow(STANDARD, 'C', 0), 0)).toEqual([]);
    });
});

describe('rowMarks', () => {
    it('MODE-1.9 names the characteristic note and what changed', () => {
        expect(modeRows('C', 'auto').map(rowMarks)).toEqual([
            '♯4 characteristic',
            '♮4 characteristic, was ♯4',
            '♭7 characteristic, was 7',
            '♮6 characteristic · ♭3, was 3',
            '♭6 characteristic, was 6',
            '♭2 characteristic, was 2',
            '♭5 characteristic, was 5'
        ]);
        expect(markedInterval('6M')).toBe('♮6');
        expect(markedInterval('4A')).toBe('♯4');
    });
});
