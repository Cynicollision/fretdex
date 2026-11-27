import { describe, expect, it } from 'vitest';
import { NO_PINS, type PinBoard } from '#lib/pins/pins.ts';
import { DEFAULT_SETTINGS } from '#lib/settings/settings.ts';
import { MAX_CUSTOM_TUNINGS, NO_CUSTOM_TUNINGS, type CustomTunings } from '#lib/settings/tunings.ts';
import {
    addPins,
    addTunings,
    backupFileName,
    describeBackup,
    readBackup,
    writeBackup,
    type Backup,
    type ReadBackup
} from './backup';

const board: PinBoard = {
    groups: [
        { id: 'g1', name: 'Gig' },
        { id: 'g2', name: 'Practice' }
    ],
    pins: [
        { id: 'a', url: '/scales/C/major', label: 'C major' },
        { id: 'b', url: '/scales/A/minor-pentatonic?pos=1', label: 'A minor box 1', group: 'g1' },
        { id: 'c', url: '/scales/D/dorian?nps=2', label: 'D Dorian', group: 'g2' }
    ]
};

const tunings: CustomTunings = {
    guitar: [{ id: 't1', name: 'Open C', strings: ['C2', 'G2', 'C3', 'G3', 'C4', 'E4'] }],
    bass: []
};

const backup: Backup = {
    settings: { ...DEFAULT_SETTINGS, labels: 'degrees', theme: 'light' },
    customTunings: tunings,
    pins: board
};

function refused(result: ReadBackup): string {
    if (result.ok) throw new Error('The backup was read');
    return result.reason;
}

function file(records: Record<string, unknown>, version = 1): string {
    return JSON.stringify({ kind: 'fretdex-backup', version, exported: '2026-11-27T10:00:00.000Z', records });
}

describe('exporting', () => {
    it('PIN-5.1 writes the pins, groups, settings and saved tunings, each with its version', () => {
        const written = JSON.parse(writeBackup(backup, new Date('2026-11-27T10:00:00Z'))) as Record<string, unknown>;
        expect(written).toEqual({
            kind: 'fretdex-backup',
            version: 1,
            exported: '2026-11-27T10:00:00.000Z',
            records: {
                settings: { version: 1, data: backup.settings },
                customTunings: { version: 1, data: tunings },
                pins: { version: 2, data: board }
            }
        });
    });

    it('PIN-5.1 names the file by the day', () => {
        expect(backupFileName(new Date(2026, 0, 5, 23, 30))).toBe('fretdex-2026-01-05.json');
    });
});

describe('reading a backup', () => {
    it('PIN-5.2 reads back what was exported', async () => {
        expect(await readBackup(writeBackup(backup, new Date()))).toEqual({ ok: true, backup });
    });

    it('PIN-5.2 migrates an older record as loading it from the device would', async () => {
        const result = await readBackup(
            file({
                settings: { version: 1, data: DEFAULT_SETTINGS },
                customTunings: { version: 1, data: NO_CUSTOM_TUNINGS },
                pins: { version: 1, data: { pins: [{ id: 'a', url: '/scales/C/major', label: 'C major' }] } }
            })
        );
        expect(result.ok && result.backup.pins).toEqual({
            pins: [{ id: 'a', url: '/scales/C/major', label: 'C major' }],
            groups: []
        });
    });

    it('PIN-5.2 keeps what is valid in each record, as loading does', async () => {
        const result = await readBackup(
            file({
                settings: { version: 1, data: { labels: 'nonsense', theme: 'contrast' } },
                customTunings: { version: 1, data: NO_CUSTOM_TUNINGS },
                pins: {
                    version: 2,
                    data: { pins: [{ id: 'x', url: 'https://example.com/', label: 'Away' }], groups: [] }
                }
            })
        );
        expect(result.ok && result.backup.settings).toEqual({ ...DEFAULT_SETTINGS, theme: 'contrast' });
        expect(result.ok && result.backup.pins).toEqual(NO_PINS);
    });

    it('PIN-5.2 refuses a file that is not a backup, saying why', async () => {
        expect(refused(await readBackup('not json'))).toBe("This file isn't a Fretdex backup.");
        expect(refused(await readBackup('[]'))).toBe("This file isn't a Fretdex backup.");
        expect(refused(await readBackup(JSON.stringify({ kind: 'something-else', version: 1, records: {} })))).toBe(
            "This file isn't a Fretdex backup."
        );
        expect(refused(await readBackup(JSON.stringify({ kind: 'fretdex-backup', version: 1, records: [] })))).toBe(
            "This file isn't a Fretdex backup."
        );
        expect(refused(await readBackup(' '.repeat(1_000_001)))).toMatch(/too big/u);
    });

    it('PIN-5.2 refuses a backup with a record missing or damaged, which would replace what is here with defaults', async () => {
        const { records } = JSON.parse(writeBackup(backup, new Date())) as { records: Record<string, unknown> };
        const damaged = [
            { settings: records.settings, customTunings: records.customTunings },
            { ...records, settings: null },
            { ...records, settings: { version: 0, data: {} } },
            { ...records, pins: { version: 2 } },
            { ...records, pins: { version: 2, data: null } },
            { ...records, customTunings: { version: 1, data: [] } }
        ];
        for (const each of damaged) {
            expect(refused(await readBackup(file(each)))).toBe(
                "Part of this backup is missing or damaged, so it can't be restored."
            );
        }
    });

    it('PIN-5.2 refuses a backup a newer version of the app wrote', async () => {
        const records = JSON.parse(writeBackup(backup, new Date())) as { records: Record<string, unknown> };
        expect(refused(await readBackup(file(records.records, 2)))).toMatch(/newer version/u);
        expect(refused(await readBackup(file({ ...records.records, pins: { version: 3, data: board } })))).toMatch(
            /newer version/u
        );
        // A record this version doesn't keep yet, such as M02's hidden voicings.
        expect(
            refused(await readBackup(file({ ...records.records, hiddenVoicings: { version: 1, data: {} } })))
        ).toMatch(/newer version/u);
    });
});

