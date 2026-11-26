import '#lib/styles/tokens.css';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';
import { DEFAULT_SETTINGS } from '#lib/settings/settings.ts';
import { settings } from '#lib/settings/store.svelte.ts';
import { MAX_CUSTOM_TUNINGS, NO_CUSTOM_TUNINGS } from '#lib/settings/tunings.ts';
import { customTunings } from '#lib/settings/tunings.svelte.ts';
import ContextBar from './ContextBar.svelte';

// The bar's button: its name always has the instrument.
const bar = () => page.getByRole('button', { name: /Guitar|Bass/ });
const sheet = () => page.getByRole('dialog', { name: 'Key and tuning' });

async function openSheet() {
    await render(ContextBar);
    await bar().click();
    await expect.element(sheet()).toBeVisible();
}

describe('the context bar', () => {
    // The bar uses the app's own settings and tunings, in this browser's IndexedDB, so each test starts them afresh.
    beforeEach(async () => {
        await settings.update(DEFAULT_SETTINGS);
        await customTunings.update(() => NO_CUSTOM_TUNINGS);
    });

    it('APP-2.1 shows the key, the instrument and the tuning, and CTX-3.1 the capo when one is set', async () => {
        await render(ContextBar);
        await expect.element(page.getByText('No key')).toBeVisible();
        await expect.element(page.getByText('Guitar · Standard', { exact: true })).toBeVisible();

        await settings.update({ key: { root: 'F#', mode: 'dorian' }, tuning: ['D2', 'A2', 'D3', 'G3', 'B3', 'E4'] });
        await settings.update({ capo: 2 });

        await expect.element(page.getByText('F♯ Dorian')).toBeVisible();
        await expect.element(page.getByText('Guitar · Drop D · Capo 2')).toBeVisible();
    });

    it('CTX-1.1 and THY-2.2 pick a key, opening the spelling Auto prefers with the other one tap away', async () => {
        await openSheet();

        await sheet().getByText('C♯/D♭', { exact: true }).click();
        await expect.poll(() => settings.current.key).toEqual({ root: 'Db', mode: 'major' });

        await sheet().getByRole('button', { name: 'Spell as C♯' }).click();
        await expect.poll(() => settings.current.key).toEqual({ root: 'C#', mode: 'major' });
        await expect.element(page.getByRole('button', { name: 'Spell as D♭' })).toBeVisible();

        await sheet().getByRole('button', { name: 'No key' }).click();
        await expect.poll(() => settings.current.key).toBeNull();
    });

    it('CTX-2.6 shows major and minor first, with the other modes one tap away', async () => {
        await openSheet();
        await expect.element(sheet().getByRole('radio', { name: 'Dorian' })).not.toBeInTheDocument();

        await sheet().getByRole('button', { name: 'More modes' }).click();
        await sheet().getByText('Dorian', { exact: true }).click();
        // A♯ Dorian would need F𝄪, so its button offers B♭ alone (THY-2.5).
        await sheet().getByText('B♭', { exact: true }).click();
        await expect.poll(() => settings.current.key).toEqual({ root: 'Bb', mode: 'dorian' });

        await sheet().getByText('Mixolydian', { exact: true }).click();
        await expect.poll(() => settings.current.key).toEqual({ root: 'Bb', mode: 'mixolydian' });
    });

    it('CTX-1.2 and CTX-2.1 switch instrument, keeping the tuning where both have it', async () => {
        await settings.update({ tuning: ['D2', 'A2', 'D3', 'G3', 'B3', 'E4'] });
        await openSheet();

        await sheet().getByText('Bass', { exact: true }).click();

        await expect
            .poll(() => settings.current)
            .toMatchObject({ instrument: 'bass', tuning: ['D1', 'A1', 'D2', 'G2'] });
        await expect.element(page.getByText('Bass · Drop D')).toBeVisible();
    });

    it('CTX-1.3 and CTX-1.9 choose a tuning and a capo, and APP-2.2 the bar follows', async () => {
        await openSheet();

        await sheet().getByText('DADGAD', { exact: true }).click();
        await sheet().getByRole('button', { name: 'Raise capo' }).click();
        await sheet().getByRole('button', { name: 'Raise capo' }).click();

        await expect
            .poll(() => settings.current)
            .toMatchObject({ tuning: ['D2', 'A2', 'D3', 'G3', 'A3', 'D4'], capo: 2 });
        await expect.element(page.getByText('Guitar · DADGAD · Capo 2')).toBeVisible();
    });

    it('THY-3.3 and CTX-2.7 save a new tuning from the current one, which it then plays in', async () => {
        await openSheet();
        await sheet().getByRole('button', { name: 'New tuning…' }).click();

        await expect.element(page.getByText("That's Standard, which is already in the list.")).toBeVisible();
        await page.getByRole('button', { name: 'Lower string 6' }).click();
        await page.getByRole('button', { name: 'Lower string 6' }).click();
        await page.getByRole('textbox', { name: 'Name' }).fill('Low D');
        await expect.element(page.getByText("That's Drop D, which is already in the list.")).toBeVisible();

        await page.getByRole('button', { name: 'Lower string 6' }).click();
        await page.getByRole('button', { name: 'Save' }).click();

        await expect
            .poll(() => customTunings.current.guitar)
            .toMatchObject([{ name: 'Low D', strings: ['C#2', 'A2', 'D3', 'G3', 'B3', 'E4'] }]);
        await expect.poll(() => settings.current.tuning).toEqual(['C#2', 'A2', 'D3', 'G3', 'B3', 'E4']);
        await expect.element(page.getByText('Guitar · Low D')).toBeVisible();
        await expect.element(sheet().getByText('Low D', { exact: true })).toBeVisible();
    });

    it(`CTX-2.7 offers no new tuning once ${String(MAX_CUSTOM_TUNINGS)} are saved`, async () => {
        const highStrings = ['F4', 'F#4', 'G4', 'G#4', 'A4', 'A#4', 'B4', 'C5', 'C#5', 'D5'];
        for (const [i, high] of highStrings.slice(0, MAX_CUSTOM_TUNINGS).entries()) {
            await customTunings.add('guitar', `Tuning ${String(i)}`, ['C2', 'G2', 'C3', 'G3', 'C4', high]);
        }
        await openSheet();

        await expect.element(sheet().getByRole('button', { name: 'New tuning…' })).not.toBeInTheDocument();
        await expect.element(sheet().getByText(/the most there can be/)).toBeVisible();
    });

    it('CTX-2.6 keeps the mode shown when the key is cleared', async () => {
        await settings.update({ key: { root: 'D', mode: 'dorian' } });
        await openSheet();

        await sheet().getByRole('button', { name: 'No key' }).click();
        await sheet().getByText('E', { exact: true }).click();

        await expect.poll(() => settings.current.key).toEqual({ root: 'E', mode: 'dorian' });
    });

    it('closes with a tap on the backdrop, but not with a click that started in the sheet', async () => {
        await openSheet();
        const dialog = sheet().element() as HTMLDialogElement;
        const box = dialog.getBoundingClientRect();
        const press = (x: number, y: number, type: string) =>
            dialog.dispatchEvent(new PointerEvent(type, { bubbles: true, clientX: x, clientY: y }));

        // A text selection dragged out of the sheet, or its scrollbar: the click lands on the dialog, inside its box.
        press(box.left + 10, box.top + 10, 'pointerdown');
        press(box.left + 10, box.top + 10, 'click');
        await expect.element(sheet()).toBeVisible();

        press(box.left + 10, box.top - 20, 'pointerdown');
        press(box.left + 10, box.top - 20, 'click');
        await expect.element(sheet()).not.toBeInTheDocument();
    });

    it("APP-2.3 shows what a card's URL overrides, marked as the card's, with a button that clears it", async () => {
        const onclear = vi.fn();
        await render(ContextBar, {
            override: { instrument: 'bass', tuning: ['D1', 'A1', 'D2', 'G2'], capo: 0 },
            onclear
        });

        await expect.element(page.getByText('Bass · Drop D', { exact: false })).toBeVisible();
        await expect.element(page.getByText('· this card')).toBeVisible();
        await page.getByRole('button', { name: 'Clear' }).click();
        expect(onclear).toHaveBeenCalledOnce();
    });

    it('APP-2.3 shows no override when the URL names what the settings already are', async () => {
        await render(ContextBar, { override: { instrument: 'guitar', capo: 0 }, onclear: vi.fn() });

        await expect.element(page.getByText('Guitar · Standard', { exact: true })).toBeVisible();
        await expect.element(page.getByRole('button', { name: 'Clear' })).not.toBeInTheDocument();
    });

    it('APP-2.3 changes the setting and clears the override when the sheet changes the capo', async () => {
        const onclear = vi.fn();
        await render(ContextBar, { override: { capo: 3 }, onclear });
        await bar().click();
        await expect
            .element(sheet().getByText("This card's link shows it for Guitar · Standard · Capo 3.", { exact: false }))
            .toBeVisible();

        await sheet().getByRole('button', { name: 'Raise capo' }).click();

        await expect.poll(() => settings.current.capo).toBe(1);
        await expect.poll(() => onclear.mock.calls.length).toBe(1);
    });

    it('AUD-1.2 sets the master volume and mute from the sheet', async () => {
        await openSheet();

        const volume = sheet().getByRole('slider', { name: 'Volume' });
        await expect.element(volume).toHaveValue('80');
        await volume.fill('35');
        await expect.poll(() => settings.current.volume).toBe(35);

        await sheet().getByRole('switch', { name: 'Mute' }).click();
        await expect.poll(() => settings.current.muted).toBe(true);
        expect(settings.current.volume).toBe(35);
    });

    it('closes with Done', async () => {
        await openSheet();

        await sheet().getByRole('button', { name: 'Done' }).click();

        await expect.element(sheet()).not.toBeInTheDocument();
    });
});
