import { noteAlteration, notePitchClass, spellingsOf, type NoteName } from './note';
import { pitchClass } from './pitch';
import { scaleType, spell, type ScaleType } from './scale';

/** The accidentals setting (CTX-1.6). */
export type Accidentals = 'auto' | 'sharps' | 'flats';

/** One of a root picker's 12 buttons (THY-2.2). */
export interface PickerRoot {
    readonly pitchClass: number;
    /** What the button shows (`C`, `C#` and `Db`, `Eb`); `noteLabel` each to show it. */
    readonly shown: readonly NoteName[];
    /** A white key's letter, or a black key's sharp then its flat. */
    readonly spellings: readonly NoteName[];
}

/** The 12 roots a picker offers, C to B (THY-2.2). */
export const PICKER_ROOTS: readonly PickerRoot[] = (
    [['C'], ['C#', 'Db'], ['D'], ['Eb'], ['E'], ['F'], ['F#', 'Gb'], ['G'], ['Ab'], ['A'], ['Bb'], ['B']] as const
).map((shown, pc) => ({
    pitchClass: pc,
    shown,
    spellings: pickerSpellings(pc)
}));

/** A white key's letter, or a black key's sharp and flat. */
function pickerSpellings(pc: number): NoteName[] {
    const spellings = spellingsOf(pc);
    const natural = spellings.find(spelling => noteAlteration(spelling) === 0);
    return natural === undefined ? spellings.filter(spelling => Math.abs(noteAlteration(spelling)) === 1) : [natural];
}

/**
 * How a note with no key is spelled (THY-2.3), such as a fretboard's note names outside a scale: on Auto as the root
 * pickers name it (C♯ E♭ F♯ A♭ B♭), otherwise all sharps or all flats.
 */
export function spellPitchClass(pc: number, accidentals: Accidentals): NoteName {
    const root = PICKER_ROOTS[pitchClass(pc)];
    const [sharp = 'C', flat = sharp] = root?.spellings ?? [];
    if (accidentals === 'sharps') return sharp;
    if (accidentals === 'flats') return flat;
    return root?.shown[0] ?? sharp;
}

/** How a root's key signature reads: how many sharps and flats, counting a double sharp or flat as two. */
export interface Signature {
    readonly sharps: number;
    readonly flats: number;
    /** Whether the key needs a double sharp or flat, so the root isn't offered in pickers (THY-2.5). */
    readonly doubles: boolean;
}

/**
 * The key signature a scale on a root is read in (THY-2.1, THY-2.5): the notes of its `signatureFrom` scale on the
 * same root, or its own. The signature of A♯ Dorian is G♯ major's, with F𝄪.
 */
export function signature(root: NoteName, type: ScaleType): Signature {
    const notes = spell(root, signatureScale(type).intervals);
    let sharps = 0;
    let flats = 0;
    let doubles = false;
    for (const note of notes) {
        const alteration = noteAlteration(note);
        if (alteration > 0) sharps += alteration;
        else flats -= alteration;
        if (Math.abs(alteration) > 1) doubles = true;
    }
    return { sharps, flats, doubles };
}

/**
 * The root a picker opens for a pitch class in a scale (THY-2.1 to THY-2.3, THY-2.5).
 *
 * A white-key pitch class is always its letter. For a black key, **Auto** takes the spelling with fewer accidentals in
 * its key signature (D♭ major, not C♯). At a tie (six each: F♯ or G♭ major, D♯ or E♭ minor) it takes sharps for a
 * scale read in a key with a major 3rd and flats for one with a minor 3rd, so F♯ major, E♭ minor, A♭ Dorian and C♯
 * Mixolydian. **Prefer sharps** and **Prefer flats** take their spelling, unless its key would need a double sharp or
 * flat (A♯ Dorian), when they take the other.
 */
export function rootFor(pc: number, type: ScaleType, accidentals: Accidentals): NoteName {
    return rootChoices(pc, type, accidentals).root;
}

/** A picker button's choice for one scale: the root it opens, and the other spelling one tap away if it's offered. */
export interface RootChoice {
    readonly root: NoteName;
    readonly alternative?: NoteName;
}

/** The root a picker button opens in a scale, and its other spelling if that's offered (THY-2.2, THY-2.5). */
export function rootChoices(pc: number, type: ScaleType, accidentals: Accidentals): RootChoice {
    const [sharp = 'C', flat] = PICKER_ROOTS[pitchClass(pc)]?.spellings ?? [];
    if (flat === undefined) return { root: sharp };
    const sharpSignature = signature(sharp, type);
    const flatSignature = signature(flat, type);
    let root: NoteName;
    if (sharpSignature.doubles !== flatSignature.doubles) {
        root = sharpSignature.doubles ? flat : sharp;
    } else if (accidentals === 'sharps') {
        root = sharp;
    } else if (accidentals === 'flats') {
        root = flat;
    } else {
        const sharpCount = sharpSignature.sharps + sharpSignature.flats;
        const flatCount = flatSignature.sharps + flatSignature.flats;
        if (sharpCount !== flatCount) root = sharpCount < flatCount ? sharp : flat;
        else root = signatureScale(type).intervals.includes('3M') ? sharp : flat;
    }
    const other = root === sharp ? flat : sharp;
    return signature(other, type).doubles ? { root } : { root, alternative: other };
}

/**
 * Whether a root is offered in a scale's root pickers (THY-2.2, THY-2.5): a white key's letter always is, since it's
 * that button's only spelling, even where the scale needs a double sharp (E altered's F𝄪). A black key's sharp or flat
 * is, unless its key would need a double sharp or flat. E♯, B♯, F♭ and C♭ never are.
 */
export function isOfferedRoot(root: NoteName, type: ScaleType): boolean {
    const spellings = PICKER_ROOTS[notePitchClass(root)]?.spellings ?? [];
    if (!spellings.includes(root)) return false;
    return spellings.length === 1 || !signature(root, type).doubles;
}

/**
 * For a root reached by a link or search whose key would need a double sharp or flat, the enharmonic root to offer
 * instead (A♯ Dorian offers B♭ Dorian, THY-2.5); `undefined` when the root's key needs none, when the root is a
 * natural (E altered keeps its F𝄪), or when no spelling does better.
 */
export function simplerRoot(root: NoteName, type: ScaleType): NoteName | undefined {
    if (!signature(root, type).doubles || noteAlteration(root) === 0) return undefined;
    return spellingsOf(notePitchClass(root)).find(
        spelling => Math.abs(noteAlteration(spelling)) <= 1 && !signature(spelling, type).doubles
    );
}

function signatureScale(type: ScaleType): ScaleType {
    return (type.signatureFrom === undefined ? undefined : scaleType(type.signatureFrom)) ?? type;
}
