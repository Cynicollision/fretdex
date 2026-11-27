import { PINS_FORMAT, groupNamed, newId, readPinBoard, type Pin, type PinBoard } from '#lib/pins/pins.ts';
import { SETTINGS_FORMAT, type Settings } from '#lib/settings/settings.ts';
import {
    CUSTOM_TUNINGS_FORMAT,
    MAX_CUSTOM_TUNINGS,
    newTuningId,
    readCustomTunings,
    type CustomTuning,
    type CustomTunings
} from '#lib/settings/tunings.ts';
import { loadRecord, type KeyValueStore, type RecordFormat } from '#lib/storage/record.ts';

/**
 * Backups (PIN-5): a JSON file holding each record the app keeps as it's stored, its version beside its data, so
 * importing one runs it through the same migrations and checks as loading it from the device does (`loadRecord`).
 *
 * ```json
 * { "kind": "fretdex-backup", "version": 1, "exported": "2026-11-27T10:00:00.000Z",
 *   "records": { "settings": { "version": 1, "data": … }, "customTunings": …, "pins": … } }
 * ```
 */
export interface Backup {
    readonly settings: Settings;
    readonly customTunings: CustomTunings;
    readonly pins: PinBoard;
}

/** The backup file's own format. Raise it if the file's shape around the records changes. */
export const BACKUP_VERSION = 1;

const KIND = 'fretdex-backup';

/** A file bigger than this isn't read: a full board of pins and tunings is a few tens of kilobytes. */
export const MAX_BACKUP_BYTES = 1_000_000;

/** The records a backup holds, each read from the file as it would be from the device. */
const FORMATS = {
    settings: SETTINGS_FORMAT,
    customTunings: CUSTOM_TUNINGS_FORMAT,
    pins: PINS_FORMAT
} as const satisfies Record<keyof Backup, RecordFormat<unknown>>;

/** The backup file's text (PIN-5.1). */
export function writeBackup(backup: Backup, exported: Date): string {
    const records = Object.fromEntries(
        (Object.keys(FORMATS) as (keyof Backup)[]).map(name => [
            FORMATS[name].key,
            { version: FORMATS[name].version, data: backup[name] }
        ])
    );
    return `${JSON.stringify({ kind: KIND, version: BACKUP_VERSION, exported: exported.toISOString(), records }, null, 2)}\n`;
}

/** The name an export is saved under, by the day it's made, in the phone's time: `fretdex-2026-11-27.json`. */
export function backupFileName(exported: Date): string {
    const pad = (n: number) => String(n).padStart(2, '0');
    return `fretdex-${String(exported.getFullYear())}-${pad(exported.getMonth() + 1)}-${pad(exported.getDate())}.json`;
}

export type ReadBackup =
    { readonly ok: true; readonly backup: Backup } | { readonly ok: false; readonly reason: string };

const NOT_A_BACKUP = "This file isn't a Fretdex backup.";
const TOO_NEW =
    'This backup was made by a newer version of Fretdex. Close and reopen the app to update it, then try again.';

/**
 * Reads a backup file's text (PIN-5.2): each record is migrated and checked as if loaded from the device, keeping
 * what's valid. A file that isn't a backup, or that a newer version of the app wrote, is refused with the reason,
 * since importing what this version doesn't understand would lose it.
 */
