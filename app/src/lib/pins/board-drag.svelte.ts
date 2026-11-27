import { groupIndex, sectionAt, tileIndex, type Box } from './drag';

/** What's being dragged on the home board: a pin's tile or a group's heading. */
export interface Dragged {
    readonly kind: 'pin' | 'group';
    readonly id: string;
}

/**
 * Where a dragged pin or group would land: a pin's group (`undefined` for ungrouped) and its place among that
 * group's other pins, as `placePin` takes them, or a group's place among the other groups, as `placeGroup` does.
 */
export interface Drop {
    readonly group: string | undefined;
    readonly index: number;
}

/** How long a tile or heading is held before it lifts (PIN-2.3). */
export const LONG_PRESS_MS = 500;

/** How far a finger moves before the press counts as a scroll rather than a hold, in CSS pixels. */
const SLOP = 8;

/** How near the window's top or bottom a drag scrolls the page, in CSS pixels. */
const EDGE = 56;

/**
 * Dragging on the home board (PIN-2.3). Holding a tile or a group's heading for `LONG_PRESS_MS` lifts it: a copy
 * follows the finger (`ghost`), the page scrolls near the window's edges, and `drop` says where it would land,
 * measured from the board's `data-section`, `data-pin` and `data-group` elements. Letting go calls `ondrop`. Moving
 * before the hold, or letting go, leaves the tap or scroll to the browser, so a tile still opens and the page still
 * scrolls. Nothing is moved in the page while dragging, so the finger's touch stays on its element.
 */
export class BoardDrag {
    dragging: Dragged | undefined = $state();
    drop: Drop | undefined = $state();
    /** Where the lifted copy is drawn, fixed in the viewport. */
    ghost = $state({ left: 0, top: 0, width: 0 });

    readonly #root: () => HTMLElement | undefined;
    readonly #ondrop: (dragged: Dragged, drop: Drop) => void;
    /** Ends the press being watched, dropping what's dragged or not; unset while there's none. */
    #end: ((dropped: boolean) => void) | undefined;
    #point = { x: 0, y: 0 };
    #grab = { x: 0, y: 0 };
    #frame = 0;

    constructor(root: () => HTMLElement | undefined, ondrop: (dragged: Dragged, drop: Drop) => void) {
        this.#root = root;
        this.#ondrop = ondrop;
    }

    /** Whether a press is being held or a drag is on, when a long press's context menu should be kept away. */
    get active(): boolean {
        return this.#end !== undefined;
    }

    /** Ends a press or drag without dropping anything, as when the board goes away. */
    cancel(): void {
        this.#end?.(false);
    }

    /**
     * Starts watching a press on a tile or heading (`element`), which lifts it if it's held. A press on a button in
     * it, such as its ⋯ menu, is left to the button.
     */
    press(event: PointerEvent, item: Dragged, element: HTMLElement): void {
        if (this.#end || !event.isPrimary || (event.pointerType === 'mouse' && event.button !== 0)) return;
        if (event.target instanceof Element && event.target.closest('button')) return;
        const pointer = event.pointerId;
        const start = { x: event.clientX, y: event.clientY };
        this.#point = start;

        const timer = setTimeout(() => this.#lift(item, element, start), LONG_PRESS_MS);
        const move = (moved: PointerEvent) => {
            if (moved.pointerId !== pointer) return;
            this.#point = { x: moved.clientX, y: moved.clientY };
            if (this.dragging) this.#follow();
            else if (Math.hypot(moved.clientX - start.x, moved.clientY - start.y) > SLOP) end(false);
        };
        const up = (ended: PointerEvent) => {
            if (ended.pointerId === pointer) end(ended.type === 'pointerup');
        };
        // Once lifted, a finger's move would scroll the page, and the browser would then cancel the drag.
        const touchmove = (moved: TouchEvent) => {
            if (this.dragging && moved.cancelable) moved.preventDefault();
        };
        // A window that loses focus mid-press may never hear the pointer go up.
        const blur = () => end(false);
        const end = (dropped: boolean) => {
            clearTimeout(timer);
            window.removeEventListener('pointermove', move);
            window.removeEventListener('pointerup', up);
            window.removeEventListener('pointercancel', up);
            window.removeEventListener('touchmove', touchmove);
            window.removeEventListener('blur', blur);
            cancelAnimationFrame(this.#frame);
            const { dragging, drop } = this;
            this.dragging = undefined;
            this.drop = undefined;
            this.#end = undefined;
            if (dragging && dropped) {
                this.#swallowClick();
                if (drop) this.#ondrop(dragging, drop);
            }
        };
        this.#end = end;
        window.addEventListener('pointermove', move);
        window.addEventListener('pointerup', up);
        window.addEventListener('pointercancel', up);
        window.addEventListener('touchmove', touchmove, { passive: false });
        window.addEventListener('blur', blur);
    }

    #lift(item: Dragged, element: HTMLElement, start: { x: number; y: number }): void {
        const box = element.getBoundingClientRect();
        this.#grab = { x: start.x - box.left, y: start.y - box.top };
        this.ghost = { left: box.left, top: box.top, width: box.width };
        this.dragging = item;
        window.getSelection()?.removeAllRanges();
        this.#follow();
        this.#scroll();
    }

    #follow(): void {
        const { x, y } = this.#point;
        this.ghost = { ...this.ghost, left: x - this.#grab.x, top: y - this.#grab.y };
        if (this.dragging) this.drop = this.#measure(this.dragging, x, y);
    }

    /** Scrolls the page while the finger is near the window's top or bottom, faster the nearer it is. */
    #scroll(): void {
        const { y } = this.#point;
        const by = y < EDGE ? -(EDGE - y) : y > window.innerHeight - EDGE ? y - (window.innerHeight - EDGE) : 0;
        if (by !== 0) {
            window.scrollBy(0, Math.round(by / 4));
            this.#follow();
        }
        this.#frame = requestAnimationFrame(() => this.#scroll());
    }

    #measure(dragged: Dragged, x: number, y: number): Drop | undefined {
        const root = this.#root();
        if (!root) return undefined;
        if (dragged.kind === 'group') {
            const groups = [...root.querySelectorAll<HTMLElement>('[data-group]')].filter(
                group => group.dataset.group !== dragged.id
            );
            return { group: undefined, index: groupIndex(groups.map(box), y) };
        }
        const sections = [...root.querySelectorAll<HTMLElement>('[data-section]')];
        const section = sections[sectionAt(sections.map(box), y)];
        if (!section) return undefined;
        const tiles = [...section.querySelectorAll<HTMLElement>('[data-pin]')].filter(
            tile => tile.dataset.pin !== dragged.id
        );
        const group = section.dataset.section === '' ? undefined : section.dataset.section;
        return { group, index: tileIndex(tiles.map(box), x, y) };
    }

    /**
     * Keeps the click that can follow a drop, as a mouse's does, from opening the tile it ends on. A finger's drag
     * makes no click, so the next press, or a moment, disarms it, and a tap after the drop still works.
     */
    #swallowClick(): void {
        const swallow = (event: MouseEvent) => {
            event.preventDefault();
            event.stopPropagation();
            disarm();
        };
        const disarm = () => {
            clearTimeout(timer);
            window.removeEventListener('click', swallow, { capture: true });
            window.removeEventListener('pointerdown', disarm, { capture: true });
        };
        const timer = setTimeout(disarm, 400);
        window.addEventListener('click', swallow, { capture: true });
        window.addEventListener('pointerdown', disarm, { capture: true });
    }
}

function box(element: HTMLElement): Box {
    return element.getBoundingClientRect();
}
