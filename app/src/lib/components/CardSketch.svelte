<!--
    A card until its own arrives (M01 T9): its name, notes and intervals, its notes on a fretboard and
    keyboard, which play their notes when tapped, the instrument and tuning it's shown for, and its labels option, so every route opens from its URL with
    its full state (APP-3.1).
-->
<script lang="ts">
    import { intervalLabel, noteLabel, spellScale } from '@fretdex/fretkit';
    import { playFret, playKey } from '#lib/audio/sound.ts';
    import Choice from '#lib/components/Choice.svelte';
    import Fretboard from '#lib/components/Fretboard.svelte';
    import Keyboard from '#lib/components/Keyboard.svelte';
    import Screen from '#lib/components/Screen.svelte';
    import type { TappedFret } from '#lib/diagrams/fretboard.ts';
    import type { Labels } from '#lib/settings/settings.ts';
    import { settings } from '#lib/settings/store.svelte.ts';
    import { tuningName } from '#lib/settings/tunings.ts';
    import { customTunings } from '#lib/settings/tunings.svelte.ts';
    import { readOverride, viewContext } from '#lib/url/context.ts';
    import { setViewOption } from '#lib/url/navigate.ts';
    import { cardModule, cardTitle, readViewOptions, type Card } from '#lib/url/routes.ts';
    import { page } from '$app/state';

    interface Props {
        card: Card;
    }

    let { card }: Props = $props();

    const options = $derived(readViewOptions(card.kind, page.url.searchParams));
    const view = $derived(viewContext(settings.current, readOverride(page.url.searchParams, settings.current)));

    const set = $derived(spellScale(card.root, card.scale));
    const labels: Labels = $derived(options.labels ?? settings.current.labels);
    const tuningText = $derived(tuningName(view.instrument, view.tuning, customTunings.current));
    const diagramTitle = $derived(
        `${cardTitle(card)} on ${view.instrument === 'guitar' ? 'guitar' : 'bass'}, ${tuningText} tuning`
    );
</script>

<Screen title={cardTitle(card)} back={cardModule(card.kind)} wide>
    <p>Notes: {set.notes.map(noteLabel).join(' ')}</p>
    <p>Intervals: {set.type.intervals.map(intervalLabel).join(' ')}</p>
    <Fretboard
        tuning={view.tuning}
        {set}
        range={settings.current.fretRange}
        capo={view.capo}
        {labels}
        handedness={settings.current.handedness}
        accidentals={settings.current.accidentals}
        title={diagramTitle}
        ontap={(tapped: TappedFret) => playFret(tapped, view.instrument)}
    />
    <Keyboard {set} {labels} title={cardTitle(card)} ontap={playKey} />
    <p class="muted">
        For {view.instrument === 'guitar' ? 'guitar' : 'bass'}, {tuningText} tuning{view.capo === 0
            ? ''
            : `, capo ${String(view.capo)}`}.
        {#if options.pos !== undefined}Position {options.pos}.{/if}
        {#if options.nps !== undefined}3-notes-per-string pattern {options.nps}.{/if}
    </p>
    <Choice
        legend="Labels on this card"
        name="card-labels"
        options={[
            { value: 'notes', label: 'Note names' },
            { value: 'intervals', label: 'Intervals' },
            { value: 'degrees', label: 'Scale degrees' },
            { value: 'none', label: 'None' }
        ]}
        value={options.labels ?? settings.current.labels}
        onchange={(labels: Labels) =>
            setViewOption(
                page.url,
                card.kind,
                settings.current,
                'labels',
                labels === settings.current.labels ? undefined : labels
            )}
    />
    <p class="muted">The full card, with positions and scale runs, is coming.</p>
</Screen>

<style>
    p {
        margin: 0;
    }

    .muted {
        color: var(--muted);
    }
</style>
