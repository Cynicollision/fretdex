<!--
    A custom tuning's editor (THY-3.3): one row per string, the lowest at the top as string 6 is above a guitarist's
    hand, each pitch between buttons that lower and raise it a semitone, within an octave of Standard's; then a name
    and Save (CTX-2.7).
-->
<script lang="ts">
    import {
        noteLabel,
        noteMidi,
        stringNumber,
        type Accidentals,
        type Instrument,
        type NoteName
    } from '@fretdex/fretkit';
    import { MAX_TUNING_NAME, cannotSave, spellPitch, stringReach, type CustomTunings } from '#lib/settings/tunings.ts';

    interface Props {
        instrument: Instrument;
        /** The pitches it starts from, lowest string first. */
        strings: readonly NoteName[];
        /** The name it starts with: a saved tuning's, when editing one. */
        name?: string;
        /** The saved tuning being edited, which doesn't count as a duplicate of itself. */
        editing?: string;
        saved: CustomTunings;
        accidentals: Accidentals;
        onsave: (name: string, strings: NoteName[]) => void;
        oncancel: () => void;
    }

    let { instrument, strings, name = '', editing, saved, accidentals, onsave, oncancel }: Props = $props();

    const id = $props.id();

    // What's being entered: each string's MIDI pitch, and the name. Props only set where they start.
    // svelte-ignore state_referenced_locally
    let pitches: number[] = $state(strings.map(note => noteMidi(note) ?? 0));
    // svelte-ignore state_referenced_locally
    let typedName = $state(name);

    const spelled = $derived(pitches.map(midi => spellPitch(midi, accidentals)));
    const problem = $derived(cannotSave(instrument, typedName, spelled, saved, editing));

    function step(index: number, by: number) {
        pitches = pitches.map((midi, i) => (i === index ? midi + by : midi));
    }

    function save(event: SubmitEvent) {
        event.preventDefault();
        if (problem === undefined) onsave(typedName.trim(), spelled);
    }
</script>

<form class="editor" onsubmit={save}>
    <ol class="strings" aria-label="Strings">
        {#each pitches as midi, index (index)}
            {@const number = stringNumber(index, pitches.length)}
            {@const reach = stringReach(instrument, index)}
            <li>
                <span class="number">String {number}</span>
                <button
                    type="button"
                    aria-label="Lower string {number}"
                    disabled={midi <= reach.low}
                    onclick={() => step(index, -1)}
                >
                    −
                </button>
                <output aria-live="polite">{noteLabel(spelled[index] ?? '')}</output>
                <button
                    type="button"
                    aria-label="Raise string {number}"
                    disabled={midi >= reach.high}
                    onclick={() => step(index, 1)}
                >
                    +
                </button>
            </li>
        {/each}
    </ol>

    <div class="name">
        <label for="{id}-name">Name</label>
        <input id="{id}-name" type="text" maxlength={MAX_TUNING_NAME} autocomplete="off" bind:value={typedName} />
    </div>

    {#if problem}<p class="problem" aria-live="polite">{problem}</p>{/if}

    <div class="actions">
        <button type="button" class="secondary" onclick={oncancel}>Cancel</button>
        <button type="submit" class="primary" disabled={problem !== undefined}>Save</button>
    </div>
</form>

<style>
    .editor {
        display: grid;
        gap: 16px;
    }

    .strings {
        display: grid;
        gap: 8px;
        margin: 0;
        padding: 0;
        list-style: none;
    }

    li {
        display: grid;
        grid-template-columns: 1fr var(--tap) 4.5em var(--tap);
        align-items: center;
        gap: 8px;
    }

    .number {
        color: var(--muted);
    }

    output {
        text-align: center;
        font-size: var(--text-m);
        font-weight: 700;
    }

    button,
    input {
        min-height: var(--tap);
        border: 1px solid var(--line);
        border-radius: var(--radius);
        background: var(--surface-2);
        color: var(--text);
        font: inherit;
        font-size: var(--text-m);
    }

    button {
        min-width: var(--tap);
        padding: 0 14px;
        cursor: pointer;
    }

    li button {
        padding: 0;
    }

    button:disabled {
        color: var(--muted);
        cursor: default;
    }

    .name {
        display: grid;
        gap: 8px;
    }

    label {
        font-weight: 600;
    }

    input {
        padding: 0 12px;
        min-width: 0;
    }

    .problem {
        margin: 0;
        color: var(--muted);
    }

    .actions {
        display: flex;
        justify-content: flex-end;
        gap: 8px;
    }

    .primary {
        background: var(--accent);
        border-color: var(--accent);
        color: var(--accent-ink);
        font-weight: 600;
    }

    .primary:disabled {
        background: var(--surface-2);
        border-color: var(--line);
        color: var(--muted);
    }
</style>
