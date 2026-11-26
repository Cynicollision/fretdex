import { PICKER_ROOTS, SCALE_TYPES } from '@fretdex/fretkit';
import { describe, expect, it } from 'vitest';
import { DEFAULT_SETTINGS } from '#lib/settings/settings.ts';
import {
    canonicalQuery,
    cardModule,
    cardPath,
    cardTitle,
    moduleOfPath,
    readScaleCard,
    readViewOptions,
    withViewOption,
    type Card
} from './routes';

function path(card: Card | undefined): string | undefined {
    return card === undefined ? undefined : cardPath(card);
}

function title(card: Card | undefined): string | undefined {
    return card === undefined ? undefined : cardTitle(card);
}

const ROOT_SLUGS = PICKER_ROOTS.flatMap(root => root.spellings).map(note => note.replace('#', 's'));

describe('card paths', () => {
    it('APP-3.1 reads back every card the app writes', () => {
        for (const root of ROOT_SLUGS) {
            for (const scale of SCALE_TYPES) {
                expect(path(readScaleCard(root, scale.id))).toBe(`/scales/${root}/${scale.id}`);
            }
        }
    });

    it('APP-3.4 writes sharps as s, and reads # (a decoded %23) and any case', () => {
        expect(path(readScaleCard('F#', 'major'))).toBe('/scales/Fs/major');
        expect(path(readScaleCard('fs', 'major'))).toBe('/scales/Fs/major');
        expect(path(readScaleCard('F♯', 'major'))).toBe('/scales/Fs/major');
        expect(path(readScaleCard('ess', 'lydian'))).toBe('/scales/Ess/lydian');
    });

    it('THY-2.5 opens a root reached by a link as written, even one no picker offers', () => {
        expect(path(readScaleCard('As', 'dorian'))).toBe('/scales/As/dorian');
        expect(path(readScaleCard('Es', 'major'))).toBe('/scales/Es/major');
    });

    it('MODE-1.7 gives each mode one card, its scale card', () => {
        expect(readScaleCard('G', 'dorian')).toMatchObject({ kind: 'scale', scale: { id: 'dorian' } });
        expect(path(readScaleCard('G', 'ionian'))).toBe('/scales/G/ionian');
    });

    it("APP-3.5 reads nothing for a root or scale it doesn't know", () => {
        expect(readScaleCard('H', 'major')).toBeUndefined();
        expect(readScaleCard('G', 'bebop')).toBeUndefined();
        expect(readScaleCard('E2', 'major')).toBeUndefined();
        expect(readScaleCard('Fsss', 'major')).toBeUndefined();
        expect(readScaleCard('', 'major')).toBeUndefined();
    });
});

describe('cardTitle', () => {
    it('APP-3.6 names the card', () => {
        expect(title(readScaleCard('G', 'harmonic-minor'))).toBe('G harmonic minor');
        expect(title(readScaleCard('Fs', 'major'))).toBe('F♯ major');
        expect(title(readScaleCard('Bb', 'phrygian-dominant'))).toBe('B♭ Phrygian dominant');
        expect(title(readScaleCard('D', 'dorian'))).toBe('D Dorian');
    });
});

describe('modules', () => {
    it("APP-1.3 and APP-3.5 know each card's list", () => {
        expect(cardModule('scale')).toBe('/scales');
        expect(moduleOfPath('/scales/H/major')?.name).toBe('Scales');
        expect(moduleOfPath('/intervals/b3')).toBeUndefined();
        expect(moduleOfPath('/chords/A/m7')).toBeUndefined();
        expect(moduleOfPath('/nowhere')).toBeUndefined();
    });
});

describe('view options', () => {
    const options = (kind: Parameters<typeof readViewOptions>[0], query: string) =>
        readViewOptions(kind, new URLSearchParams(query));

    it('APP-3.1 reads the options each card takes', () => {
        expect(options('scale', 'pos=3&labels=notes')).toEqual({ pos: 3, labels: 'notes' });
        expect(options('scale', 'nps=7')).toEqual({ nps: 7 });
        expect(options('scale', 'pos=5&nps=2')).toEqual({ pos: 5 });
    });

    it("ignores options the card doesn't take or can't read", () => {
        expect(options('scale', 'pos=6&nps=0&labels=frets&compare=dorian')).toEqual({});
        expect(options('scale', 'pos=2&nps=3')).toEqual({ pos: 2 });
    });
});

describe('canonicalQuery', () => {
    const canonical = (kind: Parameters<typeof canonicalQuery>[0], query: string) =>
        canonicalQuery(kind, new URLSearchParams(query), DEFAULT_SETTINGS);

    it('drops what it cannot read and writes the rest in order', () => {
        expect(canonical('scale', 'capo=2&labels=notes&utm=x&pos=9&nps=2')).toBe('?nps=2&labels=notes&capo=2');
        expect(canonical(undefined, 'pos=2&tuning=drop-d')).toBe('?inst=guitar&tuning=drop-d');
        expect(canonical('scale', 'compare=dorian')).toBe('');
    });

    it('keeps a query it wrote as it is', () => {
        for (const query of ['?pos=2&labels=degrees&inst=bass&tuning=drop-d&capo=0', '']) {
            expect(canonical('scale', query)).toBe(query);
        }
    });
});

describe('withViewOption', () => {
    const query = (text: string) => new URLSearchParams(text);

    it('APP-3.2 changes one option and writes the query in order, before the override', () => {
        expect(withViewOption('scale', query('inst=bass&capo=2'), DEFAULT_SETTINGS, 'labels', 'notes')).toBe(
            '?labels=notes&inst=bass&capo=2'
        );
        expect(withViewOption('scale', query('labels=notes&pos=1'), DEFAULT_SETTINGS, 'labels', undefined)).toBe(
            '?pos=1'
        );
    });

    it('keeps one of a position and a 3-notes-per-string pattern, the one just chosen', () => {
        expect(withViewOption('scale', query('pos=2&labels=notes'), DEFAULT_SETTINGS, 'nps', 3)).toBe(
            '?nps=3&labels=notes'
        );
        expect(withViewOption('scale', query('nps=3'), DEFAULT_SETTINGS, 'pos', 1)).toBe('?pos=1');
        expect(withViewOption('scale', query('nps=3'), DEFAULT_SETTINGS, 'pos', undefined)).toBe('?nps=3');
    });
});
