import type { IntervalCode } from './interval';

/** An arpeggio quality: a triad or seventh chord's tones (ARP-1.1). */
export interface ArpeggioType {
    /** The quality's name in URLs (`/arpeggios/D/maj7`), in ASCII letters and digits only: `mmaj7` for m(maj7). */
    readonly id: string;
    /** The chord symbol after the root, as shown (`m7♭5`, `m(maj7)`); `major` for the major triad. */
    readonly symbol: string;
    readonly name: string;
    /** The chord tones from the root, each spelled as the chord spells it (THY-1.2). */
    readonly intervals: readonly IntervalCode[];
}

/** The arpeggio qualities (ARP-1.1): the chords list's triads, sixths and sevenths (CHD-1.1), in its order. */
export const ARPEGGIO_TYPES: readonly ArpeggioType[] = [
    { id: 'major', symbol: 'major', name: 'Major', intervals: ['1P', '3M', '5P'] },
    { id: 'm', symbol: 'm', name: 'Minor', intervals: ['1P', '3m', '5P'] },
    { id: 'dim', symbol: 'dim', name: 'Diminished', intervals: ['1P', '3m', '5d'] },
    { id: 'aug', symbol: 'aug', name: 'Augmented', intervals: ['1P', '3M', '5A'] },
    { id: '6', symbol: '6', name: 'Major sixth', intervals: ['1P', '3M', '5P', '6M'] },
    { id: 'm6', symbol: 'm6', name: 'Minor sixth', intervals: ['1P', '3m', '5P', '6M'] },
    { id: '7', symbol: '7', name: 'Dominant seventh', intervals: ['1P', '3M', '5P', '7m'] },
    { id: 'maj7', symbol: 'maj7', name: 'Major seventh', intervals: ['1P', '3M', '5P', '7M'] },
    { id: 'm7', symbol: 'm7', name: 'Minor seventh', intervals: ['1P', '3m', '5P', '7m'] },
    { id: 'mmaj7', symbol: 'm(maj7)', name: 'Minor major seventh', intervals: ['1P', '3m', '5P', '7M'] },
    { id: 'm7b5', symbol: 'm7♭5', name: 'Half-diminished seventh', intervals: ['1P', '3m', '5d', '7m'] },
    { id: 'dim7', symbol: 'dim7', name: 'Diminished seventh', intervals: ['1P', '3m', '5d', '7d'] },
    { id: '7sus4', symbol: '7sus4', name: 'Dominant seventh, suspended fourth', intervals: ['1P', '4P', '5P', '7m'] }
];

/** The arpeggio quality with this id, or `undefined`. */
export function arpeggioType(id: string): ArpeggioType | undefined {
    return ARPEGGIO_TYPES.find(type => type.id === id);
}
