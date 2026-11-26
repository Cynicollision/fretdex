import { midiToFrequency } from './pitch';

/**
 * The three voices (AUD-7.1): a plucked string for guitar, a rounder sine-plus-saw for bass, and a simple electric
 * piano for the keyboard. Each note is rendered ahead into samples by a plain function, so the voices need no files
 * (AUD-7.2) and can be tested without a sound card; the engine plays the samples.
 */
export const VOICES = ['guitar', 'bass', 'piano'] as const;

export type Voice = (typeof VOICES)[number];

/** How long a rendered note lasts, in seconds, ending in a short fade. */
export const NOTE_SECONDS: Readonly<Record<Voice, number>> = { guitar: 3, bass: 2.4, piano: 2.6 };

/** The loudest sample a voice renders, so several ringing notes leave headroom. */
export const PEAK = 0.5;

const FADE_SECONDS = 0.08;

/** Renders one note of a voice, at a MIDI note's equal-tempered pitch (THY-4.1), as mono samples. */
export function renderNote(voice: Voice, midi: number, sampleRate: number): Float32Array<ArrayBuffer> {
    const frequency = midiToFrequency(midi);
    const length = Math.round(NOTE_SECONDS[voice] * sampleRate);
    const samples =
        voice === 'guitar'
            ? pluck(frequency, sampleRate, length, midi)
            : voice === 'bass'
              ? bass(frequency, sampleRate, length)
              : electricPiano(frequency, sampleRate, length);
    return finish(samples, sampleRate);
}

/**
 * A Karplus–Strong plucked string: a burst of noise, shaped as a pick near the bridge shapes it, circulates through
 * a delay line one period long, where an averaging filter takes a little of its brightness each time round. A
 * first-order allpass in the loop makes up the period's fraction of a sample, so the pitch is exact.
 */
function pluck(frequency: number, sampleRate: number, length: number, seed: number): Float32Array<ArrayBuffer> {
    // The averaging filter delays half a sample, and the allpass the fraction it's tuned for.
    const period = sampleRate / frequency - 0.5;
    let size = Math.floor(period);
    let fraction = period - size;
    // An allpass tuned to a very small fraction rings; taking a whole sample into it keeps it between 0.1 and 1.1.
    if (fraction < 0.1) {
        size -= 1;
        fraction += 1;
    }
    const allpass = (1 - fraction) / (1 + fraction);

    // Each trip round the loop keeps `loss` of the fundamental, as much as decays it by 60 dB over the string's ring
    // time: longer for low strings, as on a guitar. The averaging filter's own loss at the fundamental is made up.
    const ringSeconds = 4.5 - 2.5 * Math.min(1, Math.max(0, (frequency - 80) / 900));
    const filterGain = Math.cos((Math.PI * frequency) / sampleRate);
    const loss = Math.min(0.9995, 0.001 ** (1 / (frequency * ringSeconds)) / filterGain);

    const line = excitation(size, seed);
    const out = new Float32Array(length);
    let index = 0;
    let previous = 0;
    let allpassIn = 0;
    let allpassOut = 0;
    for (let i = 0; i < length; i++) {
        const current = line[index] ?? 0;
        out[i] = current;
        const averaged = loss * 0.5 * (current + previous);
        previous = current;
        const tuned = allpass * averaged + allpassIn - allpass * allpassOut;
        allpassIn = averaged;
        allpassOut = tuned;
        line[index] = tuned;
        index = index + 1 === size ? 0 : index + 1;
    }
    return out;
}

/** The pluck's burst: noise from a fixed seed, softened, with the notch a pick an eighth of the way along makes. */
function excitation(size: number, seed: number): Float32Array<ArrayBuffer> {
    const random = randomFrom(seed);
    const noise = new Float32Array(size);
    let soft = 0;
    for (let i = 0; i < size; i++) {
        soft = 0.6 * soft + 0.4 * (random() * 2 - 1);
        noise[i] = soft;
    }
    const pick = Math.max(1, Math.round(size / 8));
    const burst = new Float32Array(size);
    let mean = 0;
    for (let i = 0; i < size; i++) {
        burst[i] = (noise[i] ?? 0) - (noise[i - pick] ?? 0);
        mean += burst[i] ?? 0;
    }
    mean /= size;
    for (let i = 0; i < size; i++) burst[i] = (burst[i] ?? 0) - mean;
    return burst;
}

/**
 * Bass: a sine at the pitch with a saw's harmonics over it, which fade faster the higher they are, so the note
 * starts with some bite and settles round. The harmonics are what a phone's speaker plays of a low E.
 */
function bass(frequency: number, sampleRate: number, length: number): Float32Array<ArrayBuffer> {
    const out = new Float32Array(length);
    const highest = Math.min(Math.floor(Math.min(6000, sampleRate * 0.45) / frequency), 40);
    const step = (2 * Math.PI * frequency) / sampleRate;
    for (let i = 0; i < length; i++) {
        const t = i / sampleRate;
        let sample = Math.sin(step * i);
        for (let k = 1; k <= highest; k++) {
            const level = (0.45 / k) * Math.exp(-t * (0.8 + 0.9 * k));
            // Each harmonic fades faster than the one below, so once one is inaudible the rest are too.
            if (level < 1e-4) break;
            sample += level * Math.sin(step * k * i);
        }
        out[i] = sample * envelope(t, 0.006, 1.3);
    }
    return out;
}

/**
 * Electric piano: two-operator FM, a sine modulating a sine at the same pitch, its depth falling fast after the
 * strike for the bark, and a quiet high partial that dies in a few hundredths of a second for the tine.
 */
function electricPiano(frequency: number, sampleRate: number, length: number): Float32Array<ArrayBuffer> {
    const out = new Float32Array(length);
    const step = (2 * Math.PI * frequency) / sampleRate;
    const tine = 14 * frequency < sampleRate * 0.45 ? 14 : 0;
    // Lower notes sustain longer, as on the instrument.
    const decay = 1.6 - Math.min(1, Math.max(0, (frequency - 130) / 1000));
    for (let i = 0; i < length; i++) {
        const t = i / sampleRate;
        const depth = 0.25 + 1.6 * Math.exp(-t / 0.18);
        let sample = Math.sin(step * i + depth * Math.sin(step * i));
        if (tine > 0) sample += 0.18 * Math.exp(-t / 0.025) * Math.sin(step * tine * i);
        out[i] = sample * envelope(t, 0.003, decay);
    }
    return out;
}

/** A linear attack to full, then an exponential decay with time constant `decay`, all in seconds. */
function envelope(t: number, attack: number, decay: number): number {
    return t < attack ? t / attack : Math.exp(-(t - attack) / decay);
}

/** Scales a note to `PEAK` and fades its end, so it never clicks off. */
function finish(samples: Float32Array<ArrayBuffer>, sampleRate: number): Float32Array<ArrayBuffer> {
    let peak = 0;
    for (const sample of samples) peak = Math.max(peak, Math.abs(sample));
    const scale = peak > 0 ? PEAK / peak : 0;
    const fade = Math.min(samples.length, Math.round(FADE_SECONDS * sampleRate));
    for (let i = 0; i < samples.length; i++) {
        const left = samples.length - i;
        samples[i] = (samples[i] ?? 0) * scale * (left <= fade ? (left - 1) / fade : 1);
    }
    return samples;
}

/** A small seeded random number generator (mulberry32), so a note sounds the same every time it's played. */
function randomFrom(seed: number): () => number {
    let state = (seed * 0x9e3779b1) >>> 0;
    return () => {
        state = (state + 0x6d2b79f5) >>> 0;
        let t = state;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}
