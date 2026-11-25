import type { IntervalCode } from './interval';
import { notePitchClass, spellMidi, type NoteName } from './note';
import { pitchClass } from './pitch';
import type { NoteSet } from './scale';
import { fretMidi, MAX_FRET } from './tuning';

/** A note of a set where it falls at one pitch, on a fret or a key. */
export interface MappedNote {
    /** What it sounds (THY-4.1). */
    readonly midi: number;
    /** Spelled as the set spells it, with its octave (`E#3`). */
    readonly note: NoteName;
    /** Its interval from the root (`3m`); `intervalLabel` shows it. */
    readonly code: IntervalCode;
    /** Its interval's short name from the root (`b3`). */
    readonly interval: string;
    /** Its place in the set, 1 for the root. */
    readonly degree: number;
}

/** One fret on one string where a note of the set falls. */
export interface FretboardCell extends MappedNote {
    /** 1 is the highest-pitched string (THY-3.4). */
    readonly string: number;
    /** Counted from the nut, capo or not. */
    readonly fret: number;
}

export interface FretRange {
    /** The first fret shown, 0 for the open strings (CTX-1.7). */
    readonly from: number;
    /** The last fret shown, up to `MAX_FRET` (24). */
    readonly to: number;
}

/**
 * Every fret in a range where a note of the set falls, on any tuning (THY-3.2), highest string first and then up the
 * neck. With a capo, only the frets from the capo up (CTX-3.4), which sound what they would without it (THY-3.5).
 * A range reaching past the nut or past `MAX_FRET` stops there.
 */
export function mapScale(strings: readonly NoteName[], set: NoteSet, range: FretRange, capo = 0): FretboardCell[] {
    const find = finder(set);
    const cells: FretboardCell[] = [];
    for (let string = 1; string <= strings.length; string++) {
        for (let fret = Math.max(range.from, capo, 0); fret <= Math.min(range.to, MAX_FRET); fret++) {
            const midi = fretMidi(strings, string, fret, capo);
            const found = midi === undefined ? undefined : find(midi);
            if (found) cells.push({ string, fret, ...found });
        }
    }
    return cells;
}

/** Every key from `from` to `to` (MIDI numbers, both included) where a note of the set falls, lowest first. */
export function mapKeyboard(set: NoteSet, from: number, to: number): MappedNote[] {
    const find = finder(set);
    const keys: MappedNote[] = [];
    for (let midi = from; midi <= to; midi++) {
        const found = find(midi);
        if (found) keys.push(found);
    }
    return keys;
}

/** Finds a pitch's note in the set, spelled as the set spells it; the first of two spellings of a pitch class wins. */
function finder(set: NoteSet): (midi: number) => MappedNote | undefined {
    const byPitchClass = new Map<number, number>();
    set.notes.forEach((note, index) => {
        if (!byPitchClass.has(notePitchClass(note))) byPitchClass.set(notePitchClass(note), index);
    });
    return midi => {
        const index = byPitchClass.get(pitchClass(midi));
        if (index === undefined) return undefined;
        const spelling = set.notes[index];
        const code = set.codes[index];
        const interval = set.intervals[index];
        if (spelling === undefined || code === undefined || interval === undefined) return undefined;
        return { midi, note: spellMidi(midi, spelling), code, interval, degree: index + 1 };
    };
}
