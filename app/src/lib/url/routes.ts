import {
    noteLabel,
    notePitchName,
    noteSlug,
    parseNote,
    scaleType,
    type NoteName,
    type ScaleType
} from '@fretdex/fretkit';
import type { Labels, Settings } from '#lib/settings/settings.ts';
import { readOverride, writeOverride, type ContextOverride, type QueryParams } from './context';

/** A module's list, so far. */
export type ListPath = '/scales' | '/modes';

/** A screen a back control can fall back to: Home or a module's list. */
export type ScreenPath = '/' | ListPath;

/** A module or tool in Home's grid (APP-1.1), with its list's path once it's built. */
export interface ModuleEntry {
    readonly name: string;
    /** Absent for a module a later milestone builds. */
    readonly path?: ListPath;
}

/** The six modules (APP-1.1), in the grid's order. */
export const MODULES: readonly ModuleEntry[] = [
    { name: 'Chords' },
    { name: 'Scales', path: '/scales' },
    { name: 'Triads' },
    { name: 'Modes', path: '/modes' },
    { name: 'Keys' },
    { name: 'Progressions' }
];

/** The tools (APP-1.1): Identify in M02, the tuner and metronome after version 1. */
export const TOOLS: readonly ModuleEntry[] = [{ name: 'Identify' }, { name: 'Tuner' }, { name: 'Metronome' }];

/** What a card's path names (APP-3.1). */
export type Card =
    | { readonly kind: 'scale'; readonly root: NoteName; readonly scale: ScaleType }
    | { readonly kind: 'mode'; readonly root: NoteName; readonly mode: ScaleType };

export type CardKind = Card['kind'];

/** Each card's route, as SvelteKit names it. */
export const CARD_ROUTES: Readonly<Record<string, CardKind>> = {
    '/scales/[root]/[scale]': 'scale',
    '/modes/[root]/[mode]': 'mode'
};

/**
 * A root or note as a path writes it (THY-1.3, APP-3.4): a note without an octave, sharps as `s`, `#` or `♯` (so
 * `%23` reads), double sharps and flats too, the letter in either case. Any spelling is read, as THY-2.5 asks of a
 * link: `Fs`, `Gb`, `Ess`.
 */
export function readRoot(slug: string): NoteName | undefined {
    const note = parseNote(slug);
    return note !== undefined && notePitchName(note) === note ? note : undefined;
}

/** A scale card, or a mode's, since each mode has one card, under Modes (MODE-1.7): `/scales/G/dorian` is G Dorian. */
export function readScaleCard(root: string, scale: string): Card | undefined {
    const note = readRoot(root);
    const type = scaleType(scale);
    if (note === undefined || type === undefined) return undefined;
    return type.group === 'modes'
        ? { kind: 'mode', root: note, mode: type }
        : { kind: 'scale', root: note, scale: type };
}

export function readModeCard(root: string, mode: string): Card | undefined {
    const note = readRoot(root);
    const type = scaleType(mode);
    if (note === undefined || type?.group !== 'modes') return undefined;
    return { kind: 'mode', root: note, mode: type };
}

/** A card's path, as the app writes it (APP-3.4): `/scales/Fs/major`, `/modes/Fs/dorian`. */
export function cardPath(card: Card): string {
    switch (card.kind) {
        case 'scale':
            return `/scales/${noteSlug(card.root)}/${card.scale.id}`;
        case 'mode':
            return `/modes/${noteSlug(card.root)}/${card.mode.id}`;
    }
}

/** The list a card belongs to: where its back control goes when there's nothing to go back to (APP-1.3). */
export function cardModule(kind: CardKind): ListPath {
    switch (kind) {
        case 'scale':
            return '/scales';
        case 'mode':
            return '/modes';
    }
}

/** The list for a path the app can't read, from its first segment, for Not found's link (APP-3.5). */
export function moduleOfPath(pathname: string): ModuleEntry | undefined {
    const first = '/' + (pathname.split('/')[1] ?? '');
    return MODULES.find(module => module.path === first);
}

/** Mode names are proper nouns, so they keep their capital in a card's name: "G Dorian", "G harmonic minor". */
const PROPER = /^(Lydian|Ionian|Mixolydian|Dorian|Aeolian|Phrygian|Locrian)\b/u;

function lowerName(name: string): string {
    return PROPER.test(name) ? name : name.charAt(0).toLowerCase() + name.slice(1);
}

