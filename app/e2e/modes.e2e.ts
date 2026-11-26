import { expect, test, type Page } from '@playwright/test';

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
