import { idbStore } from '#lib/storage/idb.ts';
import { loadRecord, saveRecord, type KeyValueStore } from '#lib/storage/record.ts';
import { DEFAULT_SETTINGS, SETTINGS_FORMAT, readSettings, type Settings } from './settings';

/**
 * The settings every view reads (CTX), loaded from the device when the app starts and saved on every change
 * (CTX-2.5). Until they've loaded, `current` holds the defaults.
 */
export class SettingsStore {
    /** Replaced whole on each change, never changed in place. */
    current: Settings = $state.raw(DEFAULT_SETTINGS);
    loaded = $state(false);

    readonly #store: KeyValueStore | undefined;
    readonly #ready: Promise<void>;
    #writable = true;

    /** With no store (prerendering, or a browser without IndexedDB), the defaults apply and nothing is saved. */
    constructor(store: KeyValueStore | undefined) {
        this.#store = store;
        if (store) this.#ready = this.#load(store);
        else {
            this.loaded = true;
            this.#ready = Promise.resolve();
        }
    }

    /** Resolves once the stored settings have loaded. */
    ready(): Promise<void> {
        return this.#ready;
    }

    /**
     * Changes settings and saves them. A change made before the stored settings have loaded waits for them, so it
     * applies on top of them rather than saving over them; a change that depends on another setting should be given
     * as a function of the settings, so it reads them as loaded. Values that aren't valid settings fall back to
     * defaults. If saving fails (IndexedDB full or unavailable), the change still applies until the app closes.
     */
    async update(change: Partial<Settings> | ((settings: Settings) => Settings)): Promise<void> {
        await this.#ready;
        const next = typeof change === 'function' ? change(this.current) : { ...this.current, ...change };
        this.current = readSettings(next);
        if (!this.#store || !this.#writable) return;
        try {
            await saveRecord(this.#store, SETTINGS_FORMAT, this.current);
        } catch (error) {
            console.warn('Settings could not be saved', error);
        }
    }

    async #load(store: KeyValueStore): Promise<void> {
        const { data, newer } = await loadRecord(store, SETTINGS_FORMAT);
        this.current = data;
        // Settings saved by a newer version of the app stay as they are until this one updates (record.ts).
        this.#writable = !newer;
        this.loaded = true;
    }
}

/** The app's settings, in IndexedDB. */
export const settings = new SettingsStore(typeof indexedDB === 'undefined' ? undefined : idbStore());
