<!--
    A stand-in until the home board (M01 T12): the current key, or C major, on a fretboard, and a list that show what
    every setting does, so each can be checked on the phone. Deleted with the placeholder home page.
-->
<script lang="ts">
    import { noteLabel, scaleType, spellPitchClass, spellScale } from '@fretdex/fretkit';
    import { playFret } from '#lib/audio/sound.ts';
    import Fretboard from '#lib/components/Fretboard.svelte';
    import type { TappedFret } from '#lib/diagrams/fretboard.ts';
    import { KEY_MODES, type Settings } from '#lib/settings/settings.ts';
    import { NO_CUSTOM_TUNINGS, tuningName, type CustomTunings } from '#lib/settings/tunings.ts';

    let { settings, saved = NO_CUSTOM_TUNINGS }: { settings: Settings; saved?: CustomTunings } = $props();

    const mode = $derived(KEY_MODES.find(candidate => candidate.id === settings.key?.mode) ?? KEY_MODES[0]);
    const scale = $derived.by(() => {
        const type = scaleType(mode.scale);
        if (type === undefined) throw new Error(`No scale ${mode.scale}`);
        return spellScale(settings.key?.root ?? 'C', type);
    });
    const keyText = $derived(
        settings.key ? `${noteLabel(settings.key.root)} ${mode.name}` : 'None, so C major is shown'
    );
    const tuningText = $derived(
        `${tuningName(settings.instrument, settings.tuning, saved)}: ${settings.tuning.map(noteLabel).join(' ')}`
    );
    const loneNotes = $derived(
        Array.from({ length: 12 }, (_, pc) => noteLabel(spellPitchClass(pc, settings.accidentals))).join(' ')
    );

    const THEMES = { dark: 'Dark', light: 'Light', contrast: 'High contrast' } as const;
    const LABELS = { notes: 'Note names', intervals: 'Intervals', degrees: 'Scale degrees', none: 'None' } as const;
</script>

<section aria-labelledby="preview-title">
    <h2 id="preview-title">Settings preview</h2>
    <p class="muted">What each setting does, on the current key or C major.</p>

    <dl>
        <dt>Key</dt>
        <dd>{keyText}</dd>
        <dt>Instrument</dt>
        <dd>{settings.instrument === 'guitar' ? 'Guitar' : 'Bass'}</dd>
        <dt>Tuning</dt>
        <dd>{tuningText}</dd>
        <dt>Capo</dt>
        <dd>{settings.capo === 0 ? 'None' : `Fret ${String(settings.capo)}`}</dd>
        <dt>Labels</dt>
        <dd>{LABELS[settings.labels]}</dd>
        <dt>Lone notes</dt>
        <dd data-testid="lone-notes">{loneNotes}</dd>
        <dt>Handedness</dt>
        <dd>{settings.handedness === 'right' ? 'Right' : 'Left'}</dd>
        <dt>Fret range</dt>
        <dd>{settings.fretRange.from} to {settings.fretRange.to}</dd>
        <dt>Theme</dt>
        <dd>{THEMES[settings.theme]}</dd>
        <dt>Keep screen awake</dt>
        <dd>{settings.keepAwake ? 'On' : 'Off'}</dd>
        <dt>Tempo</dt>
        <dd>{settings.tempo} bpm</dd>
        <dt>Volume</dt>
        <dd>{settings.volume}{settings.muted ? ', muted' : ''}</dd>
    </dl>

    <Fretboard
        tuning={settings.tuning}
        set={scale}
        range={settings.fretRange}
        capo={settings.capo}
        labels={settings.labels}
        handedness={settings.handedness}
        accidentals={settings.accidentals}
        title="{noteLabel(scale.root)} {scale.type.name} on the fretboard"
        ontap={(tapped: TappedFret) => playFret(tapped, settings.instrument)}
    />
</section>

<style>
    section {
        display: grid;
        gap: 12px;
        min-width: 0;
    }

    p {
        margin: 0;
    }

    .muted {
        color: var(--muted);
    }

    dl {
        display: grid;
        grid-template-columns: auto 1fr;
        gap: 4px 16px;
        margin: 0;
    }

    dt {
        color: var(--muted);
    }

    dd {
        margin: 0;
    }
</style>
