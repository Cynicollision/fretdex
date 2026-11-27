import type { Page } from '@playwright/test';

/** The settings record as stored in IndexedDB (app/src/lib/storage/idb.ts), or undefined. */
export function storedSettings(page: Page): Promise<unknown> {
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
