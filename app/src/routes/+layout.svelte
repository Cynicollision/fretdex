<script lang="ts">
    import '@fontsource-variable/atkinson-hyperlegible-next/wght.css';
    import '#lib/styles/fonts.css';
    import '#lib/styles/tokens.css';
    import '#lib/styles/base.css';
    import { onMount } from 'svelte';
    import { pwaInfo } from 'virtual:pwa-info';
    import type { LayoutProps } from './$types';

    let { children }: LayoutProps = $props();

    // The manifest's link tag, made by the PWA plugin from vite.config.ts. Empty in the dev server, which has no service worker.
    const manifestLink = pwaInfo?.webManifest.linkTag ?? '';

    // Registers the service worker that precaches the build (APP-4.2). With autoUpdate, a new version found when the
    // app opens installs, takes over and reloads the page (APP-4.3).
    onMount(async () => {
        if (pwaInfo) {
            const { registerSW } = await import('virtual:pwa-register');
            registerSW({ immediate: true });
        }
    });
</script>

<svelte:head>
    <!-- eslint-disable-next-line svelte/no-at-html-tags -- the plugin's own link tag, fixed at build time -->
    {@html manifestLink}
</svelte:head>

{@render children()}
