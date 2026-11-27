import { describe, expect, it } from 'vitest';
import { groupIndex, sectionAt, tileIndex, type Box } from './drag';

const at = (left: number, top: number, size = 100): Box => ({ left, top, right: left + size, bottom: top + size });

describe('dropping on the board', () => {
    // Two rows of two tiles, then one: A B / C D / E.
    const tiles = [at(0, 0), at(110, 0), at(0, 110), at(110, 110), at(0, 220)];

    it('PIN-2.3 drops a pin before the tile whose middle is right of it on its row', () => {
        expect(tileIndex(tiles, 20, 50)).toBe(0);
        expect(tileIndex(tiles, 80, 50)).toBe(1);
        expect(tileIndex(tiles, 190, 50)).toBe(2);
        expect(tileIndex(tiles, 130, 150)).toBe(3);
    });

    it('PIN-2.3 drops a pin between rows before the next row, and past the last tile after them all', () => {
        expect(tileIndex(tiles, 190, 105)).toBe(2);
        expect(tileIndex(tiles, 190, 260)).toBe(5);
        expect(tileIndex([], 0, 0)).toBe(0);
    });

    it('PIN-2.3 finds the section a pin is over, or the nearest', () => {
        const sections = [at(0, 0), at(0, 120)];
        expect(sectionAt(sections, 50)).toBe(0);
        expect(sectionAt(sections, 150)).toBe(1);
        expect(sectionAt(sections, 105)).toBe(0);
        expect(sectionAt(sections, 116)).toBe(1);
        expect(sectionAt(sections, -40)).toBe(0);
        expect(sectionAt(sections, 900)).toBe(1);
        expect(sectionAt([], 0)).toBe(-1);
    });

    it('PIN-2.3 drops a group before the first whose middle is below it', () => {
        const groups = [at(0, 0), at(0, 120)];
        expect(groupIndex(groups, 20)).toBe(0);
        expect(groupIndex(groups, 60)).toBe(1);
        expect(groupIndex(groups, 300)).toBe(2);
    });
});
