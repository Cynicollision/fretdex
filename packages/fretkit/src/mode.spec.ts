import { describe, expect, it } from 'vitest';
import { BRIGHTNESS, diatonicChords, modeInfo, parentRoot, stepFormula } from './mode';
import { SCALE_TYPES, scaleType, spell, type ScaleType } from './scale';

function type(id: string): ScaleType {
    const found = scaleType(id);
    if (!found) throw new Error(`No scale ${id}`);
    return found;
}

describe('BRIGHTNESS', () => {
    it('SCL-5.2 orders the seven modes from Lydian to Locrian', () => {
        expect(BRIGHTNESS.map(t => t.id)).toEqual([
            'lydian',
            'ionian',
            'mixolydian',
            'dorian',
            'aeolian',
            'phrygian',
            'locrian'
        ]);
    });

    it('SCL-5.2 flattens one note from each mode to the next darker one', () => {
        for (let i = 1; i < BRIGHTNESS.length; i++) {
            const brighter = spell('C', BRIGHTNESS[i - 1]?.intervals ?? []);
            const darker = spell('C', BRIGHTNESS[i]?.intervals ?? []);
            const changed = darker.filter((note, n) => note !== brighter[n]);
            expect(changed, BRIGHTNESS[i]?.id).toHaveLength(1);
        }
    });
});

describe('modeInfo', () => {
    it('SCL-5.1 names each mode its characteristic note, Ionian its natural 4', () => {
        const names = Object.fromEntries(BRIGHTNESS.map(t => [t.id, modeInfo(t)?.characteristic]));
        expect(names).toEqual({
            lydian: '4A',
            ionian: '4P',
            mixolydian: '7m',
            dorian: '6M',
            aeolian: '6m',
            phrygian: '2m',
            locrian: '5d'
        });
    });

    it("SCL-5.1 picks a characteristic note in the mode's own intervals", () => {
        for (const t of BRIGHTNESS) expect(t.intervals, t.id).toContain(modeInfo(t)?.characteristic);
    });

    it('MODE-1.8 gives nothing for scales that are not modes of the major scale', () => {
        const others = SCALE_TYPES.filter(t => t.group !== 'modes');
        expect(others.map(modeInfo).every(info => info === undefined)).toBe(true);
    });
});

describe('parentRoot', () => {
    it('SCL-5.1 finds the parent major scale: D Dorian is the 2nd mode of C major', () => {
        expect(parentRoot('D', type('dorian'))).toBe('C');
        expect(parentRoot('E', type('phrygian'))).toBe('C');
        expect(parentRoot('A#', type('dorian'))).toBe('G#');
        expect(parentRoot('Bb', type('locrian'))).toBe('Cb');
        expect(parentRoot('F#', type('ionian'))).toBe('F#');
    });

    it("SCL-5.1 gives a parent whose major scale has the mode's notes", () => {
        const major = type('major');
        for (const t of BRIGHTNESS) {
            for (const root of ['C', 'F#', 'Eb', 'B', 'Ab']) {
                const parent = parentRoot(root, t) ?? '';
                expect(new Set(spell(parent, major.intervals)), `${root} ${t.id}`).toEqual(
                    new Set(spell(root, t.intervals))
                );
            }
        }
    });

    it('is undefined for other scales', () => {
        expect(parentRoot('C', type('harmonic-minor'))).toBeUndefined();
    });
});

describe('diatonicChords', () => {
    const triads = (root: string, id: string) => diatonicChords(root, type(id), 3);
    const sevenths = (root: string, id: string) => diatonicChords(root, type(id), 4);

    it("SCL-5.3 numbers D Dorian's triads relative to the mode", () => {
        expect(triads('D', 'dorian').map(c => c.numeral)).toEqual(['i', 'ii', 'bIII', 'IV', 'v', 'vi°', 'bVII']);
        expect(triads('D', 'dorian').map(c => c.root + c.suffix)).toEqual(['Dm', 'Em', 'F', 'G', 'Am', 'Bdim', 'C']);
    });

    it("SCL-5.3 numbers every mode's triads relative to the mode", () => {
        const numerals = Object.fromEntries(BRIGHTNESS.map(t => [t.id, triads('C', t.id).map(c => c.numeral)]));
        expect(numerals).toEqual({
            lydian: ['I', 'II', 'iii', '#iv°', 'V', 'vi', 'vii'],
            ionian: ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'],
            mixolydian: ['I', 'ii', 'iii°', 'IV', 'v', 'vi', 'bVII'],
            dorian: ['i', 'ii', 'bIII', 'IV', 'v', 'vi°', 'bVII'],
            aeolian: ['i', 'ii°', 'bIII', 'iv', 'v', 'bVI', 'bVII'],
            phrygian: ['i', 'bII', 'bIII', 'iv', 'v°', 'bVI', 'bvii'],
            locrian: ['i°', 'bII', 'biii', 'iv', 'bV', 'bVI', 'bvii']
        });
    });

    it("SCL-5.3 gives the 7th chords, D Dorian's i7 ii7 bIIImaj7 IV7 v7 viø7 bVIImaj7", () => {
        expect(sevenths('D', 'dorian').map(c => c.numeral)).toEqual([
            'i7',
            'ii7',
            'bIIImaj7',
            'IV7',
            'v7',
            'viø7',
            'bVIImaj7'
        ]);
        expect(sevenths('D', 'dorian').map(c => c.root + c.suffix)).toEqual([
            'Dm7',
            'Em7',
            'Fmaj7',
            'G7',
            'Am7',
            'Bm7b5',
            'Cmaj7'
        ]);
    });

    it("SCL-5.3 spells chord tones as the mode spells them: C# Dorian's bIII is E G# B", () => {
        expect(triads('C#', 'dorian')[2]?.notes).toEqual(['E', 'G#', 'B']);
        expect(sevenths('Bb', 'locrian')[0]?.notes).toEqual(['Bb', 'Db', 'Fb', 'Ab']);
    });

    it('is empty for scales without seven notes', () => {
        expect(triads('C', 'minor-pentatonic')).toEqual([]);
    });
});

describe('stepFormula', () => {
    it('SCL-2.1 writes the major scale as W W H W W W H', () => {
        expect(stepFormula(type('major')).join(' ')).toBe('W W H W W W H');
    });

    it('SCL-2.1 writes a minor 3rd leap as 1½', () => {
        expect(stepFormula(type('minor-pentatonic')).join(' ')).toBe('1½ W W 1½ W');
        expect(stepFormula(type('minor-blues')).join(' ')).toBe('1½ W H H 1½ W');
        expect(stepFormula(type('harmonic-minor')).join(' ')).toBe('W H W W H 1½ H');
    });

    it('SCL-2.1 spans an octave for every scale', () => {
        const size: Record<string, number> = { H: 1, W: 2, '1½': 3 };
        for (const t of SCALE_TYPES) {
            const steps = stepFormula(t);
            expect(steps, t.id).toHaveLength(t.intervals.length);
            expect(
                steps.reduce((sum, step) => sum + (size[step] ?? NaN), 0),
                t.id
            ).toBe(12);
        }
    });
});
