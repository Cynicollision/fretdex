import type { Track } from '@fretdex/audio';
import type { FretboardCell } from '@fretdex/fretkit';
import { KEYBOARD_FROM, KEYBOARD_TO } from '#lib/diagrams/keyboard.ts';

/** A note of a scale run (AUD-3): where it's played on the neck, and the key lit for it on the keyboard. */
export interface RunNote {
    readonly cell: FretboardCell;
    /** The keyboard's key for it, moved by whole octaves into the keyboard's two (AUD-3.2). */
    readonly key: number;
}

/** Each note of a run is an eighth note (AUD-3.1), half a beat. */
const NOTE_BEATS = 0.5;

/**
 * The notes a run plays, lowest first, before it turns back down (AUD-3.1). A position plays all its notes, lowest to
 * highest. The full neck plays one octave up from the lowest root among `cells`, each note on the lowest fret it falls
 * on, as an open-position scale is played; a note on the same fret on two strings goes on the lower-pitched string.
 */
export function runNotes(cells: readonly FretboardCell[], position?: { readonly cells: readonly FretboardCell[] }) {
    if (position) return lowestFirst(position.cells);
    const roots = cells.filter(cell => cell.degree === 1).map(cell => cell.midi);
    if (roots.length === 0) return [];
    const from = Math.min(...roots);
    const byPitch = new Map<number, FretboardCell>();
    for (const cell of cells) {
        if (cell.midi < from || cell.midi > from + 12) continue;
        const kept = byPitch.get(cell.midi);
        if (!kept || cell.fret < kept.fret || (cell.fret === kept.fret && cell.string > kept.string)) {
            byPitch.set(cell.midi, cell);
        }
    }
    return lowestFirst([...byPitch.values()]);
}

/** Cells in pitch order, each pitch once, the lower-pitched string first where two strings sound the same note. */
function lowestFirst(cells: readonly FretboardCell[]): FretboardCell[] {
    const sorted = [...cells].sort((a, b) => a.midi - b.midi || b.string - a.string);
    return sorted.filter((cell, i) => cell.midi !== sorted[i - 1]?.midi);
}

/**
 * A run's track (AUD-3.1): its notes ascending, then descending back to the first without playing the top one twice,
 * one an eighth note, played once. Each note's key on the keyboard keeps the run's shape: the lowest note lands in the
 * keyboard's lower octave, and a note above its top is lit an octave down (AUD-3.2).
 */
export function runTrack(ascending: readonly FretboardCell[]): Track<RunNote> {
    const lowest = ascending[0]?.midi ?? KEYBOARD_FROM;
    const shift = 12 * Math.ceil((KEYBOARD_FROM - lowest) / 12);
    const notes = [...ascending, ...ascending.slice(0, -1).reverse()];
    return {
        events: notes.map((cell, i) => ({ beat: i * NOTE_BEATS, event: { cell, key: onKeyboard(cell.midi + shift) } })),
        length: notes.length * NOTE_BEATS,
        loop: false
    };
}

function onKeyboard(midi: number): number {
    let key = midi;
    while (key > KEYBOARD_TO) key -= 12;
    while (key < KEYBOARD_FROM) key += 12;
    return key;
}
