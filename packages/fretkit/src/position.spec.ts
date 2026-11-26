import { describe, expect, it } from 'vitest';
import { noteMidi } from './note';
import { scalePositions, type Position, type PositionKind } from './position';
import { PICKER_ROOTS, rootChoices } from './root';
import { SCALE_TYPES, scaleType, spellScale } from './scale';
import type { Instrument } from './tuning';

const standard = ['E2', 'A2', 'D3', 'G3', 'B3', 'E4'];
const dropD = ['D2', 'A2', 'D3', 'G3', 'B3', 'E4'];
const bass = ['E1', 'A1', 'D2', 'G2'];
const fiveString = ['B0', 'E1', 'A1', 'D2', 'G2'];

function scale(root: string, id: string) {
    const type = scaleType(id);
    if (!type) throw new Error(`No scale ${id}`);
    return spellScale(root, type);
}

function group(
    strings: string[],
    root: string,
    id: string,
    kind: PositionKind,
    instrument: Instrument = 'guitar',
    capo = 0
) {
    return scalePositions(strings, scale(root, id), instrument, capo).find(g => g.kind === kind)?.positions ?? [];
}

/** A position's frets string by string, lowest string first: `0 2 3 | 0 2 3 | …`. */
function frets(position: Position | undefined, count = 6): string {
    const strings: string[] = [];
    for (let string = count; string >= 1; string--) {
        strings.push(
            (position?.cells ?? [])
                .filter(cell => cell.string === string)
                .map(cell => String(cell.fret))
                .join(' ')
        );
    }
    return strings.join(' | ');
}

/** Whether a position's pitches climb the scale with none missing and none twice. */
function climbsTheScale(position: Position, pcs: number[]): boolean {
    const midis = position.cells.map(cell => cell.midi).sort((a, b) => a - b);
    if (new Set(midis).size !== midis.length) return false;
    for (let i = 1; i < midis.length; i++) {
        const gap = (midis[i] ?? 0) - (midis[i - 1] ?? 0);
        for (let between = 1; between < gap; between++) {
            if (pcs.includes(((midis[i - 1] ?? 0) + between) % 12)) return false;
        }
    }
    return true;
}

const autoRoots = (id: string) => {
    const type = scaleType(id);
    if (!type) throw new Error(`No scale ${id}`);
    return PICKER_ROOTS.map(button => rootChoices(button.pitchClass, type, 'auto').root);
};

