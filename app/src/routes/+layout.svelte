<script lang="ts">
    import '@fontsource-variable/atkinson-hyperlegible-next/wght.css';
    import '#lib/styles/fonts.css';
    import '#lib/styles/tokens.css';
    import '#lib/styles/base.css';
    import ContextBar from '#lib/components/ContextBar.svelte';
    import { settings } from '#lib/settings/store.svelte.ts';
    import { applyTheme } from '#lib/settings/theme.ts';
    import { customTunings } from '#lib/settings/tunings.svelte.ts';
    import { isInstalled, requestPersistence } from '#lib/storage/persist.ts';
    import { onMount } from 'svelte';
    import { pwaInfo } from 'virtual:pwa-info';
    import type { LayoutProps } from './$types';

    let { children }: LayoutProps = $props();

    // What's stored loads once the page has hydrated, so it shows as a change to the prerendered page (store.svelte.ts).
    onMount(() => {
        void settings.ready();
        void customTunings.ready();
    });

    // The theme setting, once the stored settings have loaded; until then app.html's script has set it (CTX-1.8).
    $effect(() => {
        if (settings.loaded) applyTheme(settings.current.theme);
    });

    // Installed, the app asks the browser to keep its storage (PIN-6.2).
    onMount(() => {
        if (isInstalled()) void requestPersistence();
    });

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

<!-- The current key, instrument, tuning and capo, on every screen (APP-1.4, APP-2). -->
<ContextBar />
{@render children()}
