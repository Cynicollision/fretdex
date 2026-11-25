import { MAX_CAPO, TUNINGS, parseTuning, tuningSlug, type Instrument, type NoteName } from '@fretdex/fretkit';
import { STRING_COUNTS, builtInTuning, sameTuning, type Settings } from '#lib/settings/settings.ts';

/**
 * What a URL's `inst`, `tuning` and `capo` set for that view alone (APP-3.3). `instrument` and `tuning` come
 * together: a URL with either has both.
 */
export interface ContextOverride {
    readonly instrument?: Instrument;
    readonly tuning?: readonly NoteName[];
    readonly capo?: number;
}

/** The instrument, tuning and capo a view shows: the settings', unless its URL overrides them. */
export interface ViewContext {
    readonly instrument: Instrument;
    readonly tuning: readonly NoteName[];
    readonly capo: number;
}

/** What reading a query needs: `page.url.searchParams` is read-only. */
export type QueryParams = Pick<URLSearchParams, 'get'>;

/** The query parameters an override is written in, on any route. */
export const OVERRIDE_PARAMS = ['inst', 'tuning', 'capo'] as const;

const INSTRUMENTS: readonly Instrument[] = ['guitar', 'bass'];

/**
 * Reads a URL's override (APP-3.3), ignoring what it can't read:
 *
 * - `inst` is `guitar` or `bass`; on its own it takes that instrument's Standard tuning.
 * - `tuning` is a built-in tuning's id (`drop-d`), on the URL's instrument or else the setting's, or a tuning's
 *   pitches (`D2-A2-D3-G3-A3-D4`). Pitches with no `inst` give the instrument with that many strings, so a custom
 *   tuning's URL works on a device that hasn't saved it; pitches for the other instrument are ignored.
 * - `capo` is a fret from 0, for none, to 11 (CTX-1.9).
 */
export function readOverride(params: QueryParams, settings: Settings): ContextOverride {
    const inst = INSTRUMENTS.find(instrument => instrument === params.get('inst'));
    const tuningText = params.get('tuning');
    const tuning = tuningText === null ? undefined : readTuning(tuningText, inst ?? settings.instrument, inst);
    const capoText = params.get('capo');
    const capo = capoText !== null && /^\d{1,2}$/u.test(capoText) ? Number(capoText) : undefined;

    const instrument = tuning?.instrument ?? inst;
    return {
        ...(instrument === undefined ? {} : { instrument, tuning: tuning?.strings ?? standardStrings(instrument) }),
        ...(capo === undefined || capo > MAX_CAPO ? {} : { capo })
    };
}

/** Writes an override into query parameters as `readOverride` reads it, replacing any there. */
export function writeOverride(params: URLSearchParams, override: ContextOverride): void {
    for (const name of OVERRIDE_PARAMS) params.delete(name);
    if (override.instrument !== undefined) {
        params.set('inst', override.instrument);
        const strings = override.tuning ?? standardStrings(override.instrument);
        const builtIn = builtInTuning(override.instrument, strings);
        if (builtIn?.id !== 'standard') params.set('tuning', builtIn?.id ?? tuningSlug(strings));
    }
    if (override.capo !== undefined) params.set('capo', String(override.capo));
}

/** The context a view shows: the override where it has one, the settings elsewhere. */
export function viewContext(settings: Settings, override: ContextOverride): ViewContext {
    return {
        instrument: override.instrument ?? settings.instrument,
        tuning: override.tuning ?? settings.tuning,
        capo: override.capo ?? settings.capo
    };
}

/**
 * Whether an override shows anything other than the settings would (APP-2.3): a URL that names the instrument and
 * tuning already chosen changes nothing, so the context bar doesn't call it an override.
 */
export function overrides(settings: Settings, override: ContextOverride): boolean {
    const view = viewContext(settings, override);
    return (
        view.instrument !== settings.instrument ||
        view.capo !== settings.capo ||
        !sameTuning(view.tuning, settings.tuning)
    );
}

function readTuning(
    text: string,
    instrument: Instrument,
    named: Instrument | undefined
): { instrument: Instrument; strings: readonly NoteName[] } | undefined {
    const builtIn = TUNINGS[instrument].find(tuning => tuning.id === text);
    if (builtIn) return { instrument, strings: builtIn.strings };
    const strings = parseTuning(text);
    if (strings === undefined) return undefined;
    const fits = INSTRUMENTS.find(candidate => STRING_COUNTS[candidate] === strings.length);
    if (fits === undefined || (named !== undefined && fits !== named)) return undefined;
    return { instrument: fits, strings };
}

function standardStrings(instrument: Instrument): readonly NoteName[] {
    return TUNINGS[instrument][0]?.strings ?? [];
}
