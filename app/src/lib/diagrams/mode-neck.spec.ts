import { describe, expect, it } from 'vitest';
import { MARK, MODE_NECK, layModeNeck, modeStringY } from './mode-neck';

/** How far a ringed dot reaches from its centre: the ring's radius and half its stroke. */
const RINGED = MODE_NECK.dot / 2 + MARK.gap + MARK.stroke / 2;

describe('layModeNeck', () => {
    it('MODE-1.13 leaves room for a ringed dot at the top string and beside a dot on the next string', () => {
        const layout = layModeNeck({ from: 5, to: 10 }, 343, 6);
        expect(modeStringY(layout, 1) - RINGED).toBeGreaterThanOrEqual(0);
        expect(MODE_NECK.gap).toBeGreaterThanOrEqual(RINGED + MODE_NECK.dot / 2);
    });

    it('DIAG-1.4 gives the open strings their own column only from the nut', () => {
        expect(layModeNeck({ from: 0, to: 5 }, 343, 6).nut).toBeDefined();
        expect(layModeNeck({ from: 3, to: 8 }, 343, 6).nut).toBeUndefined();
        expect(layModeNeck({ from: 3, to: 8 }, 343, 6).spaces.map(space => space.fret)).toEqual([3, 4, 5, 6, 7, 8]);
    });
});
