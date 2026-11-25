import { ARPEGGIO_TYPES, INTERVALS, PICKER_ROOTS, SCALE_TYPES, intervalSlug } from '@fretdex/fretkit';
import { describe, expect, it } from 'vitest';
import { DEFAULT_SETTINGS } from '#lib/settings/settings.ts';
import {
    canonicalQuery,
    cardModule,
    cardPath,
    cardTitle,
    moduleOfPath,
    readArpeggioCard,
    readIntervalCard,
    readModeCard,
    readNoteCard,
    readScaleCard,
    readViewOptions,
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
                const base = scale.group === 'modes' ? 'modes' : 'scales';
                const read = base === 'modes' ? readModeCard : readScaleCard;
                expect(path(read(root, scale.id))).toBe(`/${base}/${root}/${scale.id}`);
            }
            for (const quality of ARPEGGIO_TYPES) {
                expect(path(readArpeggioCard(root, quality.id))).toBe(`/arpeggios/${root}/${quality.id}`);
            }
            expect(path(readNoteCard(root))).toBe(`/notes/${root}`);
        }
        for (const interval of INTERVALS) {
            const slug = intervalSlug(interval.code);
            expect(readIntervalCard(slug)).toEqual({ kind: 'interval', interval });
            expect(path(readIntervalCard(slug))).toBe(`/intervals/${slug}`);
        }
    });

    it('APP-3.4 writes sharps as s, and reads # (a decoded %23) and any case', () => {
        expect(path(readScaleCard('F#', 'major'))).toBe('/scales/Fs/major');
        expect(path(readScaleCard('fs', 'major'))).toBe('/scales/Fs/major');
        expect(path(readScaleCard('F♯', 'major'))).toBe('/scales/Fs/major');
        expect(path(readNoteCard('Ess'))).toBe('/notes/Ess');
        expect(path(readIntervalCard('#4'))).toBe('/intervals/s4');
    });

    it('THY-2.5 opens a root reached by a link as written, even one no picker offers', () => {
        expect(path(readModeCard('As', 'dorian'))).toBe('/modes/As/dorian');
        expect(path(readScaleCard('Es', 'major'))).toBe('/scales/Es/major');
    });

    it('MODE-1.7 reads a mode under Scales as its card under Modes', () => {
        expect(path(readScaleCard('G', 'dorian'))).toBe('/modes/G/dorian');
        expect(path(readScaleCard('G', 'ionian'))).toBe('/modes/G/ionian');
        expect(path(readScaleCard('G', 'major'))).toBe('/scales/G/major');
    });

    it("APP-3.5 reads nothing for a root, scale, quality, interval or note it doesn't know", () => {
        expect(readScaleCard('H', 'major')).toBeUndefined();
        expect(readScaleCard('G', 'bebop')).toBeUndefined();
        expect(readScaleCard('E2', 'major')).toBeUndefined();
        expect(readScaleCard('Fsss', 'major')).toBeUndefined();
        expect(readModeCard('G', 'major')).toBeUndefined();
        expect(readArpeggioCard('A', 'm7b9')).toBeUndefined();
        expect(readIntervalCard('3m')).toBeUndefined();
        expect(readNoteCard('Gb4')).toBeUndefined();
        expect(readNoteCard('')).toBeUndefined();
    });
});

describe('cardTitle', () => {
    it('APP-3.6 names the card', () => {
        expect(title(readScaleCard('G', 'harmonic-minor'))).toBe('G harmonic minor');
        expect(title(readScaleCard('Fs', 'major'))).toBe('F♯ major');
        expect(title(readScaleCard('Bb', 'phrygian-dominant'))).toBe('B♭ Phrygian dominant');
        expect(title(readModeCard('D', 'dorian'))).toBe('D Dorian');
        expect(title(readArpeggioCard('A', 'm7b5'))).toBe('A m7♭5');
        expect(title(readArpeggioCard('C', 'major'))).toBe('C major');
        expect(title(readIntervalCard('b3'))).toBe('♭3 minor third');
        expect(title(readNoteCard('Fs'))).toBe('F♯');
    });
});

describe('modules', () => {
    it("APP-1.3 and APP-3.5 know each card's list", () => {
        expect(cardModule('note')).toBe('/intervals');
        expect(moduleOfPath('/scales/H/major')?.name).toBe('Scales');
        expect(moduleOfPath('/notes/H')?.name).toBe('Intervals');
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
        expect(options('mode', 'compare=aeolian')).toEqual({ compare: 'aeolian' });
        expect(options('arpeggio', 'pos=5&nps=2')).toEqual({ pos: 5 });
    });

    it("ignores options the card doesn't take or can't read", () => {
        expect(options('scale', 'pos=6&nps=0&labels=frets&compare=dorian')).toEqual({});
        expect(options('scale', 'pos=2&nps=3')).toEqual({ pos: 2 });
        expect(options('mode', 'compare=major')).toEqual({});
        expect(options('interval', 'pos=1&labels=notes')).toEqual({});
    });
});

describe('canonicalQuery', () => {
    const canonical = (kind: Parameters<typeof canonicalQuery>[0], query: string) =>
        canonicalQuery(kind, new URLSearchParams(query), DEFAULT_SETTINGS);

    it('drops what it cannot read and writes the rest in order', () => {
        expect(canonical('scale', 'capo=2&labels=notes&utm=x&pos=9&nps=2')).toBe('?nps=2&labels=notes&capo=2');
        expect(canonical(undefined, 'pos=2&tuning=drop-d')).toBe('?inst=guitar&tuning=drop-d');
        expect(canonical('note', 'labels=notes')).toBe('');
    });

    it('keeps a query it wrote as it is', () => {
        for (const query of ['?pos=2&labels=degrees&inst=bass&tuning=drop-d&capo=0', '?compare=dorian', '']) {
            expect(canonical('mode', query)).toBe(query);
        }
    });
});
