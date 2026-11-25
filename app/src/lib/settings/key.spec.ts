import { describe, expect, it } from 'vitest';
import { changeMode, keyName, keyRootButtons, otherSpelling, pickKey } from './key';

describe('the key picker', () => {
    it('THY-2.2 offers the 12 roots, a black key showing both its names where both are offered', () => {
        // D♭ minor would need B𝄫, and G♭ minor E𝄫 too (THY-2.5).
        expect(keyRootButtons('minor').map(button => button.label)).toEqual([
            'C',
            'C♯',
            'D',
            'D♯/E♭',
            'E',
            'F',
            'F♯',
            'G',
            'G♯/A♭',
            'A',
            'A♯/B♭',
            'B'
        ]);
    });

    it('CTX-2.6 hides a spelling whose key would need a double sharp or flat (THY-2.5)', () => {
        const major = keyRootButtons('major');
        expect(major[8]?.label).toBe('A♭'); // G♯ major needs F𝄪
        expect(major[1]?.label).toBe('C♯/D♭');
        expect(keyRootButtons('dorian')[10]?.label).toBe('B♭'); // A♯ Dorian needs F𝄪
    });

    it('THY-2.2 opens the spelling Auto prefers, or the one the accidentals setting asks for', () => {
        expect(pickKey(1, 'major', 'auto')).toEqual({ root: 'Db', mode: 'major' });
        expect(pickKey(1, 'major', 'sharps')).toEqual({ root: 'C#', mode: 'major' });
        expect(pickKey(3, 'minor', 'auto')).toEqual({ root: 'Eb', mode: 'minor' });
        expect(pickKey(10, 'dorian', 'sharps')).toEqual({ root: 'Bb', mode: 'dorian' });
        expect(pickKey(2, 'lydian', 'flats')).toEqual({ root: 'D', mode: 'lydian' });
    });

    it('THY-2.2 puts the other spelling one tap away', () => {
        expect(otherSpelling({ root: 'Db', mode: 'major' })).toBe('C#');
        expect(otherSpelling({ root: 'C#', mode: 'major' })).toBe('Db');
        expect(otherSpelling({ root: 'Ab', mode: 'major' })).toBeUndefined();
        expect(otherSpelling({ root: 'D', mode: 'major' })).toBeUndefined();
    });

    it('CTX-2.6 keeps the root when the mode changes, unless the new mode refuses it', () => {
        expect(changeMode({ root: 'C#', mode: 'major' }, 'dorian', 'auto')).toEqual({ root: 'C#', mode: 'dorian' });
        expect(changeMode({ root: 'A#', mode: 'minor' }, 'dorian', 'sharps')).toEqual({ root: 'Bb', mode: 'dorian' });
    });

    it('APP-2.1 names the key, or says there is none', () => {
        expect(keyName({ root: 'F#', mode: 'major' })).toBe('F♯ major');
        expect(keyName({ root: 'D', mode: 'dorian' })).toBe('D Dorian');
        expect(keyName(null)).toBe('No key');
    });
});
