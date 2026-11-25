import { expect, test } from '@playwright/test';

test('the home page opens with its title', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveTitle('Fretdex');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Fretdex');
});
