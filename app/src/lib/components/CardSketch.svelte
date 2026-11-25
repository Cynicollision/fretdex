<!--
    A card as text, until its diagrams arrive (scales M01 T9, modes and arpeggios T10, intervals and notes T11): its
    name, notes and intervals, the instrument and tuning it's shown for, and its labels option where it takes one, so
    every route opens from its URL with its full state (APP-3.1).
-->
<script lang="ts">
    import { enharmonics, intervalLabel, intervalSemitones, noteLabel, spell, spellScale } from '@fretdex/fretkit';
    import Choice from '#lib/components/Choice.svelte';
    import Screen from '#lib/components/Screen.svelte';
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

    interface Facts {
        readonly notes?: readonly string[];
        readonly intervals?: readonly string[];
        readonly other?: string;
    }

    const facts: Facts = $derived.by(() => {
        switch (card.kind) {
            case 'scale':
            case 'mode': {
                const spelled = spellScale(card.root, card.kind === 'scale' ? card.scale : card.mode);
                return { notes: spelled.notes.map(noteLabel), intervals: spelled.type.intervals.map(intervalLabel) };
            }
            case 'arpeggio':
                return {
                    notes: spell(card.root, card.quality.intervals).map(noteLabel),
                    intervals: card.quality.intervals.map(intervalLabel)
                };
            case 'interval': {
                const semitones = intervalSemitones(card.interval.code);
                return { other: `${String(semitones)} ${semitones === 1 ? 'semitone' : 'semitones'}` };
            }
            case 'note':
                return { other: `Also written ${enharmonics(card.note).map(noteLabel).join(', ')}` };
        }
    });

    const takesLabels = $derived(card.kind === 'scale' || card.kind === 'mode' || card.kind === 'arpeggio');
</script>

<Screen title={cardTitle(card)} back={cardModule(card.kind)}>
    {#if facts.notes}<p>Notes: {facts.notes.join(' ')}</p>{/if}
    {#if facts.intervals}<p>Intervals: {facts.intervals.join(' ')}</p>{/if}
    {#if facts.other}<p>{facts.other}</p>{/if}
    <p class="muted">
        For {view.instrument === 'guitar' ? 'guitar' : 'bass'}, {tuningName(
            view.instrument,
            view.tuning,
            customTunings.current
        )} tuning{view.capo === 0 ? '' : `, capo ${String(view.capo)}`}.
        {#if options.pos !== undefined}Position {options.pos}.{/if}
        {#if options.nps !== undefined}3-notes-per-string pattern {options.nps}.{/if}
    </p>
    {#if takesLabels}
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
    {/if}
    <p class="muted">The full card, with its diagrams, is coming.</p>
</Screen>

<style>
    p {
        margin: 0;
    }

    .muted {
        color: var(--muted);
    }
</style>
