import {
    SCALE_TYPES,
    notePitchClass,
    rootChoices,
    type Accidentals,
    type NoteName,
    type ScaleGroup
} from '@fretdex/fretkit';
import { modeScale } from '#lib/settings/key.ts';
import type { CurrentKey } from '#lib/settings/settings.ts';
import { cardPath, type ScaleCardRef } from '#lib/url/routes.ts';

/** The Scales list's groups, in order (SCL-1.1). */
export const SCALE_GROUPS: readonly { readonly id: ScaleGroup; readonly name: string }[] = [
    { id: 'major-and-minor', name: 'Major and minor' },
    { id: 'pentatonic-and-blues', name: 'Pentatonic and blues' },
    { id: 'modes', name: 'Modes' },
    { id: 'other', name: 'Other' }
];

/** What the Scales list shows on a root. */
export interface ScaleList {
    /** The root's pitch class, which the picker shows chosen. */
    readonly pitchClass: number;
    /** The current key's own scale, listed first, when the list is on the key's root (SCL-1.2). */
    readonly keyCard?: ScaleCardRef;
    readonly groups: readonly {
        readonly id: ScaleGroup;
        readonly name: string;
        readonly cards: readonly ScaleCardRef[];
    }[];
}

/**
 * The Scales list on a root (SCL-1.1, SCL-1.2): the query's root if it has one, else the current key's, else C
 * (CTX-2.8). Only the root's pitch class counts, as each scale opens on the spelling its picker would (THY-2.1,
 * THY-2.2), except the key's own scale, which keeps the key's spelling.
 */
export function scaleList(root: NoteName | undefined, key: CurrentKey | null, accidentals: Accidentals): ScaleList {
    const pitchClass = notePitchClass(root ?? key?.root ?? 'C');
    const onKey = key !== null && notePitchClass(key.root) === pitchClass;
    const keyType = onKey ? modeScale(key.mode) : undefined;
    const card = (type: (typeof SCALE_TYPES)[number]): ScaleCardRef => ({
        kind: 'scale',
        root: onKey && type === keyType ? key.root : rootChoices(pitchClass, type, accidentals).root,
        scale: type
    });
    return {
        pitchClass,
        ...(onKey && keyType ? { keyCard: card(keyType) } : {}),
        groups: SCALE_GROUPS.map(group => ({
            ...group,
            cards: SCALE_TYPES.filter(type => type.group === group.id).map(card)
        }))
    };
}

/**
 * The list's scales that are pinned, in the list's order, to show first under **Pinned** (PIN-3.1): matched by the
 * card's path, whatever the pin's options. They stay in their groups too, as the key's own scale does.
 */
export function pinnedCards(list: ScaleList, pinnedPaths: ReadonlySet<string>): ScaleCardRef[] {
    const cards = [...(list.keyCard ? [list.keyCard] : []), ...list.groups.flatMap(group => group.cards)];
    const seen = new Set<string>();
    return cards.filter(card => {
        const path = cardPath(card);
        if (!pinnedPaths.has(path) || seen.has(path)) return false;
        seen.add(path);
        return true;
    });
}
