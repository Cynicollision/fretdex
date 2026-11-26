<!--
    A fretboard (DIAG-1): the notes `fretkit` maps for a set on a tuning, drawn as architecture.md's Styling says. Wide enough for
    the whole fret range at the tap target, it shows it all; otherwise, as on a phone held upright, it shows a stretch
    of up to six frets with Lower and Higher, over a strip of the whole neck (DIAG-1.10). Given a position, its notes
    are at full strength and the rest dimmed (DIAG-1.3), and upright it shows the position's frets, with Lower and
    Higher only when they don't fit.
-->
<script lang="ts">
    import {
        fretMidi,
        mapScale,
        pitchClass,
        spellMidi,
        spellPitchClass,
        type Accidentals,
        type FretboardCell,
        type FretRange,
        type NoteName,
        type NoteSet
    } from '@fretdex/fretkit';
    import NeckStrip from '#lib/components/NeckStrip.svelte';
    import {
        DOUBLE_INLAYS,
        INLAYS,
        SIZES,
        describeFretboard,
        dotLabel,
        gauge,
        layNeck,
        stretchLength,
        stretches,
        stringY,
        type FretSpace,
        type TappedFret
    } from '#lib/diagrams/fretboard.ts';
    import type { Handedness, Labels } from '#lib/settings/settings.ts';

    interface Focus {
        readonly from: number;
        readonly to: number;
        readonly cells: readonly { readonly string: number; readonly fret: number }[];
    }

    interface Props {
        /** The tuning's pitches, lowest string first. */
        tuning: readonly NoteName[];
        set: NoteSet;
        range: FretRange;
        capo?: number;
        labels: Labels;
        handedness: Handedness;
        /** What it shows, for its text alternative: "C major on guitar, Standard tuning". */
        title: string;
        /** How a fret outside the set is spelled when tapped (THY-2.3). */
        accidentals?: Accidentals;
        /** Notes to dim (DIAG-1.3). */
        dimmed?: (cell: FretboardCell) => boolean;
        /** Notes to draw outlined, such as a scale's notes outside a chord (DIAG-1.7). */
        outlined?: (cell: FretboardCell) => boolean;
        /** Notes to ring, such as a mode's characteristic note (SCL-5.1), leaving the rest as they are. */
        marked?: (cell: FretboardCell) => boolean;
        /** A position (SCL-3): its frets and its notes; the other notes are dimmed, and the neck shows past `range` to hold it. */
        focus?: Focus;
        /** The note sounding in a scale run, lit in the accent colour over whatever else it is (AUD-3.2). */
        playing?: { readonly string: number; readonly fret: number };
        ontap?: (tapped: TappedFret) => void;
    }

    let {
        tuning,
        set,
        range,
        capo = 0,
        labels,
        handedness,
        title,
        accidentals = 'auto',
        dimmed,
        outlined,
        marked,
        focus,
        playing,
        ontap
    }: Props = $props();

    let measured = $state(0);
    const width = $derived(measured > 0 ? measured : 343);
    const stringCount = $derived(tuning.length);
    /** The fret range, widened to hold the position. */
    const neck: FretRange = $derived(
        focus ? { from: Math.min(range.from, focus.from), to: Math.max(range.to, focus.to) } : range
    );
    const cells = $derived(mapScale(tuning, set, neck, capo));
    const inFocus = $derived(new Set(focus?.cells.map(cell => `${String(cell.string)}:${String(cell.fret)}`)));
    function faded(cell: FretboardCell): boolean {
        if (focus && !inFocus.has(`${String(cell.string)}:${String(cell.fret)}`)) return true;
        return dimmed?.(cell) ?? false;
    }

    const whole = $derived(layNeck(neck.from, neck.to, width, stringCount));
    // Upright, the stretches of the position's frets, or of the whole range.
    const runs = $derived(stretches(focus ? { from: focus.from, to: focus.to } : neck, stretchLength(width)));
    /**
     * The stretch chosen with Lower, Higher or the strip, for the stretches it was chosen among; until then, or once the
     * capo, the range or the width changes them, the one with the capo or the bottom of the range.
     */
    let chosen: { readonly among: string; readonly index: number } | undefined = $state();
    const among = $derived(`${String(capo)}:${runs.map(run => `${String(run.from)}-${String(run.to)}`).join(',')}`);
    const start = $derived(
        Math.max(
            0,
            runs.findIndex(run => run.to >= capo)
        )
    );
    const index = $derived(Math.min(Math.max(chosen?.among === among ? chosen.index : start, 0), runs.length - 1));
    const shown: FretRange = $derived(whole ? neck : (runs[index] ?? neck));
    const layout = $derived(
        whole ??
            layNeck(shown.from, shown.to, width, stringCount) ??
            layNeck(shown.from, shown.to, width, stringCount, 0)
    );

    const left = $derived(handedness === 'left');
    /** An x as drawn: mirrored when left-handed, so the nut is on the right (DIAG-1.5). */
    function mx(x: number): number {
        return left ? (layout?.width ?? 0) - x : x;
    }
    /** A span's left edge as drawn. */
    function sx(x0: number, x1: number): number {
        return left ? mx(x1) : x0;
    }
    function centre(space: FretSpace): number {
        return mx((space.x0 + space.x1) / 2);
    }

    const fretted = $derived(layout?.spaces.filter(space => space.fret > 0) ?? []);
    const neckStart = $derived(layout?.nut ?? fretted[0]?.x0 ?? 0);
    const neckEnd = $derived(layout?.spaces.at(-1)?.x1 ?? 0);
    const visible = $derived(cells.filter(cell => cell.fret >= shown.from && cell.fret <= shown.to));
    const middle = $derived(layout ? (layout.top + layout.bottom) / 2 : 0);
    const capoSpace = $derived(capo > 0 ? fretted.find(space => space.fret === capo) : undefined);
    /** The frets below the capo, dimmed and empty (DIAG-1.9). */
    const belowCapo = $derived.by(() => {
        if (capo === 0 || !layout) return undefined;
        const below = layout.spaces.filter(space => space.fret < capo);
        const first = below[0];
        const last = below.at(-1);
        return first && last ? { x0: first.x0, x1: last.x1 } : undefined;
    });
    /** Fret numbers at the inlay frets, and at the first fret when the nut isn't shown (DIAG-1.4). */
    const numbered = $derived(
        fretted.filter(space => INLAYS.includes(space.fret) || (layout?.nut === undefined && space === fretted[0]))
    );
    // With a position, the text alternative lists its notes alone (APP-6.4), as the title names it.
    const description = $derived(
        describeFretboard(
            title,
            tuning,
            focus ? cells.filter(cell => inFocus.has(`${String(cell.string)}:${String(cell.fret)}`)) : cells,
            capo
        )
    );

    function spaceOf(fret: number): FretSpace | undefined {
        return layout?.spaces.find(space => space.fret === fret);
    }

    function tap(event: MouseEvent) {
        if (!ontap || !layout) return;
        const svg = event.currentTarget as SVGSVGElement;
        const box = svg.getBoundingClientRect();
        const x = mx(((event.clientX - box.left) * layout.width) / box.width);
        const y = ((event.clientY - box.top) * layout.height) / box.height;
        const space = layout.spaces.find(candidate => x >= candidate.x0 && x < candidate.x1);
        const string = Math.round((y - layout.top) / SIZES.gap) + 1;
        if (!space || string < 1 || string > stringCount) return;
        const midi = fretMidi(tuning, string, space.fret, capo);
        if (midi === undefined) return;
        const cell = cells.find(candidate => candidate.string === string && candidate.fret === space.fret);
        const note = cell?.note ?? spellMidi(midi, spellPitchClass(pitchClass(midi), accidentals));
        ontap({ string, fret: space.fret, midi, note, ...(cell ? { cell } : {}) });
    }

    function move(by: number) {
        chosen = { among, index: Math.min(Math.max(index + by, 0), runs.length - 1) };
    }

    /** Shows the stretch that best centres a fret tapped on the strip. */
    function pick(fret: number) {
        let best = index;
        let distance = Infinity;
        runs.forEach((run, i) => {
            const d = Math.abs((run.from + run.to) / 2 - fret);
            if (d < distance) {
                best = i;
                distance = d;
            }
        });
        chosen = { among, index: best };
    }

    const rangeText = $derived(
        shown.from === shown.to ? `Fret ${String(shown.from)}` : `Frets ${String(shown.from)}–${String(shown.to)}`
    );
