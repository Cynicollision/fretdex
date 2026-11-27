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

test('PIN-1.2 pins a second view of a card, unpins one view or all of them', async ({ page }) => {
    const pin = page.getByRole('button', { name: 'Pin', exact: true });
    const pinned = page.getByRole('button', { name: 'Pinned' });
    const sheet = page.getByRole('dialog', { name: 'Pinned' });

    await page.goto('/scales/G/major?pos=1');
    await pin.click();
    await expect(pinned).toBeVisible();

    // Another position of the same card shows it's pinned, and offers to pin this view too.
    await page.goto('/scales/G/major?pos=2');
    await pinned.click();
    await expect(sheet).toContainText('Home has another view of this card.');
    await sheet.getByRole('button', { name: 'Pin again' }).click();
    await pinned.click();
    await expect(sheet).toContainText('This view is on Home.');
    await expect(sheet.getByRole('button', { name: 'Pin again' })).toHaveCount(0);

    // Unpin takes this view's pin only.
    await sheet.getByRole('button', { name: 'Unpin' }).click();
    await expect(pinned).toBeVisible();
    await page.goto('/scales/G/major?pos=1');
    await pinned.click();
    await expect(sheet).toContainText('This view is on Home.');
    await sheet.getByRole('button', { name: 'Done' }).click();

    // From a view that isn't pinned, Unpin takes every pin of the card.
    await page.goto('/scales/G/major?pos=2');
    await pinned.click();
    await sheet.getByRole('button', { name: 'Pin again' }).click();
    await page.goto('/scales/G/major?pos=3');
    await pinned.click();
    await expect(sheet).toContainText('Home has 2 other views of this card.');
    await sheet.getByRole('button', { name: 'Unpin all 2' }).click();
    await expect(pin).toBeVisible();
});

test('PIN-1.3, PIN-2.3 and PIN-2.4 group pins and drag one into a group, kept after a relaunch', async ({ page }) => {
    for (const card of ['/scales/G/major', '/scales/D/dorian', '/scales/A/natural-minor']) {
        await page.goto(card);
        await page.getByRole('button', { name: 'Pin', exact: true }).click();
        await expect(page.getByRole('button', { name: 'Pinned' })).toBeVisible();
    }

    await page.goto('/');
    await page.getByRole('button', { name: 'D Dorian: rename, group, move or unpin' }).click();
    const menu = page.getByRole('dialog', { name: 'D Dorian' });
    await menu.getByRole('button', { name: 'New group…' }).click();
    await menu.getByRole('textbox', { name: 'New group' }).fill('Practice');
    await menu.getByRole('button', { name: 'Create' }).click();
    await menu.getByRole('button', { name: 'Done' }).click();

    const practice = page.getByRole('region', { name: 'Practice' });
    await expect(practice.getByRole('link')).toHaveText([/D Dorian/u]);

    // Holding G major lifts it; dropped on the group's heading, it goes first in the group.
    const tile = page.getByRole('main').getByRole('listitem').filter({ hasText: 'G major' });
    const from = await tile.boundingBox();
    const to = await practice.getByRole('heading', { name: 'Practice' }).boundingBox();
    if (!from || !to) throw new Error('The tile or the heading is not on screen');
    await page.mouse.move(from.x + 20, from.y + 20);
    await page.mouse.down();
    await page.waitForTimeout(700);
    await page.mouse.move(to.x + 20, to.y + to.height / 2, { steps: 10 });
    await page.mouse.up();
    await expect(practice.getByRole('link')).toHaveText([/G major/u, /D Dorian/u]);
    // The drag didn't open the tile it ended on.
    await expect(page).toHaveURL(/\/$/u);

    await page.reload();
    await expect(practice.getByRole('link')).toHaveText([/G major/u, /D Dorian/u]);
    await expect(page.getByRole('main').getByRole('listitem').first()).toContainText('A natural minor');

    // A quick tap still opens a tile.
    await practice.getByRole('link', { name: /D Dorian/u }).click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('D Dorian');
});

test('PIN-1.1 and PIN-2.6 pin a filtered list, matched by its filter', async ({ page }) => {
    await page.goto('/scales?root=Eb');
    await page.getByRole('button', { name: 'Pin', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Pinned' })).toBeVisible();

    await page.goto('/scales?root=D');
    await expect(page.getByRole('button', { name: 'Pin', exact: true })).toBeVisible();

    await page.goto('/');
    const tile = page
        .getByRole('main')
        .getByRole('link', { name: /Scales/u })
        .first();
    await expect(tile).toContainText('on E♭');
    await tile.click();
    await expect(page).toHaveURL(/\/scales\?root=Eb$/u);
});
