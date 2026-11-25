import {
    mapScale,
    noteSet,
    scaleType,
    spellScale,
    type FretboardCell,
    type FretRange,
    type NoteName
} from '@fretdex/fretkit';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { cleanup, render } from 'vitest-browser-svelte';
import type { TappedFret } from '#lib/diagrams/fretboard.ts';
import Fretboard from './Fretboard.svelte';
import FretboardMini from './FretboardMini.svelte';

const STANDARD = ['E2', 'A2', 'D3', 'G3', 'B3', 'E4'];
const DADGAD = ['D2', 'A2', 'D3', 'G3', 'A3', 'D4'];
const BASS = ['E1', 'A1', 'D2', 'G2'];
const WIDE = 1200;
const UPRIGHT = 390;

function scale(root: string, id: string) {
    const type = scaleType(id);
    if (!type) throw new Error(`No scale ${id}`);
    return spellScale(root, type);
}

interface Options {
    tuning?: readonly NoteName[];
    set?: ReturnType<typeof scale>;
    range?: FretRange;
    capo?: number;
    handedness?: 'right' | 'left';
    labels?: 'notes' | 'intervals' | 'degrees' | 'none';
    width?: number;
    ontap?: (tapped: TappedFret) => void;
}

async function show(options: Options = {}) {
    cleanup();
    await page.viewport(options.width ?? WIDE, 800);
    await render(Fretboard, {
        tuning: options.tuning ?? STANDARD,
        set: options.set ?? scale('C', 'major'),
        range: options.range ?? { from: 0, to: 15 },
        capo: options.capo ?? 0,
        labels: options.labels ?? 'notes',
        handedness: options.handedness ?? 'right',
        title: 'C major on guitar',
        ...(options.ontap ? { ontap: options.ontap } : {})
    });
}

function dots(): SVGGElement[] {
    return Array.from(document.querySelectorAll<SVGGElement>('.dot'));
}

/** The dots drawn, as `string:fret:note`, in `mapScale`'s order. */
function drawn(): string[] {
    return dots().map(dot => `${dot.dataset.string ?? ''}:${dot.dataset.fret ?? ''}:${dot.dataset.note ?? ''}`);
}

function centreX(element: Element | null | undefined): number {
    const box = element?.getBoundingClientRect();
    return box ? box.left + box.width / 2 : NaN;
}

function dot(string: number, fret: number): SVGGElement | null {
    return document.querySelector(`.dot[data-string="${String(string)}"][data-fret="${String(fret)}"]`);
}

afterEach(async () => {
    await page.viewport(414, 896);
});

