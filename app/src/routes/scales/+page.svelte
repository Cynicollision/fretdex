<!--
    Scales (SCL-1.1), as a plain list on the current key's root, or C (CTX-2.8), until the list with its root picker
    (M01 T9). The modes open their own cards, under Modes (MODE-1.7).
-->
<script lang="ts">
    import { SCALE_TYPES, type ScaleGroup } from '@fretdex/fretkit';
    import CardList from '#lib/components/CardList.svelte';
    import Screen from '#lib/components/Screen.svelte';
    import { settings } from '#lib/settings/store.svelte.ts';
    import type { Card } from '#lib/url/routes.ts';

    const GROUPS: readonly { id: ScaleGroup; name: string }[] = [
        { id: 'major-and-minor', name: 'Major and minor' },
        { id: 'pentatonic-and-blues', name: 'Pentatonic and blues' },
        { id: 'modes', name: 'Modes' },
        { id: 'other', name: 'Other' }
    ];

    const root = $derived(settings.current.key?.root ?? 'C');

    function items(group: ScaleGroup): { card: Card }[] {
        return SCALE_TYPES.filter(type => type.group === group).map(type => ({
            card: type.group === 'modes' ? { kind: 'mode', root, mode: type } : { kind: 'scale', root, scale: type }
        }));
    }
</script>

<Screen title="Scales" back="/">
    {#each GROUPS as group (group.id)}
        <section aria-labelledby="group-{group.id}">
            <h2 id="group-{group.id}">{group.name}</h2>
            <CardList items={items(group.id)} />
        </section>
    {/each}
</Screen>

<style>
    section {
        display: grid;
        gap: 8px;
    }
</style>
