<!--
    A placeholder until the home board (PIN-2) arrives in M01 T12: the modules, so any card is two taps away
    (APP-1.2), and a preview of what the settings do.
-->
<script lang="ts">
    import ModuleGrid from '#lib/components/ModuleGrid.svelte';
    import { settings } from '#lib/settings/store.svelte.ts';
    import { customTunings } from '#lib/settings/tunings.svelte.ts';
    import ContextPreview from './ContextPreview.svelte';
</script>

<svelte:head>
    <title>Fretdex</title>
</svelte:head>

<main>
    <h1>Fretdex</h1>
    <p>A reference for guitar and bass: scales and modes in every key, from C to F♯ and B♭.</p>
    <p class="muted">Under construction.</p>
    <ModuleGrid />
    <ContextPreview settings={settings.current} saved={customTunings.current} />
</main>

<style>
    main {
        display: grid;
        gap: 12px;
        max-width: 40rem;
        margin: 0 auto;
        padding-block: 24px;
        padding-left: max(16px, env(safe-area-inset-left, 0px));
        padding-right: max(16px, env(safe-area-inset-right, 0px));
    }

    p {
        margin: 0;
    }

    .muted {
        color: var(--muted);
    }
</style>
