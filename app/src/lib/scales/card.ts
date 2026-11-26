import {
    BRIGHTNESS,
    intervalLabel,
    isOfferedRoot,
    modeInfo,
    noteLabel,
    notePitchClass,
    parentRoot,
    rootChoices,
    type Accidentals,
    type NoteName,
    type ScaleType
} from '@fretdex/fretkit';
import type { TappedFret } from '#lib/diagrams/fretboard.ts';
import { cardTitle, type ScaleCardRef } from '#lib/url/routes.ts';

/** Text written with `b` and `#`, as `fretkit` writes chord suffixes and numerals, as shown on screen (THY-1.5). */
function symbols(text: string): string {
    return text.replaceAll('b', '♭').replaceAll('#', '♯');
}

/** A chord's name as the card lists it: `B°`, `Bm7♭5`, `F♯maj7`. */
export function chordLabel(root: NoteName, suffix: string): string {
    return noteLabel(root) + symbols(suffix.replace(/^dim$/u, '°'));
}

/** A roman numeral as shown: `♭III`, `vi°`, `viiø7`. */
export function numeralLabel(numeral: string): string {
    return symbols(numeral);
}

/** "1st", "2nd", "3rd", "4th" … for a mode's degree. */
export function ordinal(n: number): string {
    const suffix = n === 1 ? 'st' : n === 2 ? 'nd' : n === 3 ? 'rd' : 'th';
    return `${String(n)}${suffix}`;
}

/** A mode's line naming its parent scale (SCL-5.1): "D Dorian is the 2nd mode of C major." */
export function parentLine(root: NoteName, type: ScaleType): string | undefined {
    const mode = modeInfo(type);
    const parent = parentRoot(root, type);
    if (mode === undefined || parent === undefined) return undefined;
    const name = cardTitle({ kind: 'scale', root, scale: type });
    if (mode.degree === 1) return `${name} is the major scale, the 1st mode of ${noteLabel(parent)} major.`;
    return `${name} is the ${ordinal(mode.degree)} mode of ${noteLabel(parent)} major.`;
}

/**
 * The brightness row's cards (SCL-5.2): the seven modes on the same root, spelled as the card is where each mode
 * offers that spelling, and otherwise as its picker would (THY-2.5), so A♯ Dorian's row has B♭ Lydian.
 */
export function brightnessRow(root: NoteName, accidentals: Accidentals): ScaleCardRef[] {
    return BRIGHTNESS.map(type => ({
        kind: 'scale',
        root: isOfferedRoot(root, type) ? root : rootChoices(notePitchClass(root), type, accidentals).root,
        scale: type
    }));
}

/**
 * What the card says about a tapped fret (DIAG-1.6): its note, where it is, and its interval in the scale, or that
 * it's outside it. "G3 · string 3, open · 4" or "C♯4 · string 2, fret 2 · not in the scale".
 */
export function tappedLine(tapped: TappedFret): string {
    const where = `string ${String(tapped.string)}, ${tapped.fret === 0 ? 'open' : `fret ${String(tapped.fret)}`}`;
    const what = tapped.cell ? intervalLabel(tapped.cell.code) : 'not in the scale';
    return `${noteLabel(tapped.note)} · ${where} · ${what}`;
}
