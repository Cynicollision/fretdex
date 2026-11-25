<!--
    The whole fret range in small, under an upright fretboard (DIAG-1.10): the roots at their strings' heights and the
    stretch shown outlined. Tapping it moves the fretboard there; Lower and Higher do the same for anyone who can't tap.
-->
<script lang="ts">
    import type { FretboardCell, FretRange } from '@fretdex/fretkit';
    import type { Handedness } from '#lib/settings/settings.ts';

    interface Props {
        range: FretRange;
        shown: FretRange;
        stringCount: number;
        roots: readonly FretboardCell[];
        handedness: Handedness;
        width: number;
        onpick: (fret: number) => void;
    }

    let { range, shown, stringCount, roots, handedness, width, onpick }: Props = $props();

    const HEIGHT = 44;
    const PAD = 12;
    const BAR_TOP = 10;
    const BAR_HEIGHT = 24;
    const slots = $derived(range.to - range.from + 1);
    const slot = $derived((width - 2 * PAD) / slots);
    const left = $derived(handedness === 'left');

    /** A fret slot's left edge as drawn, mirrored when left-handed. */
    function slotX(fret: number): number {
        const x = PAD + (fret - range.from) * slot;
        return left ? width - x - slot : x;
    }

    function rootY(string: number): number {
        const step = stringCount <= 1 ? 0 : (BAR_HEIGHT - 8) / (stringCount - 1);
        return BAR_TOP + 4 + (string - 1) * step;
    }

    function tap(event: MouseEvent) {
        const svg = event.currentTarget as SVGSVGElement;
        const box = svg.getBoundingClientRect();
        let x = ((event.clientX - box.left) * width) / box.width;
        if (left) x = width - x;
        const fret = range.from + Math.floor((x - PAD) / slot);
        onpick(Math.min(Math.max(fret, range.from), range.to));
    }
</script>

<!-- The Lower and Higher buttons do what tapping here does. -->
<svg viewBox="0 0 {width} {HEIGHT}" {width} height={HEIGHT} aria-hidden="true" onclick={tap} class="strip">
    <rect class="bar" x={PAD} y={BAR_TOP} width={width - 2 * PAD} height={BAR_HEIGHT} rx="3" />
    {#each { length: slots - 1 }, i (i)}
        {@const x = slotX(range.from + i + 1) + (left ? slot : 0)}
        <line class="fret" x1={x} x2={x} y1={BAR_TOP} y2={BAR_TOP + BAR_HEIGHT} />
    {/each}
    {#each roots as root (`${String(root.string)}:${String(root.fret)}`)}
        <rect class="root" x={slotX(root.fret) + slot / 2 - 3} y={rootY(root.string) - 3} width="6" height="6" />
    {/each}
    <rect
        class="shown"
        x={Math.min(slotX(shown.from), slotX(shown.to))}
        y={BAR_TOP - 5}
        width={(shown.to - shown.from + 1) * slot}
        height={BAR_HEIGHT + 10}
        rx="5"
    />
</svg>

<style>
    .strip {
        display: block;
        max-width: 100%;
        height: auto;
        cursor: pointer;
    }

    .bar {
        fill: var(--neck);
    }

    .fret {
        stroke: var(--fret);
        stroke-width: 1;
    }

    .root {
        fill: var(--root);
    }

    .shown {
        fill: none;
        stroke: var(--accent);
        stroke-width: 3;
    }
</style>
