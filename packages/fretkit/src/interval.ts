import { Interval } from 'tonal';
import { accidentalSymbols, accidentalText } from './accidental';

/**
 * An interval as `fretkit` passes it around: Tonal.js's name, a number then a quality (`3m`, `4A`, `7d`, `9m`),
 * always rising from the root. Its name for people comes from `intervalName` (`b3`, `#4`, `bb7`, `b9`). Functions
 * given something that isn't a rising interval throw.
 */
export type IntervalCode = string;

/**
 * An interval's short name, by how it's spelled (THY-1.4): its number, with a flat or sharp for each semitone it is
 * below or above the major or perfect interval. `3m` is `b3`, `2A` is `#2` (never `b3`), `7d` is `bb7`, `9m` is `b9`.
 * Written with `#` and `b`, as requirements and URLs write them; `intervalLabel` gives the form shown on screen.
 */
export function intervalName(code: IntervalCode): string {
    const { num, alt } = getInterval(code);
    return accidentalText(alt) + String(num);
}

/** An interval's short name as shown on screen, with ♯ ♭ 𝄪 𝄫: `3m` is `♭3`, `7d` is `𝄫7`. */
export function intervalLabel(code: IntervalCode): string {
    const { num, alt } = getInterval(code);
    return accidentalSymbols(alt) + String(num);
}

/** How many semitones an interval spans: 3 for `3m` and for `2A`. */
export function intervalSemitones(code: IntervalCode): number {
    return getInterval(code).semitones;
}

/** An interval the Intervals screen lists (INT-1.1), with its name for people. */
export interface IntervalType {
    readonly code: IntervalCode;
    readonly name: string;
}

/**
 * The intervals the Intervals screen lists, in order (INT-1.1): unison to the octave, then the 9th, 11th and 13th,
 * with both spellings where chords use both (`#2` and `b3`, `#4` and `b5`, `#5` and `b6`, INT-3.2) and the `bb7` of a
 * diminished 7th chord.
 */
export const INTERVALS: readonly IntervalType[] = [
    { code: '1P', name: 'Unison' },
    { code: '2m', name: 'Minor second' },
    { code: '2M', name: 'Major second' },
    { code: '2A', name: 'Augmented second' },
    { code: '3m', name: 'Minor third' },
    { code: '3M', name: 'Major third' },
    { code: '4P', name: 'Perfect fourth' },
    { code: '4A', name: 'Augmented fourth' },
    { code: '5d', name: 'Diminished fifth' },
    { code: '5P', name: 'Perfect fifth' },
    { code: '5A', name: 'Augmented fifth' },
    { code: '6m', name: 'Minor sixth' },
    { code: '6M', name: 'Major sixth' },
    { code: '7d', name: 'Diminished seventh' },
    { code: '7m', name: 'Minor seventh' },
    { code: '7M', name: 'Major seventh' },
    { code: '8P', name: 'Octave' },
    { code: '9m', name: 'Minor ninth' },
    { code: '9M', name: 'Major ninth' },
    { code: '9A', name: 'Augmented ninth' },
    { code: '11P', name: 'Perfect eleventh' },
    { code: '11A', name: 'Augmented eleventh' },
    { code: '13m', name: 'Minor thirteenth' },
    { code: '13M', name: 'Major thirteenth' }
];

/** An interval as a URL writes it (INT-1.2): its short name with sharps as `s`, so `4A` is `s4` and `3m` is `b3`. */
export function intervalSlug(code: IntervalCode): string {
    return intervalName(code).replaceAll('#', 's');
}

/**
 * The listed interval (`INTERVALS`) a URL names by its short name, sharps written `s` or `#` (`s4`, `#4`, `b3`,
 * `bb7`, `13`), or `undefined` for anything else.
 */
export function parseIntervalSlug(slug: string): IntervalType | undefined {
    const name = slug.replaceAll('s', '#');
    return INTERVALS.find(interval => intervalName(interval.code) === name);
}

/** Tonal.js's reading of a rising interval, or an error if it isn't one. */
function getInterval(code: IntervalCode): ReturnType<typeof Interval.get> {
    const parsed = Interval.get(code);
    if (parsed.empty || parsed.dir < 0) throw new Error(`Not a rising interval: ${code}`);
    return parsed;
}
