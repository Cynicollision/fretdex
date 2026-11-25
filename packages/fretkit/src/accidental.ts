/** An alteration in semitones as `fretkit` writes it, and Tonal.js reads it: `#` or `b` for each (`##`, `bbb`). */
export function accidentalText(alteration: number): string {
    return alteration > 0 ? '#'.repeat(alteration) : 'b'.repeat(-alteration);
}

/**
 * An alteration as it's shown on screen (THY-1.5): ♯ ♭ 𝄪 𝄫, and past a double, a ♯ or ♭ then doubles, as a triple
 * sharp is written ♯𝄪.
 */
export function accidentalSymbols(alteration: number): string {
    const size = Math.abs(alteration);
    const [single, double] = alteration > 0 ? ['♯', '𝄪'] : ['♭', '𝄫'];
    return (size % 2 === 1 ? single : '') + double.repeat(Math.floor(size / 2));
}
