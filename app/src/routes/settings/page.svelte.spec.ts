import '#lib/styles/tokens.css';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';
import { DEFAULT_SETTINGS } from '#lib/settings/settings.ts';
import { settings } from '#lib/settings/store.svelte.ts';
import { applyTheme } from '#lib/settings/theme.ts';
import { NO_CUSTOM_TUNINGS } from '#lib/settings/tunings.ts';
import { customTunings } from '#lib/settings/tunings.svelte.ts';
import Settings from './+page.svelte';

/** Leaves a field, as a change of what's typed is committed then. */
function commit(element: Element) {
    (element as HTMLInputElement).blur();
}

describe('the Settings screen', () => {
    // The screen uses the app's own settings, in this browser's IndexedDB, so each test starts them from the defaults.
    beforeEach(async () => {
        await settings.update(DEFAULT_SETTINGS);
    });

    it('CTX-1 changes each setting', async () => {
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
});

describe("Settings' saved tunings", () => {
    const OPEN_C = ['C2', 'G2', 'C3', 'G3', 'C4', 'E4'];

    beforeEach(async () => {
        await settings.update(DEFAULT_SETTINGS);
        await customTunings.update(() => NO_CUSTOM_TUNINGS);
    });

    it('says when none are saved', async () => {
        await render(Settings);

        await expect.element(page.getByText(/None saved yet/)).toBeVisible();
    });

    it('CTX-2.7 renames and retunes a saved tuning, and the tuning in use follows it', async () => {
        await customTunings.add('guitar', 'Open C', OPEN_C);
        await settings.update({ tuning: OPEN_C });
        await render(Settings);

        await page.getByRole('button', { name: 'Edit Open C' }).click();
        await page.getByRole('button', { name: 'Raise string 5' }).click();
        await page.getByRole('button', { name: 'Raise string 5' }).click();
        await page.getByRole('textbox', { name: 'Name' }).fill('Open C6');
        await page.getByRole('button', { name: 'Save' }).click();

        const C6 = ['C2', 'A2', 'C3', 'G3', 'C4', 'E4'];
        await expect.poll(() => customTunings.current.guitar).toMatchObject([{ name: 'Open C6', strings: C6 }]);
        await expect.poll(() => settings.current.tuning).toEqual(C6);
        await expect.element(page.getByText('C A C G C E')).toBeVisible();
    });

    it('CTX-2.7 deletes a saved tuning once that is confirmed', async () => {
        await customTunings.add('guitar', 'Open C', OPEN_C);
        await customTunings.add('bass', 'BEAD', ['B0', 'E1', 'A1', 'D2']);
        await render(Settings);

        await page.getByRole('button', { name: 'Delete Open C' }).click();
        await page.getByRole('button', { name: 'Keep' }).click();
        expect(customTunings.current.guitar).toHaveLength(1);

        await page.getByRole('button', { name: 'Delete Open C' }).click();
        await page.getByRole('button', { name: 'Delete', exact: true }).click();

        await expect.poll(() => customTunings.current.guitar).toEqual([]);
        await expect.element(page.getByRole('heading', { name: 'Guitar' })).not.toBeInTheDocument();
        await expect.element(page.getByText('BEAD')).toBeVisible();
    });
});

describe('the theme', () => {
    let meta: HTMLMetaElement;

    beforeEach(() => {
        meta = document.createElement('meta');
        meta.name = 'theme-color';
        document.head.append(meta);
    });

    afterEach(() => {
        meta.remove();
        delete document.documentElement.dataset.theme;
        localStorage.removeItem('fretdex-theme');
    });

    it('CTX-1.8 sets the theme on the page, colours the bars with its page colour, and keeps a copy', () => {
        applyTheme('light');

        expect(document.documentElement.dataset.theme).toBe('light');
        expect(meta.content).toBe('#f6f6f3');
        expect(localStorage.getItem('fretdex-theme')).toBe('light');

        applyTheme('dark');

        expect(document.documentElement.dataset.theme).toBe('dark');
        expect(meta.content).toBe('#14161b');
    });
});
