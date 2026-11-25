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

/** Tonal.js's reading of a rising interval, or an error if it isn't one. */
function getInterval(code: IntervalCode): ReturnType<typeof Interval.get> {
    const parsed = Interval.get(code);
    if (parsed.empty || parsed.dir < 0) throw new Error(`Not a rising interval: ${code}`);
    return parsed;
}
