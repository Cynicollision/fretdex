import { Note } from 'tonal';
import { mapScale, type FretboardCell } from './fretboard';
import { intervalSemitones, type IntervalCode } from './interval';
import { parentRoot } from './mode';
import { noteMidi, notePitchClass, type NoteName } from './note';
import { pitchClass } from './pitch';
import { scaleType, spellScale, type SpelledScale } from './scale';
import { MAX_FRET, TUNINGS, openStrings, stringNumber, type Instrument } from './tuning';

/** The five CAGED shapes, each named after the open chord whose shape it's built round (SCL-3.1). */
export type CagedShape = 'C' | 'A' | 'G' | 'E' | 'D';

/**
 * The kinds of position a card offers (SCL-3, SCL-4), each with its URL option: CAGED positions and pentatonic boxes
 * are `pos`, 3-notes-per-string patterns `nps`, and bass boxes `box`.
 */
export type PositionKind = 'caged' | 'pentatonic' | 'nps' | 'bass';

/** One position of a scale on the neck: the frets it's played on. */
export interface Position {
    readonly kind: PositionKind;
    /**
     * Its number, as the URL writes it: CAGED positions 1–5 up the neck (SCL-3.1); pentatonic boxes 1–5, Box 1 having
     * the minor pentatonic's root on the lowest string (SCL-3.3); 3-notes-per-string patterns by the degree they start
     * on, 1–7 (SCL-3.2); bass boxes 1–4 (SCL-4.1).
     */
    readonly number: number;
    /** The CAGED shape, for CAGED positions and pentatonic boxes. */
    readonly shape?: CagedShape;
    /** The major scale whose shape it is: the scale's own root, a mode's parent, or a minor scale's relative major. */
    readonly shapeOf?: NoteName;
    /** For a bass box: one octave or two. */
    readonly octaves?: 1 | 2;
    /** For a bass box: the string its root is on (1 = the highest, THY-3.4). */
    readonly rootString?: number;
    /** The lowest and highest frets it uses, counted from the nut. */
    readonly from: number;
    readonly to: number;
    /** Its notes, highest string first and then up the neck, as `mapScale` lists them. */
    readonly cells: readonly FretboardCell[];
}

/** A kind of position a card offers, its positions in the order previous and next step through them. */
export interface PositionGroup {
    readonly kind: PositionKind;
    readonly positions: readonly Position[];
}

/** Each CAGED shape's window of five frets, from the major root's fret on the lowest string: G E D C A up the neck. */
const CAGED_WINDOWS: readonly (readonly [CagedShape, number])[] = [
    ['G', -3],
    ['E', -1],
    ['D', 1],
    ['C', 4],
    ['A', 6]
];

/** The CAGED shape each pentatonic box sits in, Box 1 to Box 5, named by the relative major (owner, 2026-11-25). */
const BOX_SHAPES: readonly CagedShape[] = ['G', 'E', 'D', 'C', 'A'];

/** The scales that show the full neck only (SCL-3.7). */
const NECK_ONLY = new Set(['whole-tone', 'half-whole-diminished', 'whole-half-diminished']);

/** A blues scale's pentatonic, and the blue note it adds (SCL-3.3). */
const BLUES: Readonly<Record<string, { readonly pentatonic: string; readonly blue: IntervalCode }>> = {
    'minor-blues': { pentatonic: 'minor-pentatonic', blue: '5d' },
    'major-blues': { pentatonic: 'major-pentatonic', blue: '3m' }
};

/** A string and fret, the string as an index into the tuning, lowest first, the fret counted from the capo. */
interface Spot {
    readonly index: number;
    readonly fret: number;
}

/** What a position is, before its cells are found. */
type Placement = Omit<Position, 'cells' | 'from' | 'to'>;

/** A position and where it's played. */
type Placed = readonly [Placement, Spot[]];

