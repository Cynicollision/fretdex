# Theory Correctness (`THY`)

What every module relies on from the theory engine (`fretkit`): notes spelled correctly, intervals named correctly, and a tuning model that works for any string count. These are the requirements most worth testing, since a wrong note is the one bug a reference can't have.

## THY-1 Notes are spelled, not just pitched

| ID | Requirement | Status |
|---|---|---|
| THY-1.1 | Every scale, mode and key shall use each letter name exactly once (heptatonic scales), so F# major is spelled F# G# A# B C# D# E#. | Planned |
| THY-1.2 | Chords shall be spelled from their root by interval (C#7 is C# E# G# B; Gb7 is Gb Bb Db Fb). | Planned |
| THY-1.3 | Double sharps and double flats shall be shown where the spelling needs them (G# harmonic minor has F𝄪), written `##`/`bb` in URLs and search. | Planned |
| THY-1.4 | Intervals shall be named by their spelling (an augmented 2nd is `#2`, not `b3`) in scales where both can occur (harmonic minor). | Planned |
| THY-1.5 | Accidentals shall be shown on screen as ♯ ♭ 𝄪 𝄫, in a bundled font that has them; `#`, `s` and `b` shall be accepted wherever the user types a note. | Partial |

## THY-2 Roots pick sensible accidentals

| ID | Requirement | Status |
|---|---|---|
| THY-2.1 | With accidentals on **Auto**, a key or scale on a black-key root shall use the spelling with fewer accidentals in its signature: Db major (5 flats), not C# major (7 sharps). At the tie of six, F# major and Eb minor, the spellings guitar charts use most. A root the user typed or linked to is kept as written. | Planned |
| THY-2.2 | Root pickers shall offer the 12 roots as C, C#/Db, D, Eb, E, F, F#/Gb, G, Ab, A, Bb, B, each opening the spelling **Auto** prefers, with the other spelling one tap away. | Planned |
| THY-2.3 | **Prefer sharps** and **Prefer flats** shall decide the spelling of roots and of lone notes (fretboard note names with no key), never respelling a key's own notes. | Planned |
| THY-2.4 | Every note shall show its enharmonic equivalent where asked (INT-3). | Planned |
| THY-2.5 | A root whose key would need double sharps or flats (A# Dorian, whose parent is G# major) shall never be offered in a root picker. Reached by a link or search, its card shall show as asked, with a note offering the enharmonic (Bb Dorian). | Planned |

## THY-3 Tunings are lists of strings

| ID | Requirement | Status |
|---|---|---|
| THY-3.1 | A tuning shall be an ordered list of open-string pitches with octaves, lowest string first (Standard guitar: E2 A2 D3 G3 B3 E4; Standard bass: E1 A1 D2 G2). | Planned |
| THY-3.2 | Every fretboard computation (mapping, positions, voicings) shall take the tuning as input, and shall work for any string count from 4 to 8, though v1 offers only 4 and 6 (vision non-goals). | Planned |
| THY-3.3 | A custom tuning shall be entered as one pitch per string, each from a picker, for the current instrument's string count. | Planned |
| THY-3.4 | Strings shall be numbered from the highest-pitched (string 1) to the lowest, as players do. | Planned |
| THY-3.5 | A capo (CTX-3) shall raise every open string by its fret count for what sounds, so every computation that takes a tuning works with a capo unchanged. | Planned |

## THY-4 Concert pitch

| ID | Requirement | Status |
|---|---|---|
| THY-4.1 | Notes shall sound at concert pitch with A4 = 440 Hz, guitar and bass at their written octave's real pitch (guitar sounds an octave below written; the app shows and plays the real pitch). | Planned |

## Known gaps

- **THY-1.5:** the app bundles a font with ♯ ♭ 𝄪 𝄫, but nothing spells notes yet (M01 T4), and nothing takes typed notes until search (SRCH, M03).

## Notes

- **Tonal.js** does spelling, intervals, chord and scale dictionaries, keys and roman numerals. `fretkit` tests these behaviors through its own API anyway, so a change of library can't change an answer unnoticed.
- **Golden tests.** A table of every key's scale and every chord quality on every root, checked once by hand, makes a good regression test.
