import { describe, expect, it } from 'vitest';
import { builtInTuning, switchInstrument, DEFAULT_SETTINGS } from './settings';
import {
    CUSTOM_TUNINGS_FORMAT,
    MAX_CUSTOM_TUNINGS,
    NO_CUSTOM_TUNINGS,
    cannotSave,
    readCustomTunings,
    spellPitch,
    stringReach,
    tuningName,
    type CustomTuning,
    type CustomTunings
} from './tunings';

const OPEN_C: CustomTuning = { id: 'a', name: 'Open C', strings: ['C2', 'G2', 'C3', 'G3', 'C4', 'E4'] };
const BASS_BEAD: CustomTuning = { id: 'b', name: 'BEAD', strings: ['B0', 'E1', 'A1', 'D2'] };
const SAVED: CustomTunings = { guitar: [OPEN_C], bass: [BASS_BEAD] };

describe('custom tunings', () => {
    it('PIN-6.1 are their own versioned record', () => {
        expect(CUSTOM_TUNINGS_FORMAT).toMatchObject({ key: 'customTunings', version: 1 });
        expect(readCustomTunings(undefined)).toEqual(NO_CUSTOM_TUNINGS);
    });

    it('CTX-2.7 reads back the tunings it saved', () => {
        expect(readCustomTunings(JSON.parse(JSON.stringify(SAVED)))).toEqual(SAVED);
    });

    it('drops a saved tuning that is not valid, and keeps the rest', () => {
        const stored = {
            guitar: [
                OPEN_C,
                { ...OPEN_C, id: 'no-name', name: '  ' },
                { ...OPEN_C, id: 'too-few', strings: ['C2', 'G2', 'C3', 'G3'] },
                { ...OPEN_C, id: 'too-low', strings: ['D#1', 'G2', 'C3', 'G3', 'C4', 'E4'] },
                { ...OPEN_C, id: 'not-a-note', strings: ['H2', 'G2', 'C3', 'G3', 'C4', 'E4'] },
                { ...OPEN_C, name: 'Same id' },
                'Open C'
            ],
            bass: 'BEAD'
        };

        expect(readCustomTunings(stored)).toEqual({ guitar: [OPEN_C], bass: [] });
    });

    it(`CTX-2.7 keeps at most ${String(MAX_CUSTOM_TUNINGS)} per instrument`, () => {
        const many = Array.from({ length: 12 }, (_, i) => ({ ...OPEN_C, id: String(i), name: `Tuning ${String(i)}` }));

        expect(readCustomTunings({ guitar: many }).guitar).toHaveLength(MAX_CUSTOM_TUNINGS);
    });

    it('CTX-1.3 names a tuning by the built-in tunings, then the saved ones, else Custom', () => {
        expect(tuningName('guitar', ['D2', 'A2', 'D3', 'G3', 'B3', 'E4'], SAVED)).toBe('Drop D');
        expect(tuningName('guitar', ['C2', 'G2', 'C3', 'G3', 'C4', 'E4'], SAVED)).toBe('Open C');
        expect(tuningName('bass', ['B0', 'E1', 'A1', 'D2'], SAVED)).toBe('BEAD');
        expect(tuningName('guitar', ['C2', 'G2', 'C3', 'G3', 'C4', 'E4'], NO_CUSTOM_TUNINGS)).toBe('Custom');
    });

    it('CTX-1.3 matches a tuning by its pitches, however they are spelled', () => {
        expect(builtInTuning('guitar', ['D#2', 'G#2', 'C#3', 'F#3', 'A#3', 'D#4'])?.name).toBe('Half-step down');
        expect(tuningName('guitar', ['B#1', 'G2', 'B#2', 'G3', 'B#3', 'E4'], SAVED)).toBe('Open C');
    });

    it('CTX-2.1 switching instrument from a saved tuning gives Standard', () => {
        const onOpenC = { ...DEFAULT_SETTINGS, tuning: OPEN_C.strings };

        expect(switchInstrument(onOpenC, 'bass').tuning).toEqual(['E1', 'A1', 'D2', 'G2']);
    });

    it("THY-3.3 keeps each string within an octave of Standard's", () => {
        expect(stringReach('guitar', 0)).toEqual({ low: 28, high: 52 }); // E1 to E3, around E2
        expect(stringReach('guitar', 5)).toEqual({ low: 52, high: 76 }); // E3 to E5, around E4
        expect(stringReach('bass', 0)).toEqual({ low: 16, high: 40 }); // E0 to E2, around E1
    });

    it('THY-3.3 spells a pitch as a note with no key is on the accidentals setting', () => {
        expect(spellPitch(51, 'auto')).toBe('Eb3');
        expect(spellPitch(51, 'sharps')).toBe('D#3');
        expect(spellPitch(49, 'auto')).toBe('C#3');
        expect(spellPitch(49, 'flats')).toBe('Db3');
        expect(spellPitch(48, 'flats')).toBe('C3');
    });

    describe('saving', () => {
        const DROP_C = ['C2', 'G2', 'C3', 'F3', 'A3', 'D4'];

        it('CTX-2.7 needs a name', () => {
            expect(cannotSave('guitar', ' ', DROP_C, SAVED)).toBe('Give it a name to save it.');
            expect(cannotSave('guitar', 'Drop C', DROP_C, SAVED)).toBeUndefined();
        });

        it('CTX-2.7 needs a name no other tuning of the instrument has', () => {
            expect(cannotSave('guitar', 'open c', DROP_C, SAVED)).toBe("There's already a tuning called open c.");
            expect(cannotSave('guitar', 'Drop D', DROP_C, SAVED)).toBe("There's already a tuning called Drop D.");
            expect(cannotSave('guitar', 'BEAD', DROP_C, SAVED)).toBeUndefined();
        });

        it('CTX-2.7 needs pitches that are not already in the list', () => {
            expect(cannotSave('guitar', 'Mine', ['E2', 'A2', 'D3', 'G3', 'B3', 'E4'], SAVED)).toBe(
                "That's Standard, which is already in the list."
            );
            expect(cannotSave('guitar', 'Mine', OPEN_C.strings, SAVED)).toBe("That's Open C, which is already saved.");
        });

        it("THY-3.3 needs each string within an octave of Standard's", () => {
            expect(cannotSave('guitar', 'Low', ['D1', 'A2', 'D3', 'G3', 'B3', 'E4'], SAVED)).toBe(
                "String 6 is more than an octave from Standard's pitch."
            );
        });

        it('lets a saved tuning keep its own name and pitches when it is edited', () => {
            expect(cannotSave('guitar', 'Open C', OPEN_C.strings, SAVED, OPEN_C.id)).toBeUndefined();
        });
    });
});
