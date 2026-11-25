<!--
    Arpeggios (ARP-1.1): the triad, sixth and seventh qualities on the current key's root, or C (CTX-2.8), until the
    list with its root picker (M01 T10).
-->
<script lang="ts">
    import { ARPEGGIO_TYPES } from '@fretdex/fretkit';
    import CardList from '#lib/components/CardList.svelte';
    import Screen from '#lib/components/Screen.svelte';
    import { settings } from '#lib/settings/store.svelte.ts';
    import type { Card } from '#lib/url/routes.ts';

    const root = $derived(settings.current.key?.root ?? 'C');
    const items: { card: Card; aside: string }[] = $derived(
        ARPEGGIO_TYPES.map(quality => ({ card: { kind: 'arpeggio', root, quality }, aside: quality.name }))
    );
</script>

<Screen title="Arpeggios" back="/modules">
    <CardList {items} />
</Screen>
