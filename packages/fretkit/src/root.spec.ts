import { describe, expect, it } from 'vitest';
import { SCALE_TYPES, scaleType, type ScaleType } from './scale';
import {
    PICKER_ROOTS,
    isOfferedRoot,
    rootChoices,
    rootFor,
    signature,
    simplerRoot,
    spellPitchClass,
    type Accidentals
} from './root';

function type(id: string): ScaleType {
    const found = scaleType(id);
    if (!found) throw new Error(`No scale ${id}`);
    return found;
}

/** The roots Auto opens for each of the 12 picker buttons. */
function autoRoots(id: string, accidentals: Accidentals = 'auto'): string {
    return PICKER_ROOTS.map(root => rootFor(root.pitchClass, type(id), accidentals)).join(' ');
}

describe('PICKER_ROOTS', () => {
    it('THY-2.2 offers the 12 roots as C, C#/Db, D, Eb, E, F, F#/Gb, G, Ab, A, Bb, B', () => {
        expect(PICKER_ROOTS.map(root => root.shown.join('/')).join(', ')).toBe(
            'C, C#/Db, D, Eb, E, F, F#/Gb, G, Ab, A, Bb, B'
        );
        expect(PICKER_ROOTS.map(root => root.spellings.join('/')).join(' ')).toBe(
            'C C#/Db D D#/Eb E F F#/Gb G G#/Ab A A#/Bb B'
        );
    });
});

describe('rootFor', () => {
    it('THY-2.1 on Auto, takes the key with fewer accidentals', () => {
        expect(autoRoots('major')).toBe('C Db D Eb E F F# G Ab A Bb B');
        expect(autoRoots('natural-minor')).toBe('C C# D Eb E F F# G G# A Bb B');
    });

    it('THY-2.1 takes F# major and Eb minor at the tie of six', () => {
        expect(rootFor(6, type('major'), 'auto')).toBe('F#');
        expect(rootFor(3, type('natural-minor'), 'auto')).toBe('Eb');
    });

    it('THY-2.1 reads a mode in its parent key, and breaks the tie by its 3rd', () => {
        // C# Dorian is in B major (5 sharps); Db Dorian would be in Cb major (7 flats).
        expect(rootFor(1, type('dorian'), 'auto')).toBe('C#');
        // D# Phrygian is in B major; Eb Phrygian would be in Cb major.
        expect(rootFor(3, type('phrygian'), 'auto')).toBe('D#');
        // At the tie of F# and Gb major: sharps with a major 3rd, flats with a minor 3rd.
        expect(rootFor(1, type('mixolydian'), 'auto')).toBe('C#');
        expect(rootFor(8, type('dorian'), 'auto')).toBe('Ab');
        expect(rootFor(10, type('phrygian'), 'auto')).toBe('Bb');
        expect(rootFor(3, type('aeolian'), 'auto')).toBe('Eb');
    });

    it('THY-2.1 reads harmonic minor in its minor key, though F## makes G# harmonic minor busier than Ab', () => {
        expect(rootFor(8, type('harmonic-minor'), 'auto')).toBe('G#');
        expect(rootFor(8, type('melodic-minor'), 'auto')).toBe('G#');
        expect(rootFor(8, type('minor-pentatonic'), 'auto')).toBe('G#');
        expect(rootFor(1, type('major-pentatonic'), 'auto')).toBe('Db');
        expect(rootFor(6, type('major-blues'), 'auto')).toBe('F#');
        expect(rootFor(3, type('minor-blues'), 'auto')).toBe('Eb');
    });

    it('THY-2.1 spells scales with no key of their own by their notes', () => {
        expect(rootFor(1, type('phrygian-dominant'), 'auto')).toBe('C#');
        expect(rootFor(1, type('lydian-dominant'), 'auto')).toBe('Db');
        expect(rootFor(1, type('altered'), 'auto')).toBe('C#');
        expect(rootFor(6, type('whole-tone'), 'auto')).toBe('Gb');
    });

    it('THY-2.3 lets Prefer sharps and Prefer flats spell the root', () => {
        expect(autoRoots('natural-minor', 'sharps')).toBe('C C# D D# E F F# G G# A A# B');
        expect(autoRoots('major', 'flats')).toBe('C Db D Eb E F Gb G Ab A Bb B');
    });

    it('THY-2.5 never opens a root whose key would need double sharps or flats', () => {
        // D# major would need F##, so Prefer sharps opens Eb major; Db minor would need Bbb, so Prefer flats opens C# minor.
        expect(autoRoots('major', 'sharps')).toBe('C C# D Eb E F F# G Ab A Bb B');
        expect(autoRoots('natural-minor', 'flats')).toBe('C C# D Eb E F F# G Ab A Bb B');
        // A# Dorian's parent is G# major, and Db Phrygian's is Bbb major.
        expect(rootFor(10, type('dorian'), 'sharps')).toBe('Bb');
        expect(rootFor(1, type('phrygian'), 'flats')).toBe('C#');
        for (const t of SCALE_TYPES) {
            for (const accidentals of ['auto', 'sharps', 'flats'] as const) {
                for (const { pitchClass, spellings } of PICKER_ROOTS.filter(root => root.spellings.length === 2)) {
                    const root = rootFor(pitchClass, t, accidentals);
                    const other = spellings.find(spelling => spelling !== root) ?? root;
                    if (signature(root, t).doubles) expect(signature(other, t).doubles, `${root} ${t.id}`).toBe(true);
                }
            }
        }
    });
});

