<!--
    A Modes overview row's small fretboard (MODE-1.12, MODE-1.13): one position of the mode across its frets, the
    scale's other notes there faded, labelled per the overview's labels, and its characteristic note ringed. Not
    tappable: the row it's in opens the mode's card.
-->
<script lang="ts">
    import { mapScale, type IntervalCode, type NoteName, type NoteSet, type Position } from '@fretdex/fretkit';
    import { INLAYS, DOUBLE_INLAYS, dotLabel, gauge, type FretSpace } from '#lib/diagrams/fretboard.ts';
    import { MARK, MODE_NECK, layModeNeck, modeStringY } from '#lib/diagrams/mode-neck.ts';
    import type { Handedness, Labels } from '#lib/settings/settings.ts';

    interface Props {
        /** The tuning's pitches, lowest string first. */
        tuning: readonly NoteName[];
        set: NoteSet;
        /** The position shown (MODE-1.12): its frets, and its notes at full strength. */
        position: Pick<Position, 'from' | 'to' | 'cells'>;
        capo?: number;
        labels: Labels;
        handedness: Handedness;
        /** Ringed (SCL-5.1). */
        characteristic: IntervalCode;
    }

    let { tuning, set, position, capo = 0, labels, handedness, characteristic }: Props = $props();

    let measured = $state(0);
    const width = $derived(measured > 0 ? measured : 343);
    const stringCount = $derived(tuning.length);
    const window = $derived({ from: position.from, to: position.to });
    const layout = $derived(layModeNeck(window, width, stringCount));
    const cells = $derived(mapScale(tuning, set, window, capo));
    const inPosition = $derived(new Set(position.cells.map(cell => `${String(cell.string)}:${String(cell.fret)}`)));

    const left = $derived(handedness === 'left');
    /** An x as drawn: mirrored when left-handed, so the nut is on the right (DIAG-1.5). */
    function mx(x: number): number {
        return left ? layout.width - x : x;
    }
    function sx(x0: number, x1: number): number {
        return left ? mx(x1) : x0;
    }
    function centre(space: FretSpace): number {
        return mx((space.x0 + space.x1) / 2);
    }
    function spaceOf(fret: number): FretSpace | undefined {
        return layout.spaces.find(space => space.fret === fret);
    }

    const fretted = $derived(layout.spaces.filter(space => space.fret > 0));
    const neckStart = $derived(layout.nut ?? fretted[0]?.x0 ?? 0);
    const neckEnd = $derived(layout.spaces.at(-1)?.x1 ?? 0);
    const middle = $derived((layout.top + layout.bottom) / 2);
    const capoSpace = $derived(capo > 0 ? fretted.find(space => space.fret === capo) : undefined);
    /** The inlay frets are numbered, and the first fret when the nut isn't shown (DIAG-1.4). */
    const numbered = $derived(
        fretted.filter(space => INLAYS.includes(space.fret) || (layout.nut === undefined && space === fretted[0]))
    );
    const r = MODE_NECK.dot / 2;
</script>

<div class="mode-neck" bind:clientWidth={measured}>
    <svg
        viewBox="0 0 {layout.width} {layout.height}"
        width={layout.width}
        height={layout.height}
        aria-hidden="true"
        data-frets="{window.from}-{window.to}"
    >
        <rect
            class="neck"
            x={sx(neckStart, neckEnd)}
            y={layout.top - MODE_NECK.overhang}
            width={neckEnd - neckStart}
            height={layout.bottom - layout.top + 2 * MODE_NECK.overhang}
        />
        {#each fretted as space (space.fret)}
            {#if INLAYS.includes(space.fret)}
                {#if DOUBLE_INLAYS.includes(space.fret)}
                    <circle class="inlay" cx={centre(space)} cy={middle - MODE_NECK.gap} r="4" />
                    <circle class="inlay" cx={centre(space)} cy={middle + MODE_NECK.gap} r="4" />
                {:else}
                    <circle class="inlay" cx={centre(space)} cy={middle} r="4" />
                {/if}
            {/if}
            <line
                class="fret"
                x1={mx(space.x1)}
                x2={mx(space.x1)}
                y1={layout.top - MODE_NECK.overhang}
                y2={layout.bottom + MODE_NECK.overhang}
            />
        {/each}
        {#if layout.nut !== undefined}
            <rect
                class="nut"
                x={sx(layout.nut, layout.nut + MODE_NECK.nut)}
                y={layout.top - MODE_NECK.overhang}
                width={MODE_NECK.nut}
                height={layout.bottom - layout.top + 2 * MODE_NECK.overhang}
            />
        {:else if fretted[0]}
            <line
                class="fret"
                x1={mx(fretted[0].x0)}
                x2={mx(fretted[0].x0)}
                y1={layout.top - MODE_NECK.overhang}
                y2={layout.bottom + MODE_NECK.overhang}
            />
        {/if}
        {#each { length: stringCount }, i (i)}
            <line
                class="string"
                x1={mx(layout.nut === undefined ? neckStart : MODE_NECK.edge)}
                x2={mx(neckEnd)}
                y1={modeStringY(layout, i + 1)}
                y2={modeStringY(layout, i + 1)}
                stroke-width={gauge(i + 1, stringCount) * 0.8}
            />
        {/each}
        {#if capoSpace}
            <rect
                class="capo"
                data-capo={capo}
                x={centre(capoSpace) - 5}
                y={layout.top - MODE_NECK.overhang + 2}
                width="10"
                height={layout.bottom - layout.top + 2 * MODE_NECK.overhang - 4}
                rx="4"
            />
        {/if}
        {#each numbered as space (space.fret)}
            <text class="number" x={centre(space)} y={layout.bottom + MODE_NECK.overhang + 13}>{space.fret}</text>
        {/each}
        {#each cells as cell (`${String(cell.string)}:${String(cell.fret)}`)}
            {@const space = spaceOf(cell.fret)}
            {#if space}
                {@const x = centre(space)}
                {@const y = modeStringY(layout, cell.string)}
                {@const root = cell.degree === 1}
                {@const key = `${String(cell.string)}:${String(cell.fret)}`}
                <g
                    class="dot"
                    class:root
                    class:dim={!inPosition.has(key)}
                    class:characteristic={cell.code === characteristic}
                    data-string={cell.string}
                    data-fret={cell.fret}
                    data-code={cell.code}
                >
                    {#if cell.code === characteristic}
                        <circle class="mark" cx={x} cy={y} r={r + MARK.gap} stroke-width={MARK.stroke} />
                    {/if}
                    {#if root}
                        <rect x={x - r} y={y - r} width={MODE_NECK.dot} height={MODE_NECK.dot} rx="4" />
                    {:else}
                        <circle cx={x} cy={y} {r} />
                    {/if}
                    <text {x} {y}>{dotLabel(cell, labels)}</text>
                </g>
            {/if}
        {/each}
    </svg>
</div>

<style>
    .mode-neck {
        min-width: 0;
    }

    svg {
        display: block;
        max-width: 100%;
        height: auto;
        user-select: none;
    }

    .neck {
        fill: var(--neck);
    }

    .inlay {
        fill: var(--inlay);
    }

    .fret {
        stroke: var(--fret);
        stroke-width: 2;
    }

    .nut,
    .capo {
        fill: var(--nut);
    }

    .string {
        stroke: var(--string);
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

    .dot.dim {
        opacity: 0.3;
    }

    .dot circle.mark {
        fill: none;
        stroke: var(--accent);
    }
</style>
