<!--
    A two-octave keyboard from C (DIAG-3): the keys `fretkit` maps for a set marked, the root a square. Small in a card;
    tapping it enlarges it to full width with labels (DIAG-3.1), where a tapped key is reported (DIAG-3.2).
-->
<script lang="ts">
    import { mapKeyboard, type MappedNote, type NoteSet } from '@fretdex/fretkit';
    import { dotLabel } from '#lib/diagrams/fretboard.ts';
    import { KEYBOARD_FROM, KEYBOARD_TO, describeKeyboard, layKeys } from '#lib/diagrams/keyboard.ts';
    import type { Labels } from '#lib/settings/settings.ts';

    interface Props {
        set: NoteSet;
        labels: Labels;
        /** What it shows, for its text alternative: "C major". */
        title: string;
        /** Starts enlarged, as in a test. */
        enlarged?: boolean;
        /** The key sounding in a scale run, its mark lit in the accent colour (AUD-3.2). */
        playing?: number;
        ontap?: (midi: number, note?: MappedNote) => void;
    }

    let { set, labels, title, enlarged = $bindable(false), playing, ontap }: Props = $props();

    let measured = $state(0);
    const width = $derived(enlarged ? (measured > 0 ? measured : 343) : Math.min(measured > 0 ? measured : 240, 240));
    const marked = $derived(mapKeyboard(set, KEYBOARD_FROM, KEYBOARD_TO));
    const keys = $derived(layKeys(width, enlarged));
    const byMidi = $derived(new Map(marked.map(note => [note.midi, note])));
    const labelled = $derived(enlarged && labels !== 'none');
    const height = $derived(keys.height + (labelled ? 52 : 0));
    const description = $derived(describeKeyboard(title, marked));

    function tap(midi: number) {
        ontap?.(midi, byMidi.get(midi));
    }
</script>

<figure class="keyboard" bind:clientWidth={measured}>
    {#snippet drawing()}
        <svg viewBox="0 0 {width} {height}" {width} {height} aria-hidden="true">
            {#each keys.keys as key (key.midi)}
                {@const note = byMidi.get(key.midi)}
                <!-- Enlarged, a key can be tapped; the figure's caption says what's marked. -->
                <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
                <g
                    class="key"
                    class:black={key.black}
                    class:playing={key.midi === playing}
                    data-midi={key.midi}
                    data-marked={note ? 'true' : undefined}
                    data-playing={key.midi === playing ? 'true' : undefined}
                    onclick={enlarged ? () => tap(key.midi) : undefined}
                >
                    <rect x={key.x} y="0" width={key.width} height={key.height} />
                    {#if note}
                        {@const size = Math.min(20, key.width - 4)}
                        {@const cx = key.x + key.width / 2}
                        {@const cy = key.height - size / 2 - 6}
                        {#if note.degree === 1}
                            <rect
                                class="mark root"
                                x={cx - size / 2}
                                y={cy - size / 2}
                                width={size}
                                height={size}
                                rx="3"
                            />
                        {:else}
                            <circle class="mark" {cx} {cy} r={size / 2} />
                        {/if}
                    {/if}
                </g>
            {/each}
            {#if labelled}
                <!-- Black keys' labels in the upper row and white keys' in the lower, so neighbours never collide. -->
                {#each keys.keys as key (key.midi)}
                    {@const note = byMidi.get(key.midi)}
                    {#if note}
                        <text
                            class="label"
                            class:root={note.degree === 1}
                            x={key.x + key.width / 2}
                            y={keys.height + (key.black ? 16 : 40)}
                        >
                            {dotLabel(note, labels)}
                        </text>
                    {/if}
                {/each}
            {/if}
        </svg>
    {/snippet}
    {#if enlarged}
        {@render drawing()}
        <button type="button" class="size" onclick={() => (enlarged = false)}>Smaller keyboard</button>
    {:else}
        <button type="button" class="open" onclick={() => (enlarged = true)} aria-label="Enlarge the keyboard">
            {@render drawing()}
        </button>
    {/if}
    <figcaption class="visually-hidden">{description}</figcaption>
</figure>

<style>
    .keyboard {
        display: grid;
        justify-items: start;
        gap: 8px;
        margin: 0;
        min-width: 0;
    }

    svg {
        display: block;
        max-width: 100%;
        height: auto;
    }

    .open {
        padding: 0;
        border: 0;
        background: none;
        cursor: zoom-in;
        min-height: var(--tap);
    }

    .size {
        min-height: var(--tap);
        padding: 0 12px;
        border: 1px solid var(--line);
        border-radius: var(--radius);
        background: var(--surface-2);
        color: var(--text);
        font: inherit;
    }

    .key rect {
        fill: var(--key-white);
        stroke: var(--key-edge);
        stroke-width: 1;
    }

    .key.black > rect {
        fill: var(--key-black);
    }

    /* Each key's marks in the other key colour, so they show in every theme. */
    .mark {
        fill: var(--key-black);
    }

    .key.black .mark {
        fill: var(--key-white);
        stroke: var(--key-black);
        stroke-width: 1.5;
    }

    /* Edged on a white key, where the root's colour alone is too close to the key's. */
    .key .mark.root {
        fill: var(--root);
        stroke: var(--key-black);
        stroke-width: 1.5;
    }

    .key.black .mark.root {
        stroke: none;
    }

    /* The key sounding in a run, the whole key lit so it shows on either key colour and under the root's mark. */
    .key.playing > rect {
        fill: var(--accent);
    }

    .label {
        text-anchor: middle;
        dominant-baseline: central;
        font-family: var(--font);
        font-size: var(--text-xs);
        font-weight: 700;
        fill: var(--text);
    }

    .label.root {
        fill: var(--accent);
    }
</style>
