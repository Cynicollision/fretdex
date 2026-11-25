import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { cleanup, render } from 'vitest-browser-svelte';
import { DEFAULT_SETTINGS, type Settings } from '#lib/settings/settings.ts';
import ContextPreview from './ContextPreview.svelte';

async function show(change: Partial<Settings> = {}) {
    cleanup();
    await render(ContextPreview, { settings: { ...DEFAULT_SETTINGS, ...change } });
}

/** Each dot on a string, by fret, with its label. */
function row(string: number): Record<number, string> {
    const dots = document.querySelectorAll<SVGGElement>(`.dot[data-string="${String(string)}"]`);
    return Object.fromEntries(Array.from(dots, dot => [Number(dot.dataset.fret), dot.textContent.trim()]));
}

describe('the settings preview', () => {
    it('CTX-1.5 labels the notes as the labels setting says', async () => {
        await show({ labels: 'notes', fretRange: { from: 0, to: 3 } });
        expect(row(1)).toEqual({ 0: 'E', 1: 'F', 3: 'G' });

        await show({ labels: 'intervals', fretRange: { from: 0, to: 3 } });
        expect(row(1)).toEqual({ 0: '3', 1: '4', 3: '5' });

        await show({ labels: 'degrees', key: { root: 'A', mode: 'minor' }, fretRange: { from: 0, to: 3 } });
        expect(row(1)).toEqual({ 0: '5', 1: '6', 3: '7' });

        await show({ labels: 'none', fretRange: { from: 0, to: 1 } });
        expect(row(1)).toEqual({ 0: '', 1: '' });
    });

    it('CTX-1.4 puts the nut on the right when left-handed', async () => {
        await show({ handedness: 'left', fretRange: { from: 0, to: 3 } });

        const nut = document.querySelector('.nut')?.getBoundingClientRect();
        const fret3 = document.querySelector('.dot[data-string="1"][data-fret="3"]')?.getBoundingClientRect();
        expect(nut && fret3 && nut.left > fret3.right).toBe(true);
    });

    it('CTX-1.7 shows the fret range', async () => {
        await show({ fretRange: { from: 5, to: 9 } });

        const frets = Array.from(document.querySelectorAll<SVGGElement>('.dot'), dot => Number(dot.dataset.fret));
        expect(Math.min(...frets)).toBe(5);
        expect(Math.max(...frets)).toBe(9);
    });

    it('CTX-1.6 spells lone notes as the accidentals setting says', async () => {
        await show({ accidentals: 'flats' });

        await expect.element(page.getByTestId('lone-notes')).toHaveTextContent('C D♭ D E♭ E F G♭ G A♭ A B♭ B');
    });

    it('CTX-1.1 and CTX-1.3 show the key on the tuning, and CTX-1.9 leaves the frets below the capo empty', async () => {
        await show({
            key: { root: 'D', mode: 'major' },
            tuning: ['D2', 'A2', 'D3', 'G3', 'A3', 'D4'],
            labels: 'notes',
            capo: 2,
            fretRange: { from: 0, to: 4 }
        });

        await expect.element(page.getByText('DADGAD: D2 A2 D3 G3 A3 D4')).toBeVisible();
        expect(row(1)).toEqual({ 2: 'E', 4: 'F♯' });
    });
});
