<!--
    The Modes overview (MODE-1): the seven modes of one major scale, Ionian to Locrian, each row its numeral and name,
    its characteristic note, its intervals, its slice of the scale's step pattern, and one position of it on a small
    neck. A row opens the mode's scale card on that position (MODE-1.7, MODE-1.12). The key is the path's
    (`/modes/Db`), or on `/modes` the current key's parent major, or C (MODE-1.10).
-->
<script lang="ts">
    import {
        intervalLabel,
        noteLabel,
        notePitchClass,
        rootChoices,
        scaleType,
        simplerRoot,
        type NoteName,
        type Position
    } from '@fretdex/fretkit';
    import Choice from '#lib/components/Choice.svelte';
    import ModeNeck from '#lib/components/ModeNeck.svelte';
    import Screen from '#lib/components/Screen.svelte';
    import { describeFretboard } from '#lib/diagrams/fretboard.ts';
    import {
        STEP_STRIP,
        characteristicLine,
        modeRows,
        overviewKey,
        rowPosition,
        stepSlice,
        type ModeRow
    } from '#lib/modes/overview.ts';
    import { POSITION_OPTION } from '#lib/scales/positions.ts';
    import { rootButtons } from '#lib/settings/key.ts';
    import type { Labels } from '#lib/settings/settings.ts';
    import { settings } from '#lib/settings/store.svelte.ts';
    import { tuningName } from '#lib/settings/tunings.ts';
    import { customTunings } from '#lib/settings/tunings.svelte.ts';
    import { readOverride, viewContext } from '#lib/url/context.ts';
    import { cardHref, cardLink } from '#lib/url/href.ts';
    import { replaceCard, setViewOption } from '#lib/url/navigate.ts';
    import { cardPath, cardTitle, readViewOptions, withViewOption, writeQuery, type Card } from '#lib/url/routes.ts';
    import { page } from '$app/state';
    import { onMount } from 'svelte';

    interface Props {
        /** The path's key; on `/modes`, none, and the overview takes the current key's parent major (MODE-1.10). */
        root?: NoteName;
    }

    let { root }: Props = $props();

    const major = scaleType('major');
    if (major === undefined) throw new Error('No major scale');

    const key = $derived(root ?? overviewKey(settings.current.key, settings.current.accidentals));
    const card: Card = $derived({ kind: 'modes', root: key });
    const title = $derived(cardTitle(card));

    // `/modes` is prerendered, with no query, so the query is read once the page has mounted (architecture's Routes).
    let mounted = $state(false);
    onMount(() => {
        mounted = true;
    });
    const params = $derived(mounted ? page.url.searchParams : new URLSearchParams());
    const override = $derived(readOverride(params, settings.current));
    const view = $derived(viewContext(settings.current, override));
    const labels: Labels = $derived(readViewOptions('modes', params).labels ?? settings.current.labels);

    const rows = $derived(modeRows(key));
    const instrumentText = $derived(view.instrument === 'guitar' ? 'guitar' : 'bass');
    const tuningText = $derived(tuningName(view.instrument, view.tuning, customTunings.current));

    // The key picker (MODE-1.10): the major keys the key picker offers, the other spelling a tap away.
    const buttons = rootButtons(major);
    const keyOptions = buttons.map(button => ({ value: String(button.pitchClass), label: button.label }));
    const pitchClass = $derived(notePitchClass(key));
    // A linked key the picker doesn't offer (G♯ major) leaves every button unchosen, so A♭ is one tap (THY-2.5).
    const chosenKey = $derived(buttons.some(button => button.spellings.includes(key)) ? String(pitchClass) : '');
    const otherSpelling = $derived(
        buttons.find(button => button.pitchClass === pitchClass)?.spellings.find(spelling => spelling !== key)
    );
    const simpler = $derived(simplerRoot(key, major));
    function openKey(next: NoteName) {
        void replaceCard({ kind: 'modes', root: next }, mounted ? page.url.search : '');
    }

    // Labels for every row at once (MODE-1.15), changed in place, keeping scroll and focus (APP-3.2). On `/modes`
    // this moves to the key's own path, as only a card route holds options.
    function setLabels(next: Labels) {
        const value = next === settings.current.labels ? undefined : next;
        if (root !== undefined) void setViewOption(page.url, 'modes', settings.current, 'labels', value);
        else void replaceCard(card, withViewOption('modes', params, settings.current, 'labels', value));
    }

    /** A row's link: the mode's card on the position the row shows, keeping the override (MODE-1.7, APP-1.5). */
    function rowHref(row: ModeRow, position: Position | undefined): string {
        const option = position ? { [POSITION_OPTION[position.kind]]: position.number } : {};
        return cardHref(row.card) + writeQuery('scale', option, override);
    }
</script>

