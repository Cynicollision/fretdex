<!--
    A fretboard's compact form for a pin tile (DIAG-5.1), 150 by 72: hairline frets and strings, the nut when the open
    strings are in range, and dots without labels, the root a square.
-->
<script lang="ts">
    import { mapScale, stringIndex, type FretRange, type NoteName, type NoteSet } from '@fretdex/fretkit';
    import type { Handedness } from '#lib/settings/settings.ts';

    interface Props {
        tuning: readonly NoteName[];
        set: NoteSet;
        range: FretRange;
        capo?: number;
        handedness: Handedness;
        /** What it shows, read out in place of the drawing (APP-6.4). */
        title: string;
    }

    let { tuning, set, range, capo = 0, handedness, title }: Props = $props();

    const WIDTH = 150;
    const HEIGHT = 72;
    const PAD = 6;
    const stringCount = $derived(tuning.length);
    const slots = $derived(range.to - range.from + 1);
    const slot = $derived((WIDTH - 2 * PAD) / slots);
    const gap = $derived((HEIGHT - 2 * PAD - 8) / Math.max(1, stringCount - 1));
    const cells = $derived(mapScale(tuning, set, range, capo));

    function mx(x: number): number {
        return handedness === 'left' ? WIDTH - x : x;
    }
    function y(string: number): number {
        return PAD + 4 + (string - 1) * gap;
    }
    function cx(fret: number): number {
        return mx(PAD + (fret - range.from + 0.5) * slot);
    }
</script>

<svg viewBox="0 0 {WIDTH} {HEIGHT}" width={WIDTH} height={HEIGHT} role="img" aria-label={title} class="mini">
    <rect class="neck" x={PAD} y={PAD} width={WIDTH - 2 * PAD} height={HEIGHT - 2 * PAD} rx="3" />
    {#each { length: slots }, i (i)}
        {@const x = mx(PAD + (i + 1) * slot)}
        {#if i < slots - 1}<line class="fret" x1={x} x2={x} y1={PAD} y2={HEIGHT - PAD} />{/if}
    {/each}
    {#if range.from === 0}
        <rect class="nut" x={mx(PAD + slot) - 1.5} y={PAD} width="3" height={HEIGHT - 2 * PAD} />
    {/if}
    {#each { length: stringCount }, i (i)}
        <line
            class="string"
            x1={PAD}
            x2={WIDTH - PAD}
            y1={y(i + 1)}
            y2={y(i + 1)}
            data-open={tuning[stringIndex(i + 1, stringCount)]}
        />
    {/each}
    {#each cells as cell (`${String(cell.string)}:${String(cell.fret)}`)}
        {#if cell.degree === 1}
            <rect class="root" x={cx(cell.fret) - 4.5} y={y(cell.string) - 4.5} width="9" height="9" rx="1.5" />
        {:else}
            <circle class="note" cx={cx(cell.fret)} cy={y(cell.string)} r="4" />
        {/if}
    {/each}
</svg>

<style>
    .mini {
        display: block;
    }

    .neck {
        fill: var(--neck);
    }

    .fret {
        stroke: var(--fret);
        stroke-width: 1;
    }

    .nut {
        fill: var(--nut);
    }

    .string {
        stroke: var(--string);
        stroke-width: 0.8;
    }

    .root {
        fill: var(--root);
    }

    .note {
        fill: var(--note);
    }
</style>
