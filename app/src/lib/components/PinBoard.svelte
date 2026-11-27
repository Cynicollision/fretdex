<!--
    The home board's pins (PIN-2.1, PIN-2.2): a grid of tiles in the user's order, the ungrouped ones first and then
    each group's under its heading. Each tile opens its view and is drawn from its URL for the current theme and
    handedness; a pinned list shows its filter as text (PIN-2.6). A tile's menu renames it, chooses its group
    (PIN-1.3), moves it up or down and unpins it; a heading's menu renames, moves and deletes its group (PIN-2.4).
    Holding a tile or a heading drags it (PIN-2.3, `BoardDrag`).
-->
<script lang="ts">
    import { BoardDrag, type Dragged, type Drop } from '#lib/pins/board-drag.svelte.ts';
    import {
        MAX_GROUP_NAME,
        MAX_PIN_LABEL,
        cleanGroupName,
        groupNamed,
        pinTile,
        readPinnedView,
        type Pin,
        type PinGroup,
        type PinTile
    } from '#lib/pins/pins.ts';
    import { pins } from '#lib/pins/store.svelte.ts';
    import { settings } from '#lib/settings/store.svelte.ts';
    import { customTunings } from '#lib/settings/tunings.svelte.ts';
    import { cardHref } from '#lib/url/href.ts';
    import { resolve } from '$app/paths';
    import { untrack } from 'svelte';
    import Choice from './Choice.svelte';
    import FretboardMini from './FretboardMini.svelte';
    import Sheet from './Sheet.svelte';

    const board = $derived(pins.current);
    const ungrouped = $derived(board.pins.filter(pin => pin.group === undefined));
    const id = $props.id();

    // A tile reads only the instrument, tuning and capo of the settings (`pinTile`), so the tiles are drawn again
    // when those change, not when the volume slides or the theme changes.
    const tileContext = $derived(
        [settings.current.instrument, settings.current.tuning.join('-'), String(settings.current.capo)].join(' ')
    );
    const tiles = $derived.by(() => {
        void tileContext;
        const saved = customTunings.current;
        const current = untrack(() => settings.current);
        return new Map(board.pins.map(pin => [pin.id, pinTile(pin.url, current, saved)]));
    });

    /** Where a tile goes: its view's path, resolved against its route, with the pin's query. */
    function href(pin: Pin): string {
        const view = readPinnedView(pin.url);
        const query = pin.url.includes('?') ? pin.url.slice(pin.url.indexOf('?')) : '';
        if (view?.kind === 'card') return cardHref(view.card) + query;
        if (view?.kind === 'list') return resolve(view.list) + query;
        // A pin a newer version wrote, for a route this one doesn't have: Not found says so (APP-3.5).
        return pin.url;
    }

    // Dragging (PIN-2.3).
    let root: HTMLElement | undefined = $state();
    const drag = new BoardDrag(
        () => root,
        (dragged: Dragged, drop: Drop) => {
            if (dragged.kind === 'pin') void pins.place(dragged.id, drop.group, drop.index);
            else void pins.placeGroup(dragged.id, drop.index);
        }
    );
    // A press or drag ends with the board, so its timer and listeners don't outlive Home.
    $effect(() => () => drag.cancel());
    const draggedPin = $derived(
        drag.dragging?.kind === 'pin' ? board.pins.find(pin => pin.id === drag.dragging?.id) : undefined
    );
    const draggedGroup = $derived(
        drag.dragging?.kind === 'group' ? board.groups.find(group => group.id === drag.dragging?.id) : undefined
    );

    /**
     * Where a mark shows the dragged pin or group would land: before or after another, or into an empty section,
     * unless it's where it is. Marks are drawn in the gaps, and what's dragged stays where it was, faded, so nothing
     * moves on the page while dragging, and the place under the finger is the place it lands.
     */
    interface Mark {
        readonly before?: string;
        readonly after?: string;
        /** An empty section, by `data-section`: a group's id, or `''` for the ungrouped pins. */
        readonly into?: string;
    }

    const mark = $derived.by((): Mark => {
        const drop = drag.drop;
        if (!drop) return {};
        if (draggedGroup) {
            const others = board.groups.filter(group => group !== draggedGroup);
            if (board.groups.indexOf(draggedGroup) === drop.index) return {};
            const before = others[drop.index];
            return before ? { before: before.id } : { after: others.at(-1)?.id ?? '' };
        }
        if (!draggedPin) return {};
        const section = board.pins.filter(pin => pin.group === drop.group);
        if (drop.group === draggedPin.group && section.indexOf(draggedPin) === drop.index) return {};
        const others = section.filter(pin => pin !== draggedPin);
        const before = others[drop.index];
        const last = others.at(-1);
        return before ? { before: before.id } : last ? { after: last.id } : { into: drop.group ?? '' };
    });

    // A long press on a link opens the browser's own menu on Android; it's kept away while a press is held.
    function contextmenu(event: MouseEvent) {
        if (drag.active) event.preventDefault();
    }

    // The tile whose menu is open, by id, so the menu follows it as it moves.
    let menuId: string | undefined = $state();
    const menuPin = $derived(board.pins.find(pin => pin.id === menuId));
    const menuSection = $derived(board.pins.filter(pin => pin.group === menuPin?.group));
    const menuIndex = $derived(menuPin ? menuSection.indexOf(menuPin) : -1);
    let draft = $state('');
    let naming = $state(false);
    let groupDraft = $state('');
    const groupTaken = $derived(groupNamed(board, groupDraft));

    function openMenu(pin: Pin) {
        menuId = pin.id;
        draft = pin.label;
        naming = false;
        groupDraft = '';
    }

    function rename(event: SubmitEvent) {
        event.preventDefault();
        if (menuPin) void pins.rename(menuPin.id, draft);
    }

    const UNGROUPED = '';
    const groupOptions = $derived([
        { value: UNGROUPED, label: 'Ungrouped' },
        ...board.groups.map(group => ({ value: group.id, label: group.name }))
    ]);

    function chooseGroup(value: string) {
        if (menuPin) void pins.place(menuPin.id, value === UNGROUPED ? undefined : value);
    }

    function newGroup(event: SubmitEvent) {
        event.preventDefault();
        if (!menuPin || groupTaken || cleanGroupName(groupDraft) === '') return;
        void pins.addGroup(groupDraft, menuPin.id);
        naming = false;
        groupDraft = '';
    }

    // The group whose menu is open, by id.
    let groupMenuId: string | undefined = $state();
    const menuGroup = $derived(board.groups.find(group => group.id === groupMenuId));
    const menuGroupIndex = $derived(menuGroup ? board.groups.indexOf(menuGroup) : -1);
    const menuGroupPins = $derived(board.pins.filter(pin => menuGroup && pin.group === menuGroup.id).length);
    let groupName = $state('');
    let deleting = $state(false);
    const nameTaken = $derived(groupNamed(board, groupName));

    function openGroupMenu(group: PinGroup) {
        groupMenuId = group.id;
        groupName = group.name;
        deleting = false;
    }

    function renameThisGroup(event: SubmitEvent) {
        event.preventDefault();
        if (menuGroup) void pins.renameGroup(menuGroup.id, groupName);
    }

    function deleteThisGroup(pinsToo: 'delete' | 'ungroup') {
        if (menuGroup) void pins.deleteGroup(menuGroup.id, pinsToo);
        groupMenuId = undefined;
    }

    const count = (n: number) => (n === 1 ? '1 pin' : `${String(n)} pins`);
