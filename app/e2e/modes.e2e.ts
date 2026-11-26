import { expect, test, type Page } from '@playwright/test';

/** The path and query the page is on. */
function where(page: Page): string {
    const url = new URL(page.url());
    return url.pathname + url.search;
}

test('MODE-1.1 and MODE-1.9 show the seven modes on the root, with their marks', async ({ page }) => {
    await page.goto('/modes/D');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Modes on D');
    const rows = page.getByRole('main').getByRole('listitem');
    await expect(rows).toHaveCount(7);
    await expect(rows.first()).toContainText('D Lydian');
    await expect(rows.last()).toContainText('D Locrian');
    const dorian = rows.filter({ hasText: 'D Dorian' });
    await expect(dorian).toContainText('♮6 characteristic · ♭3, was 3');
    await expect(dorian).toContainText('1 2 ♭3 4 5 6 ♭7');
    await expect(dorian.locator('.dot.changed').first()).toBeVisible();
    await expect(dorian.locator('.ghost').first()).toBeVisible();
    await expect(rows.first().locator('.dot.changed')).toHaveCount(0);
});

test('MODE-1.7 opens a mode from its row, and its card links back to the overview', async ({ page }) => {
    await page.goto('/modes/D');
    await page.getByRole('link', { name: /^D Dorian/u }).click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('D Dorian');
    await page.getByRole('link', { name: 'All seven modes side by side' }).click();
    await expect.poll(() => where(page)).toBe('/modes/D');
});

test('MODE-1.10 changes the root in place, and /modes opens on C with no key', async ({ page }) => {
    await page.goto('/modes');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Modes on C');
    await page.getByText('Root: C').click();
    await page.getByText('F♯/G♭', { exact: true }).click();
    await expect.poll(() => where(page)).toBe('/modes/Fs');
    // `/modes/Fs` is another route than `/modes`, so the picker opens closed there.
    await page.getByText('Root: F♯').click();
    await page.getByRole('button', { name: 'Spell as G♭' }).click();
    await expect.poll(() => where(page)).toBe('/modes/Gb');
    await expect(page.getByRole('main').getByRole('listitem').first()).toContainText('G♭ Lydian');
});

test('APP-3.5 shows Not found for a root it cannot read', async ({ page }) => {
    await page.goto('/modes/H');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Not found');
});
