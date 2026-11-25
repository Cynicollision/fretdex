/** The pitch class (0 = C … 11 = B) of a number of semitones above C, for any whole number, negative included. */
export function pitchClass(semitones: number): number {
    return ((semitones % 12) + 12) % 12;
}
