/** A4, MIDI note 69, sounds at 440 Hz (THY-4.1). */
const A4_MIDI = 69;
const A4_HZ = 440;

/** The frequency in hertz of a MIDI note number, in equal temperament. */
export function midiToFrequency(midi: number): number {
    return A4_HZ * 2 ** ((midi - A4_MIDI) / 12);
}
