<!--
    The context bar's sheet (APP-2.1): the current key, instrument, tuning and capo (CTX-1), each applied as it's
    chosen so the screen behind updates in place (APP-2.2), the master volume and mute (AUD-1.2), and the way to the
    rest of the settings (APP-1.1). A new custom tuning is entered here (THY-3.3, CTX-2.7).
    On a card whose URL overrides the instrument, tuning or capo, changing one of them here also clears the override,
    so the card follows the choice (APP-2.3).
-->
<script lang="ts">
    import { MAX_CAPO, TUNINGS, noteLabel, notePitchName, type Instrument, type NoteName } from '@fretdex/fretkit';
    import Choice from '#lib/components/Choice.svelte';
    import KeyPicker from '#lib/components/KeyPicker.svelte';
    import Stepper from '#lib/components/Stepper.svelte';
    import Switch from '#lib/components/Switch.svelte';
    import TuningEditor from '#lib/components/TuningEditor.svelte';
    import { sameTuning, switchInstrument } from '#lib/settings/settings.ts';
    import { settings } from '#lib/settings/store.svelte.ts';
    import { MAX_CUSTOM_TUNINGS } from '#lib/settings/tunings.ts';
    import { customTunings } from '#lib/settings/tunings.svelte.ts';
    import { resolve } from '$app/paths';

    interface Props {
        open: boolean;
        onclose: () => void;
        /** What the card's URL overrides, as the bar shows it, when it overrides anything (APP-2.3). */
        override?: string | undefined;
        /** Called once the instrument, tuning or capo has changed, to clear the override. */
        onchangecontext?: () => void;
    }

    let { open, onclose, override, onchangecontext }: Props = $props();

    let dialog: HTMLDialogElement | undefined = $state();
    let editing = $state(false);

    $effect(() => {
        if (!dialog) return;
        if (open && !dialog.open) {
            editing = false;
            dialog.showModal();
        } else if (!open && dialog.open) dialog.close();
    });

    const current = $derived(settings.current);
    const saved = $derived(customTunings.current[current.instrument]);

    interface TuningRow {
        readonly id: string;
        readonly name: string;
        readonly strings: readonly NoteName[];
    }

    const tuningRows: TuningRow[] = $derived.by(() => {
        const rows: TuningRow[] = [
            ...TUNINGS[current.instrument].map(tuning => ({ ...tuning, id: `built-in:${tuning.id}` })),
            ...saved.map(tuning => ({ ...tuning, id: `saved:${tuning.id}` }))
        ];
        // A tuning that's neither built in nor saved (one deleted on Settings) is listed while it's chosen.
        if (!rows.some(row => sameTuning(row.strings, current.tuning))) {
            rows.push({ id: 'unsaved', name: 'Custom', strings: current.tuning });
        }
        return rows;
    });
    const chosenTuning = $derived(tuningRows.find(row => sameTuning(row.strings, current.tuning))?.id);

    function pitchNames(strings: readonly NoteName[]): string {
        return strings.map(note => noteLabel(notePitchName(note))).join(' ');
    }

    function chooseTuning(strings: readonly NoteName[]) {
        void settings.update(s => ({ ...s, tuning: strings })).then(onchangecontext);
    }

    function chooseInstrument(instrument: Instrument) {
        void settings.update(s => switchInstrument(s, instrument)).then(onchangecontext);
    }

    function chooseCapo(capo: number) {
        void settings.update({ capo }).then(onchangecontext);
    }

    async function saveTuning(name: string, strings: NoteName[]) {
        const instrument = current.instrument;
        const added = await customTunings.add(instrument, name, strings);
        if (added) {
            await settings.update(s => (s.instrument === instrument ? { ...s, tuning: added.strings } : s));
            onchangecontext?.();
        }
        editing = false;
    }

    // Closing by Escape, or a tap on the backdrop around the sheet. A click lands on the dialog itself for the
    // backdrop, but also for its scrollbar or a text selection dragged out of it, so it closes only when the press
    // started and ended outside the sheet's box.
    let pressedOutside = false;

    function outside(event: MouseEvent): boolean {
        if (event.target !== dialog || !dialog) return false;
        const box = dialog.getBoundingClientRect();
        return (
            event.clientX < box.left ||
            event.clientX > box.right ||
            event.clientY < box.top ||
            event.clientY > box.bottom
        );
    }

    function backdropClick(event: MouseEvent) {
        if (pressedOutside && outside(event)) dialog?.close();
        pressedOutside = false;
    }
</script>

<dialog
    bind:this={dialog}
    aria-labelledby="context-sheet-title"
    {onclose}
    onpointerdown={(event: PointerEvent) => (pressedOutside = outside(event))}
    onclick={backdropClick}
