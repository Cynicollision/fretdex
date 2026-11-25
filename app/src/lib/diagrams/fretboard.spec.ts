import { mapScale, scaleType, spellScale } from '@fretdex/fretkit';
import { describe, expect, it } from 'vitest';
import { FRET_RATIO, SIZES, describeFretboard, fretWidths, stretchLength, stretches } from './fretboard.ts';

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
    it('DIAG-1.10 covers the range in runs, the first from the nut and the last ending at the top', () => {
        expect(stretches({ from: 0, to: 15 }, 6)).toEqual([
            { from: 0, to: 6 },
            { from: 7, to: 12 },
            { from: 10, to: 15 }
        ]);
        expect(stretches({ from: 3, to: 8 }, 6)).toEqual([{ from: 3, to: 8 }]);
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
