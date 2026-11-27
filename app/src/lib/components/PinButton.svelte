<!--
    A card's or filtered list's Pin button (PIN-1.1): it pins the view as its URL shows it, with the instrument, tuning
    and capo (PIN-1.4). Once the card is pinned, in any view, it says so, and a tap offers Pin again, for another
    view of the same card, and Unpin (PIN-1.2).
-->
<script lang="ts">
    import { pinIdentity, pinTarget, type Pinnable } from '#lib/pins/pins.ts';
    import { pins } from '#lib/pins/store.svelte.ts';
    import { settings } from '#lib/settings/store.svelte.ts';
    import { page } from '$app/state';
    import Sheet from './Sheet.svelte';

    interface Props {
        view: Pinnable;
    }

    let { view }: Props = $props();

    const target = $derived(pinTarget(view, page.url.searchParams, settings.current));
    const identity = $derived(pinIdentity(target.url));
    const mine = $derived(pins.of(identity));
    const exact = $derived(mine.find(pin => pin.url === target.url));
    // Unpin takes this view's pin, or the card's only one, or else all of them.
    const unpinning = $derived(exact ? [exact] : mine);
    const noun = $derived(view.kind === 'card' ? 'card' : 'list');
    let open = $state(false);

    // The sheet is about one card: it closes when the screen moves to another, as back does on the same route.
    $effect(() => {
        void identity;
        return () => (open = false);
    });

    function pin() {
        void pins.add(target);
    }
</script>

<!-- Once the settings have loaded too, as a pin takes their instrument, tuning and capo (PIN-1.4). -->
{#if pins.loaded && settings.loaded}
    {#if mine.length === 0}
        <button type="button" class="pin" onclick={pin}>
            <span class="icon" aria-hidden="true">☆</span> Pin
        </button>
    {:else}
        <button type="button" class="pin pinned" aria-haspopup="dialog" onclick={() => (open = true)}>
            <span class="icon" aria-hidden="true">★</span> Pinned
        </button>
    {/if}
{/if}

<Sheet open={open && mine.length > 0} title="Pinned" onclose={() => (open = false)}>
    <p>
        {#if exact}
            This view is on Home.
        {:else if mine.length === 1}
            Home has another view of this {noun}.
        {:else}
            Home has {mine.length} other views of this {noun}.
        {/if}
    </p>
    <div class="actions">
        {#if !exact}
            <button
                type="button"
                onclick={() => {
                    pin();
                    open = false;
                }}
            >
                Pin again
            </button>
        {/if}
        <button
            type="button"
            onclick={() => {
                void pins.remove(...unpinning.map(pin => pin.id));
                open = false;
            }}
        >
            {unpinning.length > 1 ? `Unpin all ${String(unpinning.length)}` : 'Unpin'}
        </button>
    </div>
</Sheet>

<style>
    button {
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

    .pin {
        flex: none;
        white-space: nowrap;
    }

    .pinned {
        border-color: var(--accent);
        color: var(--accent);
        font-weight: 600;
    }

    .icon {
        font-size: var(--text-l);
        line-height: 1;
    }

    p {
        margin: 0;
    }

    .actions {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
    }
</style>
