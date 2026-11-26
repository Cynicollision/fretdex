import { scalePositions, scaleType, spellScale, type NoteName } from '@fretdex/fretkit';
import { describe, expect, it } from 'vitest';
import { chosenPosition, positionName } from './positions';

const STANDARD = ['E2', 'A2', 'D3', 'G3', 'B3', 'E4'];
const BASS = ['E1', 'A1', 'D2', 'G2'];

function scale(root: NoteName, id: string) {
    const type = scaleType(id);
    if (!type) throw new Error(`No scale ${id}`);
    return spellScale(root, type);
}

function names(strings: string[], root: NoteName, id: string, instrument: 'guitar' | 'bass' = 'guitar') {
    const set = scale(root, id);
    return scalePositions(strings, set, instrument).map(group => ({
        kind: group.kind,
        names: group.positions.map(position => positionName(position, set, strings))
    }));
}

describe('positionName', () => {
    it('SCL-3.4 names a position by its number, shape and frets', () => {
        expect(names(STANDARD, 'G', 'major')[0]?.names[1]).toBe('Position 2 · E shape · frets 2–5');
    });

    it("SCL-3.4 names a mode's and a minor scale's positions by their parent major (owner, 2026-11-25)", () => {
        expect(names(STANDARD, 'D', 'dorian')[0]?.names[2]).toBe('Position 3 · G shape of C major · frets 5–9');
        const boxes = names(STANDARD, 'A', 'minor-pentatonic')[0];
        expect(boxes?.kind).toBe('pentatonic');
        expect(boxes?.names[2]).toBe('Box 1 · G shape of C major · frets 5–8');
        expect(names(STANDARD, 'C', 'major-pentatonic')[0]?.names[2]).toBe('Box 1 · G shape · frets 5–8');
        expect(names(STANDARD, 'F', 'dorian')[0]?.names[0]).toContain('of E♭ major');
    });

    it('SCL-3.4 names 3-notes-per-string patterns by the degree they start on', () => {
        const nps = names(STANDARD, 'D', 'dorian').find(group => group.kind === 'nps');
        expect(nps?.names).toContain('Pattern 3 · from the ♭3 · frets 1–7');
    });

    it('SCL-4.1 names bass boxes by their octaves and string', () => {
        expect(names(BASS, 'G', 'major', 'bass')[0]?.names).toEqual([
            'Box 1 · one octave from the E string · frets 2–5',
            'Box 2 · one octave from the A string · frets 9–12',
            'Box 3 · two octaves from the E string · frets 2–12'
        ]);
    });
});

describe('chosenPosition', () => {
    it("chooses the URL's position among those offered, and the full neck for one that isn't", () => {
        const groups = scalePositions(STANDARD, scale('A', 'minor-pentatonic'), 'guitar');
        expect(chosenPosition(groups, { pos: 1 })?.index).toBe(2);
        expect(chosenPosition(groups, { pos: 1 })?.position.from).toBe(5);
        expect(chosenPosition(groups, { nps: 1 })).toBeUndefined();
        expect(chosenPosition(groups, {})).toBeUndefined();
        const bass = scalePositions(BASS, scale('A', 'minor-pentatonic'), 'bass');
        expect(chosenPosition(bass, { pos: 1 })).toBeUndefined();
        expect(chosenPosition(bass, { box: 2 })?.position.number).toBe(2);
    });
});
