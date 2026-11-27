import {
    intervalLabel,
    noteLabel,
    notePitchName,
    type FretboardCell,
    type FretRange,
    type MappedNote,
    type NoteName,
    stringIndex
} from '@fretdex/fretkit';
import type { Labels } from '#lib/settings/settings.ts';

/** A fret that was tapped, with the note it sounds, in the set or not (DIAG-1.6). */
export interface TappedFret {
    readonly string: number;
    readonly fret: number;
    readonly midi: number;
    readonly note: NoteName;
    /** The set's note there, if it has one. */
    readonly cell?: FretboardCell;
}

/** The fretboard's sizes, in CSS pixels (architecture.md's Styling). */
export const SIZES = {
    /** Around the neck, so a dot at the edge isn't clipped. */
    edge: 8,
    /** The open strings' column, left of the nut. */
    open: 40,
    nut: 7,
    /** Between strings, and so a dot's tap height (APP-5.1). */
    gap: 44,
    /** Above the top string and below the bottom one, inside the neck. */
    overhang: 16,
    /** Below the neck, for the fret numbers. */
    numbers: 30,
    dot: 30,
    /** The narrowest a fret may be: the tap target (APP-5.1). */
    tap: 44,
    /** The most frets a stretch shows upright (DIAG-1.10). */
    stretch: 6
} as const;

/** Each fret is this much the width of the one below it, so the frets narrow gently up the neck (DIAG-1.8). */
export const FRET_RATIO = 0.98;

/** The frets with an inlay; 12 and 24 have two (DIAG-1.1). */
export const INLAYS: readonly number[] = [3, 5, 7, 9, 12, 15, 17, 19, 21, 24];
export const DOUBLE_INLAYS: readonly number[] = [12, 24];

/**
 * The widths of frets `first` to `last` (from 1) sharing `total` pixels, each `FRET_RATIO` of the one below it
 * (DIAG-1.8). Where that would make the narrowest fret thinner than the tap target, the narrowing eases toward even
 * until it isn't; `undefined` when even frets would be too thin.
 */
export function fretWidths(first: number, last: number, total: number, min: number = SIZES.tap): number[] | undefined {
    const count = last - first + 1;
    if (count <= 0) return [];
    if (total / count < min) return undefined;
    const at = (ratio: number) => {
        const weights = Array.from({ length: count }, (_, i) => ratio ** (first - 1 + i));
        const sum = weights.reduce((a, b) => a + b, 0);
        return weights.map(weight => (weight * total) / sum);
    };
    const narrowest = (widths: number[]) => widths[widths.length - 1] ?? 0;
    const gentle = at(FRET_RATIO);
    if (narrowest(gentle) >= min) return gentle;
    let low = FRET_RATIO;
    let high = 1;
    for (let step = 0; step < 24; step++) {
        const middle = (low + high) / 2;
        if (narrowest(at(middle)) >= min) high = middle;
        else low = middle;
    }
    return at(high);
}

/** A fret's space across the neck, left to right with the nut on the left. */
export interface FretSpace {
    readonly fret: number;
    readonly x0: number;
    readonly x1: number;
}

/** Where everything on a fretboard goes, before mirroring for the left hand. */
export interface NeckLayout {
    readonly width: number;
    readonly height: number;
    /** The frets shown, from the lowest; fret 0 is the open strings' column when it's shown. */
    readonly spaces: readonly FretSpace[];
    /** The nut's left edge, when the open strings are shown. */
    readonly nut?: number;
    /** The neck's top and bottom. */
    readonly top: number;
    readonly bottom: number;
    readonly stringCount: number;
}

/**
 * Lays out frets `from` to `to` across `width`, or gives `undefined` if a fret would be narrower than `min` (the tap
 * target unless given). From fret 0 the open strings get their own column left of the nut.
 */
