import '#lib/styles/tokens.css';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';
import { NO_PINS } from '#lib/pins/pins.ts';
import { pins } from '#lib/pins/store.svelte.ts';
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

describe("Settings' backup", () => {
    const OPEN_C = ['C2', 'G2', 'C3', 'G3', 'C4', 'E4'];
    let exported: Blob | undefined;

    beforeEach(async () => {
        await settings.update(DEFAULT_SETTINGS);
        await customTunings.update(() => NO_CUSTOM_TUNINGS);
        await pins.update(() => NO_PINS);
        exported = undefined;
        vi.spyOn(URL, 'createObjectURL').mockImplementation(blob => {
            exported = blob as Blob;
            return 'blob:backup';
        });
        // The download itself isn't started.
        vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined);
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    /** Picks a file in the Import field, as the phone's file picker does. */
    async function choose(text: string, name = 'fretdex-2026-11-27.json') {
        await page.getByRole('button', { name: 'Import…' }).click();
        const input = document.querySelector<HTMLInputElement>('input[type="file"]');
        if (!input) throw new Error('No file field');
        const transfer = new DataTransfer();
        transfer.items.add(new File([text], name, { type: 'application/json' }));
        input.files = transfer.files;
        input.dispatchEvent(new Event('change', { bubbles: true }));
    }

    async function exportNow(): Promise<string> {
        await page.getByRole('button', { name: 'Export' }).click();
        await expect.poll(() => exported).toBeDefined();
        return (await exported?.text()) ?? '';
    }

    it('PIN-5 restores an export, replacing everything', async () => {
        await settings.update({ labels: 'intervals' });
        await customTunings.add('guitar', 'Open C', OPEN_C);
        await pins.addGroup('Gig');
        await pins.add({ url: '/scales/C/major', label: 'C major' });
        await render(Settings);
        const backup = await exportNow();
        await expect.element(page.getByText(/Exported fretdex-\d{4}-\d{2}-\d{2}\.json/u)).toBeVisible();

        await settings.update({ labels: 'none' });
        await customTunings.update(() => NO_CUSTOM_TUNINGS);
        await pins.update(() => NO_PINS);
        await choose(backup);
        await expect
            .element(page.getByText('has 1 pin, 1 group, 1 saved tuning and settings', { exact: false }))
            .toBeVisible();
        await page.getByRole('button', { name: 'Replace everything' }).click();

        await expect.element(page.getByText('Replaced everything with the backup.')).toBeVisible();
        expect(settings.current.labels).toBe('intervals');
        expect(customTunings.current.guitar).toMatchObject([{ name: 'Open C', strings: OPEN_C }]);
        expect(pins.current.pins).toMatchObject([{ url: '/scales/C/major', label: 'C major' }]);
        expect(pins.current.groups).toMatchObject([{ name: 'Gig' }]);
    });

    it("PIN-5.2 adds a backup to what's here, keeping this device's settings", async () => {
        await pins.add({ url: '/scales/C/major', label: 'C major' });
        await pins.add({ url: '/scales/G/major', label: 'G major' });
        await render(Settings);
        const backup = await exportNow();

        await pins.update(() => ({ pins: [{ id: 'mine', url: '/scales/C/major', label: 'Mine' }], groups: [] }));
        await settings.update({ labels: 'none' });
        await choose(backup);
        await page.getByRole('button', { name: "Add to what's here" }).click();

        await expect.element(page.getByText(/Added 1 pin and no saved tunings; 1 pin already here\./u)).toBeVisible();
        expect(pins.current.pins.map(pin => pin.label)).toEqual(['Mine', 'G major']);
        expect(settings.current.labels).toBe('none');
    });

    it('PIN-5.2 refuses a file it cannot read, saying why, and changes nothing', async () => {
        await pins.add({ url: '/scales/C/major', label: 'C major' });
        await render(Settings);

        await choose('{"not": "a backup"}', 'notes.json');

        await expect
            .element(page.getByRole('alert'))
            .toHaveTextContent("This file isn't a Fretdex backup. Nothing was changed.");
        await expect.element(page.getByRole('button', { name: 'Replace everything' })).not.toBeInTheDocument();
        expect(pins.current.pins).toHaveLength(1);
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
