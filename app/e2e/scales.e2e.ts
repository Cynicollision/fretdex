import { expect, test, type Page } from '@playwright/test';

/** The path and query the page is on. */
function where(page: Page): string {
    const url = new URL(page.url());
    return url.pathname + url.search;
}

test('SCL-1.1 lists every scale on the root picked, kept in the URL', async ({ page }) => {
    await page.goto('/scales');
    await expect(page.getByRole('link', { name: 'C Dorian' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'All seven modes side by side' })).toBeVisible();
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
    await expect(page.getByRole('link', { name: 'Open B♭ Dorian' })).toBeVisible();
    // A♯ isn't offered in Dorian, so no root button is chosen and B♭ is one tap.
    await page.getByText('Root: A♯').click();
    await expect(page.getByRole('radio', { checked: true, name: 'B♭' })).toHaveCount(0);
    await page.getByText('B♭', { exact: true }).click();
    await expect.poll(() => where(page)).toBe('/scales/Bb/dorian');
    await page.goto('/scales/Cs/altered');
    await expect(page.getByText(/named by their intervals from the root/u)).toBeVisible();
});

test('SCL-3 and SCL-4 choose a position, step through them, and keep the choice in the URL', async ({ page }) => {
    await page.goto('/scales/G/major?pos=2');
    const name = page.getByRole('group', { name: 'Position', exact: true });
    await expect(name).toContainText('Position 2 · E shape');
    await expect(name).toContainText('frets 2–5');
    await page.getByRole('button', { name: 'Next ›' }).click();
    await expect.poll(() => where(page)).toBe('/scales/G/major?pos=3');
    await expect(name).toContainText('Position 3 · D shape');
    // Upright, the neck shows the position's frets alone (DIAG-1.10).
    await expect(page.locator('.fretboard svg[data-frets]')).toHaveAttribute('data-frets', '4-8');

    await page.getByText('3 per string', { exact: true }).click();
    await expect.poll(() => where(page)).toBe('/scales/G/major?nps=6');
    await page.getByText('Full neck', { exact: true }).click();
    await expect.poll(() => where(page)).toBe('/scales/G/major');

    await page.goto('/scales/A/minor-pentatonic?box=1&inst=bass');
    await expect(page.getByRole('group', { name: 'Position', exact: true })).toContainText(
        'Box 1 · one octave from the E string'
    );
    await expect(page.getByText('3 per string', { exact: true })).toHaveCount(0);
});
