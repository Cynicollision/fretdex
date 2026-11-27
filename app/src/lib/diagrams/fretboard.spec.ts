import { mapScale, scaleType, spellScale } from '@fretdex/fretkit';
import { describe, expect, it } from 'vitest';
import {
    FRET_RATIO,
    SIZES,
    describeFretboard,
    fretWidths,
    centredStart,
    stretchAt,
    stretchLength,
    stretchStarts
} from './fretboard.ts';

describe('fretWidths', () => {
    it('DIAG-1.8 narrows each fret gently up the neck where there is room', () => {
        const widths = fretWidths(1, 15, 15 * 80) ?? [];
        expect(widths).toHaveLength(15);
        expect(widths.reduce((a, b) => a + b, 0)).toBeCloseTo(1200);
        for (let i = 1; i < widths.length; i++) {
            expect((widths[i] ?? 0) / (widths[i - 1] ?? 1)).toBeCloseTo(FRET_RATIO);
        }
    });

    it('DIAG-1.8 eases toward even rather than make a fret narrower than the tap target', () => {
        const widths = fretWidths(1, 15, 15 * 46) ?? [];
        expect(Math.min(...widths)).toBeCloseTo(SIZES.tap, 3);
        expect(widths[0]).toBeGreaterThan(widths[14] ?? Infinity);
    });

    it('gives nothing when even frets would be narrower than the tap target', () => {
        expect(fretWidths(1, 15, 15 * 43)).toBeUndefined();
    });
});

describe('stretches', () => {
    it('DIAG-1.10 starts a stretch on any fret, the open strings coming with fret 1, and the last ending at the top', () => {
        expect(stretchStarts({ from: 0, to: 15 }, 6)).toEqual({ first: 1, last: 10 });
        expect(stretchAt({ from: 0, to: 15 }, 6, 1)).toEqual({ from: 0, to: 6 });
        expect(stretchAt({ from: 0, to: 15 }, 6, 2)).toEqual({ from: 2, to: 7 });
        expect(stretchAt({ from: 0, to: 15 }, 6, 14)).toEqual({ from: 10, to: 15 });
        expect(stretchAt({ from: 3, to: 8 }, 6, 5)).toEqual({ from: 3, to: 8 });
        expect(stretchStarts({ from: 2, to: 12 }, 6)).toEqual({ first: 2, last: 7 });
    });

    it('DIAG-1.10 centres a stretch on a fret tapped on the strip, held within the range', () => {
        expect(centredStart({ from: 0, to: 15 }, 6, 8)).toBe(6);
        expect(stretchAt({ from: 0, to: 15 }, 6, centredStart({ from: 0, to: 15 }, 6, 8))).toEqual({ from: 6, to: 11 });
        expect(centredStart({ from: 0, to: 15 }, 5, 8)).toBe(6);
        expect(centredStart({ from: 0, to: 15 }, 6, 0)).toBe(1);
        expect(centredStart({ from: 0, to: 15 }, 6, 15)).toBe(10);
    });

    it('DIAG-1.10 fits five or six frets on a phone held upright', () => {
        expect(stretchLength(390 - 32)).toBe(6);
        expect(stretchLength(320 - 32)).toBe(5);
    });
});

describe('describeFretboard', () => {
    it('APP-6.4 lists each string, saying where the capo is', () => {
        const type = scaleType('major');
        if (!type) throw new Error('No major scale');
        const tuning = ['E2', 'A2', 'D3', 'G3', 'B3', 'E4'];
        const cells = mapScale(tuning, spellScale('A', type), { from: 0, to: 4 }, 2);
        const lines = describeFretboard('A major', tuning, cells, 2);
        expect(lines[0]).toBe('A major, capo 2.');
        expect(lines[6]).toBe('String 6, E: at the capo F♯, 4 G♯.');
        expect(lines[5]).toBe('String 5, A: at the capo B, 4 C♯.');
    });
});
