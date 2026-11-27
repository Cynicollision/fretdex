<!--
    Scales (SCL-1.1): a root picker, then every scale in its group on that root, with the pinned ones first (PIN-3.1)
    and the current key's own scale first when the list is on the key's root (SCL-1.2). The root is the query's
    (`?root=Eb`), else the key's, else C (CTX-2.8). A list on a chosen root can be pinned (PIN-1.1).
-->
<script lang="ts">
    import { PICKER_ROOTS, noteLabel, spellPitchClass } from '@fretdex/fretkit';
    import CardList from '#lib/components/CardList.svelte';
    import Choice from '#lib/components/Choice.svelte';
    import PinButton from '#lib/components/PinButton.svelte';
    import { pinPath } from '#lib/pins/pins.ts';
    import { pins } from '#lib/pins/store.svelte.ts';
    import Screen from '#lib/components/Screen.svelte';
    import { pinnedCards, scaleList } from '#lib/scales/list.ts';
    import { settings } from '#lib/settings/store.svelte.ts';
    import { readOverride } from '#lib/url/context.ts';
    import { replaceQuery } from '#lib/url/navigate.ts';
    import { readListRoot, writeListQuery } from '#lib/url/routes.ts';
    import { page } from '$app/state';
    import { cardLink } from '#lib/url/href.ts';
    import { onMount } from 'svelte';

    // The query is read once the page has hydrated: the list is prerendered, with no query (architecture's Routes).
    let mounted = $state(false);
    onMount(() => {
        mounted = true;
    });
    const root = $derived(mounted ? readListRoot(page.url.searchParams) : undefined);
    // The list's override, kept on its links (APP-1.5).
    const override = $derived(mounted ? readOverride(page.url.searchParams, settings.current) : {});
    const list = $derived(scaleList(root, settings.current.key, settings.current.accidentals));
    const pinned = $derived(pinnedCards(list, new Set(pins.current.pins.map(pin => pinPath(pin.url)))));
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
        void replaceQuery(page.url, writeListQuery('/scales', root, override));
    }
</script>

<Screen title="Scales" back="/">
    {#snippet actions()}
        <!-- The list on the key's root, or C, is on Home already; a chosen root can be pinned (PIN-1.1). -->
        {#if root !== undefined}
            <PinButton view={{ kind: 'list', list: '/scales', root }} />
        {/if}
    {/snippet}
    <Choice
        legend="Root"
        name="scales-root"
        options={rootOptions}
        value={String(list.pitchClass)}
        columns={4}
        onchange={setRoot}
    />
    {#if pinned.length > 0}
        <section aria-labelledby="group-pinned">
            <h2 id="group-pinned">Pinned</h2>
            <CardList items={pinned.map(card => ({ card }))} {override} />
        </section>
    {/if}
    {#if list.keyCard}
        <section aria-labelledby="group-key">
            <h2 id="group-key">Current key</h2>
            <CardList items={[{ card: list.keyCard }]} {override} />
        </section>
    {/if}
    {#each list.groups as group (group.id)}
        <section aria-labelledby="group-{group.id}">
            <h2 id="group-{group.id}">{group.name}</h2>
            <CardList items={group.cards.map(card => ({ card }))} {override} />
            {#if group.id === 'modes'}
                {@const ionian = group.cards.find(card => card.scale.id === 'ionian')}
                {#if ionian}
                    <a class="link" href={cardLink({ kind: 'modes', root: ionian.root }, override)}>
                        The seven modes of {noteLabel(ionian.root)} major
                    </a>
                {/if}
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
