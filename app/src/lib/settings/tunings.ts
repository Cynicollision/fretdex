import {
    TUNINGS,
    noteMidi,
    parseTuning,
    spellMidi,
    spellPitchClass,
    type Accidentals,
    type Instrument,
    type NoteName
} from '@fretdex/fretkit';
import type { RecordFormat } from '#lib/storage/record.ts';
import { STRING_COUNTS, builtInTuning, sameTuning } from './settings';

/** A tuning the user saved by name (CTX-2.7). */
export interface CustomTuning {
    /** Stays the same through renames and edits. */
    readonly id: string;
    readonly name: string;
    /** Its pitches, lowest string first, as `Settings.tuning` holds them. */
    readonly strings: readonly NoteName[];
}

/** Each instrument's saved tunings, in the order they were saved. */
export type CustomTunings = Readonly<Record<Instrument, readonly CustomTuning[]>>;

export const NO_CUSTOM_TUNINGS: CustomTunings = { guitar: [], bass: [] };

/** The most tunings each instrument can save (CTX-2.7). */
export const MAX_CUSTOM_TUNINGS = 10;

/** The longest name a saved tuning can have. */
export const MAX_TUNING_NAME = 30;

/** How far a custom tuning's string can be from Standard's, in semitones: an octave either way (THY-3.3). */
const STRING_REACH = 12;

/**
 * Reads stored custom tunings, keeping each that's valid for its instrument (a name, the right number of strings,
 * each within reach) and dropping the rest, up to `MAX_CUSTOM_TUNINGS` per instrument.
 */
export function readCustomTunings(data: unknown): CustomTunings {
    const stored = (typeof data === 'object' && data !== null ? data : {}) as Partial<Record<Instrument, unknown>>;
    return { guitar: readList(stored.guitar, 'guitar'), bass: readList(stored.bass, 'bass') };
}

/** The custom tunings record (PIN-6.1). */
export const CUSTOM_TUNINGS_FORMAT: RecordFormat<CustomTunings> = {
    key: 'customTunings',
    version: 1,
    read: readCustomTunings
};

/** A tuning's name: a built-in one's, then a saved one's, else "Custom" (CTX-1.3). */
export function tuningName(instrument: Instrument, strings: readonly NoteName[], saved: CustomTunings): string {
    return (
        builtInTuning(instrument, strings)?.name ??
        saved[instrument].find(tuning => sameTuning(tuning.strings, strings))?.name ??
        'Custom'
    );
}

/** The lowest and highest MIDI pitch a string can take: an octave either side of Standard's (THY-3.3). */
export function stringReach(instrument: Instrument, index: number): { readonly low: number; readonly high: number } {
    const note = TUNINGS[instrument][0]?.strings[index];
    const standard = note === undefined ? undefined : noteMidi(note);
    if (standard === undefined) throw new Error(`No string ${String(index)} on ${instrument}`);
    return { low: standard - STRING_REACH, high: standard + STRING_REACH };
}

/** A pitch spelled as a note with no key is on the accidentals setting (THY-2.3): with flats, 51 is E♭3. */
export function spellPitch(midi: number, accidentals: Accidentals): NoteName {
    return spellMidi(midi, spellPitchClass(midi, accidentals));
}

/** A new id for a saved tuning, unique among the ones given. */
export function newTuningId(taken: readonly CustomTuning[]): string {
    let id: string;
    do id = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
    while (taken.some(tuning => tuning.id === id));
    return id;
}

/**
 * Why a tuning can't be saved as it is, or `undefined` if it can: it needs a name no other tuning of the instrument
 * has, built in or saved, and pitches that aren't already in the list, built in or saved. `editing` is the id of the saved
 * tuning being changed, which doesn't count against itself.
 */
export function cannotSave(
    instrument: Instrument,
    name: string,
    strings: readonly NoteName[],
    saved: CustomTunings,
    editing?: string
): string | undefined {
    const others = saved[instrument].filter(tuning => tuning.id !== editing);
    const builtIn = builtInTuning(instrument, strings);
    if (builtIn) return `That's ${builtIn.name}, which is already in the list.`;
    const same = others.find(tuning => sameTuning(tuning.strings, strings));
    if (same) return `That's ${same.name}, which is already saved.`;
    const trimmed = name.trim();
    if (trimmed === '') return 'Give it a name to save it.';
    const taken = [...TUNINGS[instrument], ...others].map(tuning => tuning.name.toLowerCase());
    if (taken.includes(trimmed.toLowerCase())) {
        return `There's already a tuning called ${trimmed}.`;
    }
    return undefined;
}

function readList(value: unknown, instrument: Instrument): CustomTuning[] {
    if (!Array.isArray(value)) return [];
    const list: CustomTuning[] = [];
    for (const item of value as unknown[]) {
        const tuning = readTuning(item, instrument);
        if (tuning && !list.some(other => other.id === tuning.id) && list.length < MAX_CUSTOM_TUNINGS) {
            list.push(tuning);
        }
    }
    return list;
}

function readTuning(value: unknown, instrument: Instrument): CustomTuning | undefined {
    if (typeof value !== 'object' || value === null) return undefined;
    const { id, name, strings } = value as { id?: unknown; name?: unknown; strings?: unknown };
    if (typeof id !== 'string' || id === '' || typeof name !== 'string') return undefined;
    const trimmed = name.trim().slice(0, MAX_TUNING_NAME);
    if (trimmed === '' || !Array.isArray(strings) || strings.length !== STRING_COUNTS[instrument]) return undefined;
    if (!strings.every(note => typeof note === 'string' && !note.includes('-'))) return undefined;
    const pitches = parseTuning(strings.join('-'));
    if (!pitches?.every((note, i) => withinReach(instrument, i, note))) return undefined;
    return { id, name: trimmed, strings: pitches };
}

function withinReach(instrument: Instrument, index: number, note: NoteName): boolean {
    const midi = noteMidi(note);
    const { low, high } = stringReach(instrument, index);
    return midi !== undefined && midi >= low && midi <= high;
}
