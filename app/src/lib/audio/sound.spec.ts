import { afterEach, describe, expect, it, vi } from 'vitest';
import { playFret, playKey, sound } from './sound';

describe('sound', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("AUD-4.1 and AUD-7.1 play a tapped fret in the instrument's voice, on its string's channel", () => {
        const play = vi.spyOn(sound, 'play').mockImplementation(() => {});

        playFret({ string: 6, fret: 3, midi: 43, note: 'G2' }, 'guitar');
        playFret({ string: 4, fret: 0, midi: 28, note: 'E1' }, 'bass');

        expect(play.mock.calls).toEqual([
            [{ midi: 43, voice: 'guitar', channel: 'string:6' }],
            [{ midi: 28, voice: 'bass', channel: 'string:4' }]
        ]);
    });

    it('AUD-4.1 and AUD-7.1 play a tapped key in the electric piano, each key on its own channel', () => {
        const play = vi.spyOn(sound, 'play').mockImplementation(() => {});

        playKey(60);

        expect(play).toHaveBeenCalledWith({ midi: 60, voice: 'piano', channel: 'key:60' });
    });
});
