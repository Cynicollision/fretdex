import { describe, expect, it } from 'vitest';
import { idbStore } from '#lib/storage/idb.ts';
import { MAX_CUSTOM_TUNINGS, NO_CUSTOM_TUNINGS } from './tunings';
import { CustomTuningsStore } from './tunings.svelte';

// Each test has its own database in this real browser's IndexedDB.
let databases = 0;
const freshDatabase = () => idbStore(`fretdex-tunings-test-${String(Date.now())}-${String(databases++)}`);

const OPEN_C = ['C2', 'G2', 'C3', 'G3', 'C4', 'E4'];
const DROP_C = ['C2', 'G2', 'C3', 'F3', 'A3', 'D4'];

describe('the custom tunings store', () => {
    it('starts with none saved', async () => {
        const store = new CustomTuningsStore(freshDatabase());
        await store.ready();

        expect(store.loaded).toBe(true);
        expect(store.current).toEqual(NO_CUSTOM_TUNINGS);
    });

    it('does not load until asked, so a prerendered page hydrates before what is stored arrives', async () => {
        const database = freshDatabase();
        await new CustomTuningsStore(database).add('guitar', 'Open C', OPEN_C);

        const relaunched = new CustomTuningsStore(database);
        expect(relaunched.loaded).toBe(false);

        await relaunched.ready();
        expect(relaunched.current.guitar).toHaveLength(1);
    });

    it('CTX-2.7 remembers saved tunings across launches', async () => {
        const database = freshDatabase();
        const first = new CustomTuningsStore(database);
        await first.add('guitar', 'Open C', OPEN_C);
        await first.add('bass', 'BEAD', ['B0', 'E1', 'A1', 'D2']);

        const relaunched = new CustomTuningsStore(database);
        await relaunched.ready();

        expect(relaunched.current.guitar).toMatchObject([{ name: 'Open C', strings: OPEN_C }]);
        expect(relaunched.current.bass).toMatchObject([{ name: 'BEAD', strings: ['B0', 'E1', 'A1', 'D2'] }]);
    });

    it('CTX-2.7 renames, retunes and deletes a saved tuning, keeping its place', async () => {
        const store = new CustomTuningsStore(freshDatabase());
        const first = await store.add('guitar', 'Open C', OPEN_C);
        await store.add('guitar', 'Drop C', DROP_C);
        if (!first) throw new Error('Not added');

        await store.edit('guitar', first.id, 'Open C6', ['C2', 'A2', 'C3', 'G3', 'C4', 'E4']);
        expect(store.current.guitar.map(tuning => tuning.name)).toEqual(['Open C6', 'Drop C']);
        expect(store.current.guitar[0]?.strings).toEqual(['C2', 'A2', 'C3', 'G3', 'C4', 'E4']);

        await store.remove('guitar', first.id);
        expect(store.current.guitar.map(tuning => tuning.name)).toEqual(['Drop C']);
    });

    it(`CTX-2.7 saves at most ${String(MAX_CUSTOM_TUNINGS)} per instrument`, async () => {
        const store = new CustomTuningsStore(freshDatabase());
        for (let i = 0; i < MAX_CUSTOM_TUNINGS; i++) await store.add('guitar', `Tuning ${String(i)}`, OPEN_C);

        expect(await store.add('guitar', 'One more', OPEN_C)).toBeUndefined();
        expect(store.current.guitar).toHaveLength(MAX_CUSTOM_TUNINGS);
        expect(await store.add('bass', 'BEAD', ['B0', 'E1', 'A1', 'D2'])).toBeDefined();
    });

    it('keeps a change when saving it fails', async () => {
        const failing = {
            get: () => Promise.resolve(undefined),
            set: () => Promise.reject(new Error('quota exceeded'))
        };
        const store = new CustomTuningsStore(failing);

        await expect(store.add('guitar', 'Open C', OPEN_C)).resolves.toBeDefined();
        expect(store.current.guitar).toHaveLength(1);
    });

    it('does not save over tunings written by a newer version', async () => {
        const database = freshDatabase();
        const newer = { version: 99, data: { guitar: [{ id: 'x', name: 'Open C', strings: OPEN_C }], future: true } };
        await database.set('customTunings', newer);

        const store = new CustomTuningsStore(database);
        await store.add('guitar', 'Drop C', DROP_C);

        expect(store.current.guitar).toHaveLength(2);
        expect(await database.get('customTunings')).toEqual(newer);
    });
});
