<!--
    The home board's pins (PIN-2.1, PIN-2.2): a grid of tiles in the user's order, each opening its view and drawn
    from its URL for the current theme and handedness; a pinned list shows its filter as text (PIN-2.6). Each tile's
    menu renames it (PIN-1.3), moves it up or down (PIN-2.3) and unpins it.
-->
<script lang="ts">
    import { MAX_PIN_LABEL, pinTile, readPinnedView, type Pin } from '#lib/pins/pins.ts';
    import { pins } from '#lib/pins/store.svelte.ts';
    import { settings } from '#lib/settings/store.svelte.ts';
    import { customTunings } from '#lib/settings/tunings.svelte.ts';
    import { cardHref } from '#lib/url/href.ts';
    import { resolve } from '$app/paths';
    import { untrack } from 'svelte';
    import FretboardMini from './FretboardMini.svelte';
    import Sheet from './Sheet.svelte';

    const board = $derived(pins.current.pins);

    // A tile reads only the instrument, tuning and capo of the settings (`pinTile`), so the tiles are drawn again
    // when those change, not when the volume slides or the theme changes.
    const tileContext = $derived(
        [settings.current.instrument, settings.current.tuning.join('-'), String(settings.current.capo)].join(' ')
    );
    const tiles = $derived.by(() => {
        void tileContext;
        const saved = customTunings.current;
        const current = untrack(() => settings.current);
        return new Map(board.map(pin => [pin.id, pinTile(pin.url, current, saved)]));
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

    // The tile whose menu is open, by id, so the menu follows it as it moves.
    let menuId: string | undefined = $state();
    const menuPin = $derived(board.find(pin => pin.id === menuId));
    const menuIndex = $derived(board.findIndex(pin => pin.id === menuId));
    let draft = $state('');

    function openMenu(pin: Pin) {
        menuId = pin.id;
        draft = pin.label;
    }

    function rename(event: SubmitEvent) {
        event.preventDefault();
        if (menuPin) void pins.rename(menuPin.id, draft);
    }
</script>

<ul class="board">
    {#each board as pin (pin.id)}
        {@const tile = tiles.get(pin.id) ?? {}}
        <li class="tile">
            <!-- The pin's own path and query, resolved against its route where this version knows it (`href`). -->
            <!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- see above -->
            <a href={href(pin)}>
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
            </a>
            <button
                type="button"
                class="menu"
                aria-label="{pin.label}: rename, move or unpin"
                onclick={() => openMenu(pin)}
            >
                <span aria-hidden="true">⋯</span>
            </button>
        </li>
    {/each}
</ul>

<Sheet open={menuPin !== undefined} title={menuPin?.label ?? ''} onclose={() => (menuId = undefined)}>
    {#if menuPin}
        <form class="rename" onsubmit={rename}>
            <label for="pin-label">Name</label>
            <div class="row">
                <input id="pin-label" type="text" bind:value={draft} maxlength={MAX_PIN_LABEL} autocomplete="off" />
                <button type="submit" disabled={draft.trim() === '' || draft.trim() === menuPin.label}> Rename </button>
            </div>
        </form>
        <div class="actions">
            <button type="button" disabled={menuIndex <= 0} onclick={() => void pins.move(menuPin.id, -1)}>
                Move up
            </button>
            <button
                type="button"
                disabled={menuIndex === board.length - 1}
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

<style>
    .board {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(min(10rem, 40vw), 1fr));
        gap: 8px;
        margin: 0;
        padding: 0;
        list-style: none;
    }

    .tile {
        position: relative;
        display: grid;
        min-width: 0;
        border: 1px solid var(--line);
        border-radius: var(--radius);
        background: var(--surface);
    }

    .tile a {
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

    .rename {
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
