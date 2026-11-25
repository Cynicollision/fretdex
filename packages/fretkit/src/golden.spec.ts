import { describe, expect, it } from 'vitest';
import { PICKER_ROOTS, rootChoices, signature } from './root';
import { SCALE_TYPES, scaleType, spellScale, type ScaleType } from './scale';

/**
 * The golden table (M01 decision 4): every scale on every picker root, as Auto spells it and in the other spelling,
 * written to `golden/scales.md`. The owner checks the file by hand once; after that, any change to an answer fails
 * this test until the file is regenerated (`npx vitest run -u` in this package) and the diff checked again.
 */

function signatureText(root: string, type: ScaleType): string {
    const { sharps, flats } = signature(root, type);
    const parts = [
        flats > 0 ? `${String(flats)} flat${flats === 1 ? '' : 's'}` : '',
        sharps > 0 ? `${String(sharps)} sharp${sharps === 1 ? '' : 's'}` : ''
    ].filter(Boolean);
    return parts.length === 0 ? 'none' : parts.join(', ');
}

function signatureSource(type: ScaleType): string {
    if (type.signatureFrom !== undefined) {
        return `read in the ${scaleType(type.signatureFrom)?.name.toLowerCase() ?? type.signatureFrom} key on its root`;
    }
    return type.group === 'modes' || type.group === 'major-and-minor' ? 'its own notes' : 'its own notes (no key)';
}

function table(type: ScaleType): string {
    const lines = [
        `## ${type.name}`,
        '',
        `Intervals: ${spellScale('C', type).intervals.join(' ')}. Signature: ${signatureSource(type)}.`,
        '',
        '| Root | Auto | Notes | Signature | Other | Notes | Signature |',
        '|---|---|---|---|---|---|---|'
    ];
    for (const button of PICKER_ROOTS) {
        const { root, alternative } = rootChoices(button.pitchClass, type, 'auto');
        const cells = [button.shown.join('/'), root, spellScale(root, type).notes.join(' '), signatureText(root, type)];
        const other = button.spellings.find(spelling => spelling !== root);
        if (other === undefined) {
            cells.push('', '', '');
        } else {
            const offered = alternative === other ? '' : ' (not offered)';
            cells.push(other + offered, spellScale(other, type).notes.join(' '), signatureText(other, type));
        }
        lines.push(`| ${cells.join(' | ')} |`);
    }
    return lines.join('\n');
}

describe('golden table', () => {
    it('THY-1 and THY-2 spell every scale on all 12 roots as checked by hand', async () => {
        const intro = [
            '# Golden table: every scale on every root',
            '',
            "Every scale in the Scales list (SCL-1.1) on each of the root picker's 12 buttons (THY-2.2): the root **Auto** opens and its notes, and the button's other spelling, marked *not offered* where its key would need a double sharp or flat and the root's other spelling wouldn't (THY-2.5). Signatures count a double sharp or flat as two. Auto takes the spelling with fewer accidentals in its signature, and at a tie, sharps for a scale read in a key with a major 3rd and flats for one with a minor 3rd (THY-2.1).",
            '',
            "Written by `src/golden.spec.ts` from `fretkit`'s answers, which fail the test if they change. To change one on purpose, run `npx vitest run -u` in `packages/fretkit` and check the diff by hand."
        ].join('\n');
        const markdown = [intro, ...SCALE_TYPES.map(table)].join('\n\n') + '\n';
        await expect(markdown).toMatchFileSnapshot('../golden/scales.md');
    });
});
