import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { cleanup, render } from 'vitest-browser-svelte';
import { DEFAULT_SETTINGS, type Settings } from '#lib/settings/settings.ts';
import ContextPreview from './ContextPreview.svelte';

async function show(change: Partial<Settings> = {}) {
    cleanup();
    await render(ContextPreview, { settings: { ...DEFAULT_SETTINGS, ...change } });
}

/** The text of each cell in a string's row, left to right. */
function row(string: number): string[] {
    const rows = document.querySelectorAll('tbody tr');
    const cells = rows[string - 1]?.querySelectorAll('td') ?? [];
    return Array.from(cells, cell => cell.textContent.trim());
}

function frets(): string[] {
    return Array.from(document.querySelectorAll('thead th'), cell => cell.textContent.trim()).slice(1);
}

describe('the settings preview', () => {
    it('CTX-1.5 labels the notes as the labels setting says', async () => {
        await show({ labels: 'notes', fretRange: { from: 0, to: 3 } });
        expect(row(1)).toEqual(['E', 'F', '', 'G']);

        await show({ labels: 'intervals', fretRange: { from: 0, to: 3 } });
        expect(row(1)).toEqual(['3', '4', '', '5']);

        await show({ labels: 'degrees', key: { root: 'A', mode: 'minor' }, fretRange: { from: 0, to: 3 } });
        expect(row(1)).toEqual(['5', '6', '', '7']);

        await show({ labels: 'none', fretRange: { from: 0, to: 1 } });
        expect(row(1)).toEqual(['•', '•']);
    });

    it('CTX-1.4 puts the nut on the right when left-handed', async () => {
        await show({ handedness: 'left', fretRange: { from: 0, to: 3 } });

        expect(frets()).toEqual(['3', '2', '1', '0']);
    });

    it('CTX-1.7 shows the fret range', async () => {
        await show({ fretRange: { from: 5, to: 9 } });

        expect(frets()).toEqual(['5', '6', '7', '8', '9']);
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
        expect(row(1)).toEqual(['', '', 'E', '', 'F♯']);
    });
});
