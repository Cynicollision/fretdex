import { mapScale, type Position } from '@fretdex/fretkit';
import { afterEach, describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { cleanup, render } from 'vitest-browser-svelte';
import { modeRows, rowPosition, type ModeRow } from '#lib/modes/overview.ts';
import type { Labels } from '#lib/settings/settings.ts';
import ModeNeck from './ModeNeck.svelte';

const STANDARD = ['E2', 'A2', 'D3', 'G3', 'B3', 'E4'];

function row(key: string, degree: number): ModeRow {
    const found = modeRows(key)[degree - 1];
    if (!found) throw new Error(`No row ${String(degree)}`);
    return found;
}

function positionOf(mode: ModeRow): Position {
    const position = rowPosition(mode, STANDARD, 'guitar', 0);
    if (!position) throw new Error('No position');
    return position;
}

async function show(mode: ModeRow, labels: Labels = 'intervals', handedness: 'right' | 'left' = 'right') {
    cleanup();
    await page.viewport(390, 800);
    const position = positionOf(mode);
    await render(ModeNeck, {
        tuning: STANDARD,
        set: mode.set,
        position,
        labels,
        handedness,
        characteristic: mode.characteristic
    });
    return position;
}

function dots(selector = '.dot'): Element[] {
    return [...document.querySelectorAll(selector)];
}

afterEach(() => {
    cleanup();
});

describe('ModeNeck', () => {
    it("MODE-1.12 draws the position's frets, its notes at full strength and the scale's others there faded", async () => {
        const dorian = row('C', 2);
        const position = await show(dorian);
        expect(document.querySelector('svg')?.getAttribute('data-frets')).toBe(
            `${String(position.from)}-${String(position.to)}`
        );
        const all = mapScale(STANDARD, dorian.set, position);
        expect(dots()).toHaveLength(all.length);
        expect(dots('.dot:not(.dim)')).toHaveLength(position.cells.length);
        expect(dots('.dot.dim')).toHaveLength(all.length - position.cells.length);
    });

    it('MODE-1.15 labels its dots by the labels chosen', async () => {
        await show(row('C', 2), 'intervals');
        expect(new Set(dots().map(dot => dot.textContent.trim()))).toEqual(
            new Set(['1', '2', '♭3', '4', '5', '6', '♭7'])
        );
        await show(row('C', 2), 'notes');
        expect(new Set(dots().map(dot => dot.textContent.trim()))).toEqual(
            new Set(['D', 'E', 'F', 'G', 'A', 'B', 'C'])
        );
    });

    it('MODE-1.13 rings the characteristic note and nothing else', async () => {
        const dorian = row('C', 2);
        const position = await show(dorian);
        const sixths = mapScale(STANDARD, dorian.set, position).filter(cell => cell.code === '6M');
        expect(dots('circle.mark')).toHaveLength(sixths.length);
        expect(dots('.dot.characteristic').every(dot => dot.getAttribute('data-code') === '6M')).toBe(true);
    });

    it('DIAG-1.4 numbers the inlay frets, and the first fret only when the nut is not shown', async () => {
        const numbers = () => dots('.number').map(text => text.textContent.trim());
        // E Phrygian in C opens at the nut.
        expect((await show(row('C', 3))).from).toBe(0);
        expect(numbers()).toEqual(['3', '5']);
        // D Dorian in C starts at fret 10.
        await show(row('C', 2));
        expect(numbers()[0]).toBe('10');
    });

    it('DIAG-1.5 mirrors the neck left-handed', async () => {
        // The lowest fret's note on the lowest string is nearest the nut: on the left, or mirrored on the right.
        const x = () => document.querySelector('.dot[data-string="6"]')?.getBoundingClientRect().x ?? 0;
        await show(row('G', 1));
        const right = x();
        await show(row('G', 1), 'intervals', 'left');
        expect(x()).toBeGreaterThan(right);
    });
});
