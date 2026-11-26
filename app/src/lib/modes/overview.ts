import {
    BRIGHTNESS,
    intervalLabel,
    isOfferedRoot,
    modeInfo,
    notePitchClass,
    parentRoot,
    rootChoices,
    scalePositions,
    scaleType,
    spell,
    spellScale,
    stepFormula,
    type Accidentals,
    type Instrument,
    type IntervalCode,
    type NoteName,
    type Position,
    type ScaleType,
    type SpelledScale
} from '@fretdex/fretkit';
import type { CurrentKey } from '#lib/settings/settings.ts';
import type { ScaleCardRef } from '#lib/url/routes.ts';

function type(id: string): ScaleType {
    const found = scaleType(id);
    if (found === undefined) throw new Error(`No scale ${id}`);
    return found;
}

const MAJOR = type('major');

/** The seven modes in order of the degree of the major scale each starts on, Ionian to Locrian (MODE-1.1). */
export const DEGREE_ORDER: readonly ScaleType[] = [...BRIGHTNESS].sort(
    (a, b) => (modeInfo(a)?.degree ?? 0) - (modeInfo(b)?.degree ?? 0)
);

/** Each mode's roman numeral in its major scale, by degree (MODE-1.1). */
const NUMERALS = ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'viiø'] as const;

/** The major scale's steps, `W W H W W W H` (SCL-2.1). */
const MAJOR_STEPS = stepFormula(MAJOR);

/**
 * The strip each row shows its steps on (MODE-1.14): the major scale's steps, then as many again as the last mode's
 * slice reaches, so every mode's seven steps fit, Locrian's starting at the seventh.
 */
export const STEP_STRIP: readonly string[] = [...MAJOR_STEPS, ...MAJOR_STEPS.slice(0, MAJOR_STEPS.length - 1)];

/** One row of the Modes overview (MODE-1.1). */
export interface ModeRow {
    /** The mode's scale card, which the row opens (MODE-1.7). */
    readonly card: ScaleCardRef;
    readonly set: SpelledScale;
    /** The degree of the major scale it starts on, 1 to 7. */
    readonly degree: number;
    /** Its roman numeral in the major scale: `I`, `ii` … `viiø`. */
    readonly numeral: string;
    /** The note that sets it apart (SCL-5.1). */
    readonly characteristic: IntervalCode;
}

/**
 * The seven modes of a major scale, a row each, Ionian to Locrian (MODE-1.1): each starts on its degree of the scale
 * and is spelled as the scale spells it, so C major's are C Ionian, D Dorian, E Phrygian … B Locrian.
 */
export function modeRows(parent: NoteName): ModeRow[] {
    const notes = spell(parent, MAJOR.intervals);
    return DEGREE_ORDER.map(scale => {
        const degree = modeInfo(scale)?.degree ?? 1;
        const root = notes[degree - 1] ?? parent;
        return {
            card: { kind: 'scale', root, scale },
            set: spellScale(root, scale),
            degree,
            numeral: NUMERALS[degree - 1] ?? '',
            characteristic: modeInfo(scale)?.characteristic ?? '1P'
        };
    });
}

/**
 * The position a row's fretboard shows (MODE-1.12): on guitar, the 3-notes-per-string pattern starting on the mode's
 * root on the lowest string (`nps` 1); on bass, the one-octave box from the root on the lowest string (`box` 1).
 * `undefined` if the instrument, tuning and capo leave it out.
 */
export function rowPosition(
    row: ModeRow,
    tuning: readonly NoteName[],
    instrument: Instrument,
    capo: number
): Position | undefined {
    const kind = instrument === 'bass' ? 'bass' : 'nps';
    const group = scalePositions(tuning, row.set, instrument, capo).find(candidate => candidate.kind === kind);
    return group?.positions.find(position => position.number === 1);
}

/** The slice of `STEP_STRIP` a row lights (MODE-1.14): its seven steps, from the one its degree starts. */
export function stepSlice(row: ModeRow): { readonly from: number; readonly to: number } {
    return { from: row.degree - 1, to: row.degree - 1 + MAJOR_STEPS.length - 1 };
}

/** A row's characteristic note as it names it (MODE-1.13): "♮6 characteristic", with ♮ where it has no accidental. */
export function characteristicLine(row: ModeRow): string {
    const label = intervalLabel(row.characteristic);
    return `${/^\d/u.test(label) ? `♮${label}` : label} characteristic`;
}

/**
 * A mode's parent major key, as the key picker would spell it (MODE-1.10): C for D Dorian, and for A♯ Dorian A♭, not G♯.
 * A scale that isn't a mode of the major scale is taken as Ionian.
 */
export function parentKey(root: NoteName, mode: ScaleType, accidentals: Accidentals): NoteName {
    const parent = parentRoot(root, mode) ?? root;
    return isOfferedRoot(parent, MAJOR) ? parent : rootChoices(notePitchClass(parent), MAJOR, accidentals).root;
}

/**
 * The major key `/modes` opens on (MODE-1.10): the current key's parent major (C for D Dorian, and for A minor), or C
 * with no key.
 */
export function overviewKey(key: CurrentKey | null, accidentals: Accidentals): NoteName {
    if (key === null) return 'C';
    const mode = type(key.mode === 'major' ? 'ionian' : key.mode === 'minor' ? 'aeolian' : key.mode);
    return parentKey(key.root, mode, accidentals);
}
