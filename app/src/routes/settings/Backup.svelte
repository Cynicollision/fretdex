<!--
    Backup on Settings (PIN-5): Export saves a file of the pins, groups, settings and saved tunings; Import reads one
    and, once the user picks how, adds it to what's here or replaces everything with it.
-->
<script lang="ts">
    import Sheet from '#lib/components/Sheet.svelte';
    import {
        MAX_BACKUP_BYTES,
        addPins,
        addTunings,
        backupFileName,
        count,
        describeBackup,
        readBackup,
        writeBackup,
        type Backup
    } from '#lib/backup/backup.ts';
    import { pins } from '#lib/pins/store.svelte.ts';
    import { settings } from '#lib/settings/store.svelte.ts';
    import { customTunings } from '#lib/settings/tunings.svelte.ts';
    import { requestPersistence } from '#lib/storage/persist.ts';

    let input: HTMLInputElement | undefined = $state();
    /** The backup picked, waiting for the user to choose how to import it. */
    let picked: { readonly name: string; readonly backup: Backup } | undefined = $state();
    /** What the last export or import did, or why it couldn't. */
    let message: { readonly text: string; readonly error: boolean } | undefined = $state();

    async function exportBackup() {
        await Promise.all([settings.ready(), customTunings.ready(), pins.ready()]);
        const now = new Date();
        const text = writeBackup(
            { settings: settings.current, customTunings: customTunings.current, pins: pins.current },
            now
        );
        const url = URL.createObjectURL(new Blob([text], { type: 'application/json' }));
        const link = document.createElement('a');
        link.href = url;
        link.download = backupFileName(now);
        link.click();
        // The download has its own copy once it's started.
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        message = { text: `Exported ${link.download}.`, error: false };
    }

    async function pick(event: Event) {
        const field = event.currentTarget as HTMLInputElement;
        const file = field.files?.[0];
        // Cleared, so picking the same file again is a change too.
        field.value = '';
        if (!file) return;
        message = undefined;
        if (file.size > MAX_BACKUP_BYTES) {
            message = { text: 'This file is too big to be a Fretdex backup.', error: true };
            return;
        }
        const result = await readBackup(await file.text());
        if (result.ok) picked = { name: file.name, backup: result.backup };
        else message = { text: result.reason, error: true };
    }

    async function add(backup: Backup) {
        picked = undefined;
        await Promise.all([customTunings.ready(), pins.ready()]);
        const board = addPins(pins.current, backup.pins);
        const tunings = addTunings(customTunings.current, backup.customTunings);
        await pins.update(() => board.merged);
        await customTunings.update(() => tunings.merged);
        if (board.added > 0) void requestPersistence();
        const added = [
            count(board.added, 'pin'),
            ...(board.groups > 0 ? [count(board.groups, 'group')] : []),
            count(tunings.added, 'saved tuning')
        ];
        const skipped = [
            ...(board.skipped > 0 ? [`${count(board.skipped, 'pin')} already here`] : []),
            ...(tunings.skipped > 0 ? [`${count(tunings.skipped, 'saved tuning')} skipped`] : [])
        ];
        message = {
            text: `Added ${list(added)}${skipped.length > 0 ? `; ${list(skipped)}` : ''}. This device's settings are as they were.`,
            error: false
        };
    }

    async function replace(backup: Backup) {
        picked = undefined;
        await settings.update(() => backup.settings);
        await customTunings.update(() => backup.customTunings);
        await pins.update(() => backup.pins);
        if (backup.pins.pins.length > 0) void requestPersistence();
        message = { text: 'Replaced everything with the backup.', error: false };
    }

    /** "a, b and c". */
    function list(parts: readonly string[]): string {
        return parts.length <= 1 ? (parts[0] ?? '') : `${parts.slice(0, -1).join(', ')} and ${parts.at(-1) ?? ''}`;
    }
</script>

<div class="backup">
    <p>
        Export saves a file of your pins, groups, settings and saved tunings. Import one to restore them, here or on
        another device.
    </p>
    <div class="actions">
        <button type="button" onclick={exportBackup}>Export</button>
        <button type="button" onclick={() => input?.click()}>Import…</button>
        <input
            bind:this={input}
            type="file"
            accept=".json,application/json"
            class="visually-hidden"
            tabindex="-1"
            aria-hidden="true"
            onchange={pick}
        />
    </div>
    <!-- Both live regions are always there, so what appears in them is announced. -->
    <div>
        <div role="status">
            {#if message && !message.error}<p>{message.text}</p>{/if}
        </div>
        <div role="alert">
            {#if message?.error}<p class="error">{message.text} Nothing was changed.</p>{/if}
        </div>
    </div>
</div>

<Sheet open={picked !== undefined} title="Import" onclose={() => (picked = undefined)}>
    {#if picked}
        {@const backup = picked.backup}
        <p><strong class="file">{picked.name}</strong> has {describeBackup(backup)}.</p>
        <div class="choices">
            <button type="button" onclick={() => add(backup)}>Add to what's here</button>
            <p class="muted">
                Adds its pins, groups and saved tunings, skipping pins and tunings already here, and keeps this device's
                settings.
            </p>
            <button type="button" class="danger" onclick={() => replace(backup)}>Replace everything</button>
            <p class="muted">Replaces this device's pins, groups, saved tunings and settings with the backup's.</p>
        </div>
    {/if}
</Sheet>

<style>
    .backup {
        display: grid;
        gap: 16px;
    }

    .actions {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
    }

    .choices {
        display: grid;
        gap: 8px;
    }

    .choices p {
        margin-bottom: 8px;
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

    .file {
        overflow-wrap: anywhere;
    }

    .muted {
        color: var(--muted);
    }

    .error {
        font-weight: 600;
    }
</style>