export async function readBackup(text: string): Promise<ReadBackup> {
    if (text.length > MAX_BACKUP_BYTES) return { ok: false, reason: 'This file is too big to be a Fretdex backup.' };
    let file: unknown;
    try {
        file = JSON.parse(text);
    } catch {
        return { ok: false, reason: NOT_A_BACKUP };
    }
    if (typeof file !== 'object' || file === null) return { ok: false, reason: NOT_A_BACKUP };
    const { kind, version, records } = file as { kind?: unknown; version?: unknown; records?: unknown };
    if (kind !== KIND || !Number.isInteger(version) || (version as number) < 1)
        return { ok: false, reason: NOT_A_BACKUP };
    if ((version as number) > BACKUP_VERSION) return { ok: false, reason: TOO_NEW };
    if (typeof records !== 'object' || records === null) return { ok: false, reason: NOT_A_BACKUP };

    const stored = records as Record<string, unknown>;
    const store: KeyValueStore = {
        get: key => Promise.resolve(Object.hasOwn(stored, key) ? stored[key] : undefined),
        set: () => Promise.resolve()
    };
    const missing = (Object.values(FORMATS) as RecordFormat<unknown>[]).some(
        format => !Object.hasOwn(stored, format.key)
    );
    if (missing)
        return { ok: false, reason: "This backup is missing part of what Fretdex keeps, so it can't be restored." };

    const settings = await loadRecord(store, SETTINGS_FORMAT);
    const customTunings = await loadRecord(store, CUSTOM_TUNINGS_FORMAT);
    const pins = await loadRecord(store, PINS_FORMAT);
    if (settings.newer || customTunings.newer || pins.newer) return { ok: false, reason: TOO_NEW };
    return { ok: true, backup: { settings: settings.data, customTunings: customTunings.data, pins: pins.data } };
}

/** What a backup holds, for the confirmation before importing it. */
export function describeBackup(backup: Backup): string {
    const pins = backup.pins.pins.length;
    const groups = backup.pins.groups.length;
    const tunings = backup.customTunings.guitar.length + backup.customTunings.bass.length;
    const parts = [
        count(pins, 'pin'),
        ...(groups > 0 ? [count(groups, 'group')] : []),
        count(tunings, 'saved tuning'),
        'settings'
    ];
    return `${parts.slice(0, -1).join(', ')} and ${parts.at(-1) ?? ''}`;
}

/** A number of things: "1 pin", "3 pins", "no pins". */
export function count(n: number, thing: string): string {
    return `${n === 0 ? 'no' : String(n)} ${thing}${n === 1 ? '' : 's'}`;
}

export interface Added<T> {
    readonly merged: T;
    readonly added: number;
    readonly skipped: number;
}

/**
 * Adds a backup's pins to a board (PIN-5.2's **Add to what's here**): a pin whose URL is already pinned is skipped,
 * and the rest go last in their group, matched by name (`groupNamed`), or ungrouped. A group with no match is added
 * after the board's own. What's added gets new ids, so nothing clashes with what's here.
 */
export function addPins(here: PinBoard, from: PinBoard): Added<PinBoard> & { readonly groups: number } {
    const groups = [...here.groups];
    const into = new Map<string, string>();
    for (const group of from.groups) {
        const match = groupNamed({ pins: [], groups }, group.name);
        if (match) {
            into.set(group.id, match.id);
        } else {
            const id = newId(groups);
            groups.push({ id, name: group.name });
            into.set(group.id, id);
        }
    }
    const pins: Pin[] = [...here.pins];
    let skipped = 0;
    for (const pin of from.pins) {
        if (pins.some(other => other.url === pin.url)) {
            skipped++;
            continue;
        }
        const group = pin.group === undefined ? undefined : into.get(pin.group);
        const { url, label } = pin;
        const id = newId(pins);
        pins.push(group === undefined ? { id, url, label } : { id, url, label, group });
    }
    return {
        merged: readPinBoard({ pins, groups }),
        added: pins.length - here.pins.length,
        skipped,
        groups: groups.length - here.groups.length
    };
}

/**
 * Adds a backup's saved tunings to this device's (PIN-5.2): one whose name the instrument already has, ignoring case,
 * is skipped, as are any past `MAX_CUSTOM_TUNINGS`.
 */
export function addTunings(here: CustomTunings, from: CustomTunings): Added<CustomTunings> {
    let added = 0;
    let skipped = 0;
    const merge = (mine: readonly CustomTuning[], theirs: readonly CustomTuning[]): CustomTuning[] => {
        const list = [...mine];
        for (const tuning of theirs) {
            const taken = list.some(other => other.name.toLocaleLowerCase() === tuning.name.toLocaleLowerCase());
            if (taken || list.length >= MAX_CUSTOM_TUNINGS) {
                skipped++;
                continue;
            }
            list.push({ ...tuning, id: newTuningId(list) });
            added++;
        }
        return list;
    };
    const merged = readCustomTunings({ guitar: merge(here.guitar, from.guitar), bass: merge(here.bass, from.bass) });
    return { merged, added, skipped };
}
