<!--
    A scale card (SCL-2, SCL-5): the scale's notes, intervals and steps; its root picker (THY-2.2); its notes on the
    neck and a keyboard, which play a tapped note and name a tapped fret (DIAG-1.6); its positions, chosen above the
    neck and stepped through with Previous and Next (SCL-3, SCL-4); degrees to highlight (SCL-2.3); and, for the
    seven modes, what makes it a mode (SCL-5). Play runs the position, or an octave of the full neck, at the tempo
    setting, lighting the note that sounds (AUD-3). Its options are the URL's (APP-3.1).
-->
<script lang="ts">
    import {
        diatonicChords,
        intervalLabel,
        mapScale,
        modeInfo,
        noteLabel,
        notePitchClass,
        rootChoices,
        scalePositions,
        simplerRoot,
        spellScale,
        stepFormula,
        unavoidableDoubles,
        type FretboardCell,
        type PositionKind
    } from '@fretdex/fretkit';
    import type { Playback } from '@fretdex/audio';
    import { instrumentVoice, playFret, playKey, sound } from '#lib/audio/sound.ts';
    import Choice from '#lib/components/Choice.svelte';
    import Fretboard from '#lib/components/Fretboard.svelte';
    import Keyboard from '#lib/components/Keyboard.svelte';
    import Screen from '#lib/components/Screen.svelte';
    import type { TappedFret } from '#lib/diagrams/fretboard.ts';
    import { brightnessRow, chordLabel, numeralLabel, parentLine, tappedLine } from '#lib/scales/card.ts';
    import {
        KIND_LABELS,
        POSITION_OPTION,
        chosenPosition,
        positionName,
        positionTitle
    } from '#lib/scales/positions.ts';
    import { runNotes, runTrack, type RunNote } from '#lib/scales/run.ts';
    import { rootButtons } from '#lib/settings/key.ts';
    import type { Labels } from '#lib/settings/settings.ts';
    import { settings } from '#lib/settings/store.svelte.ts';
    import { tuningName } from '#lib/settings/tunings.ts';
    import { customTunings } from '#lib/settings/tunings.svelte.ts';
    import { readOverride, viewContext } from '#lib/url/context.ts';
    import { cardHref } from '#lib/url/href.ts';
    import { replaceCard, setViewOption } from '#lib/url/navigate.ts';
    import {
        cardModule,
        cardPath,
        cardTitle,
        degreesOf,
        readViewOptions,
        writeDegrees,
        type Card
    } from '#lib/url/routes.ts';
    import { page } from '$app/state';
    import { resolve } from '$app/paths';
    import { untrack } from 'svelte';

    interface Props {
        card: Card;
    }

    let { card }: Props = $props();

    const options = $derived(readViewOptions(card.kind, page.url.searchParams));
    const view = $derived(viewContext(settings.current, readOverride(page.url.searchParams, settings.current)));

    const type = $derived(card.scale);
    const set = $derived(spellScale(card.root, type));
    const title = $derived(cardTitle(card));
    const labels: Labels = $derived(options.labels ?? settings.current.labels);
    const tuningText = $derived(tuningName(view.instrument, view.tuning, customTunings.current));
    const instrumentText = $derived(view.instrument === 'guitar' ? 'guitar' : 'bass');

    // Positions (SCL-3, SCL-4): the kinds this scale, instrument and tuning offer, and the one the URL chooses.
    const groups = $derived(scalePositions(view.tuning, set, view.instrument, view.capo));
    const chosen = $derived(chosenPosition(groups, options));
    const chosenName = $derived(chosen ? positionName(chosen.position, set, view.tuning) : undefined);
    const kindOptions = $derived([
        { value: 'neck', label: 'Full neck' },
        ...groups.map(group => ({ value: group.kind, label: KIND_LABELS[group.kind] }))
    ]);
    function showPosition(kind: PositionKind | 'neck', index = 0) {
        // One option at most: setting this one clears the others (`withViewOption`).
        if (kind === 'neck') {
            for (const name of ['pos', 'nps', 'box'] as const) {
                if (options[name] !== undefined)
                    void setViewOption(page.url, card.kind, settings.current, name, undefined);
            }
            return;
        }
        const position = groups.find(group => group.kind === kind)?.positions[index];
        if (position) void setViewOption(page.url, card.kind, settings.current, POSITION_OPTION[kind], position.number);
    }

    const diagramTitle = $derived(
        `${title} on ${instrumentText}, ${tuningText} tuning${chosenName ? `, ${chosenName}` : ''}`
    );

    // The root picker (THY-2.2, THY-2.5): the spellings this scale offers, and the other one a tap away.
    const buttons = $derived(rootButtons(type));
    const rootOptions = $derived(buttons.map(button => ({ value: String(button.pitchClass), label: button.label })));
    const pitchClass = $derived(notePitchClass(card.root));
    // A linked root this scale doesn't offer (A♯ Dorian) leaves every button unchosen, so B♭ is one tap (THY-2.5).
    const chosenRoot = $derived(buttons.some(button => button.spellings.includes(card.root)) ? String(pitchClass) : '');
    const otherSpelling = $derived(
        buttons.find(button => button.pitchClass === pitchClass)?.spellings.find(spelling => spelling !== card.root)
    );
    const simpler = $derived(simplerRoot(card.root, type));
    const doubles = $derived(unavoidableDoubles(card.root, type));

    function openRoot(root: string) {
        void replaceCard({ ...card, root }, page.url.search);
    }

    // Highlighted degrees (SCL-2.3): only the scale's own count.
    const highlighted = $derived(degreesOf(options.deg).filter(degree => degree <= set.notes.length));
    function toggle(degree: number) {
        const next = highlighted.includes(degree) ? highlighted.filter(d => d !== degree) : [...highlighted, degree];
        void setViewOption(page.url, card.kind, settings.current, 'deg', writeDegrees(next));
    }
    const dimmed = $derived(
        highlighted.length === 0 ? undefined : (cell: FretboardCell) => !highlighted.includes(cell.degree)
    );

    // What makes a mode a mode (SCL-5), for the seven modes of the major scale only (MODE-1.8).
    const mode = $derived(modeInfo(type));
    const characteristic = $derived(mode?.characteristic);
    const marked = $derived(
        characteristic === undefined ? undefined : (cell: FretboardCell) => cell.code === characteristic
    );
    const triads = $derived(mode ? diatonicChords(card.root, type, 3) : []);
    const sevenths = $derived(mode ? diatonicChords(card.root, type, 4) : []);
    const row = $derived(mode ? brightnessRow(card.root, settings.current.accidentals) : []);

    // A scale run (AUD-3): the position's notes, or an octave of the full neck, up and back down at the tempo setting.
    const runCells = $derived(
        runNotes(chosen ? [] : mapScale(view.tuning, set, settings.current.fretRange, view.capo), chosen?.position)
    );
    let playback: Playback | undefined;
    let lit: RunNote | undefined = $state();
    let running = $state(false);
    /** Notes handed over ahead of their time, lit once the audio clock reaches it (AUD-3.2). */
    let due: { readonly note: RunNote; readonly time: number }[] = [];
    let frame: number | undefined;

    // Read from the audio clock on each frame rather than timed by the page's, as the clock stands still while a
    // phone starts audio on the first sound.
    function light() {
        const now = sound.currentTime;
        while (due[0] && due[0].time <= now) lit = due.shift()?.note;
        frame = requestAnimationFrame(light);
    }

    function play() {
        stopRun();
        if (runCells.length === 0) return;
        const voice = instrumentVoice(view.instrument);
        running = true;
        playback = sound.run(runTrack(runCells), {
            bpm: settings.current.tempo,
            note: ({ cell }) => ({ midi: cell.midi, voice, channel: `string:${String(cell.string)}` }),
            onevent: (note, time) => due.push({ note, time }),
            onend: finished,
            // Stopped by a tap or another sound (AUD-1.3).
            onstop: finished
        });
        frame = requestAnimationFrame(light);
    }

    function finished() {
        if (frame !== undefined) cancelAnimationFrame(frame);
        frame = undefined;
        due = [];
        playback = undefined;
        lit = undefined;
        running = false;
    }

    function stopRun() {
        if (playback) playback.stop();
        else finished();
    }

    // A run stops when its notes change (the card, the position, the neck) and when the card closes.
    const runKey = $derived(
        [cardPath(card), view.instrument, view.tuning.join('-'), String(view.capo), chosenName ?? 'neck'].join(' ')
    );
    $effect(() => {
        void runKey;
        return () => untrack(stopRun);
    });

    // The last fret tapped, named under the neck (DIAG-1.6); cleared when the card or the neck it was tapped on changes.
    const neck = $derived(
        [cardPath(card), view.tuning.join('-'), String(view.capo), settings.current.accidentals].join(' ')
    );
    let tapped: { readonly neck: string; readonly line: string } | undefined = $state();
    const tappedText = $derived(tapped?.neck === neck ? tapped.line : undefined);
    function tap(fret: TappedFret) {
        playFret(fret, view.instrument);
        tapped = { neck, line: tappedLine(fret) };
    }
