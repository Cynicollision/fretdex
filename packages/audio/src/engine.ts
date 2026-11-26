import { Scheduler, type Playback, type Track } from './scheduler';
import { playThroughSilentSwitch } from './silent-switch';
import { renderNote, type Voice } from './voices';

/** A note to play: a MIDI note in one of the voices. */
export interface NoteRequest {
    readonly midi: number;
    readonly voice: Voice;
    /**
     * Where it's played, such as a string (`string:3`) or a key (`key:60`): a note cuts the one sounding on the same
     * channel and leaves the others ringing, as on the instrument (AUD-1.3).
     */
    readonly channel?: string;
}

export interface RunOptions<E> {
    /** Beats per minute. */
    readonly bpm: number;
    /** The note an event plays, if any. */
    readonly note: (event: E) => NoteRequest | undefined;
    /** Called for each event ahead of its time on the audio clock, as for lighting the note that plays (AUD-3.2). */
    readonly onevent?: (event: E, time: number) => void;
    /** Called when a track that doesn't loop has finished. */
    readonly onend?: () => void;
    /** Plays under other sounds rather than stopping them and being stopped by them, as the metronome does. */
    readonly under?: boolean;
}

export interface EngineOptions {
    /** Makes the audio context, on the first sound; a real `AudioContext` by default. */
    readonly createContext?: () => AudioContext;
}

/** The volume a new engine starts at, out of 100, until the app sets the stored one. */
const DEFAULT_VOLUME = 80;

/** How quickly a note that's cut fades out, in seconds, so it doesn't click. */
const CUT_SECONDS = 0.01;

interface Sounding {
    readonly source: AudioBufferSourceNode;
    readonly gain: GainNode;
}

interface Run {
    readonly playback: Playback;
    readonly sounding: Set<Sounding>;
    readonly under: boolean;
}

/**
 * The app's audio: one audio context, made on the first sound so nothing plays before a tap (AUD-1.1), with a
 * master volume and mute (AUD-1.2) and a limiter after them, so many ringing notes never clip. Starting a sound
 * stops the one before (AUD-1.3), except that taps on different channels ring together, and a run marked `under`
 * plays on.
 */
export class AudioEngine {
    readonly #createContext: () => AudioContext;
    #context: AudioContext | undefined;
    #master: GainNode | undefined;
    #scheduler: Scheduler | undefined;
    readonly #buffers = new Map<string, AudioBuffer>();
    readonly #channels = new Map<string, Sounding>();
    readonly #taps = new Set<Sounding>();
    readonly #runs = new Set<Run>();
    #volume = DEFAULT_VOLUME;
    #muted = false;

    constructor(options: EngineOptions = {}) {
        this.#createContext = options.createContext ?? (() => new AudioContext({ latencyHint: 'interactive' }));
    }

    /** Whether audio has started: false until the first sound. */
    get started(): boolean {
        return this.#context !== undefined;
    }

    /** The audio clock, in seconds; 0 before audio has started. */
    get currentTime(): number {
        return this.#context?.currentTime ?? 0;
    }

    /** Sets the master volume, out of 100, and mute (AUD-1.2). */
    setVolume(volume: number, muted: boolean): void {
        this.#volume = Math.min(100, Math.max(0, volume));
        this.#muted = muted;
        if (this.#context && this.#master) {
            this.#master.gain.setTargetAtTime(this.#level(), this.#context.currentTime, 0.02);
        }
    }

    /** Plays a note now, as from a tap. Call it from the tap's handler, as the first sound needs one (AUD-1.1). */
    play(note: NoteRequest): void {
        const context = this.#start();
        this.#stopRuns(false);
        if (note.channel !== undefined) {
            const previous = this.#channels.get(note.channel);
            if (previous) this.#cut(previous, context.currentTime);
        }
        const sounding = this.#sound(context, note, context.currentTime, this.#taps);
        if (note.channel !== undefined) this.#channels.set(note.channel, sounding);
    }

