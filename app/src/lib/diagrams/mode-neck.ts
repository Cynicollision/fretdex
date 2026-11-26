import type { FretRange } from '@fretdex/fretkit';
import { fretWidths, type FretSpace } from './fretboard';

/** The Modes overview's small fretboard's sizes, in CSS pixels (MODE-1.1): a row's neck, not a tap target. */
export const MODE_NECK = {
    edge: 6,
    open: 26,
    nut: 5,
    /** Between strings: room for a ringed dot beside a plain one (`MARK`). */
    gap: 26,
    /** Above the top string and below the bottom one, inside the neck: room for a ringed dot, `edge` included. */
    overhang: 9,
    /** Below the neck, for the fret numbers. */
    numbers: 20,
    /** Room for a 14px label such as ♭6 or F♯ (APP-5.3). */
    dot: 22
} as const;

/** The characteristic note's ring (MODE-1.13): its radius past the dot's, and its stroke. */
export const MARK = { gap: 2.5, stroke: 2.5 } as const;

/** Where everything on a row's neck goes, before mirroring for the left hand. */
export interface ModeNeckLayout {
    readonly width: number;
    readonly height: number;
    /** The frets shown, from the lowest; fret 0 is the open strings' column when the window starts at the nut. */
    readonly spaces: readonly FretSpace[];
    /** The nut's left edge, when the open strings are shown. */
    readonly nut?: number;
    readonly top: number;
    readonly bottom: number;
}

/**
 * Lays out a row's position's frets across `width` (MODE-1.12), narrowing gently up the neck as the card's fretboard
 * does (DIAG-1.8). From fret 0 the open strings get their own column left of the nut.
 */
export function layModeNeck(window: FretRange, width: number, stringCount: number): ModeNeckLayout {
    const open = window.from === 0;
    const first = Math.max(window.from, 1);
    const left = MODE_NECK.edge + (open ? MODE_NECK.open + MODE_NECK.nut : 0);
    const widths = fretWidths(first, window.to, width - left - MODE_NECK.edge, 1) ?? [];
    const spaces: FretSpace[] = open ? [{ fret: 0, x0: MODE_NECK.edge, x1: MODE_NECK.edge + MODE_NECK.open }] : [];
    let x = left;
    widths.forEach((w, i) => {
        spaces.push({ fret: first + i, x0: x, x1: x + w });
        x += w;
    });
    const top = MODE_NECK.edge + MODE_NECK.overhang;
    const bottom = top + MODE_NECK.gap * (stringCount - 1);
    return {
        width,
        height: bottom + MODE_NECK.overhang + MODE_NECK.numbers,
        spaces,
        ...(open ? { nut: MODE_NECK.edge + MODE_NECK.open } : {}),
        top,
        bottom
    };
}

/** A string's height on a row's neck: string 1, the highest-pitched, at the top (THY-3.4). */
export function modeStringY(layout: ModeNeckLayout, string: number): number {
    return layout.top + MODE_NECK.gap * (string - 1);
}
