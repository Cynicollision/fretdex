<!-- A placeholder until the home board (PIN-2) arrives in M01 T12, with Settings and a preview of what they do. -->
<script lang="ts">
    import { settings } from '#lib/settings/store.svelte.ts';
    import { resolve } from '$app/paths';
    import ContextPreview from './ContextPreview.svelte';
</script>

<svelte:head>
    <title>Fretdex</title>
</svelte:head>

<main>
    <h1>Fretdex</h1>
    <p>A reference for guitar and bass: scales, modes and arpeggios in every key, from C to F♯ and B♭.</p>
    <p class="muted">Under construction.</p>
    <a class="settings" href={resolve('/settings')}>Settings ›</a>
    <ContextPreview settings={settings.current} />
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

    .settings {
        display: inline-flex;
        align-items: center;
        min-height: var(--tap);
        justify-self: start;
        color: var(--accent);
        font-size: var(--text-m);
        text-decoration: none;
    }
</style>