describe('Fretboard', () => {
    it('DIAG-1.1 and DIAG-1.2 draw exactly the notes fretkit maps, on any tuning', async () => {
        const cases: [readonly NoteName[], ReturnType<typeof scale>][] = [
            [STANDARD, scale('F#', 'major')],
            [DADGAD, scale('D', 'mixolydian')],
            [BASS, scale('Eb', 'minor-pentatonic')],
            [['B1', ...STANDARD], scale('A', 'harmonic-minor')]
        ];
        for (const [tuning, set] of cases) {
            await show({ tuning, set });
            const expected = mapScale(tuning, set, { from: 0, to: 15 }).map(
                cell => `${String(cell.string)}:${String(cell.fret)}:${cell.note}`
            );
            expect(drawn()).toEqual(expected);
            expect(document.querySelectorAll('.string')).toHaveLength(tuning.length);
        }
    });

    it('DIAG-1.1 draws the nut and the inlays, with two at 12', async () => {
        await show();

        expect(document.querySelector('.nut')).not.toBeNull();
        // 3, 5, 7, 9, 15 and the pair at 12.
        expect(document.querySelectorAll('.inlay')).toHaveLength(7);

        await show({ range: { from: 5, to: 12 } });
        expect(document.querySelector('.nut')).toBeNull();
    });

    it('DIAG-1.2 and DIAG-1.7 draw the root as a square and other notes as circles', async () => {
        await show({ set: scale('G', 'major') });

        for (const element of dots()) {
            const root = element.dataset.note?.startsWith('G') === true && !element.dataset.note.startsWith('G#');
            expect(element.querySelector(root ? 'rect' : 'circle')).not.toBeNull();
        }
        expect(dot(6, 3)?.classList.contains('root')).toBe(true);
    });

    it('CTX-1.5 labels the dots as the labels setting says', async () => {
        await show({ labels: 'intervals', set: scale('A', 'natural-minor'), range: { from: 0, to: 5 } });
        expect(dot(6, 5)?.textContent).toBe('1');
        expect(dot(6, 3)?.textContent).toBe('♭7');

        await show({ labels: 'degrees', set: scale('A', 'natural-minor'), range: { from: 0, to: 5 } });
        expect(dot(6, 3)?.textContent).toBe('7');

        await show({ labels: 'none', range: { from: 0, to: 5 } });
        expect(dot(6, 0)?.textContent).toBe('');
    });

    it('DIAG-1.3 dims a subset without hiding it, and DIAG-1.7 outlines notes outside a chord', async () => {
        cleanup();
        await page.viewport(WIDE, 800);
        await render(Fretboard, {
            tuning: STANDARD,
            set: scale('C', 'major'),
            range: { from: 0, to: 5 },
            labels: 'notes',
            handedness: 'right',
            title: 'C major',
            dimmed: (cell: FretboardCell) => cell.fret > 3,
            outlined: (cell: FretboardCell) => ![1, 3, 5].includes(cell.degree)
        });

        const dimmed = dot(6, 5);
        expect(dimmed?.classList.contains('dim')).toBe(true);
        expect(getComputedStyle(dimmed as Element).opacity).toBe('0.3');
        expect(dot(6, 3)?.classList.contains('ring')).toBe(false); // G, the 5th
        expect(dot(6, 1)?.classList.contains('ring')).toBe(true); // F, the 4th
        expect(dot(5, 3)?.classList.contains('ring')).toBe(false); // C, the root, never outlined
    });

    it('DIAG-1.4 numbers the inlay frets, and the first fret away from the nut', async () => {
        await show({ range: { from: 4, to: 10 } });

        const numbers = Array.from(document.querySelectorAll('.number'), text => text.textContent);
        expect(numbers).toEqual(['4', '5', '7', '9']);
    });

    it('DIAG-1.5 mirrors the neck when left-handed, keeping labels upright', async () => {
        await show({ handedness: 'left', range: { from: 0, to: 5 } });

        expect(centreX(dot(6, 0))).toBeGreaterThan(centreX(dot(6, 3)));
        expect(centreX(document.querySelector('.nut'))).toBeGreaterThan(centreX(dot(6, 3)));
        expect(document.querySelector('[transform]')).toBeNull();
        expect(drawn()).toEqual(
            mapScale(STANDARD, scale('C', 'major'), { from: 0, to: 5 }).map(
                cell => `${String(cell.string)}:${String(cell.fret)}:${cell.note}`
            )
        );
    });

    it('DIAG-1.6 reports a tapped fret, spelling one outside the set as a lone note', async () => {
        const ontap = vi.fn<(tapped: TappedFret) => void>();
        await show({ range: { from: 0, to: 5 }, ontap });

        await userEvent.click(dot(6, 3) as Element);
        expect(ontap).toHaveBeenLastCalledWith(expect.objectContaining({ string: 6, fret: 3, midi: 43, note: 'G2' }));

        // Fret 2 of the low E string is F#, which isn't in C major: spelled as Auto spells it (THY-2.3).
        const fret1 = centreX(dot(6, 1));
        const fret3 = centreX(dot(6, 3));
        const y = (dot(6, 3) as Element).getBoundingClientRect();
        await userEvent.click(document.querySelector('.fretboard svg') as Element, {
            position: {
                x:
                    (fret1 + fret3) / 2 -
                    (document.querySelector('.fretboard svg') as Element).getBoundingClientRect().left,
                y:
                    y.top +
                    y.height / 2 -
                    (document.querySelector('.fretboard svg') as Element).getBoundingClientRect().top
            }
        });
        expect(ontap).toHaveBeenLastCalledWith({ string: 6, fret: 2, midi: 42, note: 'F#2' });
    });

    it('DIAG-1.8 narrows the frets gently up the neck, never below the tap target', async () => {
        await show();

        const xs = Array.from(document.querySelectorAll('.fret'), line => line.getBoundingClientRect().left);
        const widths = xs.slice(1).map((x, i) => x - (xs[i] ?? 0));
        expect(widths).toHaveLength(14);
        for (const [i, width] of widths.entries()) {
            expect(width).toBeGreaterThanOrEqual(44);
            if (i > 0) expect(width).toBeLessThan(widths[i - 1] ?? 0);
        }
        expect((widths[1] ?? 0) / (widths[0] ?? 1)).toBeCloseTo(0.98, 2);
    });

    it('DIAG-1.9 draws the capo at its fret, with the frets below it dimmed and empty', async () => {
        await show({ capo: 2, set: scale('A', 'major'), range: { from: 0, to: 7 } });

        expect(document.querySelector('.capo')?.getAttribute('data-capo')).toBe('2');
        expect(document.querySelector('.below-capo')).not.toBeNull();
        expect(Math.min(...dots().map(element => Number(element.dataset.fret)))).toBe(2);
        expect(drawn()).toEqual(
            mapScale(STANDARD, scale('A', 'major'), { from: 0, to: 7 }, 2).map(
                cell => `${String(cell.string)}:${String(cell.fret)}:${cell.note}`
            )
        );
    });

    it('DIAG-1.10 shows the whole range when it fits, and a stretch of at most six frets upright', async () => {
        await show({ width: WIDE });
        expect(page.getByRole('button', { name: /Higher/u }).query()).toBeNull();
        expect(document.querySelector('.fretboard svg')?.getAttribute('data-frets')).toBe('0-15');

        await show({ width: UPRIGHT });
        const frets = () => document.querySelector('.fretboard svg')?.getAttribute('data-frets');
        expect(frets()).toBe('0-6');
        await expect.element(page.getByRole('button', { name: /Lower/u })).toBeDisabled();
        expect(document.querySelector('.strip')).not.toBeNull();
        expect(document.querySelectorAll('.strip .root').length).toBe(
            mapScale(STANDARD, scale('C', 'major'), { from: 0, to: 15 }).filter(cell => cell.degree === 1).length
        );

        await page.getByRole('button', { name: /Higher/u }).click();
        expect(frets()).toBe('7-12');
        for (const element of dots()) expect(Number(element.dataset.fret)).toBeGreaterThanOrEqual(7);
        await page.getByRole('button', { name: /Higher/u }).click();
        expect(frets()).toBe('10-15');
        await expect.element(page.getByRole('button', { name: /Higher/u })).toBeDisabled();
        await page.getByRole('button', { name: /Lower/u }).click();
        expect(frets()).toBe('7-12');
    });

    it('DIAG-1.10 moves to where the strip is tapped', async () => {
        await show({ width: UPRIGHT });

        const strip = document.querySelector('.strip') as Element;
        const box = strip.getBoundingClientRect();
        await userEvent.click(strip, { position: { x: box.width - 14, y: box.height / 2 } });
        expect(document.querySelector('.fretboard svg')?.getAttribute('data-frets')).toBe('10-15');
    });

    it('DIAG-1.10 starts upright at the capo', async () => {
        await show({ width: UPRIGHT, capo: 9, set: scale('A', 'major') });

        expect(document.querySelector('.fretboard svg')?.getAttribute('data-frets')).toBe('7-12');
    });

    it('APP-6.4 has a text alternative listing every string', async () => {
        await show({ range: { from: 0, to: 3 } });

        const caption = document.querySelector('figcaption')?.textContent ?? '';
        expect(caption).toContain('C major on guitar.');
        expect(caption).toContain('String 6, E: open E, 1 F, 3 G.');
        expect(caption).toContain('String 5, A: open A, 2 B, 3 C (root).');
    });
});

describe('FretboardMini', () => {
    it('DIAG-5.1 draws dots without labels at 150 wide, the root marked', async () => {
        cleanup();
        await render(FretboardMini, {
            tuning: STANDARD,
            set: noteSet('A', ['1P', '3m', '5P']),
            range: { from: 5, to: 8 },
            handedness: 'right',
            title: 'A minor arpeggio'
        });

        const svg = page.getByRole('img', { name: 'A minor arpeggio' });
        await expect.element(svg).toBeVisible();
        expect(svg.element().getBoundingClientRect().width).toBe(150);
        expect(svg.element().querySelectorAll('text')).toHaveLength(0);
        const cells = mapScale(STANDARD, noteSet('A', ['1P', '3m', '5P']), { from: 5, to: 8 });
        expect(svg.element().querySelectorAll('.root')).toHaveLength(cells.filter(cell => cell.degree === 1).length);
        expect(svg.element().querySelectorAll('.note')).toHaveLength(cells.filter(cell => cell.degree !== 1).length);
    });
});
