import { describe, expect, it } from 'vitest';
import {
    enharmonics,
    noteAlteration,
    noteLabel,
    noteMidi,
    notePitchClass,
    notePitchName,
    noteSlug,
    parseNote,
    spellingsOf,
    spellMidi
} from './note';

describe('parseNote', () => {
    it('THY-1.5 accepts #, s and b, and the signs, for typed notes', () => {
        expect(parseNote('F#')).toBe('F#');
        expect(parseNote('Fs')).toBe('F#');
        expect(parseNote('fs')).toBe('F#');
        expect(parseNote('F♯')).toBe('F#');
        expect(parseNote('Bb')).toBe('Bb');
        expect(parseNote('bb')).toBe('Bb');
        expect(parseNote('B♭')).toBe('Bb');
        expect(parseNote('b')).toBe('B');
        expect(parseNote(' C ')).toBe('C');
        expect(parseNote('FS')).toBe('F#');
        expect(parseNote('C♮')).toBe('C');
        expect(parseNote('C♮4')).toBe('C4');
    });

    it('THY-1.3 reads double sharps and flats as URLs and search write them', () => {
        expect(parseNote('F##')).toBe('F##');
        expect(parseNote('Fss')).toBe('F##');
        expect(parseNote('Fx')).toBe('F##');
        expect(parseNote('FX')).toBe('F##');
        expect(parseNote('F𝄪')).toBe('F##');
        expect(parseNote('Ebb')).toBe('Ebb');
        expect(parseNote('E𝄫')).toBe('Ebb');
    });

    it('keeps an octave', () => {
        expect(parseNote('E2')).toBe('E2');
        expect(parseNote('Fs3')).toBe('F#3');
    });

    it('refuses what is not a note', () => {
        for (const text of ['', 'H', 'F#b', 'F###', 'Fbbb', 'C-1', 'C10', 'Cq', '#', 'BB', 'C♮♮', 'C♮#']) {
            expect(parseNote(text), text).toBeUndefined();
        }
    });
});

describe('noteLabel', () => {
    it('THY-1.5 shows accidentals as ♯ ♭ 𝄪 𝄫', () => {
        expect(noteLabel('F#')).toBe('F♯');
        expect(noteLabel('Bb')).toBe('B♭');
        expect(noteLabel('F##')).toBe('F𝄪');
        expect(noteLabel('Ebb')).toBe('E𝄫');
        expect(noteLabel('C')).toBe('C');
        expect(noteLabel('C#4')).toBe('C♯4');
    });

    it('THY-1.5 shows a triple sharp or flat as ♯𝄪 or ♭𝄫, never as # or b', () => {
        expect(noteLabel('F###')).toBe('F♯𝄪');
        expect(noteLabel('Fbbb')).toBe('F♭𝄫');
    });
});

describe('noteSlug', () => {
    it('THY-1.3 writes sharps as s in URLs', () => {
        expect(noteSlug('F#')).toBe('Fs');
        expect(noteSlug('F##')).toBe('Fss');
        expect(noteSlug('Bbb')).toBe('Bbb');
        expect(noteSlug('Eb2')).toBe('Eb2');
    });

    it('reads back as the same note', () => {
        for (const note of ['C', 'F#', 'F##', 'Bb', 'Bbb', 'E#3']) {
            expect(parseNote(noteSlug(note))).toBe(note);
        }
    });
});

describe('what is not a note', () => {
    it('throws rather than giving an empty answer', () => {
        for (const read of [
            noteLabel,
            noteSlug,
            notePitchClass,
            noteMidi,
            noteAlteration,
            notePitchName,
            enharmonics
        ]) {
            expect(() => read('Fs'), read.name).toThrow();
            expect(() => read(''), read.name).toThrow();
        }
    });
});

describe('enharmonics', () => {
    it('THY-2.4 lists the other spellings, fewest accidentals first', () => {
        expect(enharmonics('F#')).toEqual(['Gb', 'E##']);
        expect(enharmonics('B#')).toEqual(['C', 'Dbb']);
        expect(enharmonics('E##')).toEqual(['F#', 'Gb']);
        expect(enharmonics('Gb4')).toEqual(['F#', 'E##']);
    });

    it('gives every pitch class two or three spellings', () => {
        expect(spellingsOf(8)).toEqual(['G#', 'Ab']);
        expect(spellingsOf(0)).toEqual(['C', 'B#', 'Dbb']);
    });
});

describe('spellMidi', () => {
    it('THY-4.1 puts a spelling in the octave it sounds in', () => {
        expect(spellMidi(60, 'C')).toBe('C4');
        expect(spellMidi(60, 'B#')).toBe('B#3');
        expect(spellMidi(59, 'Cb')).toBe('Cb4');
        expect(spellMidi(40, 'E')).toBe('E2');
        expect(spellMidi(42, 'Gb')).toBe('Gb2');
    });

    it('refuses a spelling of another pitch', () => {
        expect(() => spellMidi(60, 'D')).toThrow();
    });

    it('agrees with noteMidi', () => {
        for (let midi = 28; midi <= 88; midi++) {
            for (const spelling of spellingsOf(midi % 12)) {
                expect(noteMidi(spellMidi(midi, spelling))).toBe(midi);
            }
        }
    });
});
