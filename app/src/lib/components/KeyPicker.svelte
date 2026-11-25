<!--
    The current key's picker (CTX-1.1): major and minor, with the other modes one tap away (CTX-2.6), the 12 roots
    (THY-2.2), the root's other spelling when there is one, and No key.
-->
<script lang="ts">
    import { noteLabel } from '@fretdex/fretkit';
    import Choice from '#lib/components/Choice.svelte';
    import { changeMode, keyName, keyRootButtons, otherSpelling, pickKey } from '#lib/settings/key.ts';
    import { KEY_MODES, type KeyMode } from '#lib/settings/settings.ts';
    import { settings } from '#lib/settings/store.svelte.ts';

    const key = $derived(settings.current.key);

    // The mode the roots open in when there's no key: the key's own until it's cleared.
    // svelte-ignore state_referenced_locally
    let chosenMode: KeyMode = $state(key?.mode ?? 'major');
    const mode = $derived(key?.mode ?? chosenMode);

    // The other modes show once asked for, or while one of them is chosen.
    let expanded = $state(false);
    const allModes = $derived(expanded || (mode !== 'major' && mode !== 'minor'));
    const modeOptions = $derived(
        KEY_MODES.filter(candidate => allModes || candidate.id === 'major' || candidate.id === 'minor').map(
            candidate => ({ value: candidate.id, label: candidate.name })
        )
    );

    const buttons = $derived(keyRootButtons(mode));
    const rootOptions = $derived(buttons.map(button => ({ value: String(button.pitchClass), label: button.label })));
    const chosenRoot = $derived(
        key ? String(buttons.find(button => button.spellings.includes(key.root))?.pitchClass ?? '') : ''
    );
    const other = $derived(key ? otherSpelling(key) : undefined);

    function setMode(next: KeyMode) {
        chosenMode = next;
        void settings.update(s => (s.key ? { ...s, key: changeMode(s.key, next, s.accidentals) } : s));
    }

    function setRoot(pitchClass: string) {
        void settings.update(s => ({ ...s, key: pickKey(Number(pitchClass), mode, s.accidentals) }));
    }

    function clearKey() {
        chosenMode = mode;
        void settings.update({ key: null });
    }

    function respell() {
        if (!key || !other) return;
        const root = other;
        void settings.update(s => (s.key ? { ...s, key: { ...s.key, root } } : s));
    }
</script>

<div class="picker">
    <div class="modes">
        <Choice legend="Mode" name="key-mode" options={modeOptions} value={mode} hideLegend onchange={setMode} />
        {#if !allModes}
            <button type="button" class="more" aria-expanded="false" onclick={() => (expanded = true)}>
                More modes
            </button>
        {/if}
    </div>

    <Choice legend="Root" name="key-root" options={rootOptions} value={chosenRoot} columns={4} onchange={setRoot} />

    <div class="row">
        <button type="button" class="none" aria-pressed={key === null} onclick={clearKey}> No key </button>
        {#if key && other}
            <button type="button" class="respell" onclick={respell}>Spell as {noteLabel(other)}</button>
        {/if}
    </div>
    <p class="muted" aria-live="polite">{keyName(key)}</p>
</div>

<style>
    .picker {
        display: grid;
        gap: 16px;
    }

    .modes {
        display: grid;
        gap: 8px;
        justify-items: start;
    }

    .row {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
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

    .more {
        background: none;
        border-color: transparent;
        color: var(--accent);
        padding: 0;
    }

    .none[aria-pressed='true'] {
        background: var(--accent);
        border-color: var(--accent);
        color: var(--accent-ink);
        font-weight: 600;
    }

    p {
        margin: 0;
    }

    .muted {
        color: var(--muted);
    }
</style>
