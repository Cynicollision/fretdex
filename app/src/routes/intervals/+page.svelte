<!-- Intervals (INT-1.1) and the notes, as plain lists until the Intervals screen (M01 T11). -->
<script lang="ts">
    import { INTERVALS, PICKER_ROOTS, intervalSemitones } from '@fretdex/fretkit';
    import CardList from '#lib/components/CardList.svelte';
    import Screen from '#lib/components/Screen.svelte';
    import type { Card } from '#lib/url/routes.ts';

    const intervals: { card: Card; aside: string }[] = INTERVALS.map(interval => {
        const semitones = intervalSemitones(interval.code);
        return {
            card: { kind: 'interval', interval },
            aside: `${String(semitones)} ${semitones === 1 ? 'semitone' : 'semitones'}`
        };
    });
    const notes: { card: Card }[] = PICKER_ROOTS.flatMap(root => root.spellings).map(note => ({
        card: { kind: 'note', note }
    }));
</script>

<Screen title="Intervals" back="/modules">
    <section aria-labelledby="intervals">
        <h2 id="intervals">Intervals</h2>
        <CardList items={intervals} />
    </section>
    <section aria-labelledby="notes">
        <h2 id="notes">Notes</h2>
        <CardList items={notes} />
    </section>
</Screen>

<style>
    section {
        display: grid;
        gap: 8px;
    }
</style>