/**
 * The positions a scale card offers for a scale on an instrument, tuning and capo (SCL-3, SCL-4), each kind's in the
 * order previous and next step through them:
 *
 * - On guitar in standard tuning, the major scale, its modes and natural minor have five CAGED positions, and the
 *   pentatonic and blues scales five boxes. In other tunings neither is offered (SCL-3.6).
 * - On guitar in any tuning, every seven-note scale has seven 3-notes-per-string patterns (SCL-3.2).
 * - On bass, every scale has one- and two-octave boxes from the root on each of the lowest two strings, where it fits
 *   (SCL-4.1), and nothing else (owner, 2026-11-25).
 * - Whole tone and the diminished scales have none: the full neck only (SCL-3.7).
 *
 * A capo moves every position up with it (SCL-3.6); a position that would pass `MAX_FRET` is left out.
 */
export function scalePositions(
    strings: readonly NoteName[],
    scale: SpelledScale,
    instrument: Instrument,
    capo = 0
): PositionGroup[] {
    if (NECK_ONLY.has(scale.type.id)) return [];
    const open = openStrings(strings, capo);
    const groups: PositionGroup[] = [];
    const add = (kind: PositionKind, spots: Placed[]) => {
        const positions = spots
            .map(([position, found]) => withCells(strings, scale, capo, position, found))
            .filter(position => position !== undefined);
        // Guitar's positions step up the neck; bass boxes go by number, a box and then its two octaves.
        if (kind !== 'bass') positions.sort((a, b) => a.from - b.from);
        if (positions.length > 0) groups.push({ kind, positions });
    };
    if (instrument === 'bass') {
        add('bass', bassBoxes(open, scale));
        return groups;
    }
    if (isStandardGuitar(strings)) {
        const major = relativeMajor(scale);
        if (major !== undefined) add('caged', cagedPositions(open, scale, major));
        const boxes = pentatonicBoxes(open, scale);
        if (boxes !== undefined) add('pentatonic', boxes);
    }
    if (scale.notes.length === 7)
        add(
            'nps',
            perString(open, scale, 3).map((spots, i) => [{ kind: 'nps', number: i + 1 }, spots])
        );
    return groups;
}

/** Whether a tuning sounds as standard guitar tuning does, however its notes are spelled. */
function isStandardGuitar(strings: readonly NoteName[]): boolean {
    const standard = TUNINGS.guitar[0]?.strings ?? [];
    return (
        strings.length === standard.length && strings.every((note, i) => noteMidi(note) === noteMidi(standard[i] ?? ''))
    );
}

/**
 * The major scale whose CAGED shapes a scale's positions take (owner, 2026-11-25): the major scale's own root, a
 * mode's parent (D Dorian's is C), natural minor's relative major. `undefined` for other scales.
 */
function relativeMajor(scale: SpelledScale): NoteName | undefined {
    if (scale.type.id === 'major') return scale.root;
    const type = scale.type.id === 'natural-minor' ? scaleType('aeolian') : scale.type;
    return type === undefined ? undefined : parentRoot(scale.root, type);
}

/** The lowest fret, from the capo, where a pitch class falls on a string. */
function fretOf(open: number, pc: number): number {
    return pitchClass(pc - open);
}

/**
 * The five CAGED positions (SCL-3.1): each shape's window of five frets placed as low as it fits, its scale notes in
 * the window, a pitch found on two strings kept on the higher one. Numbered up the neck.
 */
function cagedPositions(open: readonly number[], scale: SpelledScale, major: NoteName): Placed[] {
    const pcs = new Set(scale.notes.map(notePitchClass));
    const lowest = open[0] ?? 0;
    const root = fretOf(lowest, notePitchClass(major));
    return CAGED_WINDOWS.map(([shape, offset]) => ({ shape, start: pitchClass(root + offset) }))
        .sort((a, b) => a.start - b.start)
        .map(({ shape, start }, i) => {
            const spots: Spot[] = [];
            const taken = new Set<number>();
            for (let index = open.length - 1; index >= 0; index--) {
                for (let fret = start; fret <= start + 4; fret++) {
                    const midi = (open[index] ?? 0) + fret;
                    if (pcs.has(pitchClass(midi)) && !taken.has(midi)) {
                        taken.add(midi);
                        spots.push({ index, fret });
                    }
                }
            }
            return [{ kind: 'caged', number: i + 1, shape, shapeOf: major }, spots] as const;
        });
}

