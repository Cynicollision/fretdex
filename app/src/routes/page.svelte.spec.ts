import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';
import { LONG_PRESS_MS } from '#lib/pins/board-drag.svelte.ts';
import { NO_PINS } from '#lib/pins/pins.ts';
import { pins } from '#lib/pins/store.svelte.ts';
import Page from './+page.svelte';

const board = () =>
    page
        .getByRole('main')
        .getByRole('listitem')
        .filter({ has: page.getByRole('button') });

describe('Home', () => {
    beforeEach(async () => {
        await pins.ready();
        await pins.update(() => NO_PINS);
    });

    afterEach(async () => {
        await pins.update(() => NO_PINS);
    });

    it('names the app', async () => {
        await render(Page);

        await expect.element(page.getByRole('heading', { level: 1 })).toHaveTextContent('Fretdex');
    });

    it('PIN-2.5 says how to pin when nothing is, and links to the modules', async () => {
        await render(Page);

        await expect.element(page.getByText('Nothing pinned yet.', { exact: false })).toBeVisible();
        await expect.element(page.getByRole('link', { name: 'Scales' })).toBeVisible();
        await expect.element(page.getByRole('region', { name: 'Tools' })).toBeVisible();
    });

    it('PIN-2.5 and APP-1.1 show the board alone once something is pinned, the modules being in the menu', async () => {
        await pins.add({ url: '/scales/G/major', label: 'G major' });
        await render(Page);

        await expect.poll(() => board().all()).toHaveLength(1);
        await expect.element(page.getByRole('region', { name: 'Modules' })).not.toBeInTheDocument();
        await expect.element(page.getByRole('region', { name: 'Tools' })).not.toBeInTheDocument();
        await expect.element(page.getByText('Nothing pinned yet.', { exact: false })).not.toBeInTheDocument();

        // Unpinned again, the modules come back.
        await pins.update(() => NO_PINS);
        await expect.element(page.getByRole('region', { name: 'Modules' })).toBeVisible();
    });

    it("PIN-2.1, 2.2 and 2.6 show the pins as tiles in order, a list's as text", async () => {
        await pins.add({ url: '/scales/G/major?pos=2', label: 'G major' });
        await pins.add({ url: '/scales?root=Eb', label: 'Scales' });
        await render(Page);

        await expect.poll(() => board().all()).toHaveLength(2);
        const gMajor = board().nth(0);
        const list = board().nth(1);
        await expect.element(gMajor.getByRole('img')).toBeVisible();
        await expect.element(gMajor.getByRole('link')).toHaveAttribute('href', '/scales/G/major?pos=2');
        expect(list.element().textContent).toMatch(/Scales\s+on E♭/u);
        expect(list.getByRole('img').all()).toHaveLength(0);
    });

    it('PIN-1.3 and PIN-2.3 rename, move and unpin a pin from its menu', async () => {
        await pins.add({ url: '/scales/G/major', label: 'G major' });
        await pins.add({ url: '/scales/D/dorian', label: 'D Dorian' });
        await render(Page);

        await page.getByRole('button', { name: 'D Dorian: rename, group, move or unpin' }).click();
        const menu = page.getByRole('dialog');
        await menu.getByRole('textbox', { name: 'Name' }).fill('Dorian solo');
        await menu.getByRole('button', { name: 'Rename' }).click();
        await menu.getByRole('button', { name: 'Move up' }).click();
        await expect.element(menu.getByRole('button', { name: 'Move up' })).toBeDisabled();
        expect(pins.current.pins.map(pin => pin.label)).toEqual(['Dorian solo', 'G major']);

        await menu.getByRole('button', { name: 'Unpin' }).click();
        await expect.element(page.getByRole('dialog')).not.toBeInTheDocument();
        expect(pins.current.pins.map(pin => pin.label)).toEqual(['G major']);
    });

    it("PIN-1.3 and PIN-2.1 make a group from a pin's menu and show it under its heading", async () => {
        await pins.add({ url: '/scales/G/major', label: 'G major' });
        await pins.add({ url: '/scales/D/dorian', label: 'D Dorian' });
        await render(Page);

        await page.getByRole('button', { name: 'G major: rename, group, move or unpin' }).click();
        const menu = page.getByRole('dialog');
        await menu.getByRole('button', { name: 'New group…' }).click();
        await menu.getByRole('textbox', { name: 'New group' }).fill('Practice');
        await menu.getByRole('button', { name: 'Create' }).click();
        await expect.element(menu.getByRole('radio', { name: 'Practice' })).toBeChecked();

        // A name already taken, in any case, isn't made again.
        await menu.getByRole('button', { name: 'New group…' }).click();
        await menu.getByRole('textbox', { name: 'New group' }).fill('PRACTICE');
        await expect.element(menu.getByRole('button', { name: 'Create' })).toBeDisabled();
        await menu.getByRole('button', { name: 'Done' }).click();

        // Ungrouped pins come first, then the group's under its heading.
        const practice = page.getByRole('region', { name: 'Practice' });
        await expect.element(practice.getByRole('link', { name: /G major/u })).toBeVisible();
        expect(
            board()
                .all()
                .map(tile => tile.element().textContent.trim().split(/\s/u)[0])
        ).toEqual(['D', 'G']);

        // Choosing Ungrouped takes it out, and the group stays, saying it's empty.
        await page.getByRole('button', { name: 'G major: rename, group, move or unpin' }).click();
        await menu.getByText('Ungrouped', { exact: true }).click();
        await menu.getByRole('button', { name: 'Done' }).click();
        await expect.element(practice.getByText('Nothing in this group.', { exact: false })).toBeVisible();
        expect(pins.current.pins.map(pin => pin.group)).toEqual([undefined, undefined]);
    });

    it('PIN-2.4 renames, moves and deletes a group from its heading, asking what to do with its pins', async () => {
        await pins.add({ url: '/scales/G/major', label: 'G major' });
        await pins.add({ url: '/scales/D/dorian', label: 'D Dorian' });
        const [g, d] = pins.current.pins.map(pin => pin.id);
        await pins.addGroup('Practice', g);
        await pins.addGroup('Gig', d);
        await render(Page);

        await page.getByRole('button', { name: 'Gig: rename, move or delete' }).click();
        const menu = page.getByRole('dialog');
        await menu.getByRole('textbox', { name: 'Name' }).fill('Saturday');
        await menu.getByRole('button', { name: 'Rename' }).click();
        await menu.getByRole('button', { name: 'Move up' }).click();
        await expect.element(menu.getByRole('button', { name: 'Move up' })).toBeDisabled();
        expect(pins.current.groups.map(group => group.name)).toEqual(['Saturday', 'Practice']);
        expect(pins.current.pins.map(pin => pin.label)).toEqual(['D Dorian', 'G major']);

        await menu.getByRole('button', { name: 'Delete group' }).click();
        await expect.element(menu.getByText('Delete Saturday and its 1 pin,', { exact: false })).toBeVisible();
        await menu.getByRole('button', { name: 'Keep the pins' }).click();
        await expect.element(page.getByRole('dialog')).not.toBeInTheDocument();
        expect(pins.current.groups.map(group => group.name)).toEqual(['Practice']);
        expect(pins.current.pins.map(pin => [pin.label, pin.group])).toEqual([
            ['D Dorian', undefined],
            ['G major', pins.current.groups[0]?.id]
        ]);

        await page.getByRole('button', { name: 'Practice: rename, move or delete' }).click();
        await menu.getByRole('button', { name: 'Delete group' }).click();
        await menu.getByRole('button', { name: 'Delete the pins too' }).click();
        expect(pins.current).toMatchObject({ groups: [], pins: [{ label: 'D Dorian' }] });
    });
});

