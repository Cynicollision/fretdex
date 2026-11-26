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
    /** Called when the run is stopped before its end: by its `stop`, by another sound, or by `stopAll`. */
    readonly onstop?: () => void;
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
    /** When it starts, on the audio clock. */
    readonly when: number;
}

/** A run, kept until its track has ended and its last note has stopped ringing, so it can be stopped till then. */
interface Run {
    playback: Playback | undefined;
    readonly sounding: Set<Sounding>;
    /** Its notes by channel, so a run's notes on one string cut each other as taps do. */
    readonly channels: Map<string, Sounding>;
    readonly under: boolean;
    readonly onstop: (() => void) | undefined;
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
        this.#sound(context, note, context.currentTime, this.#taps, this.#channels);
    }

    /** Plays a track's notes on the beat, as a scale run does (AUD-3), stopping other sounds unless `under`. */
    run<E>(track: Track<E>, options: RunOptions<E>): Playback {
        const context = this.#start();
        if (!options.under) this.#stopAll(false);
        const scheduler = this.#scheduler ?? new Scheduler(context);
        this.#scheduler = scheduler;
        const run: Run = {
            playback: undefined,
            sounding: new Set(),
            channels: new Map(),
            under: options.under ?? false,
            onstop: options.onstop
        };
        this.#runs.add(run);
        run.playback = scheduler.play(track, {
            bpm: options.bpm,
            onevent: (event, time) => {
                const note = options.note(event);
                if (note) this.#sound(context, note, time, run.sounding, run.channels, () => this.#settle(run));
                options.onevent?.(event, time);
            },
            onend: () => {
                this.#settle(run);
                options.onend?.();
            }
        });
        // A short track can end while `play` hands over its first events, before `playback` is set.
        this.#settle(run);
        const playback = run.playback;
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
        // On every sound, as a phone may pause the silent-switch fallback's media element in the background (AUD-1.4).
        playThroughSilentSwitch();
        if (!this.#context) {
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

    /**
     * Starts a note at `when`, kept in `into` until it ends. A note with a channel first cuts the one sounding on it
     * (AUD-1.3).
     */
    #sound(
        context: AudioContext,
        note: NoteRequest,
        when: number,
        into: Set<Sounding>,
        channels: Map<string, Sounding>,
        onended?: () => void
    ): void {
        if (note.channel !== undefined) {
            const previous = channels.get(note.channel);
            if (previous) this.#cut(previous, when);
        }
        const source = context.createBufferSource();
        source.buffer = this.#buffer(context, note);
        const gain = context.createGain();
        source.connect(gain);
        if (this.#master) gain.connect(this.#master);
        const sounding: Sounding = { source, gain, when };
        into.add(sounding);
        if (note.channel !== undefined) channels.set(note.channel, sounding);
        source.onended = () => {
            into.delete(sounding);
            if (note.channel !== undefined && channels.get(note.channel) === sounding) channels.delete(note.channel);
            gain.disconnect();
            onended?.();
        };
        source.start(when);
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

    /** Stops a note at `at`: one sounding by then fades out, so it doesn't click, and a later one never starts. */
    #cut(sounding: Sounding, at: number): void {
        sounding.gain.gain.cancelScheduledValues(at);
        if (sounding.when >= at) {
            sounding.gain.gain.setValueAtTime(0, at);
            sounding.source.stop(at);
            return;
        }
        sounding.gain.gain.setTargetAtTime(0, at, CUT_SECONDS);
        sounding.source.stop(at + CUT_SECONDS * 6);
    }

    /** Lets a run go once its track has ended and its last note has stopped ringing. */
    #settle(run: Run): void {
        if (run.playback !== undefined && !run.playback.playing && run.sounding.size === 0) this.#runs.delete(run);
    }

    #stopRun(run: Run, at: number): void {
        const early = run.playback?.playing ?? false;
        run.playback?.stop();
        for (const sounding of run.sounding) this.#cut(sounding, at);
        run.channels.clear();
        this.#runs.delete(run);
        if (early) run.onstop?.();
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