/**
 * The five pentatonic boxes (SCL-3.3): two notes on each string, Box 1 starting on the minor pentatonic's root on
 * the lowest string and each next box on the next note, each placed as low as it fits. A
 * blues scale adds its blue note wherever it falls within the box's frets. `undefined` for other scales.
 */
function pentatonicBoxes(open: readonly number[], scale: SpelledScale): Placed[] | undefined {
    const blues = BLUES[scale.type.id];
    const id = blues?.pentatonic ?? scale.type.id;
    if (id !== 'minor-pentatonic' && id !== 'major-pentatonic') return undefined;
    const pentatonic = spellScale(scale.root, scaleType(id) ?? scale.type);
    // The minor pentatonic's root is the major pentatonic's 5th note, its 6th degree.
    const first = id === 'minor-pentatonic' ? 0 : 4;
    const major = id === 'minor-pentatonic' ? Note.transpose(scale.root, '3m') : scale.root;
    const patterns = perString(open, pentatonic, 2);
    return BOX_SHAPES.map((shape, i) => {
        let spots = patterns[(first + i) % 5] ?? [];
        if (blues !== undefined) spots = [...spots, ...blueNotes(open, scale.root, blues.blue, spots)];
        return [{ kind: 'pentatonic', number: i + 1, shape, shapeOf: major }, spots] as const;
    });
}

/** Where a blues scale's blue note falls within a box's frets, once per pitch, on the higher string. */
function blueNotes(open: readonly number[], root: NoteName, blue: IntervalCode, box: readonly Spot[]): Spot[] {
    const from = lowestFret(box);
    const to = Math.max(...box.map(spot => spot.fret));
    const pc = pitchClass(notePitchClass(root) + intervalSemitones(blue));
    const spots: Spot[] = [];
    const taken = new Set<number>();
    for (let index = open.length - 1; index >= 0; index--) {
        for (let fret = from; fret <= to; fret++) {
            const midi = (open[index] ?? 0) + fret;
            if (pitchClass(midi) === pc && !taken.has(midi)) {
                taken.add(midi);
                spots.push({ index, fret });
            }
        }
    }
    return spots;
}

function lowestFret(spots: readonly Spot[]): number {
    return Math.min(...spots.map(spot => spot.fret));
}

/**
 * Patterns of `count` notes on each string, one starting on each note of the scale on the lowest string at its lowest
 * fret (SCL-3.2 with 3, the pentatonic boxes with 2), the scale climbing string by string. A pattern that would need
 * a fret below the nut, or the capo, starts an octave up.
 */
function perString(open: readonly number[], scale: SpelledScale, count: number): Spot[][] {
    const pcs = scale.notes.map(notePitchClass);
    const lowest = open[0] ?? 0;
    return pcs.map(pc => {
        for (let start = fretOf(lowest, pc); ; start += 12) {
            const spots = climb(open, pcs, lowest + start, count);
            if (spots.every(spot => spot.fret >= 0)) return spots;
        }
    });
}

/** Climbs the scale from a pitch on the lowest string, `count` notes on each string. */
function climb(open: readonly number[], pcs: readonly number[], from: number, count: number): Spot[] {
    const spots: Spot[] = [];
    let midi = from;
    for (let index = 0; index < open.length; index++) {
        for (let n = 0; n < count; n++) {
            spots.push({ index, fret: midi - (open[index] ?? 0) });
            midi = nextNote(pcs, midi);
        }
    }
    return spots;
}

/** The next pitch above `midi` in the scale. */
function nextNote(pcs: readonly number[], midi: number): number {
    for (let next = midi + 1; ; next++) if (pcs.includes(pitchClass(next))) return next;
}

/**
 * Bass boxes (SCL-4.1): 1 and 2 are one octave from the root on the lowest and next string, 3 and 4 two octaves
 * from them. A two-octave box is a one-octave box, then a shift up to the octave on the next string and the same box
 * from there, so it needs three strings above its root's: on a four-string bass, box 4 isn't offered (owner,
 * 2026-11-25).
 */
