import { describe, expect, it } from 'vitest';
import { ARPEGGIO_TYPES, arpeggioType } from './arpeggio';
import { intervalName } from './interval';
import { spell } from './scale';

function formula(id: string): string | undefined {
    return arpeggioType(id)?.intervals.map(intervalName).join(' ');
}

describe('ARPEGGIO_TYPES', () => {
    it('ARP-1.1 offers the triads, sixths and sevenths of the chords list, each id once', () => {
        expect(ARPEGGIO_TYPES.map(type => type.id)).toEqual([
            'major',
            'm',
            'dim',
            'aug',
            '6',
            'm6',
            '7',
            'maj7',
            'm7',
            'mmaj7',
            'm7b5',
            'dim7',
            '7sus4'
        ]);
        for (const type of ARPEGGIO_TYPES) expect(type.id, type.id).toMatch(/^[a-z0-9]+$/u);
    });

    it('THY-1.2 spells each quality by its chord tones', () => {
        expect(formula('major')).toBe('1 3 5');
        expect(formula('aug')).toBe('1 3 #5');
        expect(formula('m6')).toBe('1 b3 5 6');
        expect(formula('m7b5')).toBe('1 b3 b5 b7');
        expect(formula('dim7')).toBe('1 b3 b5 bb7');
        expect(formula('mmaj7')).toBe('1 b3 5 7');
        expect(formula('7sus4')).toBe('1 4 5 b7');
        expect(spell('B', arpeggioType('dim7')?.intervals ?? [])).toEqual(['B', 'D', 'F', 'Ab']);
        expect(spell('C#', arpeggioType('7')?.intervals ?? [])).toEqual(['C#', 'E#', 'G#', 'B']);
    });

    it('finds nothing for an unknown id', () => {
        expect(arpeggioType('m7b9')).toBeUndefined();
        expect(arpeggioType('m(maj7)')).toBeUndefined();
    });
});
