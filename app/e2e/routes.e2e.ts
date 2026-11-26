import { expect, test, type Page } from '@playwright/test';

/** Every route of M01, as a fresh install would open it from a link or a pin, with its heading. */
const ROUTES: readonly [path: string, heading: string][] = [
    ['/scales', 'Scales'],
    ['/scales/G/harmonic-minor', 'G harmonic minor'],
    ['/modes', 'Modes'],
    ['/scales/Fs/dorian', 'F♯ Dorian'],
    ['/scales/Eb/locrian', 'E♭ Locrian'],
    ['/settings', 'Settings']
];

function heading(page: Page) {
    return page.getByRole('heading', { level: 1 });
}

/** The path and query the page is on. */
function where(page: Page): string {
    const url = new URL(page.url());
    return url.pathname + url.search;
}

test('APP-3.1 and APP-3.6 open every route from its URL, named in the title', async ({ page }) => {
    for (const [path, name] of ROUTES) {
        await page.goto(path);
        await expect(heading(page), path).toHaveText(name);
        await expect(page, path).toHaveTitle(`${name} · Fretdex`);
    }
});

test('APP-3.1 opens a card with its options and override, dropping what it cannot read', async ({ page }) => {
    await page.goto('/scales/G/major?nps=3&labels=notes&inst=bass&tuning=drop-d&capo=2&ref=abc&pos=9');

    await expect(page.getByText('For bass, Drop D tuning, capo 2.')).toBeVisible();
    await expect(page.getByRole('radio', { name: 'Note names' })).toBeChecked();
    await expect.poll(() => where(page)).toBe('/scales/G/major?nps=3&labels=notes&inst=bass&tuning=drop-d&capo=2');
});

test('APP-3.4 rewrites %23 to s', async ({ page }) => {
    await page.goto('/scales/F%23/major?pos=2');
    await expect(heading(page)).toHaveText('F♯ major');
    await expect.poll(() => where(page)).toBe('/scales/Fs/major?pos=2');
});

test("APP-3.5 shows Not found, with a link to the module's list, for a URL it can't read", async ({ page }) => {
    await page.goto('/scales/H/dorian');
    await expect(heading(page)).toHaveText('Not found');
    await expect(page).toHaveTitle('Not found · Fretdex');
    await page.getByRole('link', { name: 'See all scales' }).click();
    await expect(heading(page)).toHaveText('Scales');

    await page.goto('/nowhere');
    await expect(heading(page)).toHaveText('Not found');
    await expect(page.getByRole('link', { name: 'Home' }).first()).toBeVisible();
});

test('APP-1.1 and APP-1.2 reach a card in two taps from Home, and the context bar goes Home and to Settings', async ({
    page
}) => {
    await page.goto('/');
    await expect(page.getByRole('main').getByText('Chords')).toBeVisible();
    await expect(page.getByRole('main').getByRole('link', { name: 'Chords' })).toHaveCount(0);
    await page.getByRole('main').getByRole('link', { name: 'Modes' }).click();
    await page.getByRole('link', { name: 'C Lydian' }).click();
    await expect(heading(page)).toHaveText('C Lydian');

    const banner = page.getByRole('banner');
    await banner.getByRole('link', { name: 'Home' }).click();
    await expect(heading(page)).toHaveText('Fretdex');
    await expect(banner.getByRole('link', { name: 'Home' })).toHaveAttribute('aria-current', 'page');

    await banner.getByRole('button', { name: /No key/u }).click();
    await page.getByRole('dialog').getByRole('link', { name: 'All settings ›' }).click();
    await expect(heading(page)).toHaveText('Settings');
    await expect(page.getByRole('dialog')).toBeHidden();
});

test('APP-1.3 goes back where the user came from, by the back control and the browser', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('main').getByRole('link', { name: 'Modes' }).click();
    await page.getByRole('link', { name: 'C Dorian' }).click();
    await expect(heading(page)).toHaveText('C Dorian');

    await page.getByRole('link', { name: '‹ Back' }).click();
    await expect(heading(page)).toHaveText('Modes');
    await page.goBack();
    await expect(heading(page)).toHaveText('Fretdex');
});

test("APP-1.3 goes to the card's list from a card opened with nothing to go back to", async ({ page }) => {
    await page.goto('/scales/A/phrygian');
    await page.getByRole('link', { name: '‹ Back' }).click();
    await expect(heading(page)).toHaveText('Scales');
});

test('APP-3.2 changes a view option in place, so back leaves the card', async ({ page }) => {
    await page.goto('/scales');
    await page.getByRole('link', { name: 'C major', exact: true }).click();
    await page.getByText('Note names', { exact: true }).click();
    await expect.poll(() => where(page)).toBe('/scales/C/major?labels=notes');
    await page.getByText('Scale degrees', { exact: true }).click();
    await expect.poll(() => where(page)).toBe('/scales/C/major?labels=degrees');

    await page.goBack();
    await expect(heading(page)).toHaveText('Scales');
});

test("APP-2.3 shows a card's override in the context bar, and clears it", async ({ page }) => {
    await page.goto('/scales/C/major?inst=bass&capo=1');
    const banner = page.getByRole('banner');
    await expect(banner).toContainText('Bass · Standard · Capo 1 · this card');

    await banner.getByRole('button', { name: 'Clear' }).click();
    await expect(banner).toContainText('Guitar · Standard');
    await expect(banner.getByRole('button', { name: 'Clear' })).toHaveCount(0);
    await expect.poll(() => where(page)).toBe('/scales/C/major');
});

test('APP-2.3 clears the override when the sheet changes the instrument, tuning or capo', async ({ page }) => {
    await page.goto('/scales/D/dorian?tuning=dadgad');
    const banner = page.getByRole('banner');
    await expect(banner).toContainText('Guitar · DADGAD · this card');

    await banner.getByRole('button', { name: /Guitar/u }).click();
    const sheet = page.getByRole('dialog', { name: 'Key and tuning' });
    await expect(sheet).toContainText("This card's link shows it for Guitar · DADGAD.");
    await sheet.getByRole('button', { name: 'Raise capo' }).click();
    await sheet.getByRole('button', { name: 'Done' }).click();

    await expect(banner).toContainText('Guitar · Standard · Capo 1');
    await expect.poll(() => where(page)).toBe('/scales/D/dorian');
});