export function layNeck(
    from: number,
    to: number,
    width: number,
    stringCount: number,
    min: number = SIZES.tap
): NeckLayout | undefined {
    const open = from === 0;
    const first = Math.max(from, 1);
    const left = SIZES.edge + (open ? SIZES.open + SIZES.nut : 0);
    const widths = fretWidths(first, to, width - left - SIZES.edge, min);
    if (widths === undefined) return undefined;
    const spaces: FretSpace[] = open ? [{ fret: 0, x0: SIZES.edge, x1: SIZES.edge + SIZES.open }] : [];
    let x = left;
    widths.forEach((w, i) => {
        spaces.push({ fret: first + i, x0: x, x1: x + w });
        x += w;
    });
    const top = SIZES.edge + SIZES.overhang;
    const bottom = top + SIZES.gap * (stringCount - 1);
    return {
        width,
        height: bottom + SIZES.overhang + SIZES.numbers,
        spaces,
        ...(open ? { nut: SIZES.edge + SIZES.open } : {}),
        top,
        bottom,
        stringCount
    };
}

/** How many frets a stretch shows upright: as many as fit, up to six, with the open strings beside them. */
export function stretchLength(width: number): number {
    const total = width - 2 * SIZES.edge - SIZES.open - SIZES.nut;
    return Math.max(1, Math.min(SIZES.stretch, Math.floor(total / SIZES.tap)));
}

/**
 * The frets an upright stretch of `length` frets can start on (DIAG-1.10), a fret apart: from the bottom of the range
 * (fret 1 where it starts at the nut, as the open strings come with it) to where the stretch ends at the top.
 */
export function stretchStarts(range: FretRange, length: number): { readonly first: number; readonly last: number } {
    const first = Math.max(range.from, 1);
    return { first, last: Math.max(first, range.to - length + 1) };
}

/** The stretch of `length` frets from a start, held within the range, taking in the open strings from fret 1. */
export function stretchAt(range: FretRange, length: number, start: number): FretRange {
    const { first, last } = stretchStarts(range, length);
    const from = Math.min(Math.max(start, first), last);
    return { from: from === 1 && range.from === 0 ? 0 : from, to: Math.min(from + length - 1, range.to) };
}

/** The start of the stretch centred on a fret, held within the range: a tap or drag on the strip (DIAG-1.10). */
export function centredStart(range: FretRange, length: number, fret: number): number {
    const { first, last } = stretchStarts(range, length);
    return Math.min(Math.max(Math.round(fret - (length - 1) / 2), first), last);
}

/** A string's height: string 1, the highest-pitched, at the top (THY-3.4). */
export function stringY(layout: NeckLayout, string: number): number {
    return layout.top + SIZES.gap * (string - 1);
}

/** A string's thickness: from 3.2 for the lowest to 1 for the highest. */
export function gauge(string: number, stringCount: number): number {
    return stringCount <= 1 ? 2 : 1 + ((string - 1) * 2.2) / (stringCount - 1);
}

/** A dot's label for the labels setting (CTX-1.5), with ♯ ♭ 𝄪 𝄫; empty for None. */
export function dotLabel(note: MappedNote, labels: Labels): string {
    switch (labels) {
        case 'notes':
            return noteLabel(notePitchName(note.note));
        case 'intervals':
            return intervalLabel(note.code);
        case 'degrees':
            return String(note.degree);
        case 'none':
            return '';
    }
}

/**
 * A fretboard's text alternative (APP-6.4): what it shows, then each string's notes up the neck, as "String 6, E:
 * open E, 3 G, 5 A (root)".
 */
export function describeFretboard(
    title: string,
    tuning: readonly NoteName[],
    cells: readonly FretboardCell[],
    capo: number
): string[] {
    const lines = [title + (capo > 0 ? `, capo ${String(capo)}` : '') + '.'];
    for (let string = 1; string <= tuning.length; string++) {
        const open = tuning[stringIndex(string, tuning.length)];
        const notes = cells
            .filter(cell => cell.string === string)
            .map(cell => {
                const where = cell.fret === capo ? (capo > 0 ? 'at the capo' : 'open') : String(cell.fret);
                return `${where} ${noteLabel(notePitchName(cell.note))}${cell.degree === 1 ? ' (root)' : ''}`;
            });
        const name = open === undefined ? '' : `, ${noteLabel(notePitchName(open))}`;
        lines.push(`String ${String(string)}${name}: ${notes.length === 0 ? 'none' : notes.join(', ')}.`);
    }
    return lines;
}
