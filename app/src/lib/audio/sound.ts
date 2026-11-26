import { AudioEngine, type Voice } from '@fretdex/audio';
import type { Instrument } from '@fretdex/fretkit';
import type { TappedFret } from '#lib/diagrams/fretboard.ts';

/**
 * The app's one audio engine. It makes no audio context until the first tap plays something (AUD-1.1); the root
 * layout keeps its volume and mute in step with the settings (AUD-1.2).
 */
export const sound = new AudioEngine();

/** The voice an instrument's fretboard plays in (AUD-7.1). */
export function instrumentVoice(instrument: Instrument): Voice {
    return instrument === 'guitar' ? 'guitar' : 'bass';
}

/** Plays a tapped fret at the pitch it sounds, capo included, cutting only the note on its string (AUD-4.1, AUD-1.3). */
export function playFret(tapped: TappedFret, instrument: Instrument): void {
    sound.play({ midi: tapped.midi, voice: instrumentVoice(instrument), channel: `string:${String(tapped.string)}` });
}

/** Plays a key tapped on the enlarged keyboard in the electric piano (AUD-4.1, AUD-7.1). */
export function playKey(midi: number): void {
    sound.play({ midi, voice: 'piano', channel: `key:${String(midi)}` });
}
