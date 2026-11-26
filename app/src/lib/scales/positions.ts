import {
    intervalLabel,
    noteLabel,
    notePitchName,
    type NoteName,
    type Position,
    type PositionGroup,
    type PositionKind,
    type SpelledScale
} from '@fretdex/fretkit';
import type { ViewOptions } from '#lib/url/routes.ts';

/** The URL option each kind of position is chosen by (SCL-3, SCL-4). */
export const POSITION_OPTION: Readonly<Record<PositionKind, 'pos' | 'nps' | 'box'>> = {
    caged: 'pos',
    pentatonic: 'pos',
    nps: 'nps',
    bass: 'box'
};

/** Each kind's choice on the card's Positions row. */
export const KIND_LABELS: Readonly<Record<PositionKind, string>> = {
    caged: 'CAGED',
    pentatonic: 'Boxes',
    nps: '3 per string',
    bass: 'Boxes'
};

/** The position a card's URL chooses, among those it offers, with its group and place there; else the full neck. */
export interface ChosenPosition {
    readonly group: PositionGroup;
    readonly index: number;
    readonly position: Position;
}

export function chosenPosition(groups: readonly PositionGroup[], options: ViewOptions): ChosenPosition | undefined {
    for (const group of groups) {
        const number = options[POSITION_OPTION[group.kind]];
        const index = group.positions.findIndex(position => position.number === number);
        const position = group.positions[index];
        if (position !== undefined) return { group, index, position };
    }
    return undefined;
}

/**
 * A position's name (SCL-3.4): its number, its shape and its frets. "Position 2 · E shape · frets 4–8" for the major
 * scale; a mode or minor scale names its parent major (owner, 2026-11-25), "Position 3 · G shape of C major · frets
 * 5–9"; "Box 1 · G shape of C major · frets 5–8"; "Pattern 3 · from the 3 · frets 7–12"; on bass, "Box 1 · one
 * octave from the E string · frets 2–5".
 */
export function positionName(position: Position, scale: SpelledScale, strings: readonly NoteName[]): string {
    return `${positionTitle(position, scale, strings)} · ${positionFrets(position)}`;
}

/** A position's frets, the end of its name: "frets 4–8". */
export function positionFrets(position: Position): string {
    return `frets ${String(position.from)}–${String(position.to)}`;
}

/** A position's name without its frets: "Position 3 · G shape of C major". */
export function positionTitle(position: Position, scale: SpelledScale, strings: readonly NoteName[]): string {
    switch (position.kind) {
        case 'caged':
        case 'pentatonic': {
            const word = position.kind === 'caged' ? 'Position' : 'Box';
            const of =
                position.shapeOf === undefined || position.shapeOf === scale.root
                    ? ''
                    : ` of ${noteLabel(position.shapeOf)} major`;
            return `${word} ${String(position.number)} · ${position.shape ?? ''} shape${of}`;
        }
        case 'nps': {
            const code = scale.codes[position.number - 1];
            const from = code === undefined ? '' : ` · from the ${intervalLabel(code)}`;
            return `Pattern ${String(position.number)}${from}`;
        }
        case 'bass': {
            const open = strings[strings.length - (position.rootString ?? strings.length)];
            const string = open === undefined ? '' : ` from the ${noteLabel(notePitchName(open))} string`;
            const octaves = position.octaves === 2 ? 'two octaves' : 'one octave';
            return `Box ${String(position.number)} · ${octaves}${string}`;
        }
    }
}
