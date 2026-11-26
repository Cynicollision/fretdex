import { idbStore } from '#lib/storage/idb.ts';
import { requestPersistence } from '#lib/storage/persist.ts';
import { loadRecord, saveRecord, type KeyValueStore } from '#lib/storage/record.ts';
import {
    NO_PINS,
    PINS_FORMAT,
    cleanLabel,
    newPinId,
    pinIdentity,
    readPinBoard,
    type Pin,
    type PinBoard,
    type PinTarget
} from './pins';

/**
 * The home board's pins (PIN-1, PIN-2), loaded from the device once the app has started (`ready`) and saved on
 * every change, as `CustomTuningsStore` does with saved tunings. Until they've loaded, `current` holds none.
 */
export class PinsStore {
    /** Replaced whole on each change, never changed in place. */
    current: PinBoard = $state.raw(NO_PINS);
    loaded = $state(false);

    readonly #store: KeyValueStore | undefined;
    readonly #persist: () => unknown;
    #loading: Promise<void> | undefined;
    #writable = true;

    /**
     * With no store (prerendering, or a browser without IndexedDB), nothing is saved and changes last until it
     * closes. `persist` asks the browser to keep the app's storage, the first time something is pinned (PIN-6.2).
     */
    constructor(store: KeyValueStore | undefined, persist: () => unknown = requestPersistence) {
        this.#store = store;
        this.#persist = persist;
        if (!store) {
            this.loaded = true;
            this.#loading = Promise.resolve();
        }
    }

    /**
     * Loads the stored pins the first time it's called, and resolves once they have. The root layout calls it once
     * the page has hydrated, as `CustomTuningsStore.ready` explains. Changing them calls it too.
     */
    ready(): Promise<void> {
        this.#loading ??= this.#store ? this.#load(this.#store) : Promise.resolve();
        return this.#loading;
    }

    /** The pins of a card or list, whatever their options (`pinIdentity`, PIN-1.2). */
    of(identity: string): Pin[] {
        return this.current.pins.filter(pin => pinIdentity(pin.url) === identity);
    }

    /** Pins a view at the end of the board. The first pin asks for persistent storage (PIN-6.2). */
    async add(target: PinTarget): Promise<void> {
        let first = false;
        await this.update(board => {
            first = board.pins.length === 0;
            const pin = { id: newPinId(board.pins), url: target.url, label: target.label };
            return { ...board, pins: [...board.pins, pin] };
        });
        if (first) void this.#persist();
    }

    /** Unpins the pins with these ids. */
    async remove(...ids: string[]): Promise<void> {
        await this.update(board => ({ ...board, pins: board.pins.filter(pin => !ids.includes(pin.id)) }));
    }

    /** Renames a pin (PIN-1.3); an empty label leaves it as it was. */
    async rename(id: string, label: string): Promise<void> {
        const cleaned = cleanLabel(label);
        if (cleaned === '') return;
        await this.update(board => ({
            ...board,
            pins: board.pins.map(pin => (pin.id === id ? { ...pin, label: cleaned } : pin))
        }));
    }

    /** Moves a pin a place earlier (-1) or later (1) on the board (PIN-2.3); at either end it stays. */
    async move(id: string, by: -1 | 1): Promise<void> {
        await this.update(board => {
            const from = board.pins.findIndex(pin => pin.id === id);
            const to = from + by;
            if (from === -1 || to < 0 || to >= board.pins.length) return board;
            const pins = [...board.pins];
            const [pin] = pins.splice(from, 1);
            if (pin) pins.splice(to, 0, pin);
            return { ...board, pins };
        });
    }

    /**
     * Changes the board and saves it. A change made before the pins have loaded waits for them, and is given them
     * as loaded. If saving fails (IndexedDB full or unavailable), the change still applies until the app closes.
     */
    async update(change: (board: PinBoard) => PinBoard): Promise<void> {
        await this.ready();
        this.current = readPinBoard(change(this.current));
        if (!this.#store || !this.#writable) return;
        try {
            await saveRecord(this.#store, PINS_FORMAT, this.current);
        } catch (error) {
            console.warn('Pins could not be saved', error);
        }
    }

    async #load(store: KeyValueStore): Promise<void> {
        const { data, newer } = await loadRecord(store, PINS_FORMAT);
        this.current = data;
        // Pins saved by a newer version of the app stay as they are until this one updates (record.ts).
        this.#writable = !newer;
        this.loaded = true;
    }
}

/** The app's pins, in IndexedDB beside the settings. */
export const pins = new PinsStore(typeof indexedDB === 'undefined' ? undefined : idbStore());
