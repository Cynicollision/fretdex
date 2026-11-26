import {
    noteAlteration,
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

/** What a card's path names (APP-3.1): a scale card, or the Modes overview of a major key (MODE-1). */
export type Card =
    | { readonly kind: 'scale'; readonly root: NoteName; readonly scale: ScaleType }
    | { readonly kind: 'modes'; readonly root: NoteName };

export type CardKind = Card['kind'];

/** A scale card, the modes' included. */
export type ScaleCardRef = Extract<Card, { readonly kind: 'scale' }>;

/** Each card's route, as SvelteKit names it. */
export const CARD_ROUTES: Readonly<Record<string, CardKind>> = {
    '/scales/[root]/[scale]': 'scale',
    '/modes/[root]': 'modes'
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

/** A scale card, the modes' included (SCL-1.1): `/scales/G/dorian` is G Dorian. */
export function readScaleCard(root: string, scale: string): ScaleCardRef | undefined {
    const note = readRoot(root);
    const type = scaleType(scale);
    if (note === undefined || type === undefined) return undefined;
    return { kind: 'scale', root: note, scale: type };
}

/**
 * The Modes overview of a major key (MODE-1.10): `/modes/Db` shows the modes of D♭ major. A key with a double sharp
 * or flat isn't read, as some of its modes' roots would need a triple one, which no card can open.
 */
export function readModesCard(root: string): Card | undefined {
    const note = readRoot(root);
    return note === undefined || Math.abs(noteAlteration(note)) > 1 ? undefined : { kind: 'modes', root: note };
}

/** A card's path, as the app writes it (APP-3.4): `/scales/Fs/major`, `/scales/Fs/dorian`, `/modes/Fs`. */
export function cardPath(card: Card): string {
    switch (card.kind) {
        case 'scale':
            return `/scales/${noteSlug(card.root)}/${card.scale.id}`;
        case 'modes':
            return `/modes/${noteSlug(card.root)}`;
    }
}

/**
 * Where a card's back control goes when there's nothing to go back to (APP-1.3): a card's module list, or Home for
 * the Modes overview, which is its module's screen on another root.
 */
export function cardModule(kind: CardKind): ScreenPath {
    switch (kind) {
        case 'scale':
            return '/scales';
        case 'modes':
            return '/';
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

/** A card's name, as its heading and title show it (APP-3.6): "G major", "D Dorian", "Modes of C major". */
export function cardTitle(card: Card): string {
    switch (card.kind) {
        case 'scale':
            return `${noteLabel(card.root)} ${lowerName(card.scale.name)}`;
        case 'modes':
            return `Modes of ${noteLabel(card.root)} major`;
    }
}

/** A page's `<title>` (APP-3.6): "D Dorian · Fretdex". */
export function pageTitle(name: string): string {
    return `${name} · Fretdex`;
}

/** How a card is shown, from its URL's query (APP-3.1). Absent options take their defaults. */
export interface ViewOptions {
    /** A CAGED position or pentatonic box, 1–5 (SCL-3.1, SCL-3.3). */
    readonly pos?: number;
    /** A 3-notes-per-string pattern, 1–7, by the degree it starts on (SCL-3.2); never with `pos`. */
    readonly nps?: number;
    /** A bass box, 1–4 (SCL-4.1); never with `pos` or `nps`. */
    readonly box?: number;
    /** The labels setting for this card alone (CTX-2.4). */
    readonly labels?: Labels;
    /** The degrees highlighted, the rest dimmed (SCL-2.3): their numbers from the root in order, `135`. */
    readonly deg?: string;
}

/** The options each card takes, in the order its URL writes them. */
const CARD_OPTIONS: Readonly<Record<CardKind, readonly (keyof ViewOptions)[]>> = {
    scale: ['pos', 'nps', 'box', 'deg', 'labels'],
    modes: ['labels']
};

/** The options that choose a position, of which a card shows one at most, in the order the first present wins. */
const POSITION_OPTIONS = ['pos', 'nps', 'box'] as const;

const LABELS: readonly Labels[] = ['notes', 'intervals', 'degrees', 'none'];

/**
 * Reads a card's options from its query, ignoring any the card doesn't take or can't read: `pos`, `nps` and `box`
 * are whole numbers in range, and with more than one, the first of them wins.
 */
export function readViewOptions(kind: CardKind, params: QueryParams): ViewOptions {
    const takes = CARD_OPTIONS[kind];
    const whole = (name: (typeof POSITION_OPTIONS)[number], max: number) => {
        const text = params.get(name);
        if (!takes.includes(name) || text === null || !/^\d$/u.test(text)) return undefined;
        const value = Number(text);
        return value >= 1 && value <= max ? value : undefined;
    };
    const pos = whole('pos', 5);
    const nps = pos === undefined ? whole('nps', 7) : undefined;
    const box = pos === undefined && nps === undefined ? whole('box', 4) : undefined;
    const labels = takes.includes('labels') ? LABELS.find(label => label === params.get('labels')) : undefined;
    const deg = takes.includes('deg') ? readDegrees(params.get('deg')) : undefined;
    return {
        ...(pos === undefined ? {} : { pos }),
        ...(nps === undefined ? {} : { nps }),
        ...(box === undefined ? {} : { box }),
        ...(deg === undefined ? {} : { deg }),
        ...(labels === undefined ? {} : { labels })
    };
}

/**
 * Highlighted degrees as a URL writes them (SCL-2.3): each a digit from 1 to 8, at most once, in order. `undefined`
 * for anything else, so a bad `deg` leaves the URL. A card ignores degrees its scale doesn't have.
 */
function readDegrees(text: string | null): string | undefined {
    if (text === null || !/^[1-8]{1,8}$/u.test(text)) return undefined;
    const digits = [...text];
    return digits.every((digit, i) => i === 0 || digit > (digits[i - 1] ?? '')) ? text : undefined;
}

/** Degrees chosen on a card as `deg` writes them, or `undefined` for none (SCL-2.3). */
export function writeDegrees(degrees: Iterable<number>): string | undefined {
    const text = [...new Set(degrees)]
        .filter(degree => Number.isInteger(degree) && degree >= 1 && degree <= 8)
        .sort((a, b) => a - b)
        .join('');
    return text === '' ? undefined : text;
}

/** Degrees as `deg` writes them, read back into numbers. */
export function degreesOf(deg: string | undefined): number[] {
    return deg === undefined ? [] : [...deg].map(Number);
}

/** Each list's route, as SvelteKit names it, for the lists that take a filter. */
export const LIST_ROUTES: Readonly<Record<string, ListPath>> = {
    '/scales': '/scales'
};

/**
 * The root a Scales list shows its scales on, from its query (`/scales?root=Eb`, SCL-1.1): a note without an
 * octave, read as `readRoot` reads a path's. Absent, the list takes the current key's root (SCL-1.2).
 */
export function readListRoot(params: QueryParams): NoteName | undefined {
    const text = params.get('root');
    return text === null ? undefined : readRoot(text);
}

/** A list's query as the app writes it: its filter, then the override (APP-3.1, APP-3.3). */
export function writeListQuery(list: ListPath, root: NoteName | undefined, override: ContextOverride): string {
    const params = new URLSearchParams();
    if (list === '/scales' && root !== undefined) params.set('root', noteSlug(root));
    writeOverride(params, override);
    const query = params.toString();
    return query === '' ? '' : `?${query}`;
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
 * position, pattern or bass box clears the others, as a card shows one at most.
 */
export function withViewOption<K extends keyof ViewOptions>(
    kind: CardKind,
    params: QueryParams,
    settings: Settings,
    name: K,
    value: ViewOptions[K] | undefined
): string {
    const options: ViewOptions = { ...readViewOptions(kind, params), [name]: value };
    const { pos, nps, box, ...others } = options;
    const positions = { pos, nps, box };
    // One at most: the one just chosen, else the first already there.
    const chosen =
        POSITION_OPTIONS.find(option => option === name && value !== undefined) ??
        POSITION_OPTIONS.find(option => positions[option] !== undefined);
    const position = chosen === undefined ? {} : { [chosen]: positions[chosen] };
    // `writeQuery` leaves out an option that's undefined.
    return writeQuery(kind, { ...others, ...position }, readOverride(params, settings));
}

/**
 * A URL's query as the app would write it: what it can read, in order, and nothing else, so a bad or unknown
 * option falls back to its default and leaves the URL. A list takes its filter (`list`), and any other screen only
 * the override.
 */
export function canonicalQuery(
    kind: CardKind | undefined,
    params: QueryParams,
    settings: Settings,
    list?: ListPath
): string {
    if (kind === undefined && list !== undefined) {
        return writeListQuery(list, readListRoot(params), readOverride(params, settings));
    }
    const options = kind === undefined ? {} : readViewOptions(kind, params);
    return writeQuery(kind, options, readOverride(params, settings));
}
