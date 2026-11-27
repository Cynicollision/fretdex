import {
    mapScale,
    noteSet,
    scalePositions,
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
    focus?: { from: number; to: number; cells: readonly { string: number; fret: number }[] };
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
        ...(options.focus ? { focus: options.focus } : {}),
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

    it('DIAG-1.1 draws the lowest string thickest, at the bottom', async () => {
        await show();

        const strings = Array.from(document.querySelectorAll('.string'), line => ({
            y: Number(line.getAttribute('y1')),
            width: Number(line.getAttribute('stroke-width'))
        })).sort((a, b) => a.y - b.y);
        const widths = strings.map(string => string.width);
        expect(widths).toEqual([...widths].sort((a, b) => a - b));
        expect(widths[0]).toBeLessThan(widths[5] ?? 0);
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

        // Degrees count the scale's notes from the root: the blues scale's b5 is its 4th note, its 5 the 5th.
        await show({ labels: 'degrees', set: scale('A', 'minor-blues'), range: { from: 5, to: 8 } });
        expect([dot(5, 6)?.textContent, dot(5, 7)?.textContent, dot(6, 8)?.textContent]).toEqual(['4', '5', '2']);

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

    it('AUD-3.2 lights the playing note, even where it is dimmed, leaving the rest as they are', async () => {
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
            playing: { string: 6, fret: 5 }
        });

        const lit = dot(6, 5);
        expect(lit?.classList.contains('playing')).toBe(true);
        expect(lit?.classList.contains('dim')).toBe(false);
        expect(lit?.querySelector('circle.halo')).not.toBeNull();
        expect(document.querySelectorAll('.dot.playing')).toHaveLength(1);
        expect(dot(5, 5)?.classList.contains('dim')).toBe(true);
    });

    it('SCL-5.1 rings a mode’s characteristic note, dimming nothing', async () => {
        cleanup();
        await page.viewport(WIDE, 800);
        await render(Fretboard, {
            tuning: STANDARD,
            set: scale('D', 'dorian'),
            range: { from: 0, to: 5 },
            labels: 'notes',
            handedness: 'right',
            title: 'D Dorian',
            marked: (cell: FretboardCell) => cell.code === '6M'
        });

        const ringed = dots().filter(dot => dot.classList.contains('marked'));
        expect(ringed.map(dot => dot.dataset['note'])).toEqual(['B3', 'B3', 'B2']);
        expect(ringed.every(dot => dot.querySelector('.mark') !== null)).toBe(true);
        expect(dots().some(dot => dot.classList.contains('dim'))).toBe(false);
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

        // A fret at a time, the open strings leaving with fret 1.
        await page.getByRole('button', { name: /Higher/u }).click();
        expect(frets()).toBe('2-7');
        for (const element of dots()) expect(Number(element.dataset.fret)).toBeGreaterThanOrEqual(2);
        for (let i = 0; i < 8; i++) await page.getByRole('button', { name: /Higher/u }).click();
        expect(frets()).toBe('10-15');
        await expect.element(page.getByRole('button', { name: /Higher/u })).toBeDisabled();
        await page.getByRole('button', { name: /Lower/u }).click();
        expect(frets()).toBe('9-14');
    });

    it('DIAG-1.3 and DIAG-1.10 show a position at full strength, the rest dimmed, upright its frets alone', async () => {
        const set = scale('G', 'major');
        const caged = scalePositions(STANDARD, set, 'guitar').find(group => group.kind === 'caged');
        const position = caged?.positions[1];
        if (!position) throw new Error('No position');
        await show({ set, focus: position });
        expect(document.querySelector('.fretboard svg')?.getAttribute('data-frets')).toBe('0-15');
        expect(dot(6, 3)?.classList.contains('dim')).toBe(false);
        expect(dot(6, 7)?.classList.contains('dim')).toBe(true);
        // B on the G string's 4th fret belongs to the E shape, the open B to the G shape.
        expect(dot(3, 4)?.classList.contains('dim')).toBe(false);
        expect(dot(2, 0)?.classList.contains('dim')).toBe(true);

        // The text alternative lists the position's notes alone (APP-6.4).
        const caption = document.querySelector('figcaption')?.textContent ?? '';
        expect(caption).toContain('3 G');
        expect(caption).not.toContain('7 B');

        await show({ width: UPRIGHT, set, focus: position });
        expect(document.querySelector('.fretboard svg')?.getAttribute('data-frets')).toBe('2-5');
        await expect.element(page.getByRole('button', { name: /Lower/u })).not.toBeInTheDocument();
    });

    it('DIAG-1.10 shows the whole of a position past the fret range, and steps along one too wide upright', async () => {
        const set = scale('G', 'major');
        const caged = scalePositions(STANDARD, set, 'guitar').find(group => group.kind === 'caged');
        const top = caged?.positions[4];
        if (!top) throw new Error('No position');
        await show({ set, range: { from: 0, to: 12 }, focus: top });
        expect(document.querySelector('.fretboard svg')?.getAttribute('data-frets')).toBe('0-13');
        expect(dot(2, 13)).not.toBeNull();

        const bass = scalePositions(BASS, set, 'bass').find(group => group.kind === 'two-octaves')?.positions[0];
        if (!bass) throw new Error('No box');
        await show({ width: UPRIGHT, tuning: BASS, set, focus: bass });
        const frets = () => document.querySelector('.fretboard svg')?.getAttribute('data-frets');
        expect(frets()).toBe('2-7');
        await page.getByRole('button', { name: /Higher/u }).click();
        expect(frets()).toBe('3-8');
        for (let i = 0; i < 4; i++) await page.getByRole('button', { name: /Higher/u }).click();
        expect(frets()).toBe('7-12');
        await expect.element(page.getByRole('button', { name: /Higher/u })).toBeDisabled();
    });

    /** Where fret `fret`'s slot is on the strip of frets 0 to 15, from its left edge. */
    function stripX(strip: Element, fret: number): number {
        const box = strip.getBoundingClientRect();
        const pad = (12 * box.width) / Number(strip.getAttribute('width'));
        return pad + ((fret + 0.5) * (box.width - 2 * pad)) / 16;
    }

    it('DIAG-1.10 centres the stretch on a fret tapped on the strip', async () => {
        await show({ width: UPRIGHT });
        const frets = () => document.querySelector('.fretboard svg')?.getAttribute('data-frets');

        const strip = document.querySelector('.strip') as Element;
        const y = strip.getBoundingClientRect().height / 2;
        await userEvent.click(strip, { position: { x: stripX(strip, 8), y } });
        expect(frets()).toBe('6-11');
        // Near either end, the stretch stops at the end of the neck.
        await userEvent.click(strip, { position: { x: stripX(strip, 15), y } });
        expect(frets()).toBe('10-15');
        await userEvent.click(strip, { position: { x: stripX(strip, 1), y } });
        expect(frets()).toBe('0-6');
    });

    it('DIAG-1.10 slides the stretch along with a drag on the strip', async () => {
        await show({ width: UPRIGHT });
        const frets = () => document.querySelector('.fretboard svg')?.getAttribute('data-frets');

        const strip = document.querySelector('.strip') as Element;
        const box = strip.getBoundingClientRect();
        const at = (type: string, fret: number) =>
            strip.dispatchEvent(
                new PointerEvent(type, {
                    bubbles: true,
                    pointerId: 1,
                    pointerType: 'mouse',
                    button: type === 'pointermove' ? -1 : 0,
                    buttons: type === 'pointerup' ? 0 : 1,
                    clientX: box.left + stripX(strip, fret),
                    clientY: box.top + box.height / 2
                })
            );
        at('pointerdown', 4);
        await expect.poll(frets).toBe('2-7');
        at('pointermove', 7);
        await expect.poll(frets).toBe('5-10');
        at('pointermove', 9);
        await expect.poll(frets).toBe('7-12');
        at('pointerup', 9);
        // Once the pointer lifts, moving over the strip no longer slides it.
        at('pointermove', 3);
        await expect.poll(frets).toBe('7-12');
    });

    it('DIAG-1.10 goes back to the capo when the capo changes after moving along the neck', async () => {
        cleanup();
        await page.viewport(UPRIGHT, 800);
        const view = await render(Fretboard, {
            tuning: STANDARD,
            set: scale('A', 'major'),
            range: { from: 0, to: 15 },
            capo: 0,
            labels: 'notes',
            handedness: 'right',
            title: 'A major'
        });
        const frets = () => document.querySelector('.fretboard svg')?.getAttribute('data-frets');

        await page.getByRole('button', { name: /Higher/u }).click();
        await page.getByRole('button', { name: /Lower/u }).click();
        expect(frets()).toBe('0-6');
        await view.rerender({ capo: 9 });
        await expect.poll(frets).toBe('9-14');
    });

    it('DIAG-1.10 starts upright at the capo', async () => {
        await show({ width: UPRIGHT, capo: 9, set: scale('A', 'major') });

        expect(document.querySelector('.fretboard svg')?.getAttribute('data-frets')).toBe('9-14');
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
            title: 'A minor triad'
        });

        const svg = page.getByRole('img', { name: 'A minor triad' });
        await expect.element(svg).toBeVisible();
        expect(svg.element().getBoundingClientRect().width).toBe(150);
        expect(svg.element().querySelectorAll('text')).toHaveLength(0);
        const cells = mapScale(STANDARD, noteSet('A', ['1P', '3m', '5P']), { from: 5, to: 8 });
        expect(svg.element().querySelectorAll('.root')).toHaveLength(cells.filter(cell => cell.degree === 1).length);
        expect(svg.element().querySelectorAll('.note')).toHaveLength(cells.filter(cell => cell.degree !== 1).length);
    });

    it("DIAG-5.1 draws only a position's notes when given them", async () => {
        cleanup();
        const set = noteSet('A', ['1P', '3m', '5P']);
        const cells = mapScale(STANDARD, set, { from: 5, to: 8 }).filter(cell => cell.string >= 5);
        await render(FretboardMini, {
            tuning: STANDARD,
            set,
            range: { from: 5, to: 8 },
            cells,
            handedness: 'right',
            title: 'A minor triad on the low strings'
        });

        const svg = page.getByRole('img', { name: 'A minor triad on the low strings' }).element();
        expect(svg.querySelectorAll('.root, .note')).toHaveLength(cells.length);
    });
});
