import { Note } from 'tonal';
import { accidentalSymbols, accidentalText } from './accidental';
import { pitchClass } from './pitch';

/**
 * A spelled note as `fretkit` passes it around: a capital letter, then a `#` or `b` for each semitone it's raised or
 * lowered, then an optional octave (`F#`, `Bbb`, `E2`). It's the form Tonal.js reads. Text a user typed or a URL
 * carried goes through `parseNote` first, which takes up to double sharps and flats; text shown on screen comes from
 * `noteLabel`. Functions given something that isn't a note throw.
 */
export type NoteName = string;

const LETTERS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'] as const;
const LETTER_PITCH_CLASS = [0, 2, 4, 5, 7, 9, 11] as const;

/** What each accidental a user may type is worth, in semitones (THY-1.5). */
const ACCIDENTAL_VALUES: Record<string, number> = {
    '#': 1,
    s: 1,
    S: 1,
    '♯': 1,
    x: 2,
    X: 2,
    '𝄪': 2,
    b: -1,
    '♭': -1,
    '𝄫': -2
};

/**
 * Reads a note as a user types it or a URL carries it (THY-1.3, THY-1.5): a letter in either case, accidentals
 * written `#`, `s`, `♯`, `x`, `𝄪`, `b`, `♭` or `𝄫` (up to a double sharp or double flat, all one way; `s` and `x` in
 * either case, `b` only lower case) or a lone `♮`, and an optional octave from 0 to 9. Gives `undefined` for
 * anything else.
 *
 * `parseNote('fs')` is `'F#'`, `parseNote('Fss3')` is `'F##3'`, `parseNote('bb')` is `'Bb'`.
 */
export function parseNote(text: string): NoteName | undefined {
    const match = /^([A-Ga-g])(\D*?)(\d)?$/u.exec(text.trim());
    if (!match) return undefined;
    const [, letter = '', accidentals = '', octave = ''] = match;
    let alteration = 0;
    let direction = 0;
    for (const symbol of accidentals === '♮' ? '' : accidentals) {
        const value = ACCIDENTAL_VALUES[symbol];
        if (value === undefined) return undefined;
        if (direction !== 0 && Math.sign(value) !== direction) return undefined;
        direction = Math.sign(value);
        alteration += value;
    }
    if (Math.abs(alteration) > 2) return undefined;
    return letter.toUpperCase() + accidentalText(alteration) + octave;
}

/**
 * A note as it's shown on screen, with ♯ ♭ 𝄪 𝄫 (THY-1.5): `noteLabel('F##')` is `'F𝄪'`, and the triple sharp that a
 * linked root such as G𝄪 major needs is `'F♯𝄪'`.
 */
export function noteLabel(note: NoteName): string {
    const { letter, alt, oct } = getNote(note);
    return letter + accidentalSymbols(alt) + (oct ?? '');
}

/**
 * A note as it's written in a URL, with sharps as `s` (THY-1.3, architecture's URL scheme):
 * `noteSlug('F#')` is `'Fs'`, `noteSlug('F##3')` is `'Fss3'`, `noteSlug('Bb')` is `'Bb'`.
 */
export function noteSlug(note: NoteName): string {
    return getNote(note).name.replaceAll('#', 's');
}

/** The pitch class (0 = C … 11 = B) of a spelled note, with or without an octave. */
export function notePitchClass(note: NoteName): number {
    return getNote(note).chroma;
}

/** The MIDI number of a spelled note with an octave (`E2` is 40), or `undefined` without one. */
export function noteMidi(note: NoteName): number | undefined {
    return getNote(note).midi ?? undefined;
}

/** How many semitones a note's accidentals move its letter: 2 for `F##`, -1 for `Bb`, 0 for `C`. */
export function noteAlteration(note: NoteName): number {
    return getNote(note).alt;
}

/** The note's name without its octave: `E2` gives `E`. */
export function notePitchName(note: NoteName): NoteName {
    return getNote(note).pc;
}

/** Every spelling of a pitch class with at most a double sharp or flat, fewest accidentals first, sharps before flats. */
export function spellingsOf(pc: number): NoteName[] {
    const spellings: { name: NoteName; alteration: number }[] = [];
    LETTERS.forEach((letter, index) => {
        const letterPc = LETTER_PITCH_CLASS[index] ?? 0;
        // The alteration from the letter to the pitch class, as the nearest way round (-6 to 5).
        const alteration = pitchClass(pc - letterPc + 6) - 6;
        if (Math.abs(alteration) <= 2) spellings.push({ name: letter + accidentalText(alteration), alteration });
    });
    return spellings
        .sort((a, b) => Math.abs(a.alteration) - Math.abs(b.alteration) || b.alteration - a.alteration)
        .map(spelling => spelling.name);
}

/**
 * A pitch class with its octave, from a MIDI number and the spelling it should take:
 * `spellMidi(60, 'B#')` is `'B#3'`, since B♯3 sounds as middle C.
 */
export function spellMidi(midi: number, spelling: NoteName): NoteName {
    const name = notePitchName(spelling);
    const guess = Math.floor(midi / 12) - 1;
    for (const octave of [guess, guess - 1, guess + 1]) {
        if (Note.get(name + String(octave)).midi === midi) return name + String(octave);
    }
    throw new Error(`${spelling} can't spell MIDI note ${String(midi)}`);
}

/** Tonal.js's reading of a note, or an error if it isn't one. */
function getNote(note: NoteName): ReturnType<typeof Note.get> {
    const parsed = Note.get(note);
    if (parsed.empty) throw new Error(`Not a note: ${note}`);
    return parsed;
}
