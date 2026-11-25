import type { Instrument, NoteName } from '@fretdex/fretkit';
import { idbStore } from '#lib/storage/idb.ts';
import { loadRecord, saveRecord, type KeyValueStore } from '#lib/storage/record.ts';
import {
    CUSTOM_TUNINGS_FORMAT,
    MAX_CUSTOM_TUNINGS,
    NO_CUSTOM_TUNINGS,
    newTuningId,
    readCustomTunings,
    type CustomTuning,
    type CustomTunings
} from './tunings';

/**
 * The tunings the user has saved by name (CTX-2.7), loaded from the device once the app has started (`ready`) and
 * saved on every change, as `SettingsStore` does with the settings. Until they've loaded, `current` holds none.
 */
export class CustomTuningsStore {
    /** Replaced whole on each change, never changed in place. */
    current: CustomTunings = $state.raw(NO_CUSTOM_TUNINGS);
    loaded = $state(false);

    readonly #store: KeyValueStore | undefined;
    #loading: Promise<void> | undefined;
    #writable = true;

    /** With no store (prerendering, or a browser without IndexedDB), none are saved and changes last until it closes. */
    constructor(store: KeyValueStore | undefined) {
        this.#store = store;
        if (!store) {
            this.loaded = true;
            this.#loading = Promise.resolve();
        }
    }

    /**
     * Loads the stored tunings the first time it's called, and resolves once they have. The root layout calls it
     * once the page has hydrated: Svelte keeps a prerendered page's text as it was when hydrating it, so tunings
     * that arrived earlier would never be shown. Changing them calls it too.
     */
    ready(): Promise<void> {
        this.#loading ??= this.#store ? this.#load(this.#store) : Promise.resolve();
        return this.#loading;
    }

    /**
     * Saves a new tuning for an instrument and gives it as saved, or `undefined` if the instrument already has
     * `MAX_CUSTOM_TUNINGS` or the tuning isn't valid (`cannotSave` says why).
     */
    async add(instrument: Instrument, name: string, strings: readonly NoteName[]): Promise<CustomTuning | undefined> {
        let id: string | undefined;
        await this.update(all => {
            const list = all[instrument];
            if (list.length >= MAX_CUSTOM_TUNINGS) return all;
            id = newTuningId(list);
            return { ...all, [instrument]: [...list, { id, name, strings }] };
        });
        // What was kept, as the record reads it: a tuning that isn't valid is dropped (readCustomTunings).
        return this.current[instrument].find(tuning => tuning.id === id);
    }

    /** Renames or retunes a saved tuning, keeping its place in the list. */
    async edit(instrument: Instrument, id: string, name: string, strings: readonly NoteName[]): Promise<void> {
        await this.update(all => ({
            ...all,
            [instrument]: all[instrument].map(tuning => (tuning.id === id ? { ...tuning, name, strings } : tuning))
        }));
    }

    async remove(instrument: Instrument, id: string): Promise<void> {
        await this.update(all => ({ ...all, [instrument]: all[instrument].filter(tuning => tuning.id !== id) }));
    }

    /**
     * Changes the saved tunings and saves them. A change made before they've loaded waits for them, and is given
     * them as loaded. Tunings that aren't valid are dropped. If saving fails (IndexedDB full or unavailable), the
     * change still applies until the app closes.
     */
    async update(change: (tunings: CustomTunings) => CustomTunings): Promise<void> {
        await this.ready();
        this.current = readCustomTunings(change(this.current));
        if (!this.#store || !this.#writable) return;
        try {
            await saveRecord(this.#store, CUSTOM_TUNINGS_FORMAT, this.current);
        } catch (error) {
            console.warn('Custom tunings could not be saved', error);
        }
    }

    async #load(store: KeyValueStore): Promise<void> {
        const { data, newer } = await loadRecord(store, CUSTOM_TUNINGS_FORMAT);
        this.current = data;
        // Tunings saved by a newer version of the app stay as they are until this one updates (record.ts).
        this.#writable = !newer;
        this.loaded = true;
    }
}

/** The app's saved tunings, in IndexedDB beside the settings. */
export const customTunings = new CustomTuningsStore(typeof indexedDB === 'undefined' ? undefined : idbStore());
