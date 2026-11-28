import type { Track } from '@fretdex/audio';
import type { FretboardCell } from '@fretdex/fretkit';
import { KEYBOARD_FROM, KEYBOARD_TO } from '#lib/diagrams/keyboard.ts';

/** A note of a scale run (AUD-3): where it's played on the neck, and the key lit for it on the keyboard. */
export interface RunNote {
    readonly cell: FretboardCell;
    /** The keyboard's key for it, the run moved by whole octaves onto its two; none where it falls off them (AUD-3.2). */
    readonly key: number | undefined;
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
 * A run's track (AUD-3.1): its notes ascending, then the same notes descending, so the top one sounds twice and the
 * way down mirrors the way up; one an eighth note, played once. On the keyboard the run keeps its shape, moved by
 * whole octaves to light as many of its notes as fit, its lowest note in the lower octave where that fits as many; a
 * note still off the keyboard lights no key, rather than one in the wrong octave (AUD-3.2).
 */
export function runTrack(ascending: readonly FretboardCell[]): Track<RunNote> {
    const shift = keyboardShift(ascending.map(cell => cell.midi));
    const notes = [...ascending, ...[...ascending].reverse()];
    return {
        events: notes.map((cell, i) => ({ beat: i * NOTE_BEATS, event: { cell, key: onKeyboard(cell.midi + shift) } })),
        length: notes.length * NOTE_BEATS,
        loop: false
    };
}

/** The whole octaves that move a run, lowest note first, onto the keyboard with the most of its notes on it. */
function keyboardShift(pitches: readonly number[]): number {
    const lifted = 12 * Math.ceil((KEYBOARD_FROM - (pitches[0] ?? KEYBOARD_FROM)) / 12);
    const fitting = (shift: number) => pitches.filter(midi => onKeyboard(midi + shift) !== undefined).length;
    return fitting(lifted - 12) > fitting(lifted) ? lifted - 12 : lifted;
}

function onKeyboard(midi: number): number | undefined {
    return midi >= KEYBOARD_FROM && midi <= KEYBOARD_TO ? midi : undefined;
}
