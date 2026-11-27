import {
    noteLabel,
    noteSlug,
    scalePositions,
    spellScale,
    type FretRange,
    type FretboardCell,
    type NoteName,
    type SpelledScale
} from '@fretdex/fretkit';
import { chosenPosition, positionTitle } from '#lib/scales/positions.ts';
import { DEFAULT_SETTINGS, builtInTuning, type Settings } from '#lib/settings/settings.ts';
import { tuningName, type CustomTunings } from '#lib/settings/tunings.ts';
import type { RecordFormat } from '#lib/storage/record.ts';
import { overrides, readOverride, viewContext, type ContextOverride, type QueryParams } from '#lib/url/context.ts';
import {
    cardPath,
    cardTitle,
    readCardPath,
    readListRoot,
    readViewOptions,
    writeListQuery,
    writeQuery,
    type Card,
    type ListPath
} from '#lib/url/routes.ts';

/**
 * Pins (PIN-1, PIN-2): each a view's URL and a label, kept in the board's order. A pin's URL is a path and query as
 * the app writes them (`/scales/G/dorian?pos=2&inst=bass`), so it opens exactly as pinned (APP-3.1).
 */
export interface Pin {
    /** Stays the same through renames and moves. */
    readonly id: string;
    readonly url: string;
    readonly label: string;
}

/** The home board: the pins in the user's order. */
export interface PinBoard {
    readonly pins: readonly Pin[];
}

export const NO_PINS: PinBoard = { pins: [] };

/** The longest label a pin can have. */
export const MAX_PIN_LABEL = 60;

/** The longest URL a pin keeps; the app's own are far shorter. */
const MAX_PIN_URL = 2000;

/**
 * Reads a stored board, keeping each pin with an id, a label and a URL on this site, and dropping the rest. A pin
 * whose URL this version can't read is kept, as a newer version may have written it; its tile shows its label.
 */
export function readPinBoard(data: unknown): PinBoard {
    const stored = typeof data === 'object' && data !== null ? (data as { pins?: unknown }).pins : undefined;
    if (!Array.isArray(stored)) return NO_PINS;
    const pins: Pin[] = [];
    for (const item of stored as unknown[]) {
        const pin = readPin(item);
        if (pin && !pins.some(other => other.id === pin.id)) pins.push(pin);
    }
    return { pins };
}

/** The pins record (PIN-6.1). */
export const PINS_FORMAT: RecordFormat<PinBoard> = { key: 'pins', version: 1, read: readPinBoard };

function readPin(value: unknown): Pin | undefined {
    if (typeof value !== 'object' || value === null) return undefined;
    const { id, url, label } = value as { id?: unknown; url?: unknown; label?: unknown };
    if (typeof id !== 'string' || id === '' || typeof url !== 'string' || typeof label !== 'string') return undefined;
    if (!isOwnPath(url)) return undefined;
    const trimmed = cleanLabel(label);
    return trimmed === '' ? undefined : { id, url, label: trimmed };
}

const ORIGIN = 'https://fretdex.invalid';

/**
 * Whether a URL is a path on this site: from `/`, and with no backslash or control character, which a browser reads
 * past (`/\evil.example` and `/<tab>/evil.example` open another site), so a stored or imported pin can't link away.
 */
function isOwnPath(url: string): boolean {
    // eslint-disable-next-line no-control-regex -- control characters are what it looks for
    if (url.length > MAX_PIN_URL || !url.startsWith('/') || /[\u0000-\u001f\u007f\\]/u.test(url)) return false;
    try {
        return new URL(url, ORIGIN).origin === ORIGIN;
    } catch {
        return false;
    }
}

/** A label as a pin keeps it: trimmed, and cut to `MAX_PIN_LABEL`. */
export function cleanLabel(label: string): string {
    return label.trim().slice(0, MAX_PIN_LABEL).trim();
}

/** A new id for a pin, unique among the ones given. */
export function newPinId(taken: readonly Pin[]): string {
    let id: string;
    do id = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
    while (taken.some(pin => pin.id === id));
    return id;
}

/** A pin's path, without its query: what PIN-3.1 matches a list's items by. */
export function pinPath(url: string): string {
    const query = url.indexOf('?');
    return query === -1 ? url : url.slice(0, query);
}

/**
 * What a pin is of, whatever its options: a card's path, or a list's path and filter (`/scales?root=Eb`). A card or
 * list with a pin of the same identity shows it's pinned (PIN-1.2).
 */
export function pinIdentity(url: string): string {
    const view = readPinnedView(url);
    if (view?.kind !== 'list') return pinPath(url);
    const root = readListRoot(view.params);
    return root === undefined ? view.list : `${view.list}?root=${noteSlug(root)}`;
}

/** What a screen pins: a card, or a list with its filter (PIN-1.1). */
export type Pinnable =
    | { readonly kind: 'card'; readonly card: Card }
    | { readonly kind: 'list'; readonly list: ListPath; readonly root: NoteName };

