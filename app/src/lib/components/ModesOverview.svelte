<!--
    The Modes overview (MODE-1): the seven modes of the major scale on one root, brightest first, each row its name,
    what it changed from the row above and its characteristic note, its intervals, and a small neck of it in the same
    six frets as every other row, so only the changed note moves. A row opens the mode's scale card (MODE-1.7). The
    root is the path's (`/modes/Fs`), or on `/modes` the current key's, or C (MODE-1.10).
-->
<script lang="ts">
    import {
        PICKER_ROOTS,
        intervalLabel,
        mapScale,
        noteLabel,
        notePitchClass,
        spellPitchClass,
        type NoteName
    } from '@fretdex/fretkit';
    import Choice from '#lib/components/Choice.svelte';
    import ModeNeck from '#lib/components/ModeNeck.svelte';
    import Screen from '#lib/components/Screen.svelte';
    import { describeFretboard } from '#lib/diagrams/fretboard.ts';
    import { ghosts, modeRows, modeWindow, rowMarks } from '#lib/modes/overview.ts';
    import { settings } from '#lib/settings/store.svelte.ts';
    import { tuningName } from '#lib/settings/tunings.ts';
    import { customTunings } from '#lib/settings/tunings.svelte.ts';
    import { readOverride, viewContext } from '#lib/url/context.ts';
    import { cardHref } from '#lib/url/href.ts';
    import { replaceCard } from '#lib/url/navigate.ts';
    import { cardPath, cardTitle, type Card } from '#lib/url/routes.ts';
    import { page } from '$app/state';
    import { onMount } from 'svelte';

    interface Props {
        /** The path's root; on `/modes`, none, and the overview takes the current key's (MODE-1.10). */
        root?: NoteName;
    }

    let { root }: Props = $props();

    const shown = $derived(root ?? settings.current.key?.root ?? 'C');
    const card: Card = $derived({ kind: 'modes', root: shown });
    const title = $derived(cardTitle(card));
    // `/modes` is prerendered, with no query, so the override is read once the page has mounted (architecture's Routes).
    let mounted = $state(false);
    onMount(() => {
        mounted = true;
    });
    const override = $derived(mounted ? readOverride(page.url.searchParams, settings.current) : {});
    const view = $derived(viewContext(settings.current, override));
    const rows = $derived(modeRows(shown, settings.current.accidentals));
    const window = $derived(modeWindow(view.tuning, shown, view.capo));
    const instrumentText = $derived(view.instrument === 'guitar' ? 'guitar' : 'bass');
    const tuningText = $derived(tuningName(view.instrument, view.tuning, customTunings.current));

    // The root picker (MODE-1.10), as the Scales list's: a black key opens the spelling the accidentals setting
    // gives a lone note, with the other one a tap away.
    const rootOptions = PICKER_ROOTS.map(button => ({
        value: String(button.pitchClass),
        label: button.spellings.map(noteLabel).join('/')
    }));
    const pitchClass = $derived(notePitchClass(shown));
    const otherSpelling = $derived(PICKER_ROOTS[pitchClass]?.spellings.find(spelling => spelling !== shown));
    function openRoot(next: NoteName) {
        void replaceCard({ kind: 'modes', root: next }, page.url.search);
    }
</script>

<Screen {title} back="/">
    <p class="muted">Brightest to darkest: each mode flattens one note of the one above. Tap a mode to open it.</p>

    <details class="root">
        <summary>Root: {noteLabel(shown)} <span class="change">Change</span></summary>
        <div class="root-picker">
            <Choice
                legend="Root"
                name="modes-root"
                options={rootOptions}
                value={String(pitchClass)}
                columns={4}
                hideLegend
                onchange={value => openRoot(spellPitchClass(Number(value), settings.current.accidentals))}
            />
            {#if otherSpelling}
                <button type="button" onclick={() => openRoot(otherSpelling)}>
                    Spell as {noteLabel(otherSpelling)}
                </button>
            {/if}
        </div>
    </details>

    <ol class="rows">
        {#each rows as row (cardPath(row.card))}
            {@const name = cardTitle(row.card)}
            {@const id = `mode-${row.card.scale.id}`}
            <li>
                <a href={cardHref(row.card)} aria-describedby="{id}-neck">
                    <span class="head">
                        <span class="name">{name}</span>
                        <span class="marks">{rowMarks(row)}</span>
                    </span>
                    <span class="intervals">{row.set.codes.map(intervalLabel).join(' ')}</span>
                    <ModeNeck
                        tuning={view.tuning}
                        set={row.set}
                        {window}
                        capo={view.capo}
                        handedness={settings.current.handedness}
                        characteristic={row.characteristic}
                        {...row.change ? { changed: row.change.to } : {}}
                        ghosts={ghosts(row, view.tuning, window, view.capo)}
                    />
                </a>
                <span class="visually-hidden" id="{id}-neck">
                    {describeFretboard(
                        `${name} on ${instrumentText}, ${tuningText} tuning, frets ${String(window.from)} to ${String(window.to)}`,
                        view.tuning,
                        mapScale(view.tuning, row.set, window, view.capo),
                        view.capo
                    ).join(' ')}
                </span>
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

    .root summary {
        min-height: var(--tap);
        display: flex;
        align-items: center;
        font-size: var(--text-m);
        cursor: pointer;
    }

    .root summary .change {
        margin-left: 12px;
        color: var(--accent);
    }

    .root[open] summary .change {
        display: none;
    }

    .root-picker {
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
        gap: 4px;
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

    .name::after {
        content: ' ›';
        color: var(--accent);
    }

    .marks,
    .intervals {
        color: var(--muted);
    }
</style>
