<!-- A list of cards, each a link to its card with an optional note beside its name: the module lists until their own. -->
<script lang="ts">
    import { cardHref } from '#lib/url/href.ts';
    import { cardPath, cardTitle, type Card } from '#lib/url/routes.ts';

    interface Item {
        readonly card: Card;
        readonly aside?: string;
    }

    interface Props {
        items: readonly Item[];
    }

    let { items }: Props = $props();
</script>

<ul>
    {#each items as { card, aside } (cardPath(card))}
        <li>
            <a href={cardHref(card)}>
                {cardTitle(card)}
                {#if aside}<span class="aside">{aside}</span>{/if}
            </a>
        </li>
    {/each}
</ul>

<style>
    ul {
        display: grid;
        margin: 0;
        padding: 0;
        list-style: none;
        border-top: 1px solid var(--line);
    }

    a {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        min-height: var(--tap);
        padding-block: 6px;
        border-bottom: 1px solid var(--line);
        color: var(--text);
        font-size: var(--text-m);
        text-decoration: none;
    }

    .aside {
        color: var(--muted);
        font-size: var(--text-s);
        text-align: right;
    }
</style>
