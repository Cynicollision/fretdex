import { mapScale } from '@fretdex/fretkit';
import { afterEach, describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { cleanup, render } from 'vitest-browser-svelte';
import { ghosts, modeRows, modeWindow, type ModeRow } from '#lib/modes/overview.ts';
import ModeNeck from './ModeNeck.svelte';

const STANDARD = ['E2', 'A2', 'D3', 'G3', 'B3', 'E4'];

function row(root: string, id: string): ModeRow {
    const found = modeRows(root, 'auto').find(candidate => candidate.card.scale.id === id);
    if (!found) throw new Error(`No ${id}`);
    return found;
}

async function show(mode: ModeRow, root: string, handedness: 'right' | 'left' = 'right') {
    cleanup();
    await page.viewport(390, 800);
    const window = modeWindow(STANDARD, root, 0);
    await render(ModeNeck, {
        tuning: STANDARD,
        set: mode.set,
        window,
        handedness,
        characteristic: mode.characteristic,
        ...(mode.change ? { changed: mode.change.to } : {}),
        ghosts: ghosts(mode, STANDARD, window, 0)
    });
    return window;
}

function dots(selector = '.dot'): Element[] {
    return [...document.querySelectorAll(selector)];
}

afterEach(() => {
    cleanup();
});

describe('ModeNeck', () => {
    it('MODE-1.1 draws the mode in its window, labelled by interval', async () => {
        const dorian = row('D', 'dorian');
        const window = await show(dorian, 'D');
        const cells = mapScale(STANDARD, dorian.set, window);
        expect(dots()).toHaveLength(cells.length);
        expect(document.querySelector('svg')?.getAttribute('data-frets')).toBe('9-14');
        const labels = new Set(dots().map(dot => dot.textContent.trim()));
        expect(labels).toEqual(new Set(['1', '2', '♭3', '4', '5', '6', '♭7']));
        expect(dots('.dot.root rect').length).toBe(cells.filter(cell => cell.degree === 1).length);
    });

    it('MODE-1.9 fills the changed note, rings the characteristic one and marks where the change came from', async () => {
        const dorian = row('D', 'dorian');
        const window = await show(dorian, 'D');
        const cells = mapScale(STANDARD, dorian.set, window);
        const changed = dots('.dot.changed');
        expect(changed).toHaveLength(cells.filter(cell => cell.code === '3m').length);
        expect(changed.every(dot => dot.getAttribute('data-code') === '3m')).toBe(true);
        expect(dots('.dot.characteristic').every(dot => dot.getAttribute('data-code') === '6M')).toBe(true);
        expect(dots('.dot.characteristic circle.mark').length).toBe(cells.filter(cell => cell.code === '6M').length);
        const marks = ghosts(dorian, STANDARD, window, 0);
        expect(marks.length).toBeGreaterThan(0);
        expect(dots('.ghost')).toHaveLength(marks.length);
    });

    it('MODE-1.9 marks no change on Lydian, the first row', async () => {
        await show(row('C', 'lydian'), 'C');
        expect(dots('.dot.changed')).toHaveLength(0);
        expect(dots('.ghost')).toHaveLength(0);
        expect(dots('.dot.characteristic').length).toBeGreaterThan(0);
    });

    it('DIAG-1.5 mirrors the neck left-handed', async () => {
        const ionian = row('G', 'ionian');
        await show(ionian, 'G');
        // The lowest fret's note on the lowest string is nearest the nut: on the left, or mirrored on the right.
        const x = () => document.querySelector('.dot[data-string="6"]')?.getBoundingClientRect().x ?? 0;
        const right = x();
        await show(ionian, 'G', 'left');
        expect(x()).toBeGreaterThan(right);
    });
});
