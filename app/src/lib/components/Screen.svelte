<!--
    A screen's frame: its title in the browser tab and installed app (APP-3.6), a back control where it has one
    (APP-1.3), its heading and its content.
-->
<script lang="ts">
    import type { Snippet } from 'svelte';
    import BackLink from '#lib/components/BackLink.svelte';
    import { pageTitle, type ScreenPath } from '#lib/url/routes.ts';

    interface Props {
        /** The screen's heading, and its title before " · Fretdex". */
        title: string;
        /** Where the back control goes when there's no history to go back through; no back control without it. */
        back?: ScreenPath;
        /** Lets a screen with a fretboard use a wide window, so it shows the whole neck in landscape (DIAG-1.10). */
        wide?: boolean;
        children: Snippet;
    }

    let { title, back, wide = false, children }: Props = $props();
</script>

<svelte:head>
    <title>{pageTitle(title)}</title>
</svelte:head>

<main class:wide>
    {#if back !== undefined}
        <BackLink href={back} />
    {/if}
    <h1>{title}</h1>
    {@render children()}
</main>

<style>
    main {
        display: grid;
        align-content: start;
        gap: 16px;
        max-width: 40rem;
        margin: 0 auto;
        padding-block: 16px 32px;
        padding-left: max(16px, env(safe-area-inset-left, 0px));
        padding-right: max(16px, env(safe-area-inset-right, 0px));
    }

    main.wide {
        max-width: 72rem;
    }
</style>