</script>

{#snippet body(pin: Pin, tile: PinTile)}
    {#if tile.diagram}
        <FretboardMini
            tuning={tile.diagram.tuning}
            set={tile.diagram.set}
            range={tile.diagram.range}
            capo={tile.diagram.capo}
            handedness={settings.current.handedness}
            title={tile.diagram.title}
            {...tile.diagram.cells ? { cells: tile.diagram.cells } : {}}
        />
    {/if}
    <span class="label">{pin.label}</span>
    {#if tile.detail}<span class="sub">{tile.detail}</span>{/if}
    {#if tile.context}<span class="sub">{tile.context}</span>{/if}
{/snippet}

{#snippet tileList(section: readonly Pin[])}
    <ul class="tiles">
        {#each section as pin (pin.id)}
            <li
                class="tile"
                class:lifted={draggedPin === pin}
                class:drop-before={draggedPin && mark.before === pin.id}
                class:drop-after={draggedPin && mark.after === pin.id}
                data-pin={pin.id}
                onpointerdown={(event: PointerEvent) =>
                    drag.press(event, { kind: 'pin', id: pin.id }, event.currentTarget as HTMLElement)}
            >
                <!-- The pin's own path and query, resolved against its route where this version knows it. -->
                <!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- see above -->
                <a href={href(pin)} draggable="false">
                    {@render body(pin, tiles.get(pin.id) ?? {})}
                </a>
                <button
                    type="button"
                    class="menu"
                    aria-label="{pin.label}: rename, group, move or unpin"
                    onclick={() => openMenu(pin)}
                >
                    <span aria-hidden="true">⋯</span>
                </button>
            </li>
        {/each}
    </ul>
{/snippet}

<div
    class="board"
    bind:this={root}
    oncontextmenu={contextmenu}
    ondragstart={(event: DragEvent) => event.preventDefault()}
    role="presentation"
>
    {#if ungrouped.length > 0}
        <div class="section" data-section="">
            {@render tileList(ungrouped)}
        </div>
    {/if}

    {#each board.groups as group, index (group.id)}
        {@const section = board.pins.filter(pin => pin.group === group.id)}
        <section
            class="section group"
            class:lifted={draggedGroup === group}
            class:drop-before={draggedGroup && mark.before === group.id}
            class:drop-after={draggedGroup && mark.after === group.id}
            class:drop-into={draggedPin && mark.into === group.id}
            data-section={group.id}
            data-group={group.id}
            aria-labelledby="{id}-group-{String(index)}"
        >
            <div
                class="heading"
                role="presentation"
                onpointerdown={(event: PointerEvent) =>
                    drag.press(event, { kind: 'group', id: group.id }, event.currentTarget as HTMLElement)}
            >
                <h3 id="{id}-group-{String(index)}">{group.name}</h3>
                <button
                    type="button"
                    class="menu"
                    aria-label="{group.name}: rename, move or delete"
                    onclick={() => openGroupMenu(group)}
                >
                    <span aria-hidden="true">⋯</span>
                </button>
            </div>
            {#if section.length === 0}
                <p class="hint">
                    Nothing in this group. Hold a pin to drag it here, or choose this group from its ⋯ menu.
                </p>
            {/if}
            {@render tileList(section)}
        </section>
    {/each}

    <!--
        With nothing ungrouped, a pin is dragged out of its group onto this area, which shows below the groups so
        that nothing above it moves when the pin lifts.
    -->
    {#if ungrouped.length === 0 && draggedPin && board.groups.length > 0}
        <div class="section" class:drop-into={mark.into === ''} data-section="">
            <p class="hint drop-zone">Ungrouped</p>
        </div>
    {/if}
</div>

{#if drag.dragging}
    <div
        class="ghost"
        class:tile={draggedPin !== undefined}
        style:left="{drag.ghost.left}px"
        style:top="{drag.ghost.top}px"
        style:width="{drag.ghost.width}px"
        aria-hidden="true"
    >
        {#if draggedPin}
            <div class="ghost-body">{@render body(draggedPin, tiles.get(draggedPin.id) ?? {})}</div>
        {:else if draggedGroup}
            <div class="heading"><h3>{draggedGroup.name}</h3></div>
        {/if}
    </div>
{/if}

<Sheet open={menuPin !== undefined} title={menuPin?.label ?? ''} onclose={() => (menuId = undefined)}>
    {#if menuPin}
        <form class="field" onsubmit={rename}>
            <label for="{id}-pin-label">Name</label>
            <div class="row">
                <input
                    id="{id}-pin-label"
                    type="text"
                    bind:value={draft}
                    maxlength={MAX_PIN_LABEL}
                    autocomplete="off"
                />
                <button type="submit" disabled={draft.trim() === '' || draft.trim() === menuPin.label}>Rename</button>
            </div>
        </form>
        <Choice
            legend="Group"
            name="{id}-pin-group"
            options={groupOptions}
            value={menuPin.group ?? UNGROUPED}
            onchange={chooseGroup}
        />
        {#if naming}
            <form class="field" onsubmit={newGroup}>
                <label for="{id}-new-group">New group</label>
                <div class="row">
                    <!-- It's opened to type a name in. -->
                    <!-- svelte-ignore a11y_autofocus -->
                    <input
                        id="{id}-new-group"
                        type="text"
                        bind:value={groupDraft}
                        maxlength={MAX_GROUP_NAME}
                        autocomplete="off"
                        autofocus
                    />
                    <button type="submit" disabled={groupTaken !== undefined || cleanGroupName(groupDraft) === ''}>
                        Create
                    </button>
                </div>
                {#if groupTaken}<p class="note">There's already a group called {groupTaken.name}.</p>{/if}
            </form>
        {:else}
            <div class="actions">
                <button type="button" onclick={() => (naming = true)}>New group…</button>
            </div>
        {/if}
        <div class="actions">
            <button type="button" disabled={menuIndex <= 0} onclick={() => void pins.move(menuPin.id, -1)}>
                Move up
            </button>
            <button
                type="button"
                disabled={menuIndex === menuSection.length - 1}
                onclick={() => void pins.move(menuPin.id, 1)}
            >
                Move down
            </button>
            <button
                type="button"
                onclick={() => {
                    void pins.remove(menuPin.id);
                    menuId = undefined;
                }}
            >
                Unpin
            </button>
        </div>
    {/if}
</Sheet>

<Sheet open={menuGroup !== undefined} title={menuGroup?.name ?? ''} onclose={() => (groupMenuId = undefined)}>
    {#if menuGroup}
        {#if deleting}
            <p>Delete {menuGroup.name} and its {count(menuGroupPins)}, or keep them on Home, ungrouped?</p>
            <div class="actions">
                <button type="button" onclick={() => deleteThisGroup('ungroup')}>Keep the pins</button>
                <button type="button" onclick={() => deleteThisGroup('delete')}>Delete the pins too</button>
                <button type="button" onclick={() => (deleting = false)}>Cancel</button>
            </div>
        {:else}
            <form class="field" onsubmit={renameThisGroup}>
                <label for="{id}-group-name">Name</label>
                <div class="row">
                    <input
                        id="{id}-group-name"
                        type="text"
                        bind:value={groupName}
                        maxlength={MAX_GROUP_NAME}
                        autocomplete="off"
                    />
                    <button
                        type="submit"
                        disabled={cleanGroupName(groupName) === '' ||
                            cleanGroupName(groupName) === menuGroup.name ||
                            (nameTaken !== undefined && nameTaken.id !== menuGroup.id)}
                    >
                        Rename
                    </button>
                </div>
                {#if nameTaken && nameTaken.id !== menuGroup.id}
                    <p class="note">There's already a group called {nameTaken.name}.</p>
                {/if}
            </form>
            <div class="actions">
                <button
                    type="button"
                    disabled={menuGroupIndex <= 0}
                    onclick={() => void pins.moveGroup(menuGroup.id, -1)}
                >
                    Move up
                </button>
                <button
                    type="button"
                    disabled={menuGroupIndex === board.groups.length - 1}
                    onclick={() => void pins.moveGroup(menuGroup.id, 1)}
                >
                    Move down
                </button>
                <button
                    type="button"
                    onclick={() => (menuGroupPins === 0 ? deleteThisGroup('ungroup') : (deleting = true))}
                >
                    Delete group
                </button>
            </div>
        {/if}
    {/if}
</Sheet>

<style>
    .board {
        display: grid;
        gap: 16px;
    }

    .section {
        display: grid;
        gap: 8px;
    }

    .tiles {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(min(10rem, 40vw), 1fr));
        gap: 8px;
        margin: 0;
        padding: 0;
        list-style: none;
    }

    /* A held tile or heading lifts rather than selecting its text or opening the browser's link preview. */
    .tile,
    .heading {
        -webkit-touch-callout: none;
        -webkit-user-select: none;
        user-select: none;
    }

    .tile {
        position: relative;
        display: grid;
        min-width: 0;
        border: 1px solid var(--line);
        border-radius: var(--radius);
        background: var(--surface);
    }

    .tile a,
    .ghost-body {
        display: grid;
        align-content: start;
        justify-items: center;
        gap: 4px;
        min-height: 56px;
        padding: 10px 10px 12px;
        color: var(--text);
        text-decoration: none;
        border-radius: inherit;
    }

    .label,
    .sub {
        justify-self: stretch;
        min-width: 0;
        overflow-wrap: anywhere;
    }

    /* The text clears the menu button in the tile's corner. */
    .label,
    .sub {
        padding-right: 36px;
    }

    .label {
        font-size: var(--text-s);
        font-weight: 600;
    }

    .sub {
        color: var(--muted);
        font-size: var(--text-xs);
    }

    .heading {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        min-height: var(--tap);
        border-bottom: 1px solid var(--line);
    }

    h3 {
        min-width: 0;
        margin: 0;
        font-size: var(--text-m);
        overflow-wrap: anywhere;
    }

    .hint {
        margin: 0;
        color: var(--muted);
        font-size: var(--text-s);
    }

    /*
     * While dragging, what's dragged stays in place, faded, and a bar in the gap before or after a tile or group, or
     * a dashed outline round an empty section, shows where it would land, so nothing on the page moves.
     */
    .lifted {
        opacity: 0.35;
    }

    .section {
        position: relative;
    }

    .drop-before::before,
    .drop-after::after {
        content: '';
        position: absolute;
        border-radius: 2px;
        background: var(--accent);
    }

    .tile.drop-before::before,
    .tile.drop-after::after {
        top: 0;
        bottom: 0;
        width: 4px;
    }

    .tile.drop-before::before {
        left: -7px;
    }

    .tile.drop-after::after {
        right: -7px;
    }

    .group.drop-before::before,
    .group.drop-after::after {
        left: 0;
        right: 0;
        height: 4px;
    }

    .group.drop-before::before {
        top: -10px;
    }

    .group.drop-after::after {
        bottom: -10px;
    }

    .drop-into {
        outline: 2px dashed var(--accent);
        outline-offset: 4px;
        border-radius: var(--radius);
    }

    .drop-zone {
        display: flex;
        align-items: center;
        min-height: var(--tap);
        padding: 0 12px;
    }

    /* The lifted copy is a little smaller and see-through, so the tiles and the bar under it still show. */
    .ghost {
        position: fixed;
        z-index: 10;
        pointer-events: none;
        opacity: 0.85;
        transform: scale(0.9);
        box-shadow: 0 8px 24px var(--backdrop);
    }

    .ghost .heading {
        padding: 0 12px;
        border: 1px solid var(--accent);
        border-radius: var(--radius);
        background: var(--surface);
    }

    .ghost.tile {
        border-color: var(--accent);
    }

    .menu {
        position: absolute;
        right: 0;
        bottom: 0;
        min-height: var(--tap);
        min-width: var(--tap);
        border: 0;
        border-radius: var(--radius);
        background: none;
        color: var(--muted);
        font: inherit;
        font-size: var(--text-l);
        line-height: 1;
        cursor: pointer;
    }

    .heading .menu {
        position: static;
    }

    .field {
        display: grid;
        gap: 8px;
    }

    label {
        font-weight: 600;
    }

    .row {
        display: flex;
        gap: 8px;
    }

    input {
        flex: 1;
        min-width: 0;
        min-height: var(--tap);
        padding: 0 12px;
        border: 1px solid var(--line);
        border-radius: var(--radius);
        background: var(--bg);
        color: var(--text);
        font: inherit;
        font-size: var(--text-m);
    }

    p {
        margin: 0;
    }

    .note {
        color: var(--muted);
        font-size: var(--text-s);
    }

    .actions {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
    }

    button:not(.menu) {
        min-height: var(--tap);
        min-width: var(--tap);
        padding: 0 14px;
        border: 1px solid var(--line);
        border-radius: var(--radius);
        background: var(--surface-2);
        color: var(--text);
        font: inherit;
        font-size: var(--text-m);
        cursor: pointer;
    }

    button:disabled {
        color: var(--muted);
        opacity: 0.5;
        cursor: default;
    }
</style>
