<!-- Settings' list of saved tunings (CTX-2.7): each can be renamed or retuned in the editor (THY-3.3), or deleted. -->
<script lang="ts">
    import { noteLabel, notePitchName, type Instrument, type NoteName } from '@fretdex/fretkit';
    import TuningEditor from '#lib/components/TuningEditor.svelte';
    import { sameTuning } from '#lib/settings/settings.ts';
    import { settings } from '#lib/settings/store.svelte.ts';
    import type { CustomTuning } from '#lib/settings/tunings.ts';
    import { customTunings } from '#lib/settings/tunings.svelte.ts';

    const INSTRUMENTS = [
        { id: 'guitar', name: 'Guitar' },
        { id: 'bass', name: 'Bass' }
    ] as const;

    /** The tuning open in the editor, or waiting for its deletion to be confirmed. */
    let editing: string | undefined = $state();
    let deleting: string | undefined = $state();

    const none = $derived(INSTRUMENTS.every(({ id }) => customTunings.current[id].length === 0));

    function pitchNames(strings: readonly NoteName[]): string {
        return strings.map(note => noteLabel(notePitchName(note))).join(' ');
    }

    async function save(instrument: Instrument, tuning: CustomTuning, name: string, strings: NoteName[]) {
        await customTunings.edit(instrument, tuning.id, name, strings);
        // If it's the tuning in use, the context follows it, so the bar keeps its name.
        await settings.update(s =>
            s.instrument === instrument && sameTuning(s.tuning, tuning.strings) ? { ...s, tuning: strings } : s
        );
        editing = undefined;
    }

    async function remove(instrument: Instrument, tuning: CustomTuning) {
        await customTunings.remove(instrument, tuning.id);
        deleting = undefined;
    }
</script>

{#if none}
    <p class="muted">None saved yet. To save one, tap the bar at the top of the screen, then New tuning…</p>
{/if}

{#each INSTRUMENTS as instrument (instrument.id)}
    {@const list = customTunings.current[instrument.id]}
    {#if list.length > 0}
        <div class="instrument">
            <h3>{instrument.name}</h3>
            <ul>
                {#each list as tuning (tuning.id)}
                    <li>
                        {#if editing === tuning.id}
                            <TuningEditor
                                instrument={instrument.id}
                                strings={tuning.strings}
                                name={tuning.name}
                                editing={tuning.id}
                                saved={customTunings.current}
                                accidentals={settings.current.accidentals}
                                onsave={(name: string, strings: NoteName[]) =>
                                    save(instrument.id, tuning, name, strings)}
                                oncancel={() => (editing = undefined)}
                            />
                        {:else}
                            <div class="tuning">
                                <span class="name">{tuning.name}</span>
                                <span class="pitches">{pitchNames(tuning.strings)}</span>
                            </div>
                            {#if deleting === tuning.id}
                                <div class="actions" role="group" aria-label="Delete {tuning.name}?">
                                    <span>Delete {tuning.name}?</span>
                                    <button type="button" onclick={() => (deleting = undefined)}>Keep</button>
                                    <button type="button" class="danger" onclick={() => remove(instrument.id, tuning)}>
                                        Delete
                                    </button>
                                </div>
                            {:else}
                                <div class="actions">
                                    <button
                                        type="button"
                                        aria-label="Edit {tuning.name}"
                                        onclick={() => {
                                            editing = tuning.id;
                                            deleting = undefined;
                                        }}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        type="button"
                                        aria-label="Delete {tuning.name}"
                                        onclick={() => {
                                            deleting = tuning.id;
                                            editing = undefined;
                                        }}
                                    >
                                        Delete
                                    </button>
                                </div>
                            {/if}
                        {/if}
                    </li>
                {/each}
            </ul>
        </div>
    {/if}
{/each}

<style>
    .instrument {
        display: grid;
        gap: 8px;
    }

    ul {
        display: grid;
        gap: 12px;
        margin: 0;
        padding: 0;
        list-style: none;
    }

    li {
        display: grid;
        gap: 8px;
        padding: 12px;
        border: 1px solid var(--line);
        border-radius: var(--radius);
        background: var(--surface);
    }

    .tuning {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
        gap: 4px 12px;
        font-size: var(--text-m);
    }

    .name {
        font-weight: 600;
        overflow-wrap: anywhere;
    }

    .pitches {
        color: var(--muted);
    }

    .actions {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: flex-end;
        gap: 8px;
    }

    .actions span {
        flex-basis: 100%;
    }

    button {
        min-height: var(--tap);
        min-width: var(--tap);
        padding: 0 14px;
        border: 1px solid var(--line);
        border-radius: var(--radius);
        background: var(--surface-2);
        color: var(--text);
        font: inherit;
        font-size: var(--text-m);
        cursor: pointer;
    }

    .danger {
        border-color: var(--text);
        font-weight: 600;
    }

    p {
        margin: 0;
    }

    .muted {
        color: var(--muted);
    }
</style>
