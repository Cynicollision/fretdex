<!--
    Modes (MODE-1.1): the seven modes of the major scale from brightest to darkest, on the current key's root, or C
    (CTX-2.8), until the list with its root picker (M01 T10).
-->
<script lang="ts">
    import { SCALE_TYPES } from '@fretdex/fretkit';
    import CardList from '#lib/components/CardList.svelte';
    import Screen from '#lib/components/Screen.svelte';
    import { settings } from '#lib/settings/store.svelte.ts';
    import type { Card } from '#lib/url/routes.ts';

    const root = $derived(settings.current.key?.root ?? 'C');
    const items: { card: Card }[] = $derived(
        SCALE_TYPES.filter(type => type.group === 'modes').map(mode => ({ card: { kind: 'mode', root, mode } }))
    );
</script>

<Screen title="Modes" back="/">
    <p>Brightest first.</p>
    <CardList {items} />
</Screen>

<style>
    p {
        margin: 0;
        color: var(--muted);
    }
</style>