</script>

<figure class="fretboard" bind:clientWidth={measured}>
    <!-- A position that fits needs no Lower and Higher: the card steps through positions (DIAG-1.10). -->
    {#if !whole && (!focus || runs.length > 1)}
        <div class="stretch" role="group" aria-label="Part of the neck">
            {#snippet lower(side: 'start' | 'end')}
                <button type="button" onclick={() => move(-1)} disabled={index === 0}>
                    {side === 'start' ? '‹ Lower' : 'Lower ›'}
                </button>
            {/snippet}
            {#snippet higher(side: 'start' | 'end')}
                <button type="button" onclick={() => move(1)} disabled={index === runs.length - 1}>
                    {side === 'start' ? '‹ Higher' : 'Higher ›'}
                </button>
            {/snippet}
            <!-- Each button is on the side of the neck it moves toward: the nut's side is lower (DIAG-1.5). -->
            {@render (left ? higher : lower)('start')}
            <span class="frets" aria-live="polite">{rangeText}</span>
            {@render (left ? lower : higher)('end')}
        </div>
    {/if}
    {#if layout}
        <!-- Taps are a convenience on top of the buttons and text; a screen reader reads the figure's caption. -->
        <svg
            viewBox="0 0 {layout.width} {layout.height}"
            width={layout.width}
            height={layout.height}
            aria-hidden="true"
            class:tappable={ontap !== undefined}
            onclick={tap}
            data-frets="{shown.from}-{shown.to}"
        >
            <rect
                class="neck"
                x={sx(neckStart, neckEnd)}
                y={layout.top - SIZES.overhang}
                width={neckEnd - neckStart}
                height={layout.bottom - layout.top + 2 * SIZES.overhang}
            />
            {#each fretted as space (space.fret)}
                {#if INLAYS.includes(space.fret)}
                    {#if DOUBLE_INLAYS.includes(space.fret)}
                        <circle class="inlay" cx={centre(space)} cy={middle - SIZES.gap} r="7" />
                        <circle class="inlay" cx={centre(space)} cy={middle + SIZES.gap} r="7" />
                    {:else}
                        <circle class="inlay" cx={centre(space)} cy={middle} r="7" />
                    {/if}
                {/if}
                <line
                    class="fret"
                    x1={mx(space.x1)}
                    x2={mx(space.x1)}
                    y1={layout.top - SIZES.overhang}
                    y2={layout.bottom + SIZES.overhang}
                />
            {/each}
            {#if layout.nut !== undefined}
                <rect
                    class="nut"
                    x={sx(layout.nut, layout.nut + SIZES.nut)}
                    y={layout.top - SIZES.overhang}
                    width={SIZES.nut}
                    height={layout.bottom - layout.top + 2 * SIZES.overhang}
                />
            {:else if fretted[0]}
                <line
                    class="fret"
                    x1={mx(fretted[0].x0)}
                    x2={mx(fretted[0].x0)}
                    y1={layout.top - SIZES.overhang}
                    y2={layout.bottom + SIZES.overhang}
                />
            {/if}
            {#each { length: stringCount }, i (i)}
                <line
                    class="string"
                    x1={mx(layout.nut === undefined ? neckStart : SIZES.edge)}
                    x2={mx(neckEnd)}
                    y1={stringY(layout, i + 1)}
                    y2={stringY(layout, i + 1)}
                    stroke-width={gauge(i + 1, stringCount)}
                />
            {/each}
            {#if belowCapo}
                <rect
                    class="below-capo"
                    x={sx(belowCapo.x0, belowCapo.x1)}
                    y={layout.top - SIZES.overhang}
                    width={belowCapo.x1 - belowCapo.x0}
                    height={layout.bottom - layout.top + 2 * SIZES.overhang}
                />
            {/if}
            {#if capoSpace}
                <rect
                    class="capo"
                    data-capo={capo}
                    x={centre(capoSpace) - 7}
                    y={layout.top - SIZES.overhang + 2}
                    width="14"
                    height={layout.bottom - layout.top + 2 * SIZES.overhang - 4}
                    rx="5"
                />
            {/if}
            {#each numbered as space (space.fret)}
                <text class="number" x={centre(space)} y={layout.bottom + SIZES.overhang + 20}>{space.fret}</text>
            {/each}
            {#each visible as cell (`${String(cell.string)}:${String(cell.fret)}`)}
                {@const space = spaceOf(cell.fret)}
                {#if space}
                    {@const x = centre(space)}
                    {@const y = stringY(layout, cell.string)}
                    {@const r = SIZES.dot / 2}
                    {@const root = cell.degree === 1}
                    {@const ring = !root && (outlined?.(cell) ?? false)}
                    {@const mark = marked?.(cell) ?? false}
                    {@const lit = playing?.string === cell.string && playing.fret === cell.fret}
                    <g
                        class="dot"
                        class:root
                        class:ring
                        class:marked={mark}
                        class:dim={!lit && faded(cell)}
                        class:playing={lit}
                        data-string={cell.string}
                        data-fret={cell.fret}
                        data-note={cell.note}
                    >
                        {#if mark}
                            <circle class="mark" cx={x} cy={y} r={r + 4} />
                        {/if}
                        {#if lit}
                            <!-- A ring too, as the root is already in the accent colour in two themes. -->
                            <circle class="halo" cx={x} cy={y} r={r + 7} />
                        {/if}
                        {#if root}
                            <rect x={x - r} y={y - r} width={SIZES.dot} height={SIZES.dot} rx="4" />
                        {:else if ring}
                            <circle cx={x} cy={y} r={r - 1.5} />
                        {:else}
                            <circle cx={x} cy={y} {r} />
                        {/if}
                        <text {x} {y}>{dotLabel(cell, labels)}</text>
                    </g>
                {/if}
            {/each}
        </svg>
    {/if}
    {#if !whole}
        <NeckStrip
            range={neck}
            {shown}
            {stringCount}
            {handedness}
            {width}
            roots={cells.filter(cell => cell.degree === 1)}
            onpick={pick}
        />
    {/if}
    <figcaption class="visually-hidden">
        {#each description as line, i (i)}<span>{line} </span>{/each}
    </figcaption>
</figure>

<style>
    .fretboard {
        display: grid;
        gap: 8px;
        margin: 0;
        min-width: 0;
    }

    svg {
        display: block;
        max-width: 100%;
        height: auto;
        user-select: none;
    }

    .tappable {
        cursor: pointer;
    }

    .neck {
        fill: var(--neck);
    }

    .inlay {
        fill: var(--inlay);
    }

    .fret {
        stroke: var(--fret);
        stroke-width: 2.5;
    }

    .nut,
    .capo {
        fill: var(--nut);
    }

    .string {
        stroke: var(--string);
    }

    .below-capo {
        fill: var(--bg);
        opacity: 0.7;
    }

    text {
        text-anchor: middle;
        dominant-baseline: central;
        font-family: var(--font);
        font-size: var(--text-xs);
        font-weight: 700;
    }

    .number {
        fill: var(--muted);
        font-weight: 600;
    }

    .dot circle {
        fill: var(--note);
    }

    .dot text {
        fill: var(--note-ink);
    }

    .dot.root rect {
        fill: var(--root);
    }

    .dot.root text {
        fill: var(--root-ink);
    }

    .dot.ring circle {
        fill: var(--neck);
        stroke: var(--note);
        stroke-width: 3;
    }

    .dot.ring text {
        fill: var(--note);
    }

    .dot circle.mark {
        fill: none;
        stroke: var(--accent);
        stroke-width: 3;
    }

    .dot.dim {
        opacity: 0.3;
    }

    .dot.playing circle:not(.mark, .halo),
    .dot.playing rect {
        fill: var(--accent);
        stroke: none;
    }

    .dot.playing text {
        fill: var(--accent-ink);
    }

    .dot circle.halo {
        fill: none;
        stroke: var(--text);
        stroke-width: 3;
    }

    .stretch {
        display: grid;
        grid-template-columns: auto 1fr auto;
        align-items: center;
        gap: 8px;
    }

    .stretch button {
        min-height: var(--tap);
        min-width: var(--tap);
        padding: 0 12px;
        border: 1px solid var(--line);
        border-radius: var(--radius);
        background: var(--surface-2);
        color: var(--text);
        font: inherit;
        font-size: var(--text-m);
    }

    .stretch button:disabled {
        color: var(--muted);
        opacity: 0.5;
    }

    .frets {
        text-align: center;
        color: var(--muted);
    }
</style>
