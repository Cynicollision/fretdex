import { Interval } from 'tonal';

/**
 * An interval as `fretkit` passes it around: Tonal.js's name, a number then a quality (`3m`, `4A`, `7d`, `9m`).
 * Its name for people comes from `intervalName` (`b3`, `#4`, `bb7`, `b9`).
 */
export type IntervalCode = string;

/**
 * An interval's short name, by how it's spelled (THY-1.4): its number, with a flat or sharp for each semitone it is
 * below or above the major or perfect interval. `3m` is `b3`, `2A` is `#2` (never `b3`), `7d` is `bb7`, `9m` is `b9`.
 * Written with `#` and `b`, as requirements and URLs write them; `intervalLabel` gives the form shown on screen.
 */
export function intervalName(code: IntervalCode): string {
    const { num, alt, empty } = Interval.get(code);
    if (empty) throw new Error(`Not an interval: ${code}`);
    return (alt > 0 ? '#'.repeat(alt) : 'b'.repeat(-alt)) + String(num);
}

/** An interval's short name as shown on screen, with ♯ ♭ 𝄪 𝄫: `3m` is `♭3`, `7d` is `𝄫7`. */
export function intervalLabel(code: IntervalCode): string {
    return intervalName(code).replace('bb', '𝄫').replace('##', '𝄪').replace('b', '♭').replace('#', '♯');
}

/** How many semitones an interval spans: 3 for `3m` and for `2A`. */
export function intervalSemitones(code: IntervalCode): number {
    return Interval.get(code).semitones;
}
