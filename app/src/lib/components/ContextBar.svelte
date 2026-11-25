<!--
    The context bar at the top of every screen (APP-1.4, APP-2.1): the current key, the instrument, the tuning's name
    and the capo when one is set (CTX-3.1). A tap opens the sheet that changes them.
-->
<script lang="ts">
    import ContextSheet from '#lib/components/ContextSheet.svelte';
    import { keyName } from '#lib/settings/key.ts';
    import { settings } from '#lib/settings/store.svelte.ts';
    import { tuningName } from '#lib/settings/tunings.ts';
    import { customTunings } from '#lib/settings/tunings.svelte.ts';

    let open = $state(false);

    const current = $derived(settings.current);
    const details = $derived(
        [
            current.instrument === 'guitar' ? 'Guitar' : 'Bass',
            tuningName(current.instrument, current.tuning, customTunings.current),
            current.capo === 0 ? undefined : `Capo ${String(current.capo)}`
        ].filter(part => part !== undefined)
    );
    // Until what's stored has loaded, the bar keeps its place but shows nothing, rather than the defaults; prerendered,
    // nothing has.
    const loaded = $derived(typeof window !== 'undefined' && settings.loaded && customTunings.loaded);
</script>

<header>
    <button
        type="button"
        class:pending={!loaded}
        aria-haspopup="dialog"
        aria-expanded={open}
        onclick={() => (open = true)}
    >
        <span class="key">{keyName(current.key)}</span>
        <span class="details">{details.join(' · ')}</span>
        <span class="change" aria-hidden="true">▾</span>
    </button>
</header>

<ContextSheet {open} onclose={() => (open = false)} />

<style>
    header {
        position: sticky;
        top: 0;
        z-index: 1;
        background: var(--surface);
        border-bottom: 1px solid var(--line);
        padding-top: env(safe-area-inset-top, 0px);
    }

    button {
        display: grid;
        grid-template-columns: 1fr auto;
        grid-template-areas: 'key change' 'details change';
        align-items: center;
        column-gap: 12px;
        width: 100%;
        max-width: 40rem;
        min-height: 56px;
        margin: 0 auto;
        padding: 6px max(16px, env(safe-area-inset-right, 0px)) 6px max(16px, env(safe-area-inset-left, 0px));
        border: 0;
        background: none;
        color: var(--text);
        font: inherit;
        text-align: left;
        cursor: pointer;
    }

    button.pending > * {
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

    .change {
        grid-area: change;
        color: var(--muted);
        font-size: var(--text-m);
    }
</style>
