# Theory Correctness (`THY`)

What every module relies on from the theory engine (`fretkit`): notes spelled correctly, intervals named correctly, and a tuning model that works for any string count. These are the requirements most worth testing, since a wrong note is the one bug a reference can't have.

## THY-1 Notes are spelled, not just pitched

| ID | Requirement | Status |
|---|---|---|
| THY-1.1 | Every scale, mode and key shall use each letter name exactly once (heptatonic scales), so F# major is spelled F# G# A# B C# D# E#. The altered scale is the exception: it's spelled by the tensions it's played for, `1 b2 #2 3 #4 b6 b7` (C Db D# E F# Ab Bb), as a 7alt chord is (owner, 2026-11-25). | Implemented |
| THY-1.2 | Chords shall be spelled from their root by interval (C#7 is C# E# G# B; Gb7 is Gb Bb Db Fb). | Partial |
| THY-1.3 | Double sharps and double flats shall be shown where the spelling needs them (G# harmonic minor has F𝄪), written `ss`/`bb` in URLs (`Fss`, since `#` can't appear in a URL path) and `##`/`bb` in search. | Implemented |
| THY-1.4 | Intervals shall be named by their spelling (an augmented 2nd is `#2`, not `b3`) in scales where both can occur (harmonic minor). | Implemented |
| THY-1.5 | Accidentals shall be shown on screen as ♯ ♭ 𝄪 𝄫, in a bundled font that has them; `#`, `s` and `b` shall be accepted wherever the user types a note. | Partial |

## THY-2 Roots pick sensible accidentals

| ID | Requirement | Status |
|---|---|---|
| THY-2.1 | With accidentals on **Auto**, a key or scale on a black-key root shall use the spelling with fewer accidentals in its signature: Db major (5 flats), not C# major (7 sharps). A mode is read in its parent key; harmonic and melodic minor and the minor pentatonic and blues in the minor key on their root; the major pentatonic and blues in the major key; scales with no key of their own (Phrygian dominant, Lydian dominant, altered, whole tone, the diminished scales) by their own notes. At a tie, sharps for a scale read in a key with a major 3rd and flats for one with a minor 3rd: at the tie of six, F# major and Eb minor, the spellings guitar charts use most, and likewise C# Mixolydian and Ab Dorian. A root the user typed or linked to is kept as written. | Implemented |
| THY-2.2 | Root pickers shall offer the 12 roots as C, C#/Db, D, D#/Eb, E, F, F#/Gb, G, G#/Ab, A, A#/Bb, B, each opening the spelling **Auto** prefers, with the other spelling one tap away. A black key's button shows both names, so what opens is always a name that was tapped (owner, 2026-11-25). | Partial |
| THY-2.3 | **Prefer sharps** and **Prefer flats** shall decide the spelling of roots and of lone notes (fretboard note names with no key), never respelling a key's own notes. On **Auto** a lone black-key note is C#, Eb, F#, Ab or Bb. | Implemented |
| THY-2.4 | Every note shall show its enharmonic equivalent where asked (INT-3). Retired 2026-11-25: the note card that asked went with Intervals and notes (INT); a root's other spelling is THY-2.2's and THY-2.5's. | Retired |
| THY-2.5 | A root whose key would need double sharps or flats (A# Dorian, whose parent is G# major) shall never be offered in a root picker when its other spelling's key wouldn't. Reached by a link or search, its card shall show as asked, with a note offering the enharmonic (Bb Dorian). Where both spellings of a black key need them (C# or Db altered), only the one **Auto** prefers is offered, whatever the accidentals setting, and its card says why (SCL-2.6); a white key's letter is always offered, as its button's only spelling. | Partial |

## THY-3 Tunings are lists of strings

| ID | Requirement | Status |
|---|---|---|
| THY-3.1 | A tuning shall be an ordered list of open-string pitches with octaves, lowest string first (Standard guitar: E2 A2 D3 G3 B3 E4; Standard bass: E1 A1 D2 G2). | Implemented |
| THY-3.2 | Every fretboard computation (mapping, positions, voicings) shall take the tuning as input, and shall work for any string count from 4 to 8, though v1 offers only 4 and 6 (vision non-goals). | Implemented |
| THY-3.3 | A custom tuning shall be entered as one pitch per string, for the current instrument's string count, starting from the current tuning, each string with buttons that lower or raise it a semitone (owner, 2026-11-25), within an octave of Standard's pitch for that string. Its pitches are spelled as notes with no key are (THY-2.3). | Implemented |
| THY-3.4 | Strings shall be numbered from the highest-pitched (string 1) to the lowest, as players do. | Implemented |
| THY-3.5 | A capo (CTX-3) shall raise every open string by its fret count for what sounds, so every computation that takes a tuning works with a capo unchanged. | Implemented |

## THY-4 Concert pitch

| ID | Requirement | Status |
|---|---|---|
| THY-4.1 | Notes shall sound at concert pitch with A4 = 440 Hz, guitar and bass at their written octave's real pitch (guitar sounds an octave below written; the app shows and plays the real pitch). | Implemented |

## Known gaps

- **THY-1.2:** `fretkit` spells any chord formula from its root, but its chord qualities come with chords in M02.
- **THY-1.5:** `fretkit` reads typed notes and writes them with ♯ ♭ 𝄪 𝄫, and the app bundles a font that has them, and the context bar shows keys and tunings with them, but nothing takes typed notes yet: cards come in M01 T9, search in M03.
- **THY-2.2 and THY-2.5:** the context bar's key picker offers roots this way; the cards' root pickers come with the cards (M01 T9).

## Notes

- **Tonal.js** spells notes from a root by interval, which `fretkit`'s scales, and later its chords, rest on. `fretkit` keeps its own list of scales (`SCALE_TYPES` in `packages/fretkit/src/scale.ts`), so the spellings are its own (the altered scale, and the whole tone scale's `b7`), and tests these behaviors through its own API, so a change of library can't change an answer unnoticed.
- **The golden table** is `packages/fretkit/golden/scales.md`: every scale on each picker root, as Auto spells it and in the other spelling, checked once when it was made (how is in [M01](../planning/milestones/M01-foundation-and-scales.md), T4). A change to any answer fails its test (`packages/fretkit/src/golden.spec.ts`) until the file is regenerated and the diff checked. M02 adds every chord quality on every root.
