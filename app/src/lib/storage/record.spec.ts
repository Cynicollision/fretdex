import { describe, expect, it } from 'vitest';
import { loadRecord, saveRecord, type KeyValueStore, type RecordFormat } from './record';

function memoryStore(entries: Record<string, unknown> = {}): KeyValueStore & { entries: Map<string, unknown> } {
    const map = new Map(Object.entries(entries));
    return {
        entries: map,
        get: key => Promise.resolve(map.get(key)),
        set: (key, value) => {
            map.set(key, value);
            return Promise.resolve();
        }
    };
}

// Version 2 renamed `count` to `total`.
const format: RecordFormat<{ total: number }> = {
    key: 'thing',
    version: 2,
    migrations: { 1: data => ({ total: (data as { count: number }).count }) },
    read: data => {
        const total = (data as { total?: unknown } | undefined)?.total;
        return { total: typeof total === 'number' ? total : 0 };
    }
};

describe('versioned records (PIN-6.1)', () => {
    it('gives the defaults when nothing is stored', async () => {
        expect(await loadRecord(memoryStore(), format)).toEqual({ data: { total: 0 }, newer: false });
    });

    it('saves with the current version and loads it back', async () => {
        const store = memoryStore();
        await saveRecord(store, format, { total: 3 });

        expect(store.entries.get('thing')).toEqual({ version: 2, data: { total: 3 } });
        expect(await loadRecord(store, format)).toEqual({ data: { total: 3 }, newer: false });
    });

    it('migrates a record from an older version', async () => {
        const store = memoryStore({ thing: { version: 1, data: { count: 5 } } });

        expect(await loadRecord(store, format)).toEqual({ data: { total: 5 }, newer: false });
    });

    it('gives the defaults when a migration step fails on damaged data', async () => {
        const store = memoryStore({ thing: { version: 1, data: null } });

        expect(await loadRecord(store, format)).toEqual({ data: { total: 0 }, newer: false });
    });

    it('reads a newer version as far as it can, and says it is newer', async () => {
        const store = memoryStore({ thing: { version: 3, data: { total: 7, extra: true } } });

        expect(await loadRecord(store, format)).toEqual({ data: { total: 7 }, newer: true });
    });

    it('gives the defaults for something that is not a record, or a store that fails', async () => {
        const failing: KeyValueStore = {
            get: () => Promise.reject(new Error('no IndexedDB')),
            set: () => Promise.resolve()
        };

        expect((await loadRecord(memoryStore({ thing: 'junk' }), format)).data).toEqual({ total: 0 });
        expect((await loadRecord(memoryStore({ thing: { version: 0, data: {} } }), format)).data).toEqual({
            total: 0
        });
        expect((await loadRecord(failing, format)).data).toEqual({ total: 0 });
    });
});
