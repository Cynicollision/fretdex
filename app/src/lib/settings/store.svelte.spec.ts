import { describe, expect, it } from 'vitest';
import { idbStore } from '#lib/storage/idb.ts';
import { DEFAULT_SETTINGS } from './settings';
import { SettingsStore } from './store.svelte';

// Each test has its own database in this real browser's IndexedDB.
let databases = 0;
const freshDatabase = () => idbStore(`fretdex-test-${String(Date.now())}-${String(databases++)}`);

describe('the settings store', () => {
    it('starts on the defaults with nothing stored', async () => {
        const store = new SettingsStore(freshDatabase());
        await store.ready();

        expect(store.loaded).toBe(true);
        expect(store.current).toEqual(DEFAULT_SETTINGS);
    });

    it('CTX-2.5 remembers settings across launches', async () => {
        const database = freshDatabase();
        const first = new SettingsStore(database);
        await first.update({ theme: 'light', labels: 'notes', tempo: 132 });

        const relaunched = new SettingsStore(database);
        await relaunched.ready();

        expect(relaunched.current).toMatchObject({ theme: 'light', labels: 'notes', tempo: 132 });
    });

    it('applies a change made while loading on top of what was stored', async () => {
        const database = freshDatabase();
        await new SettingsStore(database).update({ theme: 'contrast' });

        const relaunched = new SettingsStore(database);
        await relaunched.update({ handedness: 'left' });

        expect(relaunched.current).toMatchObject({ theme: 'contrast', handedness: 'left' });
    });

    it('does not save an invalid value', async () => {
        const store = new SettingsStore(freshDatabase());
        await store.update({ tempo: 1000 });

        expect(store.current.tempo).toBe(DEFAULT_SETTINGS.tempo);
    });

    it('does not save over settings written by a newer version', async () => {
        const database = freshDatabase();
        await database.set('settings', { version: 99, data: { theme: 'light', future: true } });

        const store = new SettingsStore(database);
        await store.update({ theme: 'contrast' });

        expect(store.current.theme).toBe('contrast');
        expect(await database.get('settings')).toEqual({ version: 99, data: { theme: 'light', future: true } });
    });
});
