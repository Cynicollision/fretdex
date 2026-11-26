import { describe, expect, it } from 'vitest';
import { cardTitle } from '#lib/url/routes.ts';
import { pinnedCards, scaleList } from './list';

const titles = (list: ReturnType<typeof scaleList>) => list.groups.flatMap(group => group.cards.map(cardTitle));

describe('scaleList', () => {
    it('SCL-1.1 lists every scale in four groups, the modes brightest first', () => {
        const list = scaleList(undefined, null, 'auto');
        expect(list.groups.map(group => group.name)).toEqual([
            'Major and minor',
            'Pentatonic and blues',
            'Modes',
            'Other'
        ]);
        expect(list.groups[2]?.cards.map(cardTitle)).toEqual([
            'C Lydian',
            'C Ionian',
            'C Mixolydian',
            'C Dorian',
            'C Aeolian',
            'C Phrygian',
            'C Locrian'
        ]);
        expect(titles(list)).toHaveLength(21);
        expect(list.keyCard).toBeUndefined();
    });

    it('SCL-1.1 opens each scale on the spelling its picker would', () => {
        const list = scaleList('C#', null, 'auto');
        const titled = titles(list);
        expect(titled).toContain('D♭ major');
        expect(titled).toContain('C♯ natural minor');
        expect(titled).toContain('C♯ Dorian');
        expect(titles(scaleList('Db', null, 'sharps'))[0]).toBe('C♯ major');
    });

    it("SCL-1.2 opens on the current key's root, with the key's own scale first, spelled as the key is", () => {
        const list = scaleList(undefined, { root: 'C#', mode: 'major' }, 'auto');
        expect(list.pitchClass).toBe(1);
        expect(list.keyCard && cardTitle(list.keyCard)).toBe('C♯ major');
        expect(titles(list)).toContain('C♯ major');
        expect(scaleList(undefined, { root: 'D', mode: 'dorian' }, 'auto').keyCard?.scale.id).toBe('dorian');
    });

    it("SCL-1.2 has no key's scale first on another root", () => {
        expect(scaleList('E', { root: 'D', mode: 'major' }, 'auto').keyCard).toBeUndefined();
    });
});

describe('pinnedCards', () => {
    it("PIN-3.1 lists the root's pinned scales first, matched by path, in the list's order", () => {
        const list = scaleList('D', { root: 'D', mode: 'dorian' }, 'auto');
        const pinned = pinnedCards(list, new Set(['/scales/D/major', '/scales/D/dorian', '/scales/E/major']));

        expect(pinned.map(cardTitle)).toEqual(['D Dorian', 'D major']);
    });
});
