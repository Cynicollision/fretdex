import { goto } from '$app/navigation';
import type { Settings } from '#lib/settings/settings.ts';
import { OVERRIDE_PARAMS } from './context';
import { withViewOption, type CardKind, type ViewOptions } from './routes';

/** The parts of a URL these read; `page.url` is a read-only URL. */
type ViewUrl = Pick<URL, 'pathname' | 'search' | 'hash'>;

/**
 * Shows the same view with a different query, replacing the current history entry rather than adding one, so back
 * leaves the card instead of stepping through its options (APP-3.2). The page keeps its scroll and focus.
 */
export function replaceQuery(url: ViewUrl, query: string): Promise<void> {
    const next = url.pathname + query + url.hash;
    if (next === url.pathname + url.search + url.hash) return Promise.resolve();
    // The page's own path, already resolved, with a new query.
    // eslint-disable-next-line svelte/no-navigation-without-resolve -- see above
    return goto(next, { replace: true, reset: false });
}

/**
 * Changes one of a card's options (`pos`, `labels`), or removes it with `undefined`, in place (APP-3.2), writing the
 * query as the app writes it (`withViewOption`).
 */
export function setViewOption<K extends keyof ViewOptions>(
    url: ViewUrl,
    kind: CardKind,
    settings: Settings,
    name: K,
    value: ViewOptions[K] | undefined
): Promise<void> {
    return replaceQuery(url, withViewOption(kind, new URLSearchParams(url.search), settings, name, value));
}

/** Drops a URL's instrument, tuning and capo override, so the view follows the settings again (APP-2.3). */
export function clearOverride(url: ViewUrl): Promise<void> {
    const params = new URLSearchParams(url.search);
    for (const name of OVERRIDE_PARAMS) params.delete(name);
    const query = params.toString();
    return replaceQuery(url, query === '' ? '' : `?${query}`);
}

/**
 * Goes back where the user came from in the app (APP-1.3): the browser's previous entry when it's one of the app's
 * pages, and otherwise (a card opened from a link, a shortcut or a fresh launch) the fallback, usually the card's
 * module list. Gives whether it went back, so a link can follow its own `href` when it didn't.
 */
export function goBack(): boolean {
    if (!canGoBack()) return false;
    history.back();
    return true;
}

/**
 * Whether the previous history entry is one of the app's. The Navigation API lists only this origin's entries;
 * a browser without it falls back to whether there's any history at all.
 */
function canGoBack(): boolean {
    const navigation = (window as { navigation?: { canGoBack?: boolean } }).navigation;
    if (typeof navigation?.canGoBack === 'boolean') return navigation.canGoBack;
    return history.length > 1;
}
