/**
 * Where a pin or group dragged on the home board would land (PIN-2.3), worked out from the boxes the board's
 * sections, tiles and groups take on screen, in the viewport's pixels.
 */

/** A box on screen, as `getBoundingClientRect` gives it. */
export interface Box {
    readonly left: number;
    readonly top: number;
    readonly right: number;
    readonly bottom: number;
}

/**
 * The place among a section's tiles, given in reading order, where a pin dropped at this point goes: before the
 * first tile on a later row, or before one on the point's row whose middle is right of it; after them all otherwise.
 */
export function tileIndex(tiles: readonly Box[], x: number, y: number): number {
    const index = tiles.findIndex(tile => y < tile.top || (y <= tile.bottom && x < (tile.left + tile.right) / 2));
    return index === -1 ? tiles.length : index;
}

/** The section, of ones given top to bottom, that a point at this height is in, or the nearest; -1 with none. */
export function sectionAt(sections: readonly Box[], y: number): number {
    let nearest = -1;
    let distance = Infinity;
    sections.forEach((section, index) => {
        const away = y < section.top ? section.top - y : y > section.bottom ? y - section.bottom : 0;
        if (away < distance) {
            nearest = index;
            distance = away;
        }
    });
    return nearest;
}

/** The place among the other groups, given top to bottom, where a group dropped at this height goes. */
export function groupIndex(groups: readonly Box[], y: number): number {
    const index = groups.findIndex(group => y < (group.top + group.bottom) / 2);
    return index === -1 ? groups.length : index;
}