function bassBoxes(open: readonly number[], scale: SpelledScale): Placed[] {
    const pcs = scale.notes.map(notePitchClass);
    const root = notePitchClass(scale.root);
    const boxes: Placed[] = [];
    const count = open.length;
    for (const [number, index, octaves] of [
        [1, 0, 1],
        [2, 1, 1],
        [3, 0, 2],
        [4, 1, 2]
    ] as const) {
        // A one-octave box climbs three strings from its root's, a two-octave one four.
        if (index + (octaves === 1 ? 2 : 3) > count - 1) continue;
        const spots = octaves === 1 ? oneOctave(open, pcs, index, root) : twoOctaves(open, pcs, index, root);
        if (spots !== undefined) {
            boxes.push([{ kind: 'bass', number, octaves, rootString: stringNumber(index, count) }, spots]);
        }
    }
    return boxes;
}

/** A one-octave bass box from the root's lowest fret on a string (or an octave up, where it won't fit there). */
function oneOctave(open: readonly number[], pcs: readonly number[], index: number, root: number): Spot[] | undefined {
    const first = fretOf(open[index] ?? 0, root);
    return octaveBox(open, pcs, index, first) ?? octaveBox(open, pcs, index, first + 12);
}

function twoOctaves(open: readonly number[], pcs: readonly number[], index: number, root: number): Spot[] | undefined {
    const first = fretOf(open[index] ?? 0, root);
    for (const fret of [first, first + 12]) {
        const low = octaveBox(open, pcs, index, fret);
        const octave = (open[index] ?? 0) + fret + 12 - (open[index + 1] ?? 0);
        const high = octaveBox(open, pcs, index + 1, octave);
        // The low box ends below its octave, which the high box starts on.
        if (low !== undefined && high !== undefined) return [...low.slice(0, -1), ...high];
    }
    return undefined;
}

/**
 * One octave of the scale from a root fret, one finger a fret: the notes climb in a window of four frets (or five,
 * where four won't do) holding the root, each on the lowest string it fits from the root's string up. The window
 * with the root under the second finger is tried first, then the first, third and fourth.
 */
function octaveBox(open: readonly number[], pcs: readonly number[], index: number, fret: number): Spot[] | undefined {
    const from = (open[index] ?? 0) + fret;
    for (const width of [4, 5]) {
        for (const below of [1, 0, 2, 3, 4].filter(b => b < width)) {
            const low = fret - below;
            if (low < 0) continue;
            const spots = fit(open, pcs, index, from, low, low + width - 1);
            if (spots !== undefined) return spots;
        }
    }
    return undefined;
}

function fit(
    open: readonly number[],
    pcs: readonly number[],
    index: number,
    from: number,
    low: number,
    high: number
): Spot[] | undefined {
    const spots: Spot[] = [];
    let string = index;
    for (let midi = from; midi <= from + 12; midi = nextNote(pcs, midi)) {
        while (string < open.length && midi - (open[string] ?? 0) > high) string++;
        const fret = midi - (open[string] ?? 0);
        if (string >= open.length || fret < low) return undefined;
        spots.push({ index: string, fret });
    }
    return spots;
}

/** A position's cells, from `mapScale` so they're spelled as the scale spells them, frets counted from the nut. */
function withCells(
    strings: readonly NoteName[],
    scale: SpelledScale,
    capo: number,
    position: Placement,
    spots: readonly Spot[]
): Position | undefined {
    const frets = spots.map(spot => spot.fret + capo);
    const from = Math.min(...frets);
    const to = Math.max(...frets);
    if (to > MAX_FRET) return undefined;
    const keys = new Set(
        spots.map(spot => `${String(stringNumber(spot.index, strings.length))}:${String(spot.fret + capo)}`)
    );
    const cells = mapScale(strings, scale, { from, to }, capo).filter(cell =>
        keys.has(`${String(cell.string)}:${String(cell.fret)}`)
    );
    return { ...position, from, to, cells };
}
