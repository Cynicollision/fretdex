import { Note } from 'tonal';
import { accidentalText } from './accidental';
import { intervalSemitones, type IntervalCode } from './interval';
import type { NoteName } from './note';
import { SCALE_TYPES, spell, type ScaleType } from './scale';

/** What makes one of the seven modes of the major scale a mode (SCL-5, MODE-1). */
export interface ModeInfo {
    /** Its degree in its parent major scale: Ionian 1, Dorian 2 … Locrian 7. */
    readonly degree: number;
    /** The note that sets it apart (SCL-5.1): Dorian's natural 6 is `6M`, and Ionian's the natural 4 that Lydian lacks. */
    readonly characteristic: IntervalCode;
}

const MODES: Readonly<Record<string, ModeInfo>> = {
    lydian: { degree: 4, characteristic: '4A' },
    ionian: { degree: 1, characteristic: '4P' },
    mixolydian: { degree: 5, characteristic: '7m' },
    dorian: { degree: 2, characteristic: '6M' },
    aeolian: { degree: 6, characteristic: '6m' },
    phrygian: { degree: 3, characteristic: '2m' },
    locrian: { degree: 7, characteristic: '5d' }
};

/** The seven modes of the major scale from brightest to darkest, Lydian to Locrian (SCL-5.2, MODE-1.1). */
export const BRIGHTNESS: readonly ScaleType[] = SCALE_TYPES.filter(type => type.group === 'modes');

/** A mode of the major scale's degree and characteristic note, or `undefined` for any other scale (MODE-1.8). */
export function modeInfo(type: ScaleType): ModeInfo | undefined {
    return MODES[type.id];
}

/** The major scale's interval up to each of its degrees, 1 to 7. */
const MAJOR_DEGREES: readonly IntervalCode[] = ['1P', '2M', '3M', '4P', '5P', '6M', '7M'];

/**
 * The root of a mode's parent major scale (SCL-5.1): D Dorian's is C, and A♯ Dorian's G♯. `undefined` for a scale
 * that isn't a mode of the major scale.
 */
export function parentRoot(root: NoteName, type: ScaleType): NoteName | undefined {
    const mode = modeInfo(type);
    const up = mode === undefined ? undefined : MAJOR_DEGREES[mode.degree - 1];
    if (up === undefined) return undefined;
    return Note.transpose(root, `-${up}`);
}

/** A chord built on a degree of a seven-note scale from its own notes (SCL-5.3). */
export interface DiatonicChord {
    /** Its degree in the scale, from 1. */
    readonly degree: number;
    /** Its root, spelled as the scale spells it. */
    readonly root: NoteName;
    /** Its notes, root first, spelled as the scale spells them. */
    readonly notes: readonly NoteName[];
    /** Its quality's suffix, written with `b` as `intervalName` writes it: `''`, `m`, `dim`, `aug`, `maj7`, `7`, `m7`, `m7b5`. */
    readonly suffix: string;
    /** Its roman numeral relative to the scale, written with `b` and `#`: `bIII`, `vi°`, `bVIImaj7`, `iiø7`. */
    readonly numeral: string;
}

const NUMERALS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'] as const;

/** Each triad and 7th quality by its intervals' semitones above its root (3rd, 5th, and 7th when there is one). */
const QUALITIES: readonly { readonly steps: string; readonly suffix: string; readonly numeral: string }[] = [
    { steps: '4,7', suffix: '', numeral: '' },
    { steps: '3,7', suffix: 'm', numeral: '' },
    { steps: '3,6', suffix: 'dim', numeral: '°' },
    { steps: '4,8', suffix: 'aug', numeral: '+' },
    { steps: '4,7,11', suffix: 'maj7', numeral: 'maj7' },
    { steps: '4,7,10', suffix: '7', numeral: '7' },
    { steps: '3,7,10', suffix: 'm7', numeral: '7' },
    { steps: '3,6,10', suffix: 'm7b5', numeral: 'ø7' },
    { steps: '3,6,9', suffix: 'dim7', numeral: '°7' },
    { steps: '3,7,11', suffix: 'mMaj7', numeral: 'maj7' },
    { steps: '4,8,11', suffix: 'maj7#5', numeral: 'maj7' }
];

/**
 * The triads (`size` 3) or 7th chords (`size` 4) on each degree of a seven-note scale, stacked in 3rds from its own
 * notes, with roman numerals relative to the scale (SCL-5.3): D Dorian's triads are `i ii bIII IV v vi° bVII`. A
 * numeral takes the flat or sharp of its degree against the major scale, and is upper case for a major 3rd. Empty for
 * a scale without seven notes.
 */
export function diatonicChords(root: NoteName, type: ScaleType, size: 3 | 4): DiatonicChord[] {
    const count = type.intervals.length;
    if (count !== 7) return [];
    const notes = spell(root, type.intervals);
    const semitones = type.intervals.map(intervalSemitones);
    return type.intervals.map((code, i) => {
        const stack = Array.from({ length: size }, (_, k) => (i + 2 * k) % count);
        const steps = stack
            .slice(1)
            .map(index => ((semitones[index] ?? 0) - (semitones[i] ?? 0) + 12) % 12)
            .join(',');
        const quality = QUALITIES.find(candidate => candidate.steps === steps);
        if (quality === undefined) throw new Error(`No chord quality for ${steps}`);
        const major = steps.startsWith('4');
        const alteration = (semitones[i] ?? 0) - intervalSemitones(MAJOR_DEGREES[i] ?? '1P');
        const numeral = NUMERALS[i] ?? '';
        return {
            degree: i + 1,
            root: notes[i] ?? root,
            notes: stack.map(index => notes[index] ?? root),
            suffix: quality.suffix,
            numeral: accidentalText(alteration) + (major ? numeral : numeral.toLowerCase()) + quality.numeral
        };
    });
}

/** A step's name by its size in semitones (SCL-2.1): `H`, `W`, and `1½` for a minor 3rd's leap. */
const STEP_NAMES: Readonly<Record<number, string>> = { 1: 'H', 2: 'W', 3: '1½', 4: '2' };

/**
 * A scale's formula in steps, from the root to the octave above (SCL-2.1): the major scale's is `W W H W W W H`,
 * and the minor pentatonic's `1½ W W 1½ W`.
 */
export function stepFormula(type: ScaleType): string[] {
    const semitones = [...type.intervals.map(intervalSemitones), 12];
    return semitones.slice(1).map((value, i) => {
        const size = value - (semitones[i] ?? 0);
        return STEP_NAMES[size] ?? String(size);
    });
}
