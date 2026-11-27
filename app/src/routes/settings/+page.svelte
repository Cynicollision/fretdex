<!--
    Settings (CTX-1): how diagrams are drawn, the theme, the screen, the tempo, the saved tunings (CTX-2.7), and backup
    (PIN-5). The
    key, instrument, tuning and capo are set from the context bar's sheet (APP-2).
-->
<script lang="ts">
    import { MAX_FRET, type Accidentals } from '@fretdex/fretkit';
    import BackLink from '#lib/components/BackLink.svelte';
    import Choice from '#lib/components/Choice.svelte';
    import Stepper from '#lib/components/Stepper.svelte';
    import Switch from '#lib/components/Switch.svelte';
    import { MAX_TEMPO, MIN_TEMPO, type Handedness, type Labels, type Theme } from '#lib/settings/settings.ts';
    import { settings } from '#lib/settings/store.svelte.ts';
    import { shownPersistence, type Persistence } from '#lib/storage/persist.ts';
    import { onMount } from 'svelte';
    import Backup from './Backup.svelte';
    import SavedTunings from './SavedTunings.svelte';

    const current = $derived(settings.current);

    let stored: Persistence | undefined = $state();
    onMount(async () => {
        stored = await shownPersistence();
    });

    const STORAGE_TEXT: Record<Persistence, string> = {
        granted: 'The browser has agreed to keep it.',
        'not-granted':
            "The browser hasn't agreed to keep it, so it may clear it if the phone runs short of space. Installing Fretdex asks again.",
        unsupported: "This browser can't promise to keep it."
    };
</script>

<svelte:head>
    <title>Settings · Fretdex</title>
</svelte:head>

<main>
    <BackLink href="/" />
    <h1>Settings</h1>

    <section>
        <h2>Diagrams</h2>
        <Choice
            legend="Labels"
            name="labels"
            options={[
                { value: 'notes', label: 'Note names' },
                { value: 'intervals', label: 'Intervals' },
                { value: 'degrees', label: 'Scale degrees' },
                { value: 'none', label: 'None' }
            ]}
            value={current.labels}
            onchange={(labels: Labels) => settings.update({ labels })}
        />
        <Choice
            legend="Accidentals"
            name="accidentals"
            options={[
                { value: 'auto', label: 'Auto by key' },
                { value: 'sharps', label: 'Prefer sharps' },
                { value: 'flats', label: 'Prefer flats' }
            ]}
            value={current.accidentals}
            onchange={(accidentals: Accidentals) => settings.update({ accidentals })}
        />
        <Choice
            legend="Handedness"
            name="handedness"
            options={[
                { value: 'right', label: 'Right' },
                { value: 'left', label: 'Left' }
            ]}
            value={current.handedness}
            onchange={(handedness: Handedness) => settings.update({ handedness })}
        />
        <fieldset class="range">
            <legend>Fret range of the full neck</legend>
            <Stepper
                label="First fret"
                min={0}
                max={current.fretRange.to - 1}
                value={current.fretRange.from}
                onchange={(from: number) => settings.update(s => ({ ...s, fretRange: { ...s.fretRange, from } }))}
            />
            <Stepper
                label="Last fret"
                min={current.fretRange.from + 1}
                max={MAX_FRET}
                value={current.fretRange.to}
                onchange={(to: number) => settings.update(s => ({ ...s, fretRange: { ...s.fretRange, to } }))}
            />
        </fieldset>
    </section>

    <section>
        <h2>Screen</h2>
        <Choice
            legend="Theme"
            name="theme"
            options={[
                { value: 'dark', label: 'Dark' },
                { value: 'light', label: 'Light' },
                { value: 'contrast', label: 'High contrast' }
            ]}
            value={current.theme}
            onchange={(theme: Theme) => settings.update({ theme })}
        />
        <Switch
            label="Keep screen awake"
            checked={current.keepAwake}
            onchange={(keepAwake: boolean) => settings.update({ keepAwake })}
        />
    </section>

    <section>
        <h2>Sound</h2>
        <Stepper
            label="Tempo"
            unit="bpm"
            min={MIN_TEMPO}
            max={MAX_TEMPO}
            value={current.tempo}
            onchange={(tempo: number) => settings.update({ tempo })}
        />
    </section>

    <section>
        <h2>Saved tunings</h2>
        <SavedTunings />
    </section>

    <section>
        <h2>Backup</h2>
        <Backup />
    </section>

    <section>
        <h2>Storage</h2>
        <p>Pins, settings and saved tunings are kept on this device only.</p>
        {#if stored}<p class="muted">{STORAGE_TEXT[stored]}</p>{/if}
    </section>
</main>

<style>
    main {
        display: grid;
        gap: 28px;
        max-width: 40rem;
        margin: 0 auto;
        padding-block: 16px 32px;
        padding-left: max(16px, env(safe-area-inset-left, 0px));
        padding-right: max(16px, env(safe-area-inset-right, 0px));
    }

    section {
        display: grid;
        gap: 20px;
    }

    .range {
        display: flex;
        flex-wrap: wrap;
        gap: 16px 32px;
        margin: 0;
        padding: 0;
        border: 0;
        min-width: 0;
    }

    .range legend {
        padding: 0;
        margin-bottom: 8px;
        font-weight: 600;
    }

    p {
        margin: 0;
    }

    .muted {
        color: var(--muted);
    }
</style>
