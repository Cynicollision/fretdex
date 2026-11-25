import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';
import { settings } from '#lib/settings/store.svelte.ts';
import { applyTheme } from '#lib/settings/theme.ts';
import Settings from './+page.svelte';

/** Leaves a field, as a change of what's typed is committed then. */
function commit(element: Element) {
    (element as HTMLInputElement).blur();
}

describe('the Settings screen', () => {
    it('CTX-1 changes each setting', async () => {
        await settings.ready();
        await render(Settings);

        await page.getByText('Note names', { exact: true }).click();
        await page.getByText('Prefer flats', { exact: true }).click();
        await page.getByText('Left', { exact: true }).click();
        await page.getByText('Light', { exact: true }).click();
        await page.getByRole('button', { name: 'Raise first fret' }).click();
        await page.getByRole('button', { name: 'Lower last fret' }).click();
        await page.getByRole('switch', { name: 'Keep screen awake' }).click();
        await page.getByRole('spinbutton', { name: 'Tempo' }).fill('132');
        commit(page.getByRole('spinbutton', { name: 'Tempo' }).element());

        await expect
            .poll(() => settings.current)
            .toMatchObject({
                labels: 'notes',
                accidentals: 'flats',
                handedness: 'left',
                theme: 'light',
                fretRange: { from: 1, to: 14 },
                keepAwake: false,
                tempo: 132
            });
        await expect.element(page.getByRole('radio', { name: 'Light' })).toBeChecked();
    });

    it('keeps a typed tempo within 30 to 250', async () => {
        await render(Settings);

        await page.getByRole('spinbutton', { name: 'Tempo' }).fill('900');
        commit(page.getByRole('spinbutton', { name: 'Tempo' }).element());

        await expect.poll(() => settings.current.tempo).toBe(250);
        await expect.element(page.getByRole('spinbutton', { name: 'Tempo' })).toHaveValue(250);
    });

    it('CTX-1.8 sets the theme on the page and the theme colour', () => {
        applyTheme('light');

        expect(document.documentElement.dataset.theme).toBe('light');
        expect(localStorage.getItem('fretdex-theme')).toBe('light');
        applyTheme('dark');
        expect(document.documentElement.dataset.theme).toBe('dark');
    });
});