<Screen {title} back="/">
    <p class="muted">The same notes from each degree of {noteLabel(key)} major. Tap a mode to open it.</p>

    {#if simpler}
        <div class="note">
            <p>
                {noteLabel(key)} major needs a double sharp or flat; it's usually written as {noteLabel(simpler)} major.
            </p>
            <a class="link" href={cardLink({ kind: 'modes', root: simpler }, override)}>
                Open {cardTitle({ kind: 'modes', root: simpler })}
            </a>
        </div>
    {/if}

    <details class="key">
        <summary>Key: {noteLabel(key)} major <span class="change">Change</span></summary>
        <div class="key-picker">
            <Choice
                legend="Key"
                name="modes-key"
                options={keyOptions}
                value={chosenKey}
                columns={4}
                hideLegend
                onchange={value => openKey(rootChoices(Number(value), major, settings.current.accidentals).root)}
            />
            {#if otherSpelling}
                <button type="button" onclick={() => openKey(otherSpelling)}>
                    Spell as {noteLabel(otherSpelling)}
                </button>
            {/if}
        </div>
    </details>

    <Choice
        legend="Labels"
        name="modes-labels"
        options={[
            { value: 'notes', label: 'Note names' },
            { value: 'intervals', label: 'Intervals' },
            { value: 'degrees', label: 'Scale degrees' },
            { value: 'none', label: 'None' }
        ]}
        value={labels}
        onchange={setLabels}
    />

    <ol class="rows">
        {#each rows as row (cardPath(row.card))}
            {@const name = cardTitle(row.card)}
            {@const id = `mode-${row.card.scale.id}`}
            {@const position = rowPosition(row, view.tuning, view.instrument, view.capo)}
            {@const slice = stepSlice(row)}
            <li>
                <!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- a resolved card path, with its query -->
                <a href={rowHref(row, position)} aria-describedby={position ? `${id}-neck` : undefined}>
                    <span class="head">
                        <span class="name"><span class="numeral">{row.numeral}</span> {name}</span>
                        <span class="muted">{characteristicLine(row)}</span>
                    </span>
                    <span class="intervals">{row.set.codes.map(intervalLabel).join(' ')}</span>
                    <span class="visually-hidden">Steps {STEP_STRIP.slice(slice.from, slice.to + 1).join(' ')}.</span>
                    <span class="strip" aria-hidden="true">
                        {#each STEP_STRIP as step, i (i)}
                            <span class="step" class:lit={i >= slice.from && i <= slice.to}>
                                {step}
                            </span>
                        {/each}
                    </span>
                    {#if position}
                        <ModeNeck
                            tuning={view.tuning}
                            set={row.set}
                            {position}
                            capo={view.capo}
                            {labels}
                            handedness={settings.current.handedness}
                            characteristic={row.characteristic}
                        />
                    {/if}
                </a>
                {#if position}
                    <span class="visually-hidden" id="{id}-neck">
                        {describeFretboard(
                            `${name} on ${instrumentText}, ${tuningText} tuning, frets ${String(position.from)} to ${String(position.to)}`,
                            view.tuning,
                            position.cells,
                            view.capo
                        ).join(' ')}
                    </span>
                {/if}
            </li>
        {/each}
    </ol>
</Screen>

<style>
    p {
        margin: 0;
    }

    .muted {
        color: var(--muted);
    }

    .note {
        display: grid;
        padding: 8px 12px;
        border-left: 3px solid var(--accent);
        background: var(--surface);
    }

    .link {
        display: inline-flex;
        align-items: center;
        min-height: var(--tap);
        justify-self: start;
        color: var(--accent);
        font-size: var(--text-m);
    }

    .key summary {
        min-height: var(--tap);
        display: flex;
        align-items: center;
        font-size: var(--text-m);
        cursor: pointer;
    }

    .key summary .change {
        margin-left: 12px;
        color: var(--accent);
    }

    .key[open] summary .change {
        display: none;
    }

    .key-picker {
        display: grid;
        gap: 8px;
        justify-items: start;
        padding-top: 8px;
    }

    button {
        min-height: var(--tap);
        min-width: var(--tap);
        padding: 0 12px;
        border: 1px solid var(--line);
        border-radius: var(--radius);
        background: var(--surface-2);
        color: var(--text);
        font: inherit;
        font-size: var(--text-m);
        cursor: pointer;
    }

    .rows {
        display: grid;
        gap: 12px;
        margin: 0;
        padding: 0;
        list-style: none;
    }

    .rows a {
        display: grid;
        gap: 6px;
        padding: 8px 12px 4px;
        border: 1px solid var(--line);
        border-radius: var(--radius);
        background: var(--surface);
        color: var(--text);
        text-decoration: none;
    }

    .head {
        display: flex;
        flex-wrap: wrap;
        align-items: baseline;
        justify-content: space-between;
        gap: 4px 12px;
    }

    .name {
        font-size: var(--text-m);
        font-weight: 600;
    }

    .numeral {
        display: inline-block;
        min-width: 2.2em;
        color: var(--muted);
    }

    .name::after {
        content: ' ›';
        color: var(--accent);
    }

    .intervals {
        color: var(--muted);
    }

    /* The major scale's steps, the mode's seven lit: read down the page, the lit slices step right (MODE-1.14). */
    .strip {
        display: grid;
        /* Thirteen steps that share the width, however narrow, rather than push the row off screen. */
        grid-template-columns: repeat(13, minmax(0, 1fr));
        gap: 2px;
    }

    .step {
        padding: 1px 0;
        border-radius: 3px;
        color: var(--muted);
        font-size: var(--text-xs);
        text-align: center;
        opacity: 0.6;
    }

    .step.lit {
        background: var(--accent);
        color: var(--accent-ink);
        font-weight: 700;
        opacity: 1;
    }
</style>
