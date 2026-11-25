import { noteSlug } from '@fretdex/fretkit';
import { resolve } from '$app/paths';
import type { ResolvedPathname } from '$app/types';
import type { Card } from './routes';

/** A link to a card: its path (`cardPath`), resolved against its route. */
export function cardHref(card: Card): ResolvedPathname {
    switch (card.kind) {
        case 'scale':
            return resolve('/scales/[root]/[scale]', { root: noteSlug(card.root), scale: card.scale.id });
        case 'mode':
            return resolve('/modes/[root]/[mode]', { root: noteSlug(card.root), mode: card.mode.id });
    }
}
