<!--
    Credits and licences (APP-1.6): every library and font that ships, from CREDITS.md, each with its licence in full
    where it asks for its notice to travel with the code.
-->
<script lang="ts">
    import Screen from '#lib/components/Screen.svelte';
    import type { PageProps } from './$types';

    let { data }: PageProps = $props();
</script>

<Screen title="Credits and licences" back="/about">
    <p>Fretdex is built with these libraries and fonts, each used under its licence.</p>
    {#each data.credits as credit (credit.name)}
        <section>
            <h2>{credit.name}</h2>
            <p class="meta">
                {credit.licence}{#if credit.version}, version {credit.version}{/if}{#if credit.author}, by {credit.author}{/if}
            </p>
            <a href={credit.source} rel="external">{credit.source.replace(/^https:\/\//, '')}</a>
            {#if credit.text}
                <pre>{credit.text}</pre>
            {/if}
        </section>
    {/each}
</Screen>

<style>
    p {
        margin: 0;
        max-width: 34rem;
    }

    section {
        display: grid;
        grid-template-columns: minmax(0, 1fr);
        gap: 8px;
    }

    h2 {
        margin: 0;
        font-size: var(--text-m);
        overflow-wrap: anywhere;
    }

    .meta {
        color: var(--muted);
    }

    a {
        color: var(--accent);
        overflow-wrap: anywhere;
    }

    pre {
        margin: 0;
        padding: 12px;
        border: 1px solid var(--line);
        border-radius: var(--radius);
        font-family: var(--font);
        font-size: var(--text-xs);
        white-space: pre-wrap;
        overflow-wrap: anywhere;
    }
</style>
