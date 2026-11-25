import { createStore, get, set, type UseStore } from 'idb-keyval';
import type { KeyValueStore } from './record';

/**
 * Records in IndexedDB, through idb-keyval: one object store, `records`, in a database of the given name. The
 * database opens on first use, so importing this during prerendering touches nothing.
 */
export function idbStore(database = 'fretdex'): KeyValueStore {
    let store: UseStore | undefined;
    const open = () => (store ??= createStore(database, 'records'));
    return {
        get: key => get(key, open()),
        set: (key, value) => set(key, value, open())
    };
}