describe('dragging on Home', () => {
    /** A point inside an element, this far from its top left corner. */
    const inside = (element: Element, x = 20, y = 20) => {
        const box = element.getBoundingClientRect();
        return { x: box.left + x, y: box.top + y };
    };

    function pointer(type: string, target: EventTarget, at: { x: number; y: number }) {
        target.dispatchEvent(
            new PointerEvent(type, {
                bubbles: true,
                cancelable: true,
                pointerId: 1,
                isPrimary: true,
                pointerType: 'touch',
                clientX: at.x,
                clientY: at.y
            })
        );
    }

    const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
    const lifted = () => document.querySelector('.ghost') !== null;
    const element = (selector: string) => {
        const found = document.querySelector(selector);
        if (!found) throw new Error(`Nothing matches ${selector}`);
        return found;
    };

    /** Holds an element long enough to lift it. */
    async function hold(target: Element) {
        pointer('pointerdown', target, inside(target));
        await wait(LONG_PRESS_MS + 100);
    }

    /** Moves the held pointer to a point and lets go there. */
    async function dropAt(at: { x: number; y: number }) {
        pointer('pointermove', window, at);
        await wait(50);
        pointer('pointerup', window, at);
        await wait(50);
    }

    beforeEach(async () => {
        await pins.ready();
        await pins.update(() => NO_PINS);
        await pins.add({ url: '/scales/G/major', label: 'G major' });
        await pins.add({ url: '/scales/D/dorian', label: 'D Dorian' });
        const [g, d] = pins.current.pins.map(pin => pin.id);
        await pins.addGroup('Practice', g);
        await pins.addGroup('Gig', d);
        await render(Page);
        await expect.element(page.getByRole('region', { name: 'Gig' })).toBeVisible();
    });

    afterEach(async () => {
        await pins.update(() => NO_PINS);
    });

    const groupNames = () => pins.current.groups.map(group => group.name);
    const gig = () => element('[data-group] + [data-group] .heading');
    const practice = () => element('[data-group]');

    it('PIN-2.3 drags a group above another by its heading, with its pins', async () => {
        await hold(gig());
        expect(lifted()).toBe(true);
        await dropAt(inside(practice(), 20, 5));

        expect(groupNames()).toEqual(['Gig', 'Practice']);
        expect(pins.current.pins.map(pin => pin.label)).toEqual(['D Dorian', 'G major']);
        expect(lifted()).toBe(false);
    });

    it('PIN-2.3 drags a pin out of its group onto Ungrouped, shown below the groups when nothing is', async () => {
        const top = practice().getBoundingClientRect().top;
        await hold(element('[data-pin]'));

        // Nothing above the Ungrouped area moves when the pin lifts.
        expect(practice().getBoundingClientRect().top).toBe(top);
        await dropAt(inside(element('.drop-zone')));

        expect(pins.current.pins.map(pin => [pin.label, pin.group === undefined])).toEqual([
            ['G major', true],
            ['D Dorian', false]
        ]);
    });

    it('PIN-2.3 leaves a quick tap, a scroll and a press on a menu button to the page', async () => {
        const before = pins.current;
        const tile = element('[data-pin]');

        // Let go before the hold.
        pointer('pointerdown', tile, inside(tile));
        await wait(100);
        pointer('pointerup', window, inside(tile));
        await wait(LONG_PRESS_MS);
        expect(lifted()).toBe(false);

        // Move further than a tremble before the hold, as a scroll does.
        pointer('pointerdown', tile, inside(tile));
        pointer('pointermove', window, inside(tile, 20, 60));
        await wait(LONG_PRESS_MS + 100);
        expect(lifted()).toBe(false);
        pointer('pointerup', window, inside(tile, 20, 60));

        // Hold the ⋯ button.
        await hold(element('[data-pin] .menu'));
        expect(lifted()).toBe(false);
        pointer('pointerup', window, inside(tile));

        expect(pins.current).toBe(before);
    });
});
