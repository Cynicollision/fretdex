import {
    changedFrom,
    fretMidi,
    intervalLabel,
    mapScale,
    modeInfo,
    notePitchClass,
    pitchClass,
    spellScale,
    type Accidentals,
    type FretRange,
    type IntervalCode,
    type ModeChange,
    type NoteName,
    type SpelledScale
} from '@fretdex/fretkit';
import { brightnessRow } from '#lib/scales/card.ts';
import type { ScaleCardRef } from '#lib/url/routes.ts';

/** How many frets each row's neck shows (MODE-1.1). */
export const WINDOW_FRETS = 6;

/** One row of the Modes overview (MODE-1.1, MODE-1.9). */
export interface ModeRow {
    /** The mode's scale card, which the row opens (MODE-1.7). */
    readonly card: ScaleCardRef;
    readonly set: SpelledScale;
    /** The note that sets the mode apart (SCL-5.1). */
    readonly characteristic: IntervalCode;
    /** The note it flattened from the row above; none for Lydian, the first. */
    readonly change?: ModeChange;
}

/**
 * The overview's seven rows on a root, brightest first (MODE-1.1), each spelled as the scale card's brightness row
 * spells it (SCL-5.2), so A♯'s rows have B♭ Lydian.
 */
export function modeRows(root: NoteName, accidentals: Accidentals): ModeRow[] {
    return brightnessRow(root, accidentals).flatMap(card => {
        const info = modeInfo(card.scale);
        if (info === undefined) return [];
        const change = changedFrom(card.scale);
        return [
            {
                card,
                set: spellScale(card.root, card.scale),
                characteristic: info.characteristic,
                ...(change === undefined ? {} : { change })
            }
        ];
    });
}

/**
 * The frets every row's neck shows (MODE-1.1): six, from a fret below the root's lowest place on the lowest string at
 * or above the capo, or from the capo or nut when the root is there. The same for every row, so from row to row only
 * the changed note moves.
 */
export function modeWindow(tuning: readonly NoteName[], root: NoteName, capo: number): FretRange {
    const target = notePitchClass(root);
    let rootFret = capo;
    for (let fret = capo; fret < capo + 12; fret++) {
        const midi = fretMidi(tuning, tuning.length, fret, capo);
        if (midi !== undefined && pitchClass(midi) === target) {
            rootFret = fret;
            break;
        }
    }
    const from = Math.max(capo, rootFret - 1);
    return { from, to: from + WINDOW_FRETS - 1 };
}

/** A fret the changed note moved from, drawn hollow (MODE-1.9). */
export interface Ghost {
    readonly string: number;
    readonly fret: number;
}

/**
 * Where a row's changed note was in the row above (MODE-1.9): each fret in the window where the brighter mode had
 * it, one fret above where this mode has it now. Left out where that fret is past the window.
 */
export function ghosts(row: ModeRow, tuning: readonly NoteName[], window: FretRange, capo: number): Ghost[] {
    if (row.change === undefined) return [];
    const { to } = row.change;
    return mapScale(tuning, row.set, window, capo)
        .filter(cell => cell.code === to && cell.fret + 1 <= window.to)
        .map(cell => ({ string: cell.string, fret: cell.fret + 1 }));
}

/** An interval as the row names it: with ♮ where it has no accidental, as it contrasts with one (Dorian's ♮6). */
export function markedInterval(code: IntervalCode): string {
    const label = intervalLabel(code);
    return /^\d/u.test(label) ? `♮${label}` : label;
}

/**
 * What a row says about its marks (MODE-1.9): its characteristic note, and the note it changed from the row above
 * when that's another one. "♯4 characteristic" for Lydian, "♮4 characteristic, was ♯4" for Ionian and
 * "♮6 characteristic · ♭3, was 3" for Dorian.
 */
export function rowMarks(row: ModeRow): string {
    const characteristic = `${markedInterval(row.characteristic)} characteristic`;
    if (row.change === undefined) return characteristic;
    const was = `was ${intervalLabel(row.change.from)}`;
    if (row.change.to === row.characteristic) return `${characteristic}, ${was}`;
    return `${characteristic} · ${intervalLabel(row.change.to)}, ${was}`;
}
