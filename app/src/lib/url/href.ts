import { noteSlug } from '@fretdex/fretkit';
import { resolve } from '$app/paths';
import type { ResolvedPathname } from '$app/types';
import type { ContextOverride } from './context';
import { writeQuery, type Card } from './routes';

/** A link's query: none, or `?` and its options, which `resolve` keeps after the route it fills in. */
type Query = '' | `?${string}`;

/** A link to a card: its path (`cardPath`), resolved against its route, and any query. */
export function cardHref(card: Card, query: Query = ''): ResolvedPathname {
    switch (card.kind) {
        case 'scale':
            return resolve(`/scales/[root]/[scale]${query}`, { root: noteSlug(card.root), scale: card.scale.id });
        case 'modes':
            return resolve(`/modes/[root]${query}`, { root: noteSlug(card.root) });
    }
}

/**
 * A cross-link to a card from another view, keeping that view's instrument, tuning and capo override, so a bass view
 * links to bass views (APP-1.5).
 */
export function cardLink(card: Card, override: ContextOverride): ResolvedPathname {
    const query = writeQuery(card.kind, {}, override);
    return cardHref(card, query === '' ? '' : `?${query.slice(1)}`);
}
