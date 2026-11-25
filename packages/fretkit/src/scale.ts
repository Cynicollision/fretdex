import { Note } from 'tonal';
import { intervalName, type IntervalCode } from './interval';
import type { NoteName } from './note';

/** The Scales list's groups (SCL-1.1). */
export type ScaleGroup = 'major-and-minor' | 'pentatonic-and-blues' | 'modes' | 'other';

export interface ScaleType {
    /** The scale's name in URLs (`/scales/G/harmonic-minor`). */
    readonly id: string;
    readonly name: string;
    readonly group: ScaleGroup;
    /** From the root, in order, each spelled as the scale spells it (THY-1.1, THY-1.4). */
    readonly intervals: readonly IntervalCode[];
    /**
     * The scale whose notes on the same root give this one's key signature, for choosing a root's spelling
     * (THY-2.1, THY-2.5): harmonic minor is read in the minor key, the major pentatonic in the major key. Absent when
     * the scale's own notes are its signature: the modes, and the scales with no key of their own.
     */
    readonly signatureFrom?: string;
}

const MAJOR: IntervalCode[] = ['1P', '2M', '3M', '4P', '5P', '6M', '7M'];
const MINOR: IntervalCode[] = ['1P', '2M', '3m', '4P', '5P', '6m', '7m'];

/** Every scale in the Scales list (SCL-1.1), in the list's order. */
export const SCALE_TYPES: readonly ScaleType[] = [
    { id: 'major', name: 'Major', group: 'major-and-minor', intervals: MAJOR },
    { id: 'natural-minor', name: 'Natural minor', group: 'major-and-minor', intervals: MINOR },
    {
        id: 'harmonic-minor',
        name: 'Harmonic minor',
        group: 'major-and-minor',
        intervals: ['1P', '2M', '3m', '4P', '5P', '6m', '7M'],
        signatureFrom: 'natural-minor'
    },
    {
        id: 'melodic-minor',
        name: 'Melodic minor',
        group: 'major-and-minor',
        intervals: ['1P', '2M', '3m', '4P', '5P', '6M', '7M'],
        signatureFrom: 'natural-minor'
    },
    {
        id: 'major-pentatonic',
        name: 'Major pentatonic',
        group: 'pentatonic-and-blues',
        intervals: ['1P', '2M', '3M', '5P', '6M'],
        signatureFrom: 'major'
    },
    {
        id: 'minor-pentatonic',
        name: 'Minor pentatonic',
        group: 'pentatonic-and-blues',
        intervals: ['1P', '3m', '4P', '5P', '7m'],
        signatureFrom: 'natural-minor'
    },
    {
        id: 'major-blues',
        name: 'Major blues',
        group: 'pentatonic-and-blues',
        intervals: ['1P', '2M', '3m', '3M', '5P', '6M'],
        signatureFrom: 'major'
    },
    {
        id: 'minor-blues',
        name: 'Minor blues',
        group: 'pentatonic-and-blues',
        intervals: ['1P', '3m', '4P', '5d', '5P', '7m'],
        signatureFrom: 'natural-minor'
    },
    { id: 'lydian', name: 'Lydian', group: 'modes', intervals: ['1P', '2M', '3M', '4A', '5P', '6M', '7M'] },
    { id: 'ionian', name: 'Ionian', group: 'modes', intervals: MAJOR },
    { id: 'mixolydian', name: 'Mixolydian', group: 'modes', intervals: ['1P', '2M', '3M', '4P', '5P', '6M', '7m'] },
    { id: 'dorian', name: 'Dorian', group: 'modes', intervals: ['1P', '2M', '3m', '4P', '5P', '6M', '7m'] },
    { id: 'aeolian', name: 'Aeolian', group: 'modes', intervals: MINOR },
    { id: 'phrygian', name: 'Phrygian', group: 'modes', intervals: ['1P', '2m', '3m', '4P', '5P', '6m', '7m'] },
    { id: 'locrian', name: 'Locrian', group: 'modes', intervals: ['1P', '2m', '3m', '4P', '5d', '6m', '7m'] },
    {
        id: 'phrygian-dominant',
        name: 'Phrygian dominant',
        group: 'other',
        intervals: ['1P', '2m', '3M', '4P', '5P', '6m', '7m']
    },
    {
        id: 'lydian-dominant',
        name: 'Lydian dominant',
        group: 'other',
        intervals: ['1P', '2M', '3M', '4A', '5P', '6M', '7m']
    },
    // Spelled by the tensions it's played for, as a 7alt chord is, not one letter each (THY-1.1).
    { id: 'altered', name: 'Altered', group: 'other', intervals: ['1P', '2m', '2A', '3M', '4A', '6m', '7m'] },
    // With a b7, as a 7#5 chord is, rather than a #6.
    { id: 'whole-tone', name: 'Whole tone', group: 'other', intervals: ['1P', '2M', '3M', '4A', '5A', '7m'] },
    {
        id: 'half-whole-diminished',
        name: 'Half-whole diminished',
        group: 'other',
        intervals: ['1P', '2m', '3m', '3M', '4A', '5P', '6M', '7m']
    },
    {
        id: 'whole-half-diminished',
        name: 'Whole-half diminished',
        group: 'other',
        intervals: ['1P', '2M', '3m', '4P', '5d', '6m', '6M', '7M']
    }
];

/** The scale with this id, or `undefined`. */
export function scaleType(id: string): ScaleType | undefined {
    return SCALE_TYPES.find(type => type.id === id);
}

/** Notes spelled from a root by interval: a scale, an arpeggio, or a lone note. */
export interface NoteSet {
    readonly root: NoteName;
    /** In order from the root, each letter once in a seven-note scale (THY-1.1), with double sharps and flats where the spelling needs them (THY-1.3). */
    readonly notes: readonly NoteName[];
    /** Each note's interval from the root, in the same order. */
    readonly codes: readonly IntervalCode[];
    /** Short names, in the same order (`1 2 b3 4 5 b6 7`, THY-1.4). */
    readonly intervals: readonly string[];
}

/** A scale spelled on a root. */
export interface SpelledScale extends NoteSet {
    readonly type: ScaleType;
}

/**
 * Spells a scale on a root, by interval from the root (THY-1.1, THY-1.3, THY-1.4). The root is kept as written, and
 * must be a `NoteName` (run URL and typed text through `parseNote` first); anything else throws.
 */
export function spellScale(root: NoteName, type: ScaleType): SpelledScale {
    return { ...noteSet(root, type.intervals), type };
}

/**
 * Spells a set of notes from a root by interval (THY-1.2), as `spell` does, with their intervals' short names: an
 * arpeggio from its quality's intervals, or a lone note from `['1P']`.
 */
export function noteSet(root: NoteName, codes: readonly IntervalCode[]): NoteSet {
    return { root, notes: spell(root, codes), codes, intervals: codes.map(intervalName) };
}

/**
 * Spells notes from a root by interval (THY-1.1, THY-1.2): the C♯ dominant 7th `1P 3M 5P 7m` is C♯ E♯ G♯ B, and
 * from G♭ it's G♭ B♭ D♭ F♭. Each interval's number decides the letter and its quality the accidental.
 */
export function spell(root: NoteName, intervals: readonly IntervalCode[]): NoteName[] {
    if (Note.get(root).empty) throw new Error(`Not a note: ${root}`);
    return intervals.map(interval => {
        const note = Note.transpose(root, interval);
        if (note === '') throw new Error(`Can't spell ${interval} from ${root}`);
        return note;
    });
}