>
    {#if open}
        <div class="sheet">
            <header>
                <h2 id="context-sheet-title">{editing ? 'New tuning' : 'Key and tuning'}</h2>
                {#if !editing}
                    <button type="button" class="done" onclick={() => dialog?.close()}>Done</button>
                {/if}
            </header>

            {#if editing}
                <TuningEditor
                    instrument={current.instrument}
                    strings={current.tuning}
                    saved={customTunings.current}
                    accidentals={current.accidentals}
                    onsave={saveTuning}
                    oncancel={() => (editing = false)}
                />
            {:else}
                <section aria-labelledby="context-key">
                    <h3 id="context-key">Key</h3>
                    <KeyPicker />
                </section>

                {#if override}
                    <p class="override">
                        This card's link shows it for {override}. Changing the instrument, tuning or capo here changes
                        your setting and shows the card with it.
                    </p>
                {/if}

                <section aria-label="Instrument">
                    <Choice
                        legend="Instrument"
                        name="context-instrument"
                        options={[
                            { value: 'guitar', label: 'Guitar' },
                            { value: 'bass', label: 'Bass' }
                        ]}
                        value={current.instrument}
                        onchange={chooseInstrument}
                    />
                </section>

                <section aria-label="Tuning">
                    <fieldset>
                        <legend>Tuning</legend>
                        <div class="tunings">
                            {#each tuningRows as row (row.id)}
                                <label class:chosen={row.id === chosenTuning}>
                                    <input
                                        type="radio"
                                        name="context-tuning"
                                        value={row.id}
                                        checked={row.id === chosenTuning}
                                        onchange={() => chooseTuning(row.strings)}
                                    />
                                    <span class="tuning-name">{row.name}</span>
                                    <span class="pitches">{pitchNames(row.strings)}</span>
                                </label>
                            {/each}
                        </div>
                    </fieldset>
                    {#if saved.length < MAX_CUSTOM_TUNINGS}
                        <button type="button" class="new" onclick={() => (editing = true)}>New tuning…</button>
                    {:else}
                        <p class="muted">
                            {MAX_CUSTOM_TUNINGS} tunings are saved for the {current.instrument}, the most there can be.
                            Delete one on Settings to save another.
                        </p>
                    {/if}
                </section>

                <section aria-label="Capo">
                    <Stepper label="Capo" min={0} max={MAX_CAPO} value={current.capo} onchange={chooseCapo} />
                </section>

                <section aria-labelledby="context-sound">
                    <h3 id="context-sound">Sound</h3>
                    <label class="volume">
                        <span>Volume</span>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            step="5"
                            value={current.volume}
                            aria-valuetext="{current.volume} percent"
                            oninput={event => void settings.update({ volume: Number(event.currentTarget.value) })}
                        />
                    </label>
                    <Switch
                        label="Mute"
                        checked={current.muted}
                        onchange={(muted: boolean) => void settings.update({ muted })}
                    />
                </section>

                <a class="all-settings" href={resolve('/settings')} onclick={() => dialog?.close()}>All settings ›</a>
            {/if}
        </div>
    {/if}
</dialog>

<style>
    dialog {
        width: 100%;
        max-width: 40rem;
        max-height: 92dvh;
        margin: auto auto 0;
        padding: 0;
        border: 1px solid var(--line);
        border-bottom: 0;
        border-radius: var(--radius) var(--radius) 0 0;
        background: var(--surface);
        color: var(--text);
        box-sizing: border-box;
    }

    .volume {
        display: grid;
        grid-template-columns: auto 1fr;
        align-items: center;
        gap: 16px;
        min-height: var(--tap);
        font-weight: 600;
    }

    .volume input {
        width: 100%;
        min-height: var(--tap);
        margin: 0;
        accent-color: var(--accent);
    }

    .override {
        margin: 0;
        color: var(--muted);
    }

    dialog::backdrop {
        background: var(--backdrop);
    }

    .sheet {
        display: grid;
        gap: 28px;
        padding: 16px max(16px, env(safe-area-inset-right, 0px)) max(24px, env(safe-area-inset-bottom, 0px))
            max(16px, env(safe-area-inset-left, 0px));
    }

    header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
    }

    section {
        display: grid;
        gap: 12px;
        min-width: 0;
    }

    h3,
    legend {
        font-size: var(--text-s);
        font-weight: 600;
    }

    fieldset {
        margin: 0;
        padding: 0;
        border: 0;
        min-width: 0;
    }

    legend {
        padding: 0;
        margin-bottom: 8px;
    }

    .tunings {
        display: grid;
        gap: 8px;
    }

    .tunings label {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        min-height: var(--tap);
        padding: 0 14px;
        border: 1px solid var(--line);
        border-radius: var(--radius);
        background: var(--surface-2);
        font-size: var(--text-m);
        cursor: pointer;
    }

    .tunings label.chosen {
        background: var(--accent);
        border-color: var(--accent);
        color: var(--accent-ink);
    }

    .tunings label:has(:focus-visible) {
        outline: 3px solid var(--accent);
        outline-offset: 2px;
    }

    .tunings input {
        position: absolute;
        opacity: 0;
        width: 1px;
        height: 1px;
        margin: 0;
    }

    .tuning-name {
        font-weight: 600;
        overflow-wrap: anywhere;
    }

    .pitches {
        flex: none;
        font-size: var(--text-xs);
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

    .done {
        background: var(--accent);
        border-color: var(--accent);
        color: var(--accent-ink);
        font-weight: 600;
    }

    .new {
        justify-self: start;
    }

    .all-settings {
        justify-self: start;
        display: inline-flex;
        align-items: center;
        min-height: var(--tap);
        color: var(--accent);
        font-size: var(--text-m);
        text-decoration: none;
    }

    p {
        margin: 0;
    }

    .muted {
        color: var(--muted);
    }
</style>
