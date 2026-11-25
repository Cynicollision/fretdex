import { describe, expect, it } from 'vitest';
import { notePitchClass } from './note';
import { pitchClass } from './pitch';
import { intervalSemitones } from './interval';
import { SCALE_TYPES, scaleType, spell, spellScale, type ScaleType } from './scale';

function type(id: string): ScaleType {
    const found = scaleType(id);
    if (!found) throw new Error(`No scale ${id}`);
    return found;
}

function notes(root: string, id: string): string {
    return spellScale(root, type(id)).notes.join(' ');
}

describe('SCALE_TYPES', () => {
    it('SCL-1.1 offers about 20 scales in four groups, each id once', () => {
        expect(SCALE_TYPES).toHaveLength(21);
        expect(new Set(SCALE_TYPES.map(t => t.id)).size).toBe(SCALE_TYPES.length);
        expect(SCALE_TYPES.filter(t => t.group === 'modes').map(t => t.id)).toEqual([
            'lydian',
            'ionian',
            'mixolydian',
            'dorian',
            'aeolian',
            'phrygian',
            'locrian'
        ]);
    });

    it('rises through its intervals within an octave', () => {
        for (const t of SCALE_TYPES) {
            const semitones = t.intervals.map(intervalSemitones);
            expect(semitones[0], t.id).toBe(0);
            expect(
                semitones.every((s, i) => i === 0 || s > (semitones[i - 1] ?? 0)),
                t.id
            ).toBe(true);
            expect(Math.max(...semitones), t.id).toBeLessThan(12);
        }
    });

    it('reads its signature from a scale that exists', () => {
        for (const t of SCALE_TYPES) {
            if (t.signatureFrom !== undefined) expect(scaleType(t.signatureFrom), t.id).toBeDefined();
        }
    });
});

describe('spellScale', () => {
    it('THY-1.1 spells F# major with E#', () => {
        expect(notes('F#', 'major')).toBe('F# G# A# B C# D# E#');
    });

    it('THY-1.1 uses each letter once in every seven-note scale but the altered scale, on every spelling of every root', () => {
        const roots = ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'C#', 'F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb', 'Cb'];
        for (const t of SCALE_TYPES.filter(t => t.intervals.length === 7 && t.id !== 'altered')) {
            for (const root of roots) {
                const letters = spellScale(root, t).notes.map(note => note[0]);
                expect(new Set(letters).size, `${root} ${t.id}`).toBe(7);
            }
        }
    });

    it('THY-1.1 spells the altered scale by its tensions', () => {
        expect(notes('C', 'altered')).toBe('C Db D# E F# Ab Bb');
        expect(spellScale('C', type('altered')).intervals).toEqual(['1', 'b2', '#2', '3', '#4', 'b6', 'b7']);
    });

    it('THY-1.3 uses a double sharp where the spelling needs one', () => {
        expect(notes('G#', 'harmonic-minor')).toBe('G# A# B C# D# E F##');
        expect(notes('A#', 'dorian')).toBe('A# B# C# D# E# F## G#');
        expect(notes('Db', 'phrygian-dominant')).toBe('Db Ebb F Gb Ab Bbb Cb');
    });

    it('THY-1.4 names the intervals of harmonic minor by their spelling', () => {
        expect(spellScale('A', type('harmonic-minor')).intervals).toEqual(['1', '2', 'b3', '4', '5', 'b6', '7']);
        expect(spellScale('C', type('minor-blues')).intervals).toEqual(['1', 'b3', '4', 'b5', '5', 'b7']);
        expect(spellScale('C', type('major-blues')).intervals).toEqual(['1', '2', 'b3', '3', '5', '6']);
    });

    it('keeps the root as written', () => {
        expect(spellScale('C#', type('major'))).toMatchObject({
            root: 'C#',
            notes: ['C#', 'D#', 'E#', 'F#', 'G#', 'A#', 'B#']
        });
        expect(notes('Cb', 'major')).toBe('Cb Db Eb Fb Gb Ab Bb');
        expect(notes('G##', 'major')).toBe('G## A## B## C## D## E## F###');
    });

    it('refuses a root that is not a note, such as a URL slug not yet parsed', () => {
        expect(() => spellScale('Fs', type('major'))).toThrow();
        expect(() => spellScale('', type('major'))).toThrow();
        expect(() => spell('C', ['3P'])).toThrow();
    });

    it('lands every note on the pitch its interval says', () => {
        for (const t of SCALE_TYPES) {
            for (const root of ['C', 'F#', 'Gb', 'A#', 'Fb']) {
                const spelled = spellScale(root, t).notes;
                spelled.forEach((note, i) => {
                    const expected = pitchClass(notePitchClass(root) + intervalSemitones(t.intervals[i] ?? ''));
                    expect(notePitchClass(note), `${root} ${t.id} ${note}`).toBe(expected);
                });
            }
        }
    });
});

describe('spell', () => {
    it('THY-1.2 spells chords from their root by interval', () => {
        const dominantSeventh = ['1P', '3M', '5P', '7m'];
        expect(spell('C#', dominantSeventh)).toEqual(['C#', 'E#', 'G#', 'B']);
        expect(spell('Gb', dominantSeventh)).toEqual(['Gb', 'Bb', 'Db', 'Fb']);
    });
});
