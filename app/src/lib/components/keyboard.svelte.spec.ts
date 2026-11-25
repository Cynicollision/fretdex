import { mapKeyboard, noteSet, pitchClass } from '@fretdex/fretkit';
import { describe, expect, it, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { cleanup, render } from 'vitest-browser-svelte';
import { KEYBOARD_FROM, KEYBOARD_TO } from '#lib/diagrams/keyboard.ts';
import Keyboard from './Keyboard.svelte';

const C_MAJOR_7 = noteSet('C', ['1P', '3M', '5P', '7M']);

function marked(): number[] {
    return Array.from(document.querySelectorAll<SVGGElement>('.key[data-marked]'), key => Number(key.dataset.midi));
}

describe('Keyboard', () => {
    it('DIAG-3.1 marks the notes fretkit maps on two octaves from C, the root a square', async () => {
        cleanup();
        const set = noteSet('Eb', ['1P', '3m', '5P']);
        await render(Keyboard, { set, labels: 'notes', title: 'E♭ minor' });

        expect(document.querySelectorAll('.key')).toHaveLength(24);
        expect(marked().sort((a, b) => a - b)).toEqual(mapKeyboard(set, KEYBOARD_FROM, KEYBOARD_TO).map(n => n.midi));
        for (const key of document.querySelectorAll<SVGGElement>('.key[data-marked]')) {
            const root = pitchClass(Number(key.dataset.midi)) === 3;
            expect(key.querySelector(root ? 'rect.mark.root' : 'circle.mark')).not.toBeNull();
        }
        // Small in a card: no labels.
        expect(document.querySelectorAll('.label')).toHaveLength(0);
        expect(document.querySelector('figcaption')?.textContent).toBe(
            'E♭ minor on a keyboard: E♭, G♭, B♭; the root E♭.'
        );
    });

    it('DIAG-3.1 enlarges to full width with labels when tapped', async () => {
        cleanup();
        await render(Keyboard, { set: C_MAJOR_7, labels: 'notes', title: 'C major seventh' });
        const small = (document.querySelector('.keyboard svg') as Element).getBoundingClientRect().width;

        await page.getByRole('button', { name: 'Enlarge the keyboard' }).click();

        const figure = document.querySelector('.keyboard') as Element;
        const large = (figure.querySelector('svg') as Element).getBoundingClientRect().width;
        expect(large).toBeGreaterThan(small);
        expect(large).toBeCloseTo(figure.getBoundingClientRect().width, 0);
        expect(Array.from(document.querySelectorAll('.label'), label => label.textContent)).toEqual([
            'C',
            'E',
            'G',
            'B',
            'C',
            'E',
            'G',
            'B'
        ]);

        await page.getByRole('button', { name: 'Smaller keyboard' }).click();
        expect(document.querySelectorAll('.label')).toHaveLength(0);
    });

    it('DIAG-3.2 reports a key tapped on the enlarged keyboard', async () => {
        cleanup();
        const ontap = vi.fn();
        await render(Keyboard, { set: C_MAJOR_7, labels: 'notes', title: 'C major seventh', enlarged: true, ontap });

        await userEvent.click(document.querySelector('.key[data-midi="52"] rect') as Element);
        expect(ontap).toHaveBeenCalledWith(52, expect.objectContaining({ note: 'E3', degree: 2 }));

        await userEvent.click(document.querySelector('.key[data-midi="49"] rect') as Element);
        expect(ontap).toHaveBeenLastCalledWith(49, undefined);
    });
});
