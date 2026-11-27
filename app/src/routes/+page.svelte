<!--
    Home (APP-1.1): the pin board (PIN-2), or how to pin when there's nothing pinned (PIN-2.5), then the modules and
    tools, so any card is two taps away (APP-1.2).
-->
<script lang="ts">
    import ModuleGrid from '#lib/components/ModuleGrid.svelte';
    import PinBoard from '#lib/components/PinBoard.svelte';
    import { pins } from '#lib/pins/store.svelte.ts';
</script>

<svelte:head>
    <title>Fretdex</title>
</svelte:head>

<main>
    <h1>Fretdex</h1>
    <!-- Nothing until the pins have loaded, so a board never flashes empty. -->
    {#if pins.loaded}
        <section aria-labelledby="pins-heading">
            <h2 id="pins-heading">Pins</h2>
            {#if pins.current.pins.length > 0}
                <PinBoard />
            {:else}
                <p class="empty">
                    Nothing pinned yet. Open a scale from Scales below and tap <strong>☆ Pin</strong> beside its name to keep
                    it here, just as it is, a tap away.
                </p>
            {/if}
        </section>
    {/if}
    <ModuleGrid />
</main>

<style>
    main {
        display: grid;
        gap: 16px;
        max-width: 40rem;
        margin: 0 auto;
        padding-block: 24px;
        padding-left: max(16px, env(safe-area-inset-left, 0px));
        padding-right: max(16px, env(safe-area-inset-right, 0px));
    }

    section {
        display: grid;
        gap: 8px;
    }

    .empty {
        margin: 0;
        color: var(--muted);
    }

    .empty strong {
        color: var(--text);
    }
</style>
