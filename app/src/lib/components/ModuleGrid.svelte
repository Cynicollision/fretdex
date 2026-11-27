<!--
    The modules and tools as tiles, on Home while nothing is pinned (PIN-2.5); the menu lists them on every screen
    (APP-1.1). Each opens its list. Those a later milestone builds are shown in their places, dimmed and marked as
    coming.
-->
<script lang="ts">
    import { MODULES, TOOLS, type ModuleEntry } from '#lib/url/routes.ts';
    import { resolve } from '$app/paths';

    interface Props {
        /** The heading level of the Modules and Tools headings, under the screen's own. */
        level?: 2 | 3;
    }

    let { level = 2 }: Props = $props();
</script>

{#snippet grid(heading: string, entries: readonly ModuleEntry[])}
    <section aria-label={heading}>
        <svelte:element this={`h${String(level)}`}>{heading}</svelte:element>
        <ul>
            {#each entries as entry (entry.name)}
                <li>
                    {#if entry.path}
                        <a href={resolve(entry.path)}>{entry.name}</a>
                    {:else}
                        <span class="later" aria-disabled="true">
                            {entry.name}
                            <small>Coming later</small>
                        </span>
                    {/if}
                </li>
            {/each}
        </ul>
    </section>
{/snippet}

{@render grid('Modules', MODULES)}
{@render grid('Tools', TOOLS)}

<style>
    section {
        display: grid;
        gap: 8px;
    }

    ul {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(9rem, 1fr));
        gap: 8px;
        margin: 0;
        padding: 0;
        list-style: none;
    }

    a,
    .later {
        display: grid;
        align-content: center;
        min-height: 56px;
        padding: 8px 12px;
        border: 1px solid var(--line);
        border-radius: var(--radius);
        background: var(--surface);
        font-size: var(--text-m);
        font-weight: 600;
    }

    a {
        color: var(--text);
        text-decoration: none;
    }

    .later {
        color: var(--muted);
        border-style: dashed;
        background: none;
    }

    small {
        font-size: var(--text-xs);
        font-weight: 400;
    }
</style>
