import { TUNINGS } from '@fretdex/fretkit';
import { describe, expect, it } from 'vitest';
import { DEFAULT_SETTINGS, type Settings } from '#lib/settings/settings.ts';
import { NO_CUSTOM_TUNINGS } from '#lib/settings/tunings.ts';
import { readScaleCard, type Card } from '#lib/url/routes.ts';
import { MAX_PIN_LABEL, pinIdentity, pinTarget, pinTile, readPinBoard, type Pinnable } from './pins';

function scale(root: string, type: string): Pinnable {
    const card: Card | undefined = readScaleCard(root, type);
    if (!card) throw new Error(`No card ${root} ${type}`);
    return { kind: 'card', card };
}

const query = (text: string) => new URLSearchParams(text);
const bass: Settings = { ...DEFAULT_SETTINGS, instrument: 'bass', tuning: TUNINGS.bass[0]?.strings ?? [] };

describe('the pins record', () => {
    it('PIN-6.1 keeps each pin with an id, a URL on this site and a label, in order', () => {
        const board = readPinBoard({
            pins: [
                { id: 'a', url: '/scales/G/major?pos=2', label: '  G major  ' },
                { id: 'b', url: 'https://example.com/', label: 'Elsewhere' },
                { id: 'c', url: '//example.com/scales', label: 'Elsewhere too' },
                { id: 'f', url: '/\\example.com/scales', label: 'Elsewhere by a backslash' },
                { id: 'g', url: '/\t/example.com/scales', label: 'Elsewhere by a tab' },
                { id: 'h', url: '/scales\n', label: 'A newline' },
                { id: 'a', url: '/scales/D/dorian', label: 'Same id' },
                { id: 'd', url: '/scales/D/dorian', label: '   ' },
                { id: 'e', url: '/tuner', label: 'From a newer version' },
                'nonsense'
            ]
        });

        expect(board.pins).toEqual([
            { id: 'a', url: '/scales/G/major?pos=2', label: 'G major' },
            { id: 'e', url: '/tuner', label: 'From a newer version' }
        ]);
    });

    it('PIN-6.1 reads nothing stored, or nothing readable, as no pins', () => {
        expect(readPinBoard(undefined).pins).toEqual([]);
        expect(readPinBoard({ pins: 'all of them' }).pins).toEqual([]);
    });

    it('PIN-1.3 cuts a long label', () => {
        const board = readPinBoard({ pins: [{ id: 'a', url: '/scales', label: 'x'.repeat(100) }] });
        expect(board.pins[0]?.label).toHaveLength(MAX_PIN_LABEL);
    });
});

describe('pinning a view', () => {
    it("PIN-1.1 saves a card's URL with its options, and its title as the label", () => {
        expect(pinTarget(scale('G', 'major'), query('pos=2&labels=notes'), DEFAULT_SETTINGS)).toEqual({
            url: '/scales/G/major?pos=2&labels=notes',
            label: 'G major'
        });
    });

    it('PIN-1.1 writes the URL as the app does, dropping what it cannot read', () => {
        expect(pinTarget(scale('Fs', 'dorian'), query('nps=9&deg=31&box=2'), DEFAULT_SETTINGS).url).toBe(
            '/scales/Fs/dorian?box=2'
        );
    });

    it("PIN-1.4 keeps the URL's instrument, tuning and capo", () => {
        expect(pinTarget(scale('D', 'major'), query('tuning=drop-d&capo=2'), DEFAULT_SETTINGS).url).toBe(
            '/scales/D/major?inst=guitar&tuning=drop-d&capo=2'
        );
    });

    it("PIN-1.4 adds the settings' instrument, tuning and capo when they aren't the defaults", () => {
        expect(pinTarget(scale('G', 'major'), query(''), DEFAULT_SETTINGS).url).toBe('/scales/G/major');
        expect(pinTarget(scale('G', 'major'), query('box=1'), bass).url).toBe('/scales/G/major?box=1&inst=bass');
        expect(pinTarget(scale('G', 'major'), query(''), { ...DEFAULT_SETTINGS, capo: 3 }).url).toBe(
            '/scales/G/major?capo=3'
        );
        const dropD = TUNINGS.guitar.find(tuning => tuning.id === 'drop-d')?.strings ?? [];
        expect(pinTarget(scale('G', 'major'), query(''), { ...DEFAULT_SETTINGS, tuning: dropD }).url).toBe(
            '/scales/G/major?inst=guitar&tuning=drop-d'
        );
    });

    it('PIN-1.1 saves a filtered list with its filter', () => {
        expect(pinTarget({ kind: 'list', list: '/scales', root: 'Eb' }, query('root=Eb'), DEFAULT_SETTINGS)).toEqual({
            url: '/scales?root=Eb',
            label: 'Scales'
        });
    });

    it("PIN-1.2 knows a card's pins by its path, and a list's by its filter, whatever their options", () => {
        expect(pinIdentity('/scales/G/major?pos=2&inst=bass')).toBe('/scales/G/major');
        expect(pinIdentity('/scales?root=Eb&capo=2')).toBe('/scales?root=Eb');
        expect(pinIdentity('/scales?root=D')).not.toBe(pinIdentity('/scales?root=Eb'));
    });
});

describe("a pin's tile", () => {
    it('PIN-2.2 draws a pinned position on its frets, with only its notes', () => {
        const tile = pinTile('/scales/G/major?pos=2', DEFAULT_SETTINGS, NO_CUSTOM_TUNINGS);

        expect(tile.detail).toMatch(/^Position 2 · /u);
        expect(tile.context).toBeUndefined();
        const diagram = tile.diagram;
        if (!diagram) throw new Error('No diagram');
        expect(diagram.cells?.length).toBeGreaterThan(0);
        for (const cell of diagram.cells ?? []) {
            expect(cell.fret).toBeGreaterThanOrEqual(diagram.range.from);
            expect(cell.fret).toBeLessThanOrEqual(diagram.range.to);
        }
    });

    it('PIN-2.2 draws the full neck as an octave from the capo', () => {
        const tile = pinTile('/scales/A/minor-pentatonic?capo=2', DEFAULT_SETTINGS, NO_CUSTOM_TUNINGS);

        expect(tile.detail).toBe('Full neck');
        expect(tile.diagram?.range).toEqual({ from: 2, to: 14 });
        expect(tile.diagram?.cells).toBeUndefined();
    });

    it('PIN-2.2 names the instrument, tuning and capo when they differ from the settings', () => {
        expect(pinTile('/scales/G/major?inst=bass', DEFAULT_SETTINGS, NO_CUSTOM_TUNINGS).context).toBe(
            'Bass · Standard'
        );
        expect(pinTile('/scales/G/major?inst=bass', bass, NO_CUSTOM_TUNINGS).context).toBeUndefined();
        expect(pinTile('/scales/G/major?tuning=drop-d&capo=2', DEFAULT_SETTINGS, NO_CUSTOM_TUNINGS).context).toBe(
            'Guitar · Drop D · Capo 2'
        );
    });

    it("PIN-2.6 shows a pinned list's filter as text, without a diagram", () => {
        expect(pinTile('/scales?root=Eb', DEFAULT_SETTINGS, NO_CUSTOM_TUNINGS)).toEqual({ detail: 'on E♭' });
    });

    it('PIN-2.2 shows only the label for a URL this version cannot read', () => {
        expect(pinTile('/tuner', DEFAULT_SETTINGS, NO_CUSTOM_TUNINGS)).toEqual({});
    });
});
