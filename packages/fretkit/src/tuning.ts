import { noteMidi, noteSlug, parseNote, type NoteName } from './note';

export type Instrument = 'guitar' | 'bass';

/**
 * A tuning: its open strings' pitches with octaves, lowest string first (THY-3.1), at the pitch they sound (THY-4.1).
 * Any number of strings from 4 to 8 works (THY-3.2).
 */
export interface Tuning {
    /** The tuning's name in URLs (`tuning=drop-d`). A custom tuning is written as its pitches instead (`tuningSlug`). */
    readonly id: string;
    readonly name: string;
    readonly strings: readonly NoteName[];
}

/** The built-in tunings for each instrument, Standard first (CTX-1.3). */
export const TUNINGS: Readonly<Record<Instrument, readonly Tuning[]>> = {
    guitar: [
        { id: 'standard', name: 'Standard', strings: ['E2', 'A2', 'D3', 'G3', 'B3', 'E4'] },
        { id: 'drop-d', name: 'Drop D', strings: ['D2', 'A2', 'D3', 'G3', 'B3', 'E4'] },
        { id: 'dadgad', name: 'DADGAD', strings: ['D2', 'A2', 'D3', 'G3', 'A3', 'D4'] },
        { id: 'open-g', name: 'Open G', strings: ['D2', 'G2', 'D3', 'G3', 'B3', 'D4'] },
        { id: 'open-d', name: 'Open D', strings: ['D2', 'A2', 'D3', 'F#3', 'A3', 'D4'] },
        { id: 'half-step-down', name: 'Half-step down', strings: ['Eb2', 'Ab2', 'Db3', 'Gb3', 'Bb3', 'Eb4'] }
    ],
    bass: [
        { id: 'standard', name: 'Standard', strings: ['E1', 'A1', 'D2', 'G2'] },
        { id: 'drop-d', name: 'Drop D', strings: ['D1', 'A1', 'D2', 'G2'] },
        { id: 'half-step-down', name: 'Half-step down', strings: ['Eb1', 'Ab1', 'Db2', 'Gb2'] }
    ]
};

/** The fewest and most strings a tuning may have (THY-3.2). */
export const MIN_STRINGS = 4;
export const MAX_STRINGS = 8;

/** The highest capo fret (CTX-1.9). */
export const MAX_CAPO = 11;

/**
 * Reads a tuning written as its pitches, lowest first, as a URL carries a custom one (`D2-A2-D3-G3-A3-D4`, sharps as
 * `s` or `#`). Gives `undefined` unless every string is a note with an octave and there are 4 to 8 of them.
 */
export function parseTuning(text: string): NoteName[] | undefined {
    const strings = text.split('-').map(parseNote);
    if (strings.length < MIN_STRINGS || strings.length > MAX_STRINGS) return undefined;
    const valid = strings.filter((note): note is NoteName => note !== undefined && noteMidi(note) !== undefined);
    return valid.length === strings.length ? valid : undefined;
}

/** A tuning's pitches as a URL writes them: `D2-A2-D3-Fs3-A3-D4`. */
export function tuningSlug(strings: readonly NoteName[]): string {
    return strings.map(noteSlug).join('-');
}

/**
 * The string number players use for an index into a tuning's strings, which run lowest first: the highest-pitched
 * string is 1 (THY-3.4), so on a six-string the lowest, index 0, is 6.
 */
export function stringNumber(index: number, stringCount: number): number {
    return stringCount - index;
}

/** The index into a tuning's strings, lowest first, of a string number (1 = the highest, THY-3.4). */
export function stringIndex(number: number, stringCount: number): number {
    return stringCount - number;
}

/**
 * The MIDI numbers the open strings sound, lowest first. A capo raises each by its fret count (THY-3.5), so anything
 * computed from these works with a capo unchanged: with the capo at 2, standard tuning's open strings sound F♯ B E A
 * C♯ F♯.
 */
export function openStrings(strings: readonly NoteName[], capo = 0): number[] {
    return strings.map(note => {
        const midi = noteMidi(note);
        if (midi === undefined) throw new Error(`A tuning's strings need octaves: ${note}`);
        return midi + capo;
    });
}

/**
 * The MIDI number a fret sounds, at the pitch it really sounds (THY-4.1): the low E string's open E2 is 40. Frets are
 * counted from the nut whether or not there's a capo; a fret below the capo can't be played, so gives `undefined`, and
 * the capo's own fret is the string played open.
 */
export function fretMidi(strings: readonly NoteName[], string: number, fret: number, capo = 0): number | undefined {
    if (fret < capo) return undefined;
    const open = openStrings(strings)[stringIndex(string, strings.length)];
    return open === undefined ? undefined : open + fret;
}
