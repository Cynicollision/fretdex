import { mapScale, scalePositions, scaleType, spellScale, type NoteName } from '@fretdex/fretkit';
import { describe, expect, it } from 'vitest';
import { runNotes, runTrack } from './run';

const STANDARD = ['E2', 'A2', 'D3', 'G3', 'B3', 'E4'];
const BASS = ['E1', 'A1', 'D2', 'G2'];
const NECK = { from: 0, to: 15 };

function scale(root: NoteName, id: string) {
    const type = scaleType(id);
    if (!type) throw new Error(`No scale ${id}`);
    return spellScale(root, type);
}

/** Where each note is played, as string:fret. */
function places(cells: readonly { string: number; fret: number }[]) {
    return cells.map(cell => `${String(cell.string)}:${String(cell.fret)}`);
}

describe('runNotes', () => {
    it('AUD-3.1 plays one octave from the lowest root on the full neck, each note on its lowest fret', () => {
        const cells = mapScale(STANDARD, scale('C', 'major'), NECK);
        const notes = runNotes(cells);
        expect(notes.map(cell => cell.note)).toEqual(['C3', 'D3', 'E3', 'F3', 'G3', 'A3', 'B3', 'C4']);
        // The open C major scale.
        expect(places(notes)).toEqual(['5:3', '4:0', '4:2', '4:3', '3:0', '3:2', '2:0', '2:1']);
    });

    it('AUD-3.1 starts from the lowest root at or above the capo', () => {
        // With a capo at 2 the open A string is gone, so the lowest A is on the low E's fifth fret.
        const cells = mapScale(STANDARD, scale('A', 'natural-minor'), NECK, 2);
        const notes = runNotes(cells);
        expect(notes[0]?.note).toBe('A2');
        expect(places(notes)).toEqual(['6:5', '5:2', '5:3', '5:5', '4:2', '4:3', '4:5', '3:2']);
    });

    it("AUD-3.1 plays a position's notes, lowest to highest, each once", () => {
        const set = scale('G', 'major');
        const position = scalePositions(STANDARD, set, 'guitar')[0]?.positions[1];
        if (!position) throw new Error('No position');
        const notes = runNotes([], position);
        expect(notes).toHaveLength(position.cells.length);
        expect(notes.map(cell => cell.midi)).toEqual([...notes.map(cell => cell.midi)].sort((a, b) => a - b));
        expect(new Set(notes.map(cell => cell.midi)).size).toBe(notes.length);
    });

    it('AUD-3.1 plays nothing when the neck has no root', () => {
        expect(
            runNotes(mapScale(STANDARD, scale('C', 'major'), { from: 1, to: 1 }).filter(c => c.degree !== 1))
        ).toEqual([]);
    });
});

describe('runTrack', () => {
    it('AUD-3.1 goes up then back down in eighth notes, the top played twice so the way down mirrors the way up', () => {
        const notes = runNotes(mapScale(STANDARD, scale('C', 'major'), NECK));
        const track = runTrack(notes);
        expect(track.loop).toBe(false);
        expect(track.events.map(event => event.event.cell.note)).toEqual([
            'C3',
            'D3',
            'E3',
            'F3',
            'G3',
            'A3',
            'B3',
            'C4',
            'C4',
            'B3',
            'A3',
            'G3',
            'F3',
            'E3',
            'D3',
            'C3'
        ]);
        expect(track.events.map(event => event.beat).slice(0, 3)).toEqual([0, 0.5, 1]);
        expect(track.length).toBe(8);
    });

    it("AUD-3.2 lights each note's key, the run's lowest note in the keyboard's lower octave", () => {
        const notes = runNotes(mapScale(STANDARD, scale('E', 'major'), NECK));
        const keys = runTrack(notes).events.map(event => event.event.key);
        // E2 sounds below the keyboard's C3, so the run is lit from E3.
        expect(keys.slice(0, 8)).toEqual([52, 54, 56, 57, 59, 61, 63, 64]);
    });

    it('AUD-3.2 lights no key for a note off the keyboard, rather than one in the wrong octave', () => {
        // D Dorian's two-octave box on bass runs D2 to D4, a key more than the keyboard's two octaves from C.
        const set = scale('D', 'dorian');
        const box = scalePositions(BASS, set, 'bass').find(group => group.kind === 'two-octaves')?.positions[0];
        if (!box) throw new Error('No box');
        const track = runTrack(runNotes([], box));
        const lit = track.events.map(event => [event.event.cell.midi, event.event.key]);
        // Lit an octave up from D3 to B4; the top C and D, above the keyboard, light nothing, each way.
        for (const [midi, key] of lit) if (key !== undefined) expect(key - (midi ?? 0)).toBe(12);
        expect(lit.filter(([, key]) => key === undefined).map(([midi]) => midi)).toEqual([60, 62, 62, 60]);
    });

    it('AUD-3.2 moves a run down an octave when more of it fits that way', () => {
        // E major's first 3-per-string pattern runs from E2 up past two octaves: lit from E3, its top falls off.
        const set = scale('E', 'major');
        const pattern = scalePositions(STANDARD, set, 'guitar').find(group => group.kind === 'nps')?.positions[0];
        if (!pattern) throw new Error('No pattern');
        const keys = runTrack(runNotes([], pattern)).events.map(event => event.event.key);
        const shown = keys.filter(key => key !== undefined);
        expect(Math.max(...shown)).toBeLessThanOrEqual(71);
        expect(Math.min(...shown)).toBeGreaterThanOrEqual(48);
    });
});