    /** Plays a track's notes on the beat, as a scale run does (AUD-3), stopping other sounds unless `under`. */
    run<E>(track: Track<E>, options: RunOptions<E>): Playback {
        const context = this.#start();
        if (!options.under) this.#stopAll(false);
        const sounding = new Set<Sounding>();
        const scheduler = this.#scheduler ?? new Scheduler(context);
        this.#scheduler = scheduler;
        const playback = scheduler.play(track, {
            bpm: options.bpm,
            onevent: (event, time) => {
                const note = options.note(event);
                if (note) this.#sound(context, note, time, sounding);
                options.onevent?.(event, time);
            },
            onend: () => {
                // The run is known by its notes, since a short track can end before `play` returns.
                for (const run of this.#runs) if (run.sounding === sounding) this.#runs.delete(run);
                options.onend?.();
            }
        });
        const run: Run = { playback, sounding, under: options.under ?? false };
        if (playback.playing) this.#runs.add(run);
        const stop = () => this.#stopRun(run, context.currentTime);
        return {
            setTempo: bpm => playback.setTempo(bpm),
            stop,
            get playing() {
                return playback.playing;
            }
        };
    }

    /** Stops every sound, including those playing under the others. */
    stopAll(): void {
        this.#stopAll(true);
    }

    #start(): AudioContext {
        if (!this.#context) {
            playThroughSilentSwitch();
            const context = this.#createContext();
            const master = context.createGain();
            master.gain.value = this.#level();
            const limiter = context.createDynamicsCompressor();
            limiter.threshold.value = -6;
            limiter.knee.value = 6;
            limiter.ratio.value = 12;
            limiter.attack.value = 0.003;
            limiter.release.value = 0.25;
            master.connect(limiter).connect(context.destination);
            this.#context = context;
            this.#master = master;
        }
        // A context starts suspended without a tap, and a phone may suspend or interrupt it in the background.
        if (this.#context.state !== 'running') {
            this.#context.resume().catch(() => {
                // Not allowed yet, as before a tap; the next sound tries again.
            });
        }
        return this.#context;
    }

    #level(): number {
        // Squared, so the slider's middle sounds about half as loud.
        return this.#muted ? 0 : (this.#volume / 100) ** 2;
    }

    #sound(context: AudioContext, note: NoteRequest, when: number, into: Set<Sounding>): Sounding {
        const source = context.createBufferSource();
        source.buffer = this.#buffer(context, note);
        const gain = context.createGain();
        source.connect(gain);
        if (this.#master) gain.connect(this.#master);
        const sounding: Sounding = { source, gain };
        into.add(sounding);
        source.onended = () => {
            into.delete(sounding);
            if (note.channel !== undefined && this.#channels.get(note.channel) === sounding) {
                this.#channels.delete(note.channel);
            }
            gain.disconnect();
        };
        source.start(when);
        return sounding;
    }

    #buffer(context: AudioContext, note: NoteRequest): AudioBuffer {
        const key = `${note.voice}:${String(note.midi)}`;
        let buffer = this.#buffers.get(key);
        if (!buffer) {
            const samples = renderNote(note.voice, note.midi, context.sampleRate);
            buffer = context.createBuffer(1, samples.length, context.sampleRate);
            buffer.copyToChannel(samples, 0);
            this.#buffers.set(key, buffer);
        }
        return buffer;
    }

    #cut(sounding: Sounding, at: number): void {
        sounding.gain.gain.cancelScheduledValues(at);
        sounding.gain.gain.setTargetAtTime(0, at, CUT_SECONDS);
        // A note scheduled for later than `at` never starts.
        sounding.source.stop(at + CUT_SECONDS * 6);
    }

    #stopRun(run: Run, at: number): void {
        run.playback.stop();
        for (const sounding of run.sounding) this.#cut(sounding, at);
        this.#runs.delete(run);
    }

    #stopRuns(includingUnder: boolean): void {
        const at = this.currentTime;
        for (const run of [...this.#runs]) if (includingUnder || !run.under) this.#stopRun(run, at);
    }

    #stopAll(includingUnder: boolean): void {
        this.#stopRuns(includingUnder);
        const at = this.currentTime;
        for (const sounding of this.#taps) this.#cut(sounding, at);
        this.#channels.clear();
    }
}
