import { error, redirect } from '@sveltejs/kit';
import { cardPath, type Card } from './routes';

/**
 * A card route's load: Not found for a path the app can't read (APP-3.5), and otherwise the card, after rewriting
 * the path the way the app writes it (`%23` and `#` to `s`), keeping its query.
 * SvelteKit's redirect replaces the history entry, so back never returns to the old spelling.
 */
export function cardLoad<C extends Card>(card: C | undefined, url: URL): { card: C } {
    if (card === undefined) error(404, 'Not found');
    const path = cardPath(card);
    if (path !== url.pathname) redirect(308, path + url.search);
    return { card };
}
