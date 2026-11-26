<script lang="ts">
    import '@fontsource-variable/atkinson-hyperlegible-next/wght.css';
    import '#lib/styles/fonts.css';
    import '#lib/styles/tokens.css';
    import '#lib/styles/base.css';
    import { sound } from '#lib/audio/sound.ts';
    import ContextBar from '#lib/components/ContextBar.svelte';
    import { settings } from '#lib/settings/store.svelte.ts';
    import { applyTheme } from '#lib/settings/theme.ts';
    import { customTunings } from '#lib/settings/tunings.svelte.ts';
    import { isInstalled, requestPersistence } from '#lib/storage/persist.ts';
    import { readOverride, type ContextOverride } from '#lib/url/context.ts';
    import { clearOverride, replaceQuery } from '#lib/url/navigate.ts';
    import { CARD_ROUTES, LIST_ROUTES, canonicalQuery } from '#lib/url/routes.ts';
    import { keepScreenAwake } from '#lib/wake-lock.ts';
    import { page } from '$app/state';
    import { onMount } from 'svelte';
    import { pwaInfo } from 'virtual:pwa-info';
    import type { LayoutProps } from './$types';

    let { children }: LayoutProps = $props();

    let mounted = $state(false);

    // What's stored loads once the page has hydrated, so it shows as a change to the prerendered page (store.svelte.ts).
    onMount(() => {
        mounted = true;
        void settings.ready();
        void customTunings.ready();
    });

    // The URL's instrument, tuning and capo, for the context bar (APP-2.3, APP-3.3). Read once the page has
    // hydrated, as a prerendered page has no query, and once the settings have loaded, which a tuning's id is read
    // against.
    const ready = $derived(mounted && settings.loaded);
    const override: ContextOverride = $derived(ready ? readOverride(page.url.searchParams, settings.current) : {});

    // A query the app can't read in part loses that part, so the URL always says what the view shows (APP-3.1).
    // Not on an error page, whose URL is left as it was typed.
    $effect(() => {
        if (!ready || page.error) return;
        const kind = page.route.id === null ? undefined : CARD_ROUTES[page.route.id];
        const list = page.route.id === null ? undefined : LIST_ROUTES[page.route.id];
        const query = canonicalQuery(kind, page.url.searchParams, settings.current, list);
        if (query !== page.url.search) void replaceQuery(page.url, query);
    });

    // The screen stays awake while the setting is on (APP-5.5). Derived first, so changing another setting, which
    // replaces `settings.current`, leaves the lock alone.
    const keepAwake = $derived(settings.loaded && settings.current.keepAwake);
    $effect(() => {
        if (keepAwake) return keepScreenAwake();
    });

    // The master volume and mute follow the settings (AUD-1.2), before the first sound as after.
    $effect(() => {
        sound.setVolume(settings.current.volume, settings.current.muted);
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

<!-- Home, and the current key, instrument, tuning and capo, on every screen (APP-1.1, APP-1.4, APP-2). -->
<ContextBar {override} onclear={() => void clearOverride(page.url)} />
<div class="screen">
    {@render children()}
</div>

<style>
    /* The end of a screen scrolls clear of the home indicator. */
    .screen {
        padding-bottom: env(safe-area-inset-bottom, 0px);
    }
</style>
