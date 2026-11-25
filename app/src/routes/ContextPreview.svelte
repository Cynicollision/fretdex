<!--
    A stand-in until the diagrams (M01 T7) and the home board (T12): a text fretboard and a list that show what every
    setting does, so each can be checked on the phone. Deleted with the placeholder home page.
-->
<script lang="ts">
    import {
        intervalLabel,
        mapScale,
        noteLabel,
        notePitchName,
        scaleType,
        spellPitchClass,
        spellScale,
        type FretboardCell
    } from '@fretdex/fretkit';
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

    // Frets left to right as a player sees them: nut on the left, or on the right when left-handed (DIAG-1.5).
    const frets = $derived.by(() => {
        const { from, to } = settings.fretRange;
        const ascending = Array.from({ length: to - from + 1 }, (_, i) => from + i);
        return settings.handedness === 'left' ? ascending.reverse() : ascending;
    });
    // String numbers, the highest-pitched (1) at the top (THY-3.4).
    const strings = $derived(Array.from({ length: settings.tuning.length }, (_, i) => i + 1));
    const cells = $derived.by(() => {
        const byPlace: Record<string, FretboardCell> = {};
        for (const cell of mapScale(settings.tuning, scale, settings.fretRange, settings.capo)) {
            byPlace[`${String(cell.string)}:${String(cell.fret)}`] = cell;
        }
        return byPlace;
    });

    function label(cell: FretboardCell): string {
        switch (settings.labels) {
            case 'notes':
                return noteLabel(notePitchName(cell.note));
            case 'intervals':
                return intervalLabel(scale.type.intervals[cell.degree - 1] ?? '1P');
            case 'degrees':
                return String(cell.degree);
            case 'none':
                return '•';
        }
    }

    const THEMES = { dark: 'Dark', light: 'Light', contrast: 'High contrast' } as const;
    const LABELS = { notes: 'Note names', intervals: 'Intervals', degrees: 'Scale degrees', none: 'None' } as const;
</script>

<section aria-labelledby="preview-title">
    <h2 id="preview-title">Settings preview</h2>
    <p class="muted">Until the diagrams arrive, this shows what each setting does.</p>

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
    </dl>

    <div class="board">
        <table aria-label="{noteLabel(scale.root)} {scale.type.name} on the fretboard">
            <thead>
                <tr>
                    <th scope="col"><span class="visually-hidden">String</span></th>
                    {#each frets as fret (fret)}<th scope="col">{fret}</th>{/each}
                </tr>
            </thead>
            <tbody>
                {#each strings as string (string)}
                    <tr>
                        <th scope="row">{string}</th>
                        {#each frets as fret (fret)}
                            {@const cell = cells[`${String(string)}:${String(fret)}`]}
                            <td class:root={cell?.degree === 1} class:capoed={fret < settings.capo}>
                                {cell ? label(cell) : ''}
                            </td>
                        {/each}
                    </tr>
                {/each}
            </tbody>
        </table>
    </div>
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

    /* The table scrolls inside its box, so the page never scrolls sideways (APP-5.6). */
    .board {
        overflow-x: auto;
        background: var(--neck);
        border-radius: var(--radius);
        padding: 8px;
    }

    table {
        border-collapse: collapse;
        font-size: var(--text-xs);
        font-weight: 700;
    }

    th {
        color: var(--muted);
        font-weight: 600;
        padding: 2px 4px;
    }

    td {
        min-width: 2.2em;
        height: 2em;
        text-align: center;
        color: var(--note);
        border-left: 2px solid var(--fret);
        border-bottom: 1px solid var(--string);
    }

    td.root {
        color: var(--root);
    }

    td.capoed {
        opacity: 0.3;
    }

    .visually-hidden {
        position: absolute;
        width: 1px;
        height: 1px;
        overflow: hidden;
        clip-path: inset(50%);
        white-space: nowrap;
    }
</style>
