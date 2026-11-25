<!--
    Not found (APP-3.5): a path the app can't read, or a card whose root, scale, quality, interval or note it doesn't
    know, with a link to the module's list where the path names one. Any other error says so, with a way home.
-->
<script lang="ts">
    import Screen from '#lib/components/Screen.svelte';
    import { moduleOfPath } from '#lib/url/routes.ts';
    import { page } from '$app/state';
    import { resolve } from '$app/paths';

    const notFound = $derived(page.status === 404);
    const module = $derived(moduleOfPath(page.url.pathname));
</script>

<Screen title={notFound ? 'Not found' : 'Something went wrong'}>
    {#if notFound}
        <p>Fretdex has nothing at this address.</p>
        {#if module?.path}
            <a href={resolve(module.path)}>See all {module.name.toLowerCase()}</a>
        {/if}
    {:else}
        <p>{page.error?.message ?? 'This screen could not be shown.'}</p>
    {/if}
    <a href={resolve('/')}>Home</a>
</Screen>

<style>
    p {
        margin: 0;
    }

    a {
        display: inline-flex;
        align-items: center;
        min-height: var(--tap);
        justify-self: start;
        color: var(--accent);
        font-size: var(--text-m);
        text-decoration: none;
    }
</style>
