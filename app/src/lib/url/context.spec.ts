import { describe, expect, it } from 'vitest';
import { DEFAULT_SETTINGS, type Settings } from '#lib/settings/settings.ts';
import { overrides, readOverride, viewContext, writeOverride, type ContextOverride } from './context';

const read = (query: string, settings: Settings = DEFAULT_SETTINGS) =>
    readOverride(new URLSearchParams(query), settings);

function written(override: ContextOverride): string {
    const params = new URLSearchParams();
    writeOverride(params, override);
    return params.toString();
}

describe('readOverride', () => {
    it('APP-3.3 reads the instrument, a built-in tuning by id and the capo', () => {
        expect(read('inst=bass&tuning=drop-d&capo=3')).toEqual({
            instrument: 'bass',
            tuning: ['D1', 'A1', 'D2', 'G2'],
            capo: 3
        });
    });

    it('APP-3.3 gives an instrument on its own its Standard tuning', () => {
        expect(read('inst=bass')).toEqual({ instrument: 'bass', tuning: ['E1', 'A1', 'D2', 'G2'] });
    });

    it("APP-3.3 reads a built-in tuning's id on the setting's instrument when the URL names none", () => {
        expect(
            read('tuning=drop-d', { ...DEFAULT_SETTINGS, instrument: 'bass', tuning: ['E1', 'A1', 'D2', 'G2'] })
        ).toEqual({ instrument: 'bass', tuning: ['D1', 'A1', 'D2', 'G2'] });
        expect(read('tuning=dadgad').tuning).toEqual(['D2', 'A2', 'D3', 'G3', 'A3', 'D4']);
    });

    it("APP-3.3 reads a custom tuning's pitches, and takes the instrument from its strings", () => {
        expect(read('tuning=C2-G2-C3-G3-C4-E4')).toEqual({
            instrument: 'guitar',
            tuning: ['C2', 'G2', 'C3', 'G3', 'C4', 'E4']
        });
        expect(read('tuning=B0-E1-A1-D2')).toEqual({ instrument: 'bass', tuning: ['B0', 'E1', 'A1', 'D2'] });
        expect(read('tuning=Ds2-Gs2-Cs3-Fs3-As3-Ds4').tuning).toEqual(['D#2', 'G#2', 'C#3', 'F#3', 'A#3', 'D#4']);
    });

    it('APP-3.3 reads a capo of 0 as no capo, overriding one that is set', () => {
        expect(read('capo=0', { ...DEFAULT_SETTINGS, capo: 2 })).toEqual({ capo: 0 });
    });

    it("ignores what it can't read", () => {
        expect(read('inst=banjo&capo=12')).toEqual({});
        expect(read('capo=-1')).toEqual({});
        expect(read('capo=2.5')).toEqual({});
        expect(read('tuning=open-g&inst=bass')).toEqual({ instrument: 'bass', tuning: ['E1', 'A1', 'D2', 'G2'] });
        expect(read('tuning=E2-A2-D3')).toEqual({});
        // Six strings named for a bass don't fit it.
        expect(read('inst=bass&tuning=C2-G2-C3-G3-C4-E4')).toEqual({
            instrument: 'bass',
            tuning: ['E1', 'A1', 'D2', 'G2']
        });
    });
});

describe('writeOverride', () => {
    it('APP-3.3 writes built-in tunings by id, custom ones by pitch, and leaves out Standard', () => {
        expect(written({ instrument: 'bass', tuning: ['E1', 'A1', 'D2', 'G2'] })).toBe('inst=bass');
        expect(written({ instrument: 'guitar', tuning: ['D2', 'A2', 'D3', 'G3', 'B3', 'E4'], capo: 0 })).toBe(
            'inst=guitar&tuning=drop-d&capo=0'
        );
        expect(written({ instrument: 'guitar', tuning: ['C2', 'G2', 'C3', 'G3', 'C4', 'E4'] })).toBe(
            'inst=guitar&tuning=C2-G2-C3-G3-C4-E4'
        );
        expect(written({ instrument: 'guitar', tuning: ['F#2', 'A2', 'D3', 'G3', 'B3', 'E4'] })).toBe(
            'inst=guitar&tuning=Fs2-A2-D3-G3-B3-E4'
        );
        expect(written({})).toBe('');
    });

    it('reads back what it writes', () => {
        for (const query of [
            'inst=bass&tuning=half-step-down&capo=1',
            'inst=guitar&tuning=C2-G2-C3-G3-C4-E4',
            'capo=5'
        ]) {
            expect(written(read(query))).toBe(query);
        }
    });
});

describe('viewContext and overrides', () => {
    it("APP-3.3 shows the override where it has one and the settings' elsewhere", () => {
        const settings: Settings = { ...DEFAULT_SETTINGS, capo: 2 };
        expect(viewContext(settings, read('inst=bass'))).toEqual({
            instrument: 'bass',
            tuning: ['E1', 'A1', 'D2', 'G2'],
            capo: 2
        });
        expect(viewContext(settings, {})).toEqual({ instrument: 'guitar', tuning: DEFAULT_SETTINGS.tuning, capo: 2 });
    });

    it('APP-2.3 calls it an override only when it changes what shows', () => {
        expect(overrides(DEFAULT_SETTINGS, read('inst=guitar&capo=0'))).toBe(false);
        expect(overrides(DEFAULT_SETTINGS, read('capo=1'))).toBe(true);
        expect(overrides(DEFAULT_SETTINGS, read('inst=guitar&tuning=drop-d'))).toBe(true);
        const halfStep = { ...DEFAULT_SETTINGS, tuning: ['D#2', 'G#2', 'C#3', 'F#3', 'A#3', 'D#4'] };
        expect(overrides(halfStep, read('tuning=half-step-down'))).toBe(false);
    });
});
