import { noteAlteration, notePitchClass, spellingsOf, type NoteName } from './note';
import { pitchClass } from './pitch';
import { scaleType, spell, spellScale, type ScaleType } from './scale';

/** The accidentals setting (CTX-1.6). */
export type Accidentals = 'auto' | 'sharps' | 'flats';

/** One of a root picker's 12 buttons (THY-2.2). */
export interface PickerRoot {
    readonly pitchClass: number;
    /** A white key's letter, or a black key's sharp then its flat. The button shows each, as `noteLabel` writes it. */
    readonly spellings: readonly NoteName[];
}

/** The 12 roots a picker offers, C to B (THY-2.2). */
export const PICKER_ROOTS: readonly PickerRoot[] = Array.from({ length: 12 }, (_, pc) => ({
    pitchClass: pc,
    spellings: pickerSpellings(pc)
}));

/** The black keys' names on Auto where there's no key to spell them (THY-2.3). */
const LONE_NAMES: Partial<Record<number, NoteName>> = { 1: 'C#', 3: 'Eb', 6: 'F#', 8: 'Ab', 10: 'Bb' };

/** A white key's letter, or a black key's sharp and flat. */
function pickerSpellings(pc: number): NoteName[] {
    const spellings = spellingsOf(pc);
    const natural = spellings.find(spelling => noteAlteration(spelling) === 0);
    return natural === undefined ? spellings.filter(spelling => Math.abs(noteAlteration(spelling)) === 1) : [natural];
}

/**
 * How a note with no key is spelled (THY-2.3), such as a fretboard's note names outside a scale: on Auto the black
 * keys are C♯ E♭ F♯ A♭ B♭, otherwise all sharps or all flats.
 */
export function spellPitchClass(pc: number, accidentals: Accidentals): NoteName {
    const normalized = pitchClass(pc);
    const [sharp = 'C', flat = sharp] = PICKER_ROOTS[normalized]?.spellings ?? [];
    if (accidentals === 'sharps') return sharp;
    if (accidentals === 'flats') return flat;
    return LONE_NAMES[normalized] ?? sharp;
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
 * A white-key pitch class is always its letter. For a black key, if only one spelling's key needs no double sharp or
 * flat, that one, whatever the setting (B♭ Dorian, since A♯ Dorian's key would need F𝄪). Otherwise **Auto** takes the
 * spelling with fewer accidentals in its key signature (D♭ major, not C♯). At a tie (six each: F♯ or G♭ major, D♯ or
 * E♭ minor) it takes sharps for a scale read in a key with a major 3rd and flats for one with a minor 3rd, so F♯ major,
 * E♭ minor, A♭ Dorian and C♯ Mixolydian. **Prefer sharps** and **Prefer flats** take their spelling where both keys
 * are clean. Where both need doubles (C♯ or D♭ altered), neither reads better, so the button opens Auto's whatever the
 * setting, and the card says why (SCL-2.6, `unavoidableDoubles`).
 */
export function rootFor(pc: number, type: ScaleType, accidentals: Accidentals): NoteName {
    return rootChoices(pc, type, accidentals).root;
}

/** A picker button's choice for one scale: the root it opens, and the other spelling one tap away if it's offered. */
export interface RootChoice {
    readonly root: NoteName;
    readonly alternative?: NoteName;
}

/**
 * The root a picker button opens in a scale (`rootFor`), and its other spelling one tap away when that's a key as
 * clean as the root's: neither needs a double sharp or flat (THY-2.2, THY-2.5). `isOfferedRoot` offers exactly these.
 */
export function rootChoices(pc: number, type: ScaleType, accidentals: Accidentals): RootChoice {
    const [sharp = 'C', flat] = PICKER_ROOTS[pitchClass(pc)]?.spellings ?? [];
    if (flat === undefined) return { root: sharp };
    const sharpSignature = signature(sharp, type);
    const flatSignature = signature(flat, type);
    if (sharpSignature.doubles !== flatSignature.doubles) {
        // Only the spelling whose key needs no double sharp or flat is offered.
        return { root: sharpSignature.doubles ? flat : sharp };
    }
    const sharpCount = sharpSignature.sharps + sharpSignature.flats;
    const flatCount = flatSignature.sharps + flatSignature.flats;
    let auto: NoteName;
    if (sharpCount !== flatCount) auto = sharpCount < flatCount ? sharp : flat;
    else auto = signatureScale(type).intervals.includes('3M') ? sharp : flat;
    // Both need doubles: the other spelling reads no better, so only Auto's is offered.
    if (sharpSignature.doubles) return { root: auto };
    const root = accidentals === 'sharps' ? sharp : accidentals === 'flats' ? flat : auto;
    return { root, alternative: root === sharp ? flat : sharp };
}

/**
 * Whether a root is offered in a scale's root pickers (THY-2.2, THY-2.5): it's a spelling `rootChoices` opens or puts
 * one tap away on its button. So a white key's letter always is, as its button's only spelling, even where the scale
 * needs a double sharp (E altered's F𝄪); a black key's spelling is unless its key needs a double sharp or flat and
 * the other spelling's doesn't, or both need them and it isn't Auto's (D♭ altered, beside C♯); and E♯, B♯, F♭ and
 * C♭ never are.
 */
export function isOfferedRoot(root: NoteName, type: ScaleType): boolean {
    const pc = notePitchClass(root);
    if (!(PICKER_ROOTS[pc]?.spellings ?? []).includes(root)) return false;
    const { root: auto, alternative } = rootChoices(pc, type, 'auto');
    return root === auto || root === alternative;
}

/**
 * Whether a scale's notes on a root need a double sharp or flat however the root is spelled among the pickers'
 * spellings, so the card should say why (SCL-2.6): C♯ altered needs D𝄪 and F𝄪, and D♭ altered E𝄫 and B𝄫; E altered
 * needs F𝄪, and E is its button's only spelling. Not G♯ harmonic minor, whose F𝄪 A♭ harmonic minor avoids.
 */
export function unavoidableDoubles(root: NoteName, type: ScaleType): boolean {
    const hasDoubles = (spelling: NoteName) =>
        spellScale(spelling, type).notes.some(note => Math.abs(noteAlteration(note)) > 1);
    const spellings = PICKER_ROOTS[notePitchClass(root)]?.spellings ?? [];
    return hasDoubles(root) && spellings.every(hasDoubles);
}

/**
 * For a root reached by a link or search whose key would need a double sharp or flat, the enharmonic root to offer
 * instead (A♯ Dorian offers B♭ Dorian, THY-2.5); `undefined` when the root's key needs none, when the root is a
 * natural (E altered keeps its F𝄪), or when no spelling does better (D♭ altered, whose C♯ needs D𝄪; the card says
 * why instead, `unavoidableDoubles`).
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
