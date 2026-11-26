import { expect, test, type Page } from '@playwright/test';

/** The path and query the page is on. */
function where(page: Page): string {
    const url = new URL(page.url());
    return url.pathname + url.search;
}

test('SCL-1.1 lists every scale on the root picked, kept in the URL', async ({ page }) => {
    await page.goto('/scales');
    await expect(page.getByRole('link', { name: 'C Dorian' })).toBeVisible();
    await page.getByText('C♯/D♭', { exact: true }).click();
    await expect.poll(() => where(page)).toBe('/scales?root=Cs');
    await expect(page.getByRole('link', { name: 'D♭ major', exact: true })).toBeVisible();
    await expect(page.getByRole('link', { name: 'C♯ natural minor' })).toBeVisible();
});

test('SCL-2.1, SCL-2.3 and SCL-5 show a mode card, with degrees highlighted from the URL', async ({ page }) => {
    await page.goto('/scales/D/dorian?deg=6');
    await expect(page.getByText('D E F G A B C')).toBeVisible();
    await expect(page.getByText('W H W W W H W')).toBeVisible();
    await expect(page.getByText('D Dorian is the 2nd mode of C major.')).toBeVisible();
    await expect(page.getByRole('row', { name: 'vi° B° Bm7♭5' })).toBeVisible();
    await expect(page.locator('.dot.marked').first()).toBeVisible();
    await expect(page.locator('.dot.dim').first()).toBeVisible();

    await page.getByRole('button', { name: '6', exact: true }).click();
    await expect.poll(() => where(page)).toBe('/scales/D/dorian');

    await page.getByRole('link', { name: 'Lydian', exact: true }).click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('D Lydian');
});

test('THY-2.2 changes the root in place from the card', async ({ page }) => {
    await page.goto('/scales/G/major?labels=notes');
    await page.getByText('Root: G').click();
    await page.getByText('C♯/D♭', { exact: true }).click();
    await expect.poll(() => where(page)).toBe('/scales/Db/major?labels=notes');
    await page.getByRole('button', { name: 'Spell as C♯' }).click();
    await expect.poll(() => where(page)).toBe('/scales/Cs/major?labels=notes');
});

test('THY-2.5 and SCL-2.6 explain roots that need double sharps or flats', async ({ page }) => {
    await page.goto('/scales/As/dorian');
    await expect(page.getByRole('link', { name: 'B♭ Dorian' }).first()).toBeVisible();
    await page.goto('/scales/Cs/altered');
    await expect(page.getByText(/named by their intervals from the root/u)).toBeVisible();
});
