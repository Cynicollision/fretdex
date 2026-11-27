<!--
    Home (APP-1.1): the pin board (PIN-2), and nothing else once something is pinned, as the modules are in the menu.
    With nothing pinned, how to pin and the modules and tools under it (PIN-2.5).
-->
<script lang="ts">
    import ModuleGrid from '#lib/components/ModuleGrid.svelte';
    import PinBoard from '#lib/components/PinBoard.svelte';
    import { pins } from '#lib/pins/store.svelte.ts';

    const empty = $derived(pins.current.pins.length === 0 && pins.current.groups.length === 0);
</script>

<svelte:head>
    <title>Fretdex</title>
</svelte:head>

<main>
    <!-- The bar's ☰ Fretdex names the app on every screen, so Home's title is for screen readers. -->
    <h1 class="visually-hidden">Fretdex</h1>
    <!-- Nothing until the pins have loaded, so neither the board nor the modules flash in and out. -->
    {#if pins.loaded}
        <section aria-labelledby="pins-heading">
            <h2 id="pins-heading">Pins</h2>
            {#if empty}
                <p class="empty">
                    Nothing pinned yet. Open a scale from Scales below and tap <strong>☆ Pin</strong> beside its name to
                    keep it here, just as it is, a tap away. Once something's pinned, Home is your pins, and the modules
                    are in the menu, <strong>☰</strong>, at the top of every screen.
                </p>
            {:else}
                <PinBoard />
            {/if}
        </section>
        {#if empty}
            <ModuleGrid />
        {/if}
    {/if}
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