describe('scalePositions', () => {
    it('SCL-3.1 gives the major scale five CAGED positions, numbered up the neck', () => {
        const positions = group(standard, 'G', 'major', 'caged');
        expect(positions.map(p => `${String(p.number)} ${p.shape ?? ''} ${String(p.from)}-${String(p.to)}`)).toEqual([
            '1 G 0-4',
            '2 E 2-5',
            '3 D 4-8',
            '4 C 7-10',
            '5 A 9-13'
        ]);
        // The open G major scale, its B on the open B string rather than the G string's 4th fret.
        expect(frets(positions[0])).toBe('0 2 3 | 0 2 3 | 0 2 4 | 0 2 | 0 1 3 | 0 2 3');
        expect(frets(positions[1])).toBe('2 3 5 | 2 3 5 | 2 4 5 | 2 4 5 | 3 5 | 2 3 5');
        expect(positions.every(p => p.shapeOf === 'G')).toBe(true);
    });

    it('SCL-3.1 plays every note of the scale once in each CAGED position, in five frets, on every root', () => {
        for (const root of autoRoots('major')) {
            const pcs = scale(root, 'major').notes.map(note => (noteMidi(`${note}4`) ?? 0) % 12);
            const positions = group(standard, root, 'major', 'caged');
            expect(positions).toHaveLength(5);
            for (const position of positions) {
                expect(climbsTheScale(position, pcs), `${root} ${String(position.number)}`).toBe(true);
                expect(position.to - position.from).toBeLessThanOrEqual(4);
                expect(position.from).toBeLessThan(12);
            }
        }
    });

    it("SCL-3.1 gives a mode its parent major's positions, named by the parent's shapes (owner, 2026-11-25)", () => {
        const dorian = group(standard, 'D', 'dorian', 'caged');
        const major = group(standard, 'C', 'major', 'caged');
        expect(dorian.map(p => frets(p))).toEqual(major.map(p => frets(p)));
        expect(dorian.map(p => `${p.shape ?? ''} of ${p.shapeOf ?? ''}`)).toEqual(
            major.map(p => `${p.shape ?? ''} of C`)
        );
        // Natural minor is Aeolian: A minor takes C major's.
        expect(group(standard, 'A', 'natural-minor', 'caged').map(p => frets(p))).toEqual(major.map(p => frets(p)));
        // Only the root differs.
        expect(dorian[0]?.cells.filter(cell => cell.degree === 1).map(cell => cell.note)).toEqual(['D4', 'D3']);
    });

    it('SCL-3.2 gives a seven-note scale seven 3-notes-per-string patterns, one from each degree', () => {
        for (const id of SCALE_TYPES.filter(type => type.intervals.length === 7).map(type => type.id)) {
            const patterns = group(standard, 'C', id, 'nps');
            expect(patterns.map(p => p.number).sort()).toEqual([1, 2, 3, 4, 5, 6, 7]);
            const pcs = scale('C', id).notes.map(note => (noteMidi(`${note}4`) ?? 0) % 12);
            for (const pattern of patterns) {
                for (let string = 1; string <= 6; string++) {
                    expect(pattern.cells.filter(cell => cell.string === string)).toHaveLength(3);
                }
                const lowest = pattern.cells.filter(cell => cell.string === 6).sort((a, b) => a.fret - b.fret)[0];
                expect(lowest?.degree, `${id} ${String(pattern.number)}`).toBe(pattern.number);
                expect(climbsTheScale(pattern, pcs)).toBe(true);
            }
            // Up the neck, for previous and next.
            expect(patterns.map(p => p.from)).toEqual([...patterns.map(p => p.from)].sort((a, b) => a - b));
        }
        expect(frets(group(standard, 'G', 'major', 'nps').find(p => p.number === 1))).toBe(
            '3 5 7 | 3 5 7 | 4 5 7 | 4 5 7 | 5 7 8 | 5 7 8'
        );
    });

    it('SCL-3.3 numbers pentatonic boxes from the minor root on the lowest string, named by the relative major (owner, 2026-11-25)', () => {
        const boxes = group(standard, 'A', 'minor-pentatonic', 'pentatonic');
        expect(boxes.map(p => `${String(p.number)} ${p.shape ?? ''} ${String(p.from)}-${String(p.to)}`)).toEqual([
            '4 C 0-3',
            '5 A 2-5',
            '1 G 5-8',
            '2 E 7-10',
            '3 D 9-13'
        ]);
        expect(frets(boxes.find(p => p.number === 1))).toBe('5 8 | 5 7 | 5 7 | 5 7 | 5 8 | 5 8');
        expect(boxes.every(p => p.shapeOf === 'C')).toBe(true);
        // The major pentatonic shares its relative minor's numbers.
        const major = group(standard, 'C', 'major-pentatonic', 'pentatonic');
        expect(major.map(p => [p.number, frets(p)])).toEqual(boxes.map(p => [p.number, frets(p)]));
        for (const box of boxes) {
            for (let string = 1; string <= 6; string++) {
                expect(box.cells.filter(cell => cell.string === string)).toHaveLength(2);
            }
        }
    });

    it('SCL-3.3 adds the blue note to the blues scales’ boxes', () => {
        const box = group(standard, 'A', 'minor-blues', 'pentatonic').find(p => p.number === 1);
        expect(frets(box)).toBe('5 8 | 5 6 7 | 5 7 | 5 7 8 | 5 8 | 5 8');
        expect(box?.cells.filter(cell => cell.interval === 'b5').map(cell => cell.note)).toEqual(['Eb4', 'Eb3']);
        const major = group(standard, 'C', 'major-blues', 'pentatonic').find(p => p.number === 1);
        expect(major?.cells.filter(cell => cell.interval === 'b3').map(cell => cell.note)).toEqual(['Eb4', 'Eb3']);
    });

    it('SCL-3.6 hides CAGED positions and pentatonic boxes in other tunings, leaving 3-notes-per-string', () => {
        expect(scalePositions(dropD, scale('G', 'major'), 'guitar').map(g => g.kind)).toEqual(['nps']);
        expect(scalePositions(dropD, scale('A', 'minor-pentatonic'), 'guitar')).toEqual([]);
        // However it's spelled.
        const spelled = ['Fb2', 'A2', 'D3', 'G3', 'Cb4', 'E4'];
        expect(scalePositions(spelled, scale('G', 'major'), 'guitar').map(g => g.kind)).toEqual(['caged', 'nps']);
    });

    it('SCL-3.6 moves positions up with a capo', () => {
        const positions = group(standard, 'G', 'major', 'caged', 'guitar', 2);
        expect(positions.map(p => `${p.shape ?? ''} ${String(p.from)}-${String(p.to)}`)).toEqual([
            'E 2-5',
            'D 4-8',
            'C 7-10',
            'A 9-13',
            'G 12-16'
        ]);
        for (const kind of ['caged', 'nps'] as const) {
            for (const position of group(standard, 'G', 'major', kind, 'guitar', 5)) {
                expect(position.from).toBeGreaterThanOrEqual(5);
            }
        }
    });

    it('SCL-3.7 shows whole tone and the diminished scales on the full neck only', () => {
        for (const id of ['whole-tone', 'half-whole-diminished', 'whole-half-diminished']) {
            expect(scalePositions(standard, scale('C', id), 'guitar')).toEqual([]);
            expect(scalePositions(bass, scale('C', id), 'bass')).toEqual([]);
        }
    });

    it('SCL-4.1 gives bass one- and two-octave boxes from the lowest two strings, and nothing else', () => {
        const groups = scalePositions(bass, scale('G', 'major'), 'bass');
        expect(groups.map(g => g.kind)).toEqual(['bass']);
        const boxes = groups[0]?.positions ?? [];
        expect(boxes.map(p => `${String(p.number)} ${String(p.octaves)} ${String(p.rootString)}`)).toEqual([
            '1 1 4',
            '2 1 3',
            '3 2 4'
        ]);
        expect(frets(boxes[0], 4)).toBe('3 5 | 2 3 5 | 2 4 5 | ');
        expect(frets(boxes[1], 4)).toBe(' | 10 12 | 9 10 12 | 9 11 12');
        // Two octaves: the first box, then a shift to the octave on the next string.
        expect(frets(boxes[2], 4)).toBe('3 5 | 2 3 5 10 12 | 2 4 9 10 12 | 9 11 12');
        expect(boxes[2]?.cells.filter(cell => cell.degree === 1)).toHaveLength(3);
    });

    it('SCL-4.1 keeps a one-octave bass box on three strings, so its two octaves are the same box', () => {
        const boxes = group(bass, 'D', 'dorian', 'bass', 'bass');
        expect(frets(boxes[0], 4)).toBe('10 12 13 | 10 12 | 9 10 12 | ');
        for (const root of autoRoots('dorian')) {
            for (const box of group(bass, root, 'dorian', 'bass', 'bass')) {
                const strings = new Set(box.cells.map(cell => cell.string));
                expect(strings.size, `${root} ${String(box.number)}`).toBeLessThanOrEqual(box.octaves === 2 ? 4 : 3);
            }
        }
    });

    it('SCL-4.1 gives Drop D bass its boxes from the low D string too', () => {
        const dropDBass = ['D1', 'A1', 'D2', 'G2'];
        for (const id of ['major', 'natural-minor', 'dorian', 'minor-pentatonic']) {
            for (const root of autoRoots(id)) {
                const boxes = group(dropDBass, root, id, 'bass', 'bass');
                expect(
                    boxes.map(box => box.number),
                    `${root} ${id}`
                ).toEqual([1, 2, 3]);
            }
        }
        expect(frets(group(dropDBass, 'D', 'major', 'bass', 'bass')[0], 4)).toBe('0 2 4 5 | 0 2 4 5 |  | ');
    });

    it('SCL-4.1 offers a two-octave box from the second string where three strings sit above it (owner, 2026-11-25)', () => {
        const boxes = group(fiveString, 'C', 'major', 'bass', 'bass');
        expect(boxes.map(p => p.number)).toEqual([1, 2, 3, 4]);
        expect(boxes[3]?.rootString).toBe(4);
        for (const root of autoRoots('major')) {
            for (const box of group(bass, root, 'major', 'bass', 'bass')) {
                const pcs = scale(root, 'major').notes.map(note => (noteMidi(`${note}4`) ?? 0) % 12);
                expect(climbsTheScale(box, pcs), `${root} ${String(box.number)}`).toBe(true);
                expect(box.cells.filter(cell => cell.degree === 1)).toHaveLength(box.octaves === 2 ? 3 : 2);
            }
        }
    });
});
