import { describe, expect, it } from 'vitest';
import { noteLabel } from './note';
import { scalePositions, type Position, type PositionKind } from './position';
import { PICKER_ROOTS, rootChoices } from './root';
import { SCALE_TYPES, scaleType, spellScale } from './scale';
import { TUNINGS, type Instrument } from './tuning';

/**
 * The positions' golden table (M01 decision 4, SCL-3, SCL-4), written to `golden/positions.md`: every position of
 * the scales whose shapes the others reuse, on every picker root as Auto spells it. Any change to an answer fails this
 * test until the file is regenerated (`npx vitest run -u` in this package) and the diff checked.
 */

const GUITAR = TUNINGS.guitar[0]?.strings ?? [];
const BASS = TUNINGS.bass[0]?.strings ?? [];

const KIND_NAMES: Readonly<Record<PositionKind, string>> = {
    caged: 'Position',
    pentatonic: 'Box',
    nps: 'Pattern',
    bass: 'Box'
};

function describePosition(position: Position, strings: readonly string[]): string {
    if (position.shape !== undefined && position.shapeOf !== undefined) {
        return `${position.shape} shape of ${noteLabel(position.shapeOf)} major`;
    }
    if (position.octaves !== undefined && position.rootString !== undefined) {
        const open = strings[strings.length - position.rootString] ?? '';
        return `${position.octaves === 1 ? 'one octave' : 'two octaves'} from the ${open.replace(/\d+$/u, '')} string`;
    }
    return `from degree ${String(position.number)}`;
}

function rows(position: Position, strings: readonly string[]): string {
    const cells = [
        `${KIND_NAMES[position.kind]} ${String(position.number)}`,
        describePosition(position, strings),
        `${String(position.from)}–${String(position.to)}`
    ];
    for (let string = strings.length; string >= 1; string--) {
        cells.push(
            position.cells
                .filter(cell => cell.string === string)
                .map(cell => (cell.degree === 1 ? `**${String(cell.fret)}**` : String(cell.fret)))
                .join(' ')
        );
    }
    return `| ${cells.join(' | ')} |`;
}

function section(id: string, kind: PositionKind, instrument: Instrument, roots: 'all' | string[]): string {
    const type = scaleType(id);
    if (!type) throw new Error(`No scale ${id}`);
    const strings = instrument === 'guitar' ? GUITAR : BASS;
    const header = strings.map((note, i) => `${String(strings.length - i)} (${note.replace(/\d+$/u, '')})`);
    const lines = [`## ${type.name}: ${instrument === 'guitar' ? KIND_NAMES[kind].toLowerCase() + 's' : 'bass boxes'}`];
    const list =
        roots === 'all' ? PICKER_ROOTS.map(button => rootChoices(button.pitchClass, type, 'auto').root) : roots;
    for (const root of list) {
        const positions =
            scalePositions(strings, spellScale(root, type), instrument).find(g => g.kind === kind)?.positions ?? [];
        lines.push(
            '',
            `### ${noteLabel(root)}`,
            '',
            `| | Shape | Frets | ${header.join(' | ')} |`,
            `|---|---|---|${header.map(() => '---').join('|')}|`,
            ...positions.map(position => rows(position, strings))
        );
    }
    return lines.join('\n');
}

describe('golden positions', () => {
    it('SCL-3 and SCL-4 place every position as the checked table has them', async () => {
        const intro = [
            '# Golden table: positions',
            '',
            "Each position's frets, string by string from the lowest, roots in bold, in standard tuning without a capo, as the card lists them (up the neck on guitar, by number on bass). CAGED positions are numbered up the neck (SCL-3.1); a mode and natural minor take their parent major's, so only the major scale is listed. Pentatonic boxes are numbered from Box 1, the minor root on the lowest string (SCL-3.3); the major pentatonic shares its relative minor's numbers, and the blues scales add their blue note. A 3-notes-per-string pattern is numbered by the degree it starts on (SCL-3.2). Bass boxes are SCL-4.1's; on a four-string bass, the two-octave box from the A string isn't offered.",
            '',
            "Written by `src/golden-positions.spec.ts` from `fretkit`'s answers, which fail the test if they change. To change one on purpose, run `npx vitest run -u` in `packages/fretkit` and check the diff by hand."
        ].join('\n');
        const sevenNote = SCALE_TYPES.filter(type => type.intervals.length === 7 && type.id !== 'major').map(
            type => type.id
        );
        const sections = [
            section('major', 'caged', 'guitar', 'all'),
            section('minor-pentatonic', 'pentatonic', 'guitar', 'all'),
            section('minor-blues', 'pentatonic', 'guitar', ['A', 'E']),
            section('major-blues', 'pentatonic', 'guitar', ['C', 'G']),
            section('major', 'nps', 'guitar', 'all'),
            ...sevenNote.map(id => section(id, 'nps', 'guitar', ['C'])),
            section('major', 'bass', 'bass', 'all'),
            section('natural-minor', 'bass', 'bass', 'all'),
            section('minor-pentatonic', 'bass', 'bass', ['A', 'E'])
        ];
        await expect([intro, ...sections].join('\n\n') + '\n').toMatchFileSnapshot('../golden/positions.md');
    });
});
