import { expect, test, type Page } from '@playwright/test';

/** The path and query the page is on. */
function where(page: Page): string {
    const url = new URL(page.url());
    return url.pathname + url.search;
}

test('PIN-1.1, 1.4 and 2.2: a pinned card shows on Home and reopens exactly as pinned after a relaunch', async ({
    page
}) => {
    await page.goto('/scales/D/dorian?nps=2&capo=3');
    await page.getByRole('button', { name: 'Pin', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Pinned' })).toBeVisible();

    await page.goto('/');
    const tile = page.getByRole('main').getByRole('link', { name: /D Dorian/u });
    await expect(tile).toBeVisible();

    await page.reload();
    await expect(tile).toContainText('Pattern 2');
    await tile.click();

    await expect(page.getByRole('heading', { level: 1 })).toHaveText('D Dorian');
    expect(where(page)).toBe('/scales/D/dorian?nps=2&capo=3');
    await expect(page.getByRole('button', { name: 'Pinned' })).toBeVisible();

    // PIN-3.1: the Scales list on D shows it first, under Pinned.
    await page.goto('/scales?root=D');
    const pinned = page.getByRole('region', { name: 'Pinned' });
    await expect(pinned.getByRole('link')).toHaveText(['D Dorian']);

    // PIN-1.2: unpinning from the card takes it off Home.
    await page.goto('/scales/D/dorian?nps=2&capo=3');
    await page.getByRole('button', { name: 'Pinned' }).click();
    await page.getByRole('dialog', { name: 'Pinned' }).getByRole('button', { name: 'Unpin' }).click();
    await expect(page.getByRole('button', { name: 'Pin', exact: true })).toBeVisible();
    await page.goto('/');
    await expect(page.getByText('Nothing pinned yet.', { exact: false })).toBeVisible();
});
