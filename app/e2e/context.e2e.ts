import { expect, test, type Page } from '@playwright/test';

/** A record's data as stored in IndexedDB (app/src/lib/storage/idb.ts), or undefined. */
function stored(page: Page, key: string): Promise<unknown> {
    return page.evaluate(
        key =>
            new Promise(resolve => {
                const open = indexedDB.open('fretdex');
                open.onerror = () => resolve(undefined);
                open.onsuccess = () => {
                    const database = open.result;
                    if (!database.objectStoreNames.contains('records')) return resolve(undefined);
                    const read = database.transaction('records').objectStore('records').get(key);
                    read.onsuccess = () => resolve((read.result as { data?: unknown } | undefined)?.data);
                    read.onerror = () => resolve(undefined);
                };
            }),
        key
    );
}

test('the context bar sets the key, capo and a saved tuning, which survive a relaunch (APP-2, CTX-2.5, CTX-2.7)', async ({
    page
}) => {
    await page.goto('/');
    const bar = page.getByRole('banner').getByRole('button');
    await expect(bar).toContainText('No key');
    await bar.click();
    const sheet = page.getByRole('dialog', { name: 'Key and tuning' });

    await sheet.getByText('C♯/D♭', { exact: true }).click();
    await sheet.getByRole('button', { name: 'Raise capo' }).click();
    await sheet.getByRole('button', { name: 'Raise capo' }).click();
    await sheet.getByRole('button', { name: 'New tuning…' }).click();
    for (let i = 0; i < 3; i++) await page.getByRole('button', { name: 'Lower string 6' }).click();
    await page.getByRole('textbox', { name: 'Name' }).fill('Drop C♯');
    await page.getByRole('button', { name: 'Save' }).click();
    await sheet.getByRole('button', { name: 'Done' }).click();

    await expect(bar).toContainText('D♭ major');
    await expect(bar).toContainText('Guitar · Drop C♯ · Capo 2');
    // Leaving before the last change is saved would lose it, which a relaunch can't do to a saved one.
    await expect.poll(() => stored(page, 'settings')).toMatchObject({ key: { root: 'Db' }, capo: 2 });
    await expect.poll(() => stored(page, 'customTunings')).toMatchObject({ guitar: [{ name: 'Drop C♯' }] });

    await page.reload();

    await expect(bar).toContainText('D♭ major');
    await expect(bar).toContainText('Guitar · Drop C♯ · Capo 2');
    await expect(page.getByText('D♭ major', { exact: true }).last()).toBeVisible();
});
