/**
 * Versioned records (PIN-6.1): each thing the app keeps (settings, custom tunings, later pins and recents) is one
 * record, stored with the version of its format, so a change of shape is a migration here rather than lost data.
 */

/** Where records are kept: IndexedDB in the app (`idbStore`), a `Map` in tests. */
export interface KeyValueStore {
    get(key: string): Promise<unknown>;
    set(key: string, value: unknown): Promise<void>;
}

/** A record's format: where it's kept, its version and how to read it. */
export interface RecordFormat<T> {
    readonly key: string;
    /** The version written now. Raise it when the data's shape changes, and add a step to `migrations`. */
    readonly version: number;
    /** Steps that each lift data from the version they're keyed by to the next one. */
    readonly migrations?: Readonly<Partial<Record<number, (data: unknown) => unknown>>>;
    /** Reads data in the current version's shape, keeping what's valid and defaulting the rest. Never throws. */
    readonly read: (data: unknown) => T;
}

export interface Loaded<T> {
    readonly data: T;
    /**
     * Written by a newer version of the app, as when an open tab hasn't updated yet. Its data is read as far as this
     * version understands it, and shouldn't be saved over, which would lose what this version doesn't know.
     */
    readonly newer: boolean;
}

/** Loads a record, migrating it from an older version. Nothing stored, or nothing readable, gives the defaults. */
export async function loadRecord<T>(store: KeyValueStore, format: RecordFormat<T>): Promise<Loaded<T>> {
    let stored: unknown;
    try {
        stored = await store.get(format.key);
    } catch {
        // IndexedDB can be unavailable (some private windows); the app then runs on its defaults.
        return { data: format.read(undefined), newer: false };
    }
    if (!isStored(stored)) return { data: format.read(undefined), newer: false };

    let { version, data } = stored;
    while (version < format.version) {
        const step = format.migrations?.[version];
        if (step === undefined) return { data: format.read(undefined), newer: false };
        try {
            data = step(data);
        } catch {
            // Data a migration can't make sense of is as good as none.
            return { data: format.read(undefined), newer: false };
        }
        version++;
    }
    return { data: format.read(data), newer: version > format.version };
}

/** Saves a record in the current version. */
export async function saveRecord<T>(store: KeyValueStore, format: RecordFormat<T>, data: T): Promise<void> {
    await store.set(format.key, { version: format.version, data });
}

function isStored(value: unknown): value is { version: number; data: unknown } {
    if (typeof value !== 'object' || value === null || !('version' in value) || !('data' in value)) return false;
    return Number.isInteger(value.version) && (value.version as number) >= 1;
}
