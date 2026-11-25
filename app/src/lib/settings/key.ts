import {
    PICKER_ROOTS,
    isOfferedRoot,
    noteLabel,
    notePitchClass,
    rootChoices,
    scaleType,
    type Accidentals,
    type NoteName,
    type ScaleType
} from '@fretdex/fretkit';
import { KEY_MODES, type CurrentKey, type KeyMode } from './settings';

/** A key picker's button for one of the 12 roots (THY-2.2). */
export interface KeyRootButton {
    readonly pitchClass: number;
    /** The spellings it offers in the mode: a white key's letter, or a black key's sharp and flat unless one is refused. */
    readonly spellings: readonly NoteName[];
    /** The spellings as the button shows them: `C♯/D♭`. */
    readonly label: string;
}

/** The scale a key's mode is read as. */
export function modeScale(mode: KeyMode): ScaleType {
    const id = KEY_MODES.find(candidate => candidate.id === mode)?.scale ?? 'major';
    const type = scaleType(id);
    if (type === undefined) throw new Error(`No scale ${id}`);
    return type;
}

/**
 * The key picker's 12 buttons in a mode (CTX-2.6, THY-2.2): each shows the spellings `fretkit` offers for that mode,
 * so a black key whose other spelling's key would need a double sharp or flat shows one name (B♭ in Dorian).
 */
export function keyRootButtons(mode: KeyMode): KeyRootButton[] {
    const type = modeScale(mode);
    return PICKER_ROOTS.map(({ pitchClass, spellings }) => {
        const offered = spellings.filter(spelling => isOfferedRoot(spelling, type));
        return { pitchClass, spellings: offered, label: offered.map(noteLabel).join('/') };
    });
}

/** The key a root button opens: the spelling `rootChoices` gives on the accidentals setting (THY-2.2). */
export function pickKey(pitchClass: number, mode: KeyMode, accidentals: Accidentals): CurrentKey {
    return { root: rootChoices(pitchClass, modeScale(mode), accidentals).root, mode };
}

/** The key in another mode, on the same root if it's offered there, or else the spelling that is (A♯ minor to B♭ Dorian). */
export function changeMode(key: CurrentKey, mode: KeyMode, accidentals: Accidentals): CurrentKey {
    if (isOfferedRoot(key.root, modeScale(mode))) return { root: key.root, mode };
    return pickKey(notePitchClass(key.root), mode, accidentals);
}

/** The key's root's other spelling one tap away, if the mode offers it (D♭ major beside C♯ major). */
export function otherSpelling(key: CurrentKey): NoteName | undefined {
    const button = keyRootButtons(key.mode).find(candidate => candidate.pitchClass === notePitchClass(key.root));
    return button?.spellings.find(spelling => spelling !== key.root);
}

/** A key as the context bar shows it: "F♯ major", "D Dorian", or "No key". */
export function keyName(key: CurrentKey | null): string {
    if (key === null) return 'No key';
    const mode = KEY_MODES.find(candidate => candidate.id === key.mode)?.name ?? key.mode;
    return `${noteLabel(key.root)} ${mode}`;
}
