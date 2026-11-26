/**
 * iPhones silence Web Audio when the ring/silent switch is on silent, but not media playback (AUD-1.4). Safari 16.4
 * and later let a page say its audio is playback (`navigator.audioSession`); older iPhones are switched to the
 * playback session by playing a media element, here a short silent WAV made in code (AUD-7.2), looped.
 */

interface AudioSession {
    type: string;
}

/** The fallback's media element, made on the first sound. */
let element: HTMLAudioElement | undefined;

/**
 * Asks for audio that plays on silent. Called on every sound, from a tap, as playing a media element needs one, and
 * a phone may pause the element in the background.
 */
export function playThroughSilentSwitch(): void {
    if (typeof navigator === 'undefined') return;
    const session = (navigator as Navigator & { audioSession?: AudioSession }).audioSession;
    if (session !== undefined) {
        if (session.type !== 'playback') session.type = 'playback';
        return;
    }
    // Only on iPhones and iPads: elsewhere the switch doesn't exist, and a playing element can show media controls.
    if (!isAppleTouchDevice() || typeof Audio === 'undefined') return;
    if (!element) {
        element = new Audio(URL.createObjectURL(new Blob([silentWav()], { type: 'audio/wav' })));
        element.loop = true;
    }
    if (element.paused) {
        element.play().catch(() => {
            // Without it, audio still plays when the switch is off; the next sound tries again.
        });
    }
}

function isAppleTouchDevice(): boolean {
    return (
        /iPhone|iPad|iPod/.test(navigator.userAgent) ||
        (/Macintosh/.test(navigator.userAgent) && navigator.maxTouchPoints > 1)
    );
}

/** A mono 16-bit WAV of `seconds` of silence. */
export function silentWav(seconds = 0.5, sampleRate = 8000): Uint8Array<ArrayBuffer> {
    const samples = Math.round(seconds * sampleRate);
    const data = samples * 2;
    const bytes = new Uint8Array(44 + data);
    const view = new DataView(bytes.buffer);
    const text = (at: number, value: string) => {
        for (let i = 0; i < value.length; i++) view.setUint8(at + i, value.charCodeAt(i));
    };
    text(0, 'RIFF');
    view.setUint32(4, 36 + data, true);
    text(8, 'WAVE');
    text(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true); // PCM
    view.setUint16(22, 1, true); // mono
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    text(36, 'data');
    view.setUint32(40, data, true);
    return bytes;
}
