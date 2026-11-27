import { expect, test, type Page } from '@playwright/test';
import { storedSettings } from './stored.ts';

/** The path and query the page is on. */
function where(page: Page): string {
    const url = new URL(page.url());
    return url.pathname + url.search;
}

function rows(page: Page) {
    return page.getByRole('main').getByRole('listitem');
}

test("MODE-1.1, 1.13 and 1.14 show a major key's seven modes by degree, each with its marks and steps", async ({
    page
}) => {
    await page.goto('/modes/C');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Modes of C major');
    await expect(rows(page)).toHaveCount(7);
    await expect(rows(page).first()).toContainText('I C Ionian');
    await expect(rows(page).last()).toContainText('viiø B Locrian');
    const dorian = rows(page).filter({ hasText: 'D Dorian' });
    await expect(dorian).toContainText('♮6 characteristic');
    await expect(dorian).not.toContainText('was');
    await expect(dorian).toContainText('1 2 ♭3 4 5 6 ♭7');
    await expect(dorian).toContainText('Steps W H W W W H W.');
    await expect(dorian.locator('.step.lit')).toHaveCount(7);
    await expect(dorian.locator('.dot.dim').first()).toBeVisible();
    await expect(dorian.locator('circle.mark').first()).toBeVisible();
});

test('MODE-1.7 and MODE-1.12 open a mode on its position, and its card links back to the overview', async ({
    page
}) => {
    await page.goto('/modes/C');
    await page.getByRole('link', { name: /D Dorian/u }).click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('D Dorian');
    await expect.poll(() => where(page)).toBe('/scales/D/dorian?nps=1');
    await page.getByRole('link', { name: 'The seven modes of C major' }).click();
    await expect.poll(() => where(page)).toBe('/modes/C');
});

test("MODE-1.15 changes every row's labels, kept in the URL", async ({ page }) => {
    await page.goto('/modes/C');
    await page.getByText('Note names', { exact: true }).click();
    await expect.poll(() => where(page)).toBe('/modes/C?labels=notes');
    await expect(rows(page).first().locator('.dot text').first()).toHaveText(/^[A-G]/u);
});

test('MODE-1.10 changes the key in place, and /modes opens on C with no key', async ({ page }) => {
    await page.goto('/modes');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Modes of C major');
    await page.getByText('Key: C major').click();
    await page.getByText('F♯/G♭', { exact: true }).click();
    await expect.poll(() => where(page)).toBe('/modes/Fs');
    // `/modes/Fs` is another route than `/modes`, so the picker opens closed there.
    await page.getByText('Key: F♯ major').click();
    await page.getByRole('button', { name: 'Spell as G♭' }).click();
    await expect.poll(() => where(page)).toBe('/modes/Gb');
    await expect(rows(page).nth(1)).toContainText('A♭ Dorian');
});

test('THY-2.5 offers the usual spelling of a key the picker does not offer', async ({ page }) => {
    await page.goto('/modes/Gs');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Modes of G♯ major');
    await page.getByText('Key: G♯ major').click();
    await expect(page.getByRole('radio', { checked: true, name: 'A♭' })).toHaveCount(0);
    await page.getByRole('link', { name: 'Open Modes of A♭ major' }).click();
    await expect.poll(() => where(page)).toBe('/modes/Ab');
});

test('APP-3.5 shows Not found for a key it cannot read', async ({ page }) => {
    await page.goto('/modes/H');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Not found');
    await page.goto('/modes/Gss');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Not found');
});

test("CTX-2.5 opens a screen on what's stored, never the defaults and then a redraw", async ({ page }) => {
    // Records every heading the screen shows while it's visible, sampled before each frame is painted, so only what
    // could be seen counts (the prerendered HTML is parsed before its stylesheet hides the screen).
    await page.addInitScript(() => {
        const seen: string[] = [];
        Object.assign(window, { seen });
        const sample = () => {
            const screen = document.querySelector('.screen');
            const heading = document.querySelector('h1')?.textContent?.trim() ?? '';
            const shown = screen !== null && getComputedStyle(screen).visibility !== 'hidden';
            if (shown && heading !== '' && seen.at(-1) !== heading) seen.push(heading);
            requestAnimationFrame(sample);
        };
        requestAnimationFrame(sample);
    });
    await page.goto('/modes');
    await page
        .getByRole('banner')
        .getByRole('button', { name: /Guitar/u })
        .click();
    const sheet = page.getByRole('dialog', { name: 'Key and tuning' });
    await sheet.getByText('minor', { exact: true }).click();
    await sheet.getByText('E', { exact: true }).click();
    await sheet.getByRole('button', { name: 'Done' }).click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Modes of G major');
    // The key is saved after it's shown; a reload before the save commits would lose it.
    await expect.poll(() => storedSettings(page)).toMatchObject({ key: { root: 'E', mode: 'minor' } });

    // A fresh load of the prerendered `/modes` once showed C major before the stored key's.
    await page.reload();
    // The heading's text is there while the screen is still hidden, so wait for a frame that showed it.
    await expect
        .poll(() => page.evaluate(() => (window as unknown as { seen: string[] }).seen))
        .toEqual(['Modes of G major']);
});
