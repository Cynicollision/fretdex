import { TUNINGS } from '@fretdex/fretkit';
import { describe, expect, it } from 'vitest';
import { DEFAULT_SETTINGS, readSettings, switchInstrument, type Settings } from './settings';

const tuning = (instrument: 'guitar' | 'bass', id: string) =>
    TUNINGS[instrument].find(candidate => candidate.id === id)?.strings;

describe('settings', () => {
    it('CTX-1 defaults to no key, guitar in standard tuning, intervals, Auto, frets 0 to 15, Dark, no capo, the screen kept awake and 100 bpm, and AUD-1.2 the volume at 80 and not muted', () => {
        expect(readSettings(undefined)).toEqual({
            key: null,
            instrument: 'guitar',
            tuning: ['E2', 'A2', 'D3', 'G3', 'B3', 'E4'],
            handedness: 'right',
            labels: 'intervals',
            accidentals: 'auto',
            fretRange: { from: 0, to: 15 },
            theme: 'dark',
            capo: 0,
            keepAwake: true,
            tempo: 100,
            volume: 80,
            muted: false
        });
    });

    it('CTX-2.5 reads back every setting it saved', () => {
        const chosen: Settings = {
            key: { root: 'F#', mode: 'dorian' },
            instrument: 'bass',
            tuning: ['D1', 'A1', 'D2', 'G2'],
            handedness: 'left',
            labels: 'degrees',
            accidentals: 'flats',
            fretRange: { from: 5, to: 24 },
            theme: 'contrast',
            capo: 11,
            keepAwake: false,
            tempo: 250,
            volume: 0,
            muted: true
        };

        expect(readSettings(structuredClone(chosen))).toEqual(chosen);
    });

    it('keeps each valid setting and defaults each one that is not', () => {
        const read = readSettings({
            key: { root: 'E2', mode: 'minor' },
            instrument: 'banjo',
            tuning: ['E2', 'A2'],
            handedness: 'left',
            labels: 'colours',
            accidentals: 'sharps',
            fretRange: { from: 12, to: 12 },
            theme: 'light',
            capo: 12,
            keepAwake: 'yes',
            tempo: 29,
            volume: 101,
            muted: 'no'
        });

        expect(read).toEqual({
            ...DEFAULT_SETTINGS,
            handedness: 'left',
            accidentals: 'sharps',
            theme: 'light'
        });
    });

    it("gives a tuning that doesn't fit the instrument its Standard", () => {
        expect(readSettings({ instrument: 'bass', tuning: DEFAULT_SETTINGS.tuning }).tuning).toEqual(
            tuning('bass', 'standard')
        );
        expect(readSettings({ tuning: ['E2', 'A2', 'D3', 'G3', 'B3', 'X4'] }).tuning).toEqual(DEFAULT_SETTINGS.tuning);
    });

    it('CTX-1.3 keeps a custom tuning by its pitches', () => {
        expect(readSettings({ tuning: ['C2', 'G2', 'D3', 'G3', 'B3', 'D4'] }).tuning).toEqual([
            'C2',
            'G2',
            'D3',
            'G3',
            'B3',
            'D4'
        ]);
    });

    it.each([
        ['standard', 'standard'],
        ['drop-d', 'drop-d'],
        ['half-step-down', 'half-step-down'],
        ['dadgad', 'standard'],
        ['open-g', 'standard']
    ])('CTX-2.1 switching guitar in %s to bass gives bass in %s', (from, to) => {
        const guitar = { ...DEFAULT_SETTINGS, tuning: tuning('guitar', from) ?? [] };

        const bass = switchInstrument(guitar, 'bass');

        expect(bass.instrument).toBe('bass');
        expect(bass.tuning).toEqual(tuning('bass', to));
    });

    it('CTX-2.1 switching from a custom tuning gives Standard, and back again keeps the name', () => {
        const custom = { ...DEFAULT_SETTINGS, tuning: ['C2', 'G2', 'D3', 'G3', 'B3', 'D4'] };

        expect(switchInstrument(custom, 'bass').tuning).toEqual(tuning('bass', 'standard'));
        expect(switchInstrument(switchInstrument(custom, 'bass'), 'guitar').tuning).toEqual(
            tuning('guitar', 'standard')
        );
        const dropD = switchInstrument(
            { ...DEFAULT_SETTINGS, instrument: 'bass', tuning: tuning('bass', 'drop-d') ?? [] },
            'guitar'
        );
        expect(dropD.tuning).toEqual(tuning('guitar', 'drop-d'));
    });
});