</script>

<Screen {title} back={cardModule(card.kind)} wide>
    <dl class="facts">
        <div>
            <dt>Notes</dt>
            <dd>{set.notes.map(noteLabel).join(' ')}</dd>
        </div>
        <div>
            <dt>Intervals</dt>
            <dd>{type.intervals.map(intervalLabel).join(' ')}</dd>
        </div>
        <div>
            <dt>Steps</dt>
            <dd>{stepFormula(type).join(' ')}</dd>
        </div>
    </dl>

    {#if simpler}
        <div class="note">
            <p>
                {title}'s key needs a double sharp or flat; it's usually written as {cardTitle({
                    ...card,
                    root: simpler
                })}.
            </p>
            <a class="link" href={cardHref({ ...card, root: simpler })}>Open {cardTitle({ ...card, root: simpler })}</a>
        </div>
    {:else if doubles}
        <p class="note">
            The notes are named by their intervals from the root ({type.intervals.map(intervalLabel).join(' ')}), and on
            this root that takes a double sharp or flat however the root is spelled.
        </p>
    {/if}

    <details class="root">
        <summary>Root: {noteLabel(card.root)} <span class="change">Change</span></summary>
        <div class="root-picker">
            <Choice
                legend="Root"
                name="card-root"
                options={rootOptions}
                value={chosenRoot}
                columns={4}
                hideLegend
                onchange={value => openRoot(rootChoices(Number(value), type, settings.current.accidentals).root)}
            />
            {#if otherSpelling}
                <button type="button" onclick={() => openRoot(otherSpelling)}>
                    Spell as {noteLabel(otherSpelling)}
                </button>
            {/if}
        </div>
    </details>

    {#if groups.length > 0}
        <div class="positions">
            <Choice
                legend="Positions"
                name="card-positions"
                options={kindOptions}
                value={chosen?.group.kind ?? 'neck'}
                onchange={kind => showPosition(kind as PositionKind | 'neck')}
            />
            {#if chosen}
                <div class="steps" role="group" aria-label="Position">
                    <button
                        type="button"
                        disabled={chosen.index === 0}
                        onclick={() => showPosition(chosen.group.kind, chosen.index - 1)}
                    >
                        ‹ Previous
                    </button>
                    <!-- The frets are numbered on the neck; the figure's caption names them (APP-6.4). -->
                    <span class="name" aria-live="polite">{positionTitle(chosen.position, set, view.tuning)}</span>
                    <button
                        type="button"
                        disabled={chosen.index === chosen.group.positions.length - 1}
                        onclick={() => showPosition(chosen.group.kind, chosen.index + 1)}
                    >
                        Next ›
                    </button>
                </div>
            {/if}
        </div>
    {/if}

    <Fretboard
        tuning={view.tuning}
        {set}
        range={settings.current.fretRange}
        capo={view.capo}
        {labels}
        handedness={settings.current.handedness}
        accidentals={settings.current.accidentals}
        title={diagramTitle}
        {...dimmed ? { dimmed } : {}}
        {...marked ? { marked } : {}}
        {...chosen ? { focus: chosen.position } : {}}
        {...lit ? { playing: lit.cell } : {}}
        ontap={tap}
    />
    <div class="under-neck">
        <p class="tapped" aria-live="polite">{tappedText ?? 'Tap a fret to hear and name it.'}</p>
        <!-- Play is a small extra, so it sits at the end of this line rather than taking a row (owner, 2026-11-26). -->
        <button
            type="button"
            class="play"
            aria-label={running ? 'Stop playing the scale' : 'Play the scale'}
            disabled={!running && runCells.length === 0}
            onclick={() => (running ? stopRun() : play())}
        >
            <span aria-hidden="true">{running ? '■' : '▶'}</span>
        </button>
    </div>

    <div class="highlight" role="group" aria-labelledby="highlight-label">
        <span id="highlight-label">Highlight</span>
        {#each set.codes as code, i (code)}
            <button type="button" aria-pressed={highlighted.includes(i + 1)} onclick={() => toggle(i + 1)}>
                {intervalLabel(code)}
            </button>
        {/each}
        {#if highlighted.length > 0}
            <button
                type="button"
                class="clear"
                onclick={() => setViewOption(page.url, card.kind, settings.current, 'deg', undefined)}
            >
                Clear
            </button>
        {/if}
    </div>

    <Keyboard {set} {labels} {title} {...lit ? { playing: lit.key } : {}} ontap={playKey} />

    {#if mode && characteristic}
        <section class="mode" aria-labelledby="mode-heading">
            <h2 id="mode-heading">The mode</h2>
            <p>{parentLine(card.root, type)}</p>
            <p>
                Its characteristic note is the {intervalLabel(characteristic)}, ringed on the neck.
            </p>
            <nav aria-label="Brightness, brightest first">
                <ol class="brightness">
                    {#each row as other (other.scale.id)}
                        <li>
                            <a href={cardHref(other)} aria-current={other.scale.id === type.id ? 'page' : undefined}>
                                {other.scale.name}
                            </a>
                        </li>
                    {/each}
                </ol>
            </nav>
            <p class="muted">Brightest to darkest.</p>
            <a class="link" href={resolve('/modes')}>All seven modes side by side</a>
            <h3>Chords</h3>
            <table>
                <thead>
                    <tr><th scope="col"></th><th scope="col">Triad</th><th scope="col">7th</th></tr>
                </thead>
                <tbody>
                    {#each triads as triad, i (triad.degree)}
                        {@const seventh = sevenths[i]}
                        <tr>
                            <th scope="row">{numeralLabel(triad.numeral)}</th>
                            <td>{chordLabel(triad.root, triad.suffix)}</td>
                            <td>{seventh ? chordLabel(seventh.root, seventh.suffix) : ''}</td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        </section>
    {/if}

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
        onchange={(next: Labels) =>
            setViewOption(
                page.url,
                card.kind,
                settings.current,
                'labels',
                next === settings.current.labels ? undefined : next
            )}
    />
</Screen>

<style>
    p {
        margin: 0;
    }

    .muted,
    .tapped {
        color: var(--muted);
    }

    .facts {
        display: grid;
        gap: 4px;
        margin: 0;
    }

    .facts div {
        display: flex;
        gap: 12px;
    }

    .facts dt {
        min-width: 5.5em;
        color: var(--muted);
    }

    .facts dd {
        margin: 0;
        font-weight: 600;
    }

    .link {
        display: inline-flex;
        align-items: center;
        min-height: var(--tap);
        justify-self: start;
        color: var(--accent);
        font-size: var(--text-m);
    }

    .note {
        display: grid;
        padding: 8px 12px;
        border-left: 3px solid var(--accent);
        background: var(--surface);
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

    .positions {
        display: grid;
        gap: 8px;
    }

    .under-neck {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
    }

    .play {
        flex: none;
        padding: 0;
    }

    .steps {
        display: grid;
        grid-template-columns: auto 1fr auto;
        align-items: center;
        gap: 8px;
    }

    .steps .name {
        text-align: center;
    }

    button:disabled {
        color: var(--muted);
        opacity: 0.5;
        cursor: default;
    }

    .highlight {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 8px;
    }

    .highlight span {
        font-weight: 600;
        margin-right: 4px;
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

    button[aria-pressed='true'] {
        background: var(--accent);
        border-color: var(--accent);
        color: var(--accent-ink);
        font-weight: 600;
    }

    .clear {
        background: none;
        border-color: transparent;
        color: var(--accent);
    }

    .mode {
        display: grid;
        gap: 12px;
    }

    h2,
    h3 {
        margin: 0;
    }

    .brightness {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin: 0;
        padding: 0;
        list-style: none;
    }

    .brightness a {
        display: inline-flex;
        align-items: center;
        min-height: var(--tap);
        padding: 0 12px;
        border: 1px solid var(--line);
        border-radius: var(--radius);
        color: var(--text);
        text-decoration: none;
    }

    .brightness a[aria-current='page'] {
        background: var(--accent);
        border-color: var(--accent);
        color: var(--accent-ink);
        font-weight: 600;
    }

    table {
        border-collapse: collapse;
        width: 100%;
        max-width: 24rem;
    }

    th,
    td {
        padding: 8px;
        border-bottom: 1px solid var(--line);
        text-align: left;
    }

    thead th {
        color: var(--muted);
        font-weight: 600;
    }
</style>
