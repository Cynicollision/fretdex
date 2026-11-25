import { noteLabel, notePitchName, pitchClass, type MappedNote } from '@fretdex/fretkit';

/** The keyboard's two octaves from C (DIAG-3.1), as MIDI numbers: C3 to B4. */
export const KEYBOARD_FROM = 48;
export const KEYBOARD_TO = 71;

const WHITES_PER_OCTAVE = 7;
const BLACK_KEYS = new Set([1, 3, 6, 8, 10]);

/** A key's place, white keys first so the black ones are drawn over them. */
export interface KeySpace {
    readonly midi: number;
    readonly black: boolean;
    readonly x: number;
    readonly width: number;
    readonly height: number;
}

/**
 * Lays out the keys across `width` (architecture.md's Styling): white keys a fourteenth of it, black keys 0.6 as wide and 0.62 as
 * tall, centred on the line between their white neighbours. Enlarged keys are taller for their width.
 */
export function layKeys(width: number, enlarged: boolean): { keys: KeySpace[]; height: number } {
    const whiteCount = ((KEYBOARD_TO - KEYBOARD_FROM + 1) / 12) * WHITES_PER_OCTAVE;
    const white = width / whiteCount;
    const height = white * (enlarged ? 5.2 : 4.2);
    const whites: KeySpace[] = [];
    const blacks: KeySpace[] = [];
    let index = 0;
    for (let midi = KEYBOARD_FROM; midi <= KEYBOARD_TO; midi++) {
        if (BLACK_KEYS.has(pitchClass(midi))) {
            const w = white * 0.6;
            blacks.push({ midi, black: true, x: index * white - w / 2, width: w, height: height * 0.62 });
        } else {
            whites.push({ midi, black: false, x: index * white, width: white, height });
            index++;
        }
    }
    return { keys: [...whites, ...blacks], height };
}

/**
 * A keyboard's text alternative (APP-6.4), its notes in the set's order: "C major on a keyboard: C, D, E, F, G, A, B;
 * the root C."
 */
export function describeKeyboard(title: string, marked: readonly MappedNote[]): string {
    const names: string[] = [];
    for (const note of [...marked].sort((a, b) => a.degree - b.degree)) {
        const name = noteLabel(notePitchName(note.note));
        if (!names.includes(name)) names.push(name);
    }
    const root = marked.find(note => note.degree === 1);
    const rootText = root ? `; the root ${noteLabel(notePitchName(root.note))}` : '';
    return `${title} on a keyboard: ${names.length === 0 ? 'nothing marked' : names.join(', ')}${rootText}.`;
}