/** A card's name, as its heading and title show it (APP-3.6): "G major", "D Dorian". */
export function cardTitle(card: Card): string {
    switch (card.kind) {
        case 'scale':
            return `${noteLabel(card.root)} ${lowerName(card.scale.name)}`;
        case 'mode':
            return `${noteLabel(card.root)} ${card.mode.name}`;
    }
}

/** A page's `<title>` (APP-3.6): "D Dorian · Fretdex". */
export function pageTitle(name: string): string {
    return `${name} · Fretdex`;
}

/** How a card is shown, from its URL's query (APP-3.1). Absent options take their defaults. */
export interface ViewOptions {
    /** A CAGED position, 1–5 (SCL-3.1). */
    readonly pos?: number;
    /** A 3-notes-per-string pattern, 1–7 (SCL-3.3); never with `pos`. */
    readonly nps?: number;
    /** The labels setting for this card alone (CTX-2.4). */
    readonly labels?: Labels;
    /** The mode compared against, by id (MODE-2.1). */
    readonly compare?: string;
}

/** The options each card takes, in the order its URL writes them. */
const CARD_OPTIONS: Readonly<Record<CardKind, readonly (keyof ViewOptions)[]>> = {
    scale: ['pos', 'nps', 'labels'],
    mode: ['pos', 'nps', 'labels', 'compare']
};

const LABELS: readonly Labels[] = ['notes', 'intervals', 'degrees', 'none'];

/**
 * Reads a card's options from its query, ignoring any the card doesn't take or can't read: `pos` and `nps` are
 * whole numbers in range, and with both, `pos` wins.
 */
export function readViewOptions(kind: CardKind, params: QueryParams): ViewOptions {
    const takes = CARD_OPTIONS[kind];
    const whole = (name: 'pos' | 'nps', max: number) => {
        const text = params.get(name);
        if (!takes.includes(name) || text === null || !/^\d$/u.test(text)) return undefined;
        const value = Number(text);
        return value >= 1 && value <= max ? value : undefined;
    };
    const pos = whole('pos', 5);
    const nps = pos === undefined ? whole('nps', 7) : undefined;
    const labels = takes.includes('labels') ? LABELS.find(label => label === params.get('labels')) : undefined;
    const compareType = takes.includes('compare') ? scaleType(params.get('compare') ?? '') : undefined;
    const compare = compareType?.group === 'modes' ? compareType.id : undefined;
    return {
        ...(pos === undefined ? {} : { pos }),
        ...(nps === undefined ? {} : { nps }),
        ...(labels === undefined ? {} : { labels }),
        ...(compare === undefined ? {} : { compare })
    };
}

/** A query as the app writes it: the card's options in order, then the override (APP-3.3). Empty, or from `?`. */
export function writeQuery(kind: CardKind | undefined, options: ViewOptions, override: ContextOverride): string {
    const params = new URLSearchParams();
    for (const name of kind === undefined ? [] : CARD_OPTIONS[kind]) {
        const value = options[name];
        if (value !== undefined) params.set(name, String(value));
    }
    writeOverride(params, override);
    const query = params.toString();
    return query === '' ? '' : `?${query}`;
}

/**
 * A card's query with one option changed, or removed with `undefined`, written as the app writes it. Choosing a
 * position clears the 3-notes-per-string pattern and the other way round, as a card shows one or the other.
 */
export function withViewOption<K extends keyof ViewOptions>(
    kind: CardKind,
    params: QueryParams,
    settings: Settings,
    name: K,
    value: ViewOptions[K] | undefined
): string {
    const options: ViewOptions = { ...readViewOptions(kind, params), [name]: value };
    const { pos, nps, ...others } = options;
    // One of the two: the one just chosen, else the one already there.
    const position =
        name === 'nps' && nps !== undefined ? { nps } : pos !== undefined ? { pos } : nps !== undefined ? { nps } : {};
    // `writeQuery` leaves out an option that's undefined.
    return writeQuery(kind, { ...others, ...position }, readOverride(params, settings));
}

/**
 * A URL's query as the app would write it: what it can read, in order, and nothing else, so a bad or unknown
 * option falls back to its default and leaves the URL. Lists (no card) take only the override so far.
 */
export function canonicalQuery(kind: CardKind | undefined, params: QueryParams, settings: Settings): string {
    const options = kind === undefined ? {} : readViewOptions(kind, params);
    return writeQuery(kind, options, readOverride(params, settings));
}
