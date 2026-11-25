import { expect, test } from '@playwright/test';

test('settings survive a relaunch, and the theme colours the page and its bars (CTX-2.5, CTX-1.8)', async ({
    page
}) => {
    await page.goto('/settings');
    await page.getByText('High contrast', { exact: true }).click();
    await page.getByText('Note names', { exact: true }).click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'contrast');

    await page.goto('/');

    await expect(page.locator('html')).toHaveAttribute('data-theme', 'contrast');
    await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute('content', /^#000(000)?$/);
    await expect(page.getByText('Note names')).toBeVisible();
});
