import { expect, test, type Page } from '@playwright/test';

/** The settings record as stored in IndexedDB (app/src/lib/storage/idb.ts), or undefined. */
function storedSettings(page: Page): Promise<unknown> {
    return page.evaluate(
        () =>
            new Promise(resolve => {
                const open = indexedDB.open('fretdex');
                open.onerror = () => resolve(undefined);
                open.onsuccess = () => {
                    const database = open.result;
                    if (!database.objectStoreNames.contains('records')) return resolve(undefined);
                    const read = database.transaction('records').objectStore('records').get('settings');
                    read.onsuccess = () => resolve((read.result as { data?: unknown } | undefined)?.data);
                    read.onerror = () => resolve(undefined);
                };
            })
    );
}

test('settings survive a relaunch, and the theme colours the page and its bars (CTX-2.5, CTX-1.8)', async ({
    page
}) => {
    await page.goto('/settings');
    await page.getByText('High contrast', { exact: true }).click();
    await page.getByText('Note names', { exact: true }).click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'contrast');
    // Leaving before the last change is saved would lose it, which a relaunch can't do to a saved setting.
    await expect.poll(() => storedSettings(page)).toMatchObject({ theme: 'contrast', labels: 'notes' });

    await page.goto('/');

    await expect(page.locator('html')).toHaveAttribute('data-theme', 'contrast');
    await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute('content', /^#000(000)?$/);
    await page.goto('/settings');
    await expect(page.getByLabel('Note names', { exact: true })).toBeChecked();
});
