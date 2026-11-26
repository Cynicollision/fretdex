<!--
    Scales (SCL-1.1): a root picker, then every scale in its group on that root, with the current key's own scale
    first when the list is on the key's root (SCL-1.2). The root is the query's (`?root=Eb`), else the key's, else C
    (CTX-2.8).
-->
<script lang="ts">
    import { PICKER_ROOTS, noteLabel, spellPitchClass } from '@fretdex/fretkit';
    import CardList from '#lib/components/CardList.svelte';
    import Choice from '#lib/components/Choice.svelte';
    import Screen from '#lib/components/Screen.svelte';
    import { scaleList } from '#lib/scales/list.ts';
    import { settings } from '#lib/settings/store.svelte.ts';
    import { readOverride } from '#lib/url/context.ts';
    import { replaceQuery } from '#lib/url/navigate.ts';
    import { readListRoot, writeListQuery } from '#lib/url/routes.ts';
    import { page } from '$app/state';
    import { cardHref } from '#lib/url/href.ts';
    import { onMount } from 'svelte';

    // The query is read once the page has hydrated: the list is prerendered, with no query (architecture's Routes).
    let mounted = $state(false);
    onMount(() => {
        mounted = true;
    });
    const root = $derived(mounted ? readListRoot(page.url.searchParams) : undefined);
    const list = $derived(scaleList(root, settings.current.key, settings.current.accidentals));
    const rootOptions = PICKER_ROOTS.map(root => ({
        value: String(root.pitchClass),
        label: root.spellings.map(noteLabel).join('/')
    }));

    function setRoot(value: string) {
        const pitchClass = Number(value);
        const key = settings.current.key;
        // The key's root needs no query: the list opens there (SCL-1.2).
        const root =
            key !== null && PICKER_ROOTS[pitchClass]?.spellings.some(spelling => spelling === key.root)
                ? undefined
                : spellPitchClass(pitchClass, settings.current.accidentals);
        void replaceQuery(
            page.url,
            writeListQuery('/scales', root, readOverride(page.url.searchParams, settings.current))
        );
    }
</script>

<Screen title="Scales" back="/">
    <Choice
        legend="Root"
        name="scales-root"
        options={rootOptions}
        value={String(list.pitchClass)}
        columns={4}
        onchange={setRoot}
    />
    {#if list.keyCard}
        <section aria-labelledby="group-key">
            <h2 id="group-key">Current key</h2>
            <CardList items={[{ card: list.keyCard }]} />
        </section>
    {/if}
    {#each list.groups as group (group.id)}
        <section aria-labelledby="group-{group.id}">
            <h2 id="group-{group.id}">{group.name}</h2>
            <CardList items={group.cards.map(card => ({ card }))} />
            {#if group.id === 'modes' && group.cards[0]}
                <a class="link" href={cardHref({ kind: 'modes', root: group.cards[0].root })}>
                    All seven modes side by side
                </a>
            {/if}
        </section>
    {/each}
</Screen>

<style>
    section {
        display: grid;
        gap: 8px;
    }

    .link {
        display: inline-flex;
        align-items: center;
        min-height: var(--tap);
        justify-self: start;
        color: var(--accent);
        font-size: var(--text-m);
    }
</style>
