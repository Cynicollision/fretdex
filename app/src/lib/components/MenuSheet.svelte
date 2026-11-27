<!--
    The menu (APP-1.1), opened by ☰ at the start of the context bar: Home, the modules and the tools in their fixed
    order, then Settings and About, as rows in a `Sheet`. Those a later milestone builds keep their places, dimmed and marked as
    coming, so nothing moves as they arrive. The screen open now, or the module it's in, is marked. Following a row
    closes the sheet.
-->
<script lang="ts">
    import Sheet from '#lib/components/Sheet.svelte';
    import { MODULES, TOOLS, moduleOfPath, type ModuleEntry } from '#lib/url/routes.ts';
    import { resolve } from '$app/paths';
    import { page } from '$app/state';

    interface Props {
        open: boolean;
        onclose: () => void;
    }

    let { open, onclose }: Props = $props();

    const here = $derived(page.error ? undefined : page.url.pathname);
    const hereModule = $derived(here === undefined ? undefined : moduleOfPath(here)?.path);

    /** `page` on the screen itself, `true` on a card within a module, so both read as where the user is. */
    function current(path: string): 'page' | 'true' | undefined {
        if (here === path) return 'page';
        if (hereModule === path) return 'true';
        return undefined;
    }
</script>

{#snippet row(name: string, path: '/' | '/settings' | '/about' | NonNullable<ModuleEntry['path']>)}
    <li>
        <a href={resolve(path)} aria-current={current(path)} onclick={onclose}>{name}</a>
    </li>
{/snippet}

{#snippet group(heading: string, entries: readonly ModuleEntry[])}
    <section aria-labelledby="menu-{heading}">
        <h3 id="menu-{heading}">{heading}</h3>
        <ul>
            {#each entries as entry (entry.name)}
                {#if entry.path}
                    {@render row(entry.name, entry.path)}
                {:else}
                    <li>
                        <span class="later" aria-disabled="true">{entry.name} <small>Coming later</small></span>
                    </li>
                {/if}
            {/each}
        </ul>
    </section>
{/snippet}

<Sheet {open} title="Menu" {onclose} closeIcon>
    <nav aria-label="Menu">
        <ul>{@render row('Home', '/')}</ul>
        {@render group('Modules', MODULES)}
        {@render group('Tools', TOOLS)}
        <ul class="settings">
            {@render row('Settings', '/settings')}
            {@render row('About', '/about')}
        </ul>
    </nav>
</Sheet>

<style>
    nav {
        display: grid;
        gap: 20px;
    }

    section {
        display: grid;
        gap: 4px;
    }

    h3 {
        font-size: var(--text-s);
        font-weight: 600;
        color: var(--muted);
    }

    ul {
        display: grid;
        margin: 0;
        padding: 0;
        list-style: none;
    }

    .settings {
        padding-top: 12px;
        border-top: 1px solid var(--line);
    }

    a,
    .later {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        min-height: 48px;
        padding: 0 12px;
        border-radius: var(--radius);
        font-size: var(--text-m);
    }

    a {
        color: var(--text);
        font-weight: 600;
        text-decoration: none;
    }

    a[aria-current] {
        background: var(--surface-2);
        color: var(--accent);
    }

    a[aria-current]::after {
        content: '●';
        font-size: var(--text-xs);
    }

    .later {
        color: var(--muted);
    }

    small {
        font-size: var(--text-xs);
    }
</style>