describe('adding a backup to what is here', () => {
    it('PIN-5.2 skips pins whose URL is already pinned and adds the rest last in their group, matched by name', () => {
        const here: PinBoard = {
            groups: [{ id: 'mine', name: 'gig' }],
            pins: [
                { id: 'p', url: '/scales/C/major', label: 'Mine' },
                { id: 'q', url: '/scales/E/minor', label: 'E minor', group: 'mine' }
            ]
        };
        const { merged, added, skipped, groups } = addPins(here, board);
        expect({ added, skipped, groups }).toEqual({ added: 2, skipped: 1, groups: 1 });
        expect(merged.groups.map(group => group.name)).toEqual(['gig', 'Practice']);
        expect(merged.pins.map(pin => [pin.label, merged.groups.find(group => group.id === pin.group)?.name])).toEqual([
            ['Mine', undefined],
            ['E minor', 'gig'],
            ['A minor box 1', 'gig'],
            ['D Dorian', 'Practice']
        ]);
        expect(new Set(merged.pins.map(pin => pin.id)).size).toBe(4);
    });

    it('PIN-5.2 adds every pin and group to an empty board', () => {
        const { merged, added } = addPins(NO_PINS, board);
        expect(added).toBe(3);
        expect(merged.pins.map(pin => pin.url)).toEqual(board.pins.map(pin => pin.url));
        expect(merged.groups.map(group => group.name)).toEqual(['Gig', 'Practice']);
    });

    it('PIN-5.2 adds saved tunings unless their name or pitches are here already, up to the most an instrument keeps', () => {
        const OPEN_E = ['E2', 'B2', 'E3', 'G#3', 'B3', 'E4'] as const;
        const here: CustomTunings = {
            guitar: [{ id: 'mine', name: 'open c', strings: OPEN_E }],
            bass: Array.from({ length: MAX_CUSTOM_TUNINGS }, (_, i) => ({
                id: `b${String(i)}`,
                name: `Bass ${String(i)}`,
                strings: ['D1', 'A1', 'D2', 'G2'] as const
            }))
        };
        const from: CustomTunings = {
            guitar: [
                ...tunings.guitar,
                { id: 't2', name: 'Open A', strings: ['E2', 'A2', 'E3', 'A3', 'C#4', 'E4'] },
                { id: 't3', name: 'Vestapol', strings: OPEN_E },
                { id: 't4', name: 'Drop D', strings: ['C2', 'G2', 'D3', 'G3', 'A3', 'D4'] }
            ],
            bass: [{ id: 't3', name: 'Low', strings: ['C1', 'G1', 'C2', 'F2'] }]
        };
        const { merged, added, skipped } = addTunings(here, from);
        expect({ added, skipped }).toEqual({ added: 1, skipped: 4 });
        expect(merged.guitar.map(tuning => tuning.name)).toEqual(['open c', 'Open A']);
        expect(merged.bass).toHaveLength(MAX_CUSTOM_TUNINGS);
    });
});

describe('the confirmation', () => {
    it('PIN-5.2 says what a backup holds', () => {
        expect(describeBackup(backup)).toBe('3 pins, 2 groups, 1 saved tuning and settings');
        expect(describeBackup({ ...backup, pins: NO_PINS, customTunings: NO_CUSTOM_TUNINGS })).toBe(
            'no pins, no saved tunings and settings'
        );
    });
});
