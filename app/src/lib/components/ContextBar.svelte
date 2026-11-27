<!--
    The context bar at the top of every screen (APP-1.4, APP-2.1): ☰ and the app's name, its title on every screen and
    the button that opens the menu (APP-1.1), then the current key, the
    instrument, the tuning's name and the capo when one is set (CTX-3.1). On a card it leaves out the key, which never
    changes what a card shows (CTX-2.8), so it can't be read as the card's name (owner, 2026-11-25). A tap on those
    opens the sheet that changes them. On a card whose URL overrides the
    instrument, tuning or capo (APP-3.3), it shows what the card shows, marked as the card's, with a button that
    clears the override (APP-2.3).
-->
<script lang="ts">
    import ContextSheet from '#lib/components/ContextSheet.svelte';
    import MenuSheet from '#lib/components/MenuSheet.svelte';
    import { keyName } from '#lib/settings/key.ts';
    import { settings } from '#lib/settings/store.svelte.ts';
    import { tuningName } from '#lib/settings/tunings.ts';
    import { customTunings } from '#lib/settings/tunings.svelte.ts';
    import { overrides, viewContext, type ContextOverride } from '#lib/url/context.ts';

    interface Props {
        /** What the current URL overrides (APP-3.3). */
        override?: ContextOverride;
        /** Clears the override from the URL. */
        onclear?: () => void;
        /** On a card, which the key doesn't change, the key is left out. */
        card?: boolean;
    }

    let { override = {}, onclear, card = false }: Props = $props();

    let open = $state(false);
    let menuOpen = $state(false);

    const current = $derived(settings.current);
    const view = $derived(viewContext(current, override));
    const overridden = $derived(overrides(current, override));
    const details = $derived(
        [
            view.instrument === 'guitar' ? 'Guitar' : 'Bass',
            tuningName(view.instrument, view.tuning, customTunings.current),
            view.capo === 0 ? undefined : `Capo ${String(view.capo)}`
        ].filter(part => part !== undefined)
    );
    // Until what's stored has loaded, the bar keeps its place but shows nothing, rather than the defaults; prerendered,
    // nothing has.
    const loaded = $derived(typeof window !== 'undefined' && settings.loaded && customTunings.loaded);
</script>

<header>
    <div class="row">
        <button
            type="button"
            class="menu"
            aria-haspopup="dialog"
            aria-expanded={menuOpen}
            onclick={() => (menuOpen = true)}
        >
            <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <span class="name">Fretdex</span>
            <span class="visually-hidden">menu</span>
        </button>
        <button
            type="button"
            class="context"
            class:pending={!loaded}
            class:card
            disabled={!loaded}
            aria-haspopup="dialog"
            aria-expanded={open}
            onclick={() => (open = true)}
        >
            {#if !card}<span class="key">{keyName(current.key)}</span>{/if}
            <span class="details">
                {details.join(' · ')}
                {#if loaded && overridden}<span class="card-only">· this card</span>{/if}
            </span>
            <span class="change" aria-hidden="true">▾</span>
        </button>
        {#if loaded && overridden}
            <button type="button" class="clear" onclick={() => onclear?.()}>Clear</button>
        {/if}
    </div>
</header>

<MenuSheet open={menuOpen} onclose={() => (menuOpen = false)} />

<ContextSheet
    {open}
    onclose={() => (open = false)}
    override={loaded && overridden ? details.join(' · ') : undefined}
    onchangecontext={() => {
        if (Object.keys(override).length > 0) onclear?.();
    }}
/>

<style>
    header {
        position: sticky;
        top: 0;
        z-index: 1;
        background: var(--surface);
        border-bottom: 1px solid var(--line);
        padding-top: env(safe-area-inset-top, 0px);
    }

    .row {
        display: flex;
        align-items: center;
        max-width: 40rem;
        margin: 0 auto;
        padding-right: max(16px, env(safe-area-inset-right, 0px));
    }

    .menu {
        flex: none;
        display: flex;
        align-items: center;
        gap: 8px;
        min-height: 56px;
        padding: 0 12px 0 max(12px, env(safe-area-inset-left, 0px));
        border: 0;
        border-right: 1px solid var(--line);
        background: none;
        color: var(--text);
        cursor: pointer;
    }

    .menu svg {
        width: 24px;
        height: 24px;
        fill: none;
        stroke: currentColor;
        stroke-width: 2;
        stroke-linecap: round;
    }

    .name {
        font-size: var(--text-m);
        font-weight: 700;
    }

    .context {
        flex: 1;
        min-width: 0;
        display: grid;
        grid-template-columns: 1fr auto;
        grid-template-areas: 'key change' 'details change';
        align-items: center;
        column-gap: 8px;
        min-height: 56px;
        padding: 6px 8px 6px 12px;
        border: 0;
        background: none;
        color: var(--text);
        font: inherit;
        text-align: left;
        cursor: pointer;
    }

    .context.card {
        grid-template-areas: 'details change';
    }

    .context.card .details {
        color: var(--text);
        font-size: var(--text-m);
    }

    .context.pending > * {
        visibility: hidden;
    }

    .key {
        grid-area: key;
        font-size: var(--text-m);
        font-weight: 700;
        color: var(--accent);
    }

    .details {
        grid-area: details;
        color: var(--muted);
    }

    .card-only {
        color: var(--accent);
    }

    .clear {
        flex: none;
        min-height: var(--tap);
        padding: 0 12px;
        border: 1px solid var(--line);
        border-radius: var(--radius);
        background: var(--surface-2);
        color: var(--text);
        font: inherit;
        cursor: pointer;
    }

    .change {
        grid-area: change;
        color: var(--muted);
        font-size: var(--text-m);
    }
</style>