/** What pinning a view saves: its URL, written as the app writes it, and its first label. */
export interface PinTarget {
    readonly url: string;
    readonly label: string;
}

/**
 * The pin a view makes (PIN-1.1, PIN-1.4): its URL with its options, and its instrument, tuning and capo. Those are
 * the URL's override where it has one, and otherwise the settings' where they aren't the defaults (guitar in
 * Standard, no capo), so the pin opens as it was pinned on a device whose settings differ.
 */
export function pinTarget(view: Pinnable, params: QueryParams, settings: Settings): PinTarget {
    const override = pinOverride(params, settings);
    if (view.kind === 'list') {
        return { url: view.list + writeListQuery(view.list, view.root, override), label: 'Scales' };
    }
    const options = readViewOptions(view.card.kind, params);
    return { url: cardPath(view.card) + writeQuery(view.card.kind, options, override), label: cardTitle(view.card) };
}

function pinOverride(params: QueryParams, settings: Settings): ContextOverride {
    const override = readOverride(params, settings);
    const view = viewContext(settings, override);
    const standard =
        view.instrument === DEFAULT_SETTINGS.instrument &&
        builtInTuning(view.instrument, view.tuning)?.id === 'standard';
    return {
        ...(override.instrument !== undefined || !standard ? { instrument: view.instrument, tuning: view.tuning } : {}),
        ...(override.capo !== undefined || view.capo !== DEFAULT_SETTINGS.capo ? { capo: view.capo } : {})
    };
}

/** A pin's view, read from its URL, or `undefined` for one this version can't read. */
export type PinnedView =
    | { readonly kind: 'card'; readonly card: Card; readonly params: URLSearchParams }
    | { readonly kind: 'list'; readonly list: ListPath; readonly params: URLSearchParams };

export function readPinnedView(url: string): PinnedView | undefined {
    const query = url.indexOf('?');
    const params = new URLSearchParams(query === -1 ? '' : url.slice(query + 1));
    const path = pinPath(url);
    if (path === '/scales') return { kind: 'list', list: '/scales', params };
    const card = readCardPath(path);
    return card === undefined ? undefined : { kind: 'card', card, params };
}

/** A tile's mini fretboard (DIAG-5.1): the pinned position's frets and notes, else an octave of the neck. */
export interface TileDiagram {
    readonly tuning: readonly NoteName[];
    readonly set: SpelledScale;
    readonly range: FretRange;
    readonly capo: number;
    /** The position's notes, drawn in place of every note of the scale in the range. */
    readonly cells?: readonly FretboardCell[];
    readonly title: string;
}

/** What a pin's tile shows under its label (PIN-2.2, PIN-2.6). */
export interface PinTile {
    /** What it shows: the position, or a list's filter. */
    readonly detail?: string;
    /** The instrument, tuning and capo, when they aren't what the settings would show. */
    readonly context?: string;
    readonly diagram?: TileDiagram;
}

/** The notes an octave of the neck spans, from the capo or the nut. */
const OCTAVE = 12;

/**
 * A pin's tile, drawn from its URL for the current settings (PIN-2.2): a scale card's mini fretboard and its
 * position, a list's filter as text (PIN-2.6), and nothing more for a URL this version can't read.
 */
export function pinTile(url: string, settings: Settings, saved: CustomTunings): PinTile {
    const view = readPinnedView(url);
    if (view === undefined) return {};
    const override = readOverride(view.params, settings);
    const context = viewContext(settings, override);
    const contextText = overrides(settings, override)
        ? [
              context.instrument === 'guitar' ? 'Guitar' : 'Bass',
              tuningName(context.instrument, context.tuning, saved),
              ...(context.capo > 0 ? [`Capo ${String(context.capo)}`] : [])
          ].join(' · ')
        : undefined;
    const withContext = contextText === undefined ? {} : { context: contextText };

    if (view.kind === 'list') {
        const root = readListRoot(view.params);
        return { ...(root === undefined ? {} : { detail: `on ${noteLabel(root)}` }), ...withContext };
    }
    if (view.card.kind !== 'scale') return withContext;

    const set = spellScale(view.card.root, view.card.scale);
    const options = readViewOptions(view.card.kind, view.params);
    const groups = scalePositions(context.tuning, set, context.instrument, context.capo);
    const chosen = chosenPosition(groups, options);
    const detail = chosen ? positionTitle(chosen.position, set, context.tuning) : 'Full neck';
    const title = `${cardTitle(view.card)}, ${detail}`;
    const diagram: TileDiagram = chosen
        ? {
              tuning: context.tuning,
              set,
              range: { from: chosen.position.from, to: chosen.position.to },
              capo: context.capo,
              cells: chosen.position.cells,
              title
          }
        : {
              tuning: context.tuning,
              set,
              range: { from: context.capo, to: context.capo + OCTAVE },
              capo: context.capo,
              title
          };
    return { detail, ...withContext, diagram };
}
