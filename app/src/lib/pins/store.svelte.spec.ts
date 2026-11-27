import { describe, expect, it, vi } from 'vitest';
import { idbStore } from '#lib/storage/idb.ts';
import { saveRecord } from '#lib/storage/record.ts';
import { PINS_FORMAT } from './pins';
import { PinsStore } from './store.svelte';

// Each test has its own database in this real browser's IndexedDB.
let databases = 0;
const freshDatabase = () => idbStore(`fretdex-pins-test-${String(Date.now())}-${String(databases++)}`);

const G_MAJOR = { url: '/scales/G/major?pos=2', label: 'G major' };
const D_DORIAN = { url: '/scales/D/dorian?nps=1', label: 'D Dorian' };
const E_MINOR = { url: '/scales/E/natural-minor', label: 'E minor' };

const labels = (store: PinsStore) => store.current.pins.map(pin => pin.label);

describe('the pins store', () => {
    it('starts with nothing pinned', async () => {
        const store = new PinsStore(freshDatabase(), () => undefined);
        await store.ready();

        expect(store.loaded).toBe(true);
        expect(store.current.pins).toEqual([]);
    });

    it('PIN-2.1 keeps the pins in the order they were pinned, across launches', async () => {
        const database = freshDatabase();
        const first = new PinsStore(database, () => undefined);
        await first.add(G_MAJOR);
        await first.add(D_DORIAN);

        const relaunched = new PinsStore(database, () => undefined);
        expect(relaunched.loaded).toBe(false);
        await relaunched.ready();

        expect(relaunched.current.pins).toMatchObject([G_MAJOR, D_DORIAN]);
    });

    it('PIN-6.2 asks for persistent storage the first time something is pinned', async () => {
        const persist = vi.fn();
        const store = new PinsStore(freshDatabase(), persist);
        await store.add(G_MAJOR);
        await store.add(D_DORIAN);

        expect(persist).toHaveBeenCalledTimes(1);
    });

    it('PIN-1.2 pins a card again and unpins it, matching its pins by path', async () => {
        const store = new PinsStore(freshDatabase(), () => undefined);
        await store.add(G_MAJOR);
        await store.add({ url: '/scales/G/major?pos=4', label: 'G major' });
        await store.add(D_DORIAN);

        const gMajor = store.of('/scales/G/major');
        expect(gMajor).toHaveLength(2);

        await store.remove(...gMajor.map(pin => pin.id));
        expect(labels(store)).toEqual(['D Dorian']);
    });

    it('PIN-1.3 renames a pin, and ignores an empty name', async () => {
        const store = new PinsStore(freshDatabase(), () => undefined);
        await store.add(G_MAJOR);
        const id = store.current.pins[0]?.id ?? '';

        await store.rename(id, '  Solo in G  ');
        expect(labels(store)).toEqual(['Solo in G']);
        await store.rename(id, '   ');
        expect(labels(store)).toEqual(['Solo in G']);
    });

    it('PIN-2.3 moves a pin up and down, staying put at either end', async () => {
        const store = new PinsStore(freshDatabase(), () => undefined);
        for (const pin of [G_MAJOR, D_DORIAN, E_MINOR]) await store.add(pin);
        const id = store.current.pins[2]?.id ?? '';

        await store.move(id, -1);
        expect(labels(store)).toEqual(['G major', 'E minor', 'D Dorian']);
        await store.move(id, -1);
        await store.move(id, -1);
        expect(labels(store)).toEqual(['E minor', 'G major', 'D Dorian']);
        await store.move(id, 1);
        expect(labels(store)).toEqual(['G major', 'E minor', 'D Dorian']);
    });

    it('PIN-6.1 never saves over pins written by a newer version of the app', async () => {
        const database = freshDatabase();
        await saveRecord(
            database,
            { ...PINS_FORMAT, version: PINS_FORMAT.version + 1 },
            {
                pins: [{ id: 'a', ...G_MAJOR }]
            }
        );
        const store = new PinsStore(database, () => undefined);
        await store.add(D_DORIAN);

        const relaunched = new PinsStore(database, () => undefined);
        await relaunched.ready();
        expect(labels(relaunched)).toEqual(['G major']);
    });
});