describe('rootChoices', () => {
    it('THY-2.2 puts the other spelling one tap away', () => {
        expect(rootChoices(1, type('major'), 'auto')).toEqual({ root: 'Db', alternative: 'C#' });
        expect(rootChoices(0, type('major'), 'auto')).toEqual({ root: 'C' });
    });

    it('THY-2.5 leaves out a spelling whose key would need double sharps or flats', () => {
        expect(rootChoices(10, type('dorian'), 'auto')).toEqual({ root: 'Bb' });
        expect(rootChoices(8, type('major'), 'auto')).toEqual({ root: 'Ab' });
    });

    it('THY-2.5 offers both spellings where both keys need double sharps or flats', () => {
        // C# altered has D## and F##; Db altered has Ebb and Bbb.
        expect(rootChoices(1, type('altered'), 'auto')).toEqual({ root: 'C#', alternative: 'Db' });
        expect(rootChoices(1, type('altered'), 'flats')).toEqual({ root: 'Db', alternative: 'C#' });
    });

    it('THY-2.5 agrees with isOfferedRoot on every button of every scale, whatever the accidentals', () => {
        for (const t of SCALE_TYPES) {
            for (const accidentals of ['auto', 'sharps', 'flats'] as const) {
                for (const { pitchClass, spellings } of PICKER_ROOTS) {
                    const { root, alternative } = rootChoices(pitchClass, t, accidentals);
                    const label = `${String(pitchClass)} ${t.id} ${accidentals}`;
                    expect(isOfferedRoot(root, t), label).toBe(true);
                    const other = spellings.find(spelling => spelling !== root);
                    expect(alternative, label).toBe(other !== undefined && isOfferedRoot(other, t) ? other : undefined);
                    // A button always opens something.
                    expect(
                        spellings.some(spelling => isOfferedRoot(spelling, t)),
                        label
                    ).toBe(true);
                }
            }
        }
    });
});

describe('signature', () => {
    it('counts the key signature a scale is read in', () => {
        expect(signature('Db', type('major'))).toEqual({ sharps: 0, flats: 5, doubles: false });
        expect(signature('C#', type('major'))).toEqual({ sharps: 7, flats: 0, doubles: false });
        expect(signature('G#', type('harmonic-minor'))).toEqual({ sharps: 5, flats: 0, doubles: false });
        expect(signature('A#', type('dorian'))).toEqual({ sharps: 8, flats: 0, doubles: true });
    });
});

describe('isOfferedRoot and simplerRoot', () => {
    it('THY-2.5 offers Bb Dorian for A# Dorian', () => {
        expect(isOfferedRoot('A#', type('dorian'))).toBe(false);
        expect(simplerRoot('A#', type('dorian'))).toBe('Bb');
        expect(isOfferedRoot('Bb', type('dorian'))).toBe(true);
        expect(simplerRoot('Bb', type('dorian'))).toBeUndefined();
    });

    it('THY-2.5 keeps a linked root whose key needs none, and offers a simpler one for E# major', () => {
        expect(simplerRoot('Cb', type('major'))).toBeUndefined();
        expect(isOfferedRoot('Cb', type('major'))).toBe(false);
        expect(simplerRoot('E#', type('major'))).toBe('F');
    });

    it('THY-2.5 always offers a white-key root, though E altered needs F## for its #2', () => {
        expect(isOfferedRoot('E', type('altered'))).toBe(true);
        expect(simplerRoot('E', type('altered'))).toBeUndefined();
        expect(isOfferedRoot('B', type('altered'))).toBe(true);
    });

    it('THY-2.5 offers nothing simpler where every spelling needs a double sharp or flat', () => {
        expect(isOfferedRoot('Gb', type('altered'))).toBe(true);
        expect(isOfferedRoot('F#', type('altered'))).toBe(true);
        expect(simplerRoot('Gb', type('altered'))).toBeUndefined();
    });

    it('THY-2.5 offers a simpler root for a linked root with doubles in the note itself', () => {
        expect(simplerRoot('G##', type('major'))).toBe('A');
        expect(isOfferedRoot('G##', type('major'))).toBe(false);
    });
});

describe('spellPitchClass', () => {
    it('THY-2.3 spells a note with no key as the pickers do on Auto, or all one way', () => {
        const all = (accidentals: Accidentals) =>
            Array.from({ length: 12 }, (_, pc) => spellPitchClass(pc, accidentals)).join(' ');
        expect(all('auto')).toBe('C C# D Eb E F F# G Ab A Bb B');
        expect(all('sharps')).toBe('C C# D D# E F F# G G# A A# B');
        expect(all('flats')).toBe('C Db D Eb E F Gb G Ab A Bb B');
    });
});
