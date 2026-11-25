import { notePitchClass, spellMidi, type NoteName } from './note';
import { pitchClass } from './pitch';
import type { SpelledScale } from './scale';
import { fretMidi } from './tuning';

/** One fret on one string where a note of the set falls. */
export interface FretboardCell {
    /** 1 is the highest-pitched string (THY-3.4). */
    readonly string: number;
    /** Counted from the nut, capo or not. */
    readonly fret: number;
    /** What it sounds (THY-4.1). */
    readonly midi: number;
    /** Spelled as the set spells it, with its octave (`E#3`). */
    readonly note: NoteName;
    /** Its interval's short name from the root (`b3`). */
    readonly interval: string;
    /** Its place in the set, 1 for the root. */
    readonly degree: number;
}

export interface FretRange {
    /** The first fret shown, 0 for the open strings (CTX-1.7). */
    readonly from: number;
    /** The last fret shown, up to 24. */
    readonly to: number;
}

/**
 * Every fret in a range where a note of the scale falls, on any tuning (THY-3.2), highest string first and then up
 * the neck. With a capo, only the frets from the capo up (CTX-3.4), which sound what they would without it (THY-3.5).
 */
export function mapScale(
    strings: readonly NoteName[],
    scale: SpelledScale,
    range: FretRange,
    capo = 0
): FretboardCell[] {
    const byPitchClass = new Map<number, number>();
    scale.notes.forEach((note, index) => {
        if (!byPitchClass.has(notePitchClass(note))) byPitchClass.set(notePitchClass(note), index);
    });
    const cells: FretboardCell[] = [];
    for (let string = 1; string <= strings.length; string++) {
        for (let fret = Math.max(range.from, capo); fret <= range.to; fret++) {
            const midi = fretMidi(strings, string, fret, capo);
            if (midi === undefined) continue;
            const index = byPitchClass.get(pitchClass(midi));
            if (index === undefined) continue;
            const spelling = scale.notes[index];
            const interval = scale.intervals[index];
            if (spelling === undefined || interval === undefined) continue;
            cells.push({ string, fret, midi, note: spellMidi(midi, spelling), interval, degree: index + 1 });
        }
    }
    return cells;
}
