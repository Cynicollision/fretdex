import {
    MAX_CAPO,
    MAX_FRET,
    TUNINGS,
    noteMidi,
    notePitchName,
    parseNote,
    parseTuning,
    type Accidentals,
    type FretRange,
    type Instrument,
    type NoteName,
    type Tuning
} from '@fretdex/fretkit';
import type { RecordFormat } from '#lib/storage/record.ts';

/** The current key's modes: the seven modes of the major scale (CTX-1.1), major and minor first (CTX-2.6). */
export const KEY_MODES = [
    { id: 'major', name: 'major', scale: 'major' },
    { id: 'minor', name: 'minor', scale: 'natural-minor' },
    { id: 'dorian', name: 'Dorian', scale: 'dorian' },
    { id: 'phrygian', name: 'Phrygian', scale: 'phrygian' },
    { id: 'lydian', name: 'Lydian', scale: 'lydian' },
    { id: 'mixolydian', name: 'Mixolydian', scale: 'mixolydian' },
    { id: 'locrian', name: 'Locrian', scale: 'locrian' }
] as const;

export type KeyMode = (typeof KEY_MODES)[number]['id'];

/** The key the user is playing in (CTX-1.1): a root without an octave, and a mode. */
export interface CurrentKey {
    readonly root: NoteName;
    readonly mode: KeyMode;
}

export type Handedness = 'right' | 'left';
export type Labels = 'notes' | 'intervals' | 'degrees' | 'none';
export type Theme = 'dark' | 'light' | 'contrast';

/** Every setting of CTX-1, as stored on the device (CTX-2.5). */
export interface Settings {
    readonly key: CurrentKey | null;
    readonly instrument: Instrument;
    /** The tuning's pitches, lowest string first, as `fretkit` takes them. */
    readonly tuning: readonly NoteName[];
    readonly handedness: Handedness;
    readonly labels: Labels;
    readonly accidentals: Accidentals;
    readonly fretRange: FretRange;
    readonly theme: Theme;
    /** The capo's fret, 0 for none. */
    readonly capo: number;
    readonly keepAwake: boolean;
    /** Beats per minute. */
    readonly tempo: number;
    /** The master volume, from 0 to 100 (AUD-1.2). */
    readonly volume: number;
    /** Silences every sound, keeping the volume (AUD-1.2). */
    readonly muted: boolean;
}

/** The strings v1 offers on each instrument (THY-3.2). */
export const STRING_COUNTS: Readonly<Record<Instrument, number>> = { guitar: 6, bass: 4 };

export const MIN_TEMPO = 30;
export const MAX_TEMPO = 250;

function standard(instrument: Instrument): Tuning {
    const tuning = TUNINGS[instrument][0];
    if (tuning === undefined) throw new Error(`No tunings for ${instrument}`);
    return tuning;
}

/** CTX-1's defaults. */
export const DEFAULT_SETTINGS: Settings = {
    key: null,
    instrument: 'guitar',
    tuning: standard('guitar').strings,
    handedness: 'right',
    labels: 'intervals',
    accidentals: 'auto',
    fretRange: { from: 0, to: 15 },
    theme: 'dark',
    capo: 0,
    keepAwake: true,
    tempo: 100,
    volume: 80,
    muted: false
};

/**
 * Reads stored settings, keeping each one that's valid and defaulting the rest, so a damaged or partly understood
 * record never stops the app.
 */
export function readSettings(data: unknown): Settings {
    const stored = (typeof data === 'object' && data !== null ? data : {}) as Partial<Record<keyof Settings, unknown>>;
    const d = DEFAULT_SETTINGS;
    const instrument = oneOf(stored.instrument, ['guitar', 'bass'] as const, d.instrument);
    return {
        key: readKey(stored.key),
        instrument,
        tuning: readTuning(stored.tuning, instrument) ?? standard(instrument).strings,
        handedness: oneOf(stored.handedness, ['right', 'left'] as const, d.handedness),
        labels: oneOf(stored.labels, ['notes', 'intervals', 'degrees', 'none'] as const, d.labels),
        accidentals: oneOf(stored.accidentals, ['auto', 'sharps', 'flats'] as const, d.accidentals),
        fretRange: readFretRange(stored.fretRange) ?? d.fretRange,
        theme: oneOf(stored.theme, ['dark', 'light', 'contrast'] as const, d.theme),
        capo: wholeIn(stored.capo, 0, MAX_CAPO) ?? d.capo,
        keepAwake: typeof stored.keepAwake === 'boolean' ? stored.keepAwake : d.keepAwake,
        tempo: wholeIn(stored.tempo, MIN_TEMPO, MAX_TEMPO) ?? d.tempo,
        volume: wholeIn(stored.volume, 0, 100) ?? d.volume,
        muted: typeof stored.muted === 'boolean' ? stored.muted : d.muted
    };
}

/** The settings record (PIN-6.1). */
export const SETTINGS_FORMAT: RecordFormat<Settings> = { key: 'settings', version: 1, read: readSettings };

/**
 * Switches instrument, taking the tuning of the same name where both instruments have it (Standard, Drop D,
 * Half-step down) and Standard otherwise (CTX-2.1).
 */
export function switchInstrument(settings: Settings, instrument: Instrument): Settings {
    if (instrument === settings.instrument) return settings;
    const name = builtInTuning(settings.instrument, settings.tuning)?.id;
    const tuning = TUNINGS[instrument].find(candidate => candidate.id === name) ?? standard(instrument);
    return { ...settings, instrument, tuning: tuning.strings };
}

/** The built-in tuning with these pitches, however they're spelled (D♯2 is E♭2), if there is one. */
export function builtInTuning(instrument: Instrument, strings: readonly NoteName[]): Tuning | undefined {
    return TUNINGS[instrument].find(tuning => sameTuning(tuning.strings, strings));
}

/** Whether two tunings sound the same pitches on every string, however they're spelled. */
export function sameTuning(a: readonly NoteName[], b: readonly NoteName[]): boolean {
    return a.length === b.length && a.every((note, i) => b[i] !== undefined && noteMidi(note) === noteMidi(b[i]));
}

function readKey(value: unknown): CurrentKey | null {
    if (typeof value !== 'object' || value === null) return null;
    const { root, mode } = value as { root?: unknown; mode?: unknown };
    const note = typeof root === 'string' ? parseNote(root) : undefined;
    const keyMode = KEY_MODES.find(candidate => candidate.id === mode);
    if (note === undefined || notePitchName(note) !== note || keyMode === undefined) return null;
    return { root: note, mode: keyMode.id };
}

function readTuning(value: unknown, instrument: Instrument): NoteName[] | undefined {
    if (!Array.isArray(value) || value.length !== STRING_COUNTS[instrument]) return undefined;
    if (!value.every(note => typeof note === 'string' && !note.includes('-'))) return undefined;
    return parseTuning(value.join('-'));
}

function readFretRange(value: unknown): FretRange | undefined {
    if (typeof value !== 'object' || value === null) return undefined;
    const { from, to } = value as { from?: unknown; to?: unknown };
    const first = wholeIn(from, 0, MAX_FRET - 1);
    const last = wholeIn(to, 1, MAX_FRET);
    return first !== undefined && last !== undefined && first < last ? { from: first, to: last } : undefined;
}

function oneOf<T extends string>(value: unknown, options: readonly T[], fallback: T): T {
    return options.find(option => option === value) ?? fallback;
}

function wholeIn(value: unknown, min: number, max: number): number | undefined {
    return typeof value === 'number' && Number.isInteger(value) && value >= min && value <= max ? value : undefined;
}
