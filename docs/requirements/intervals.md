# Intervals and Notes (`INT`)

The small references between theory and the neck: what each interval looks like on the fretboard, where a note is, and what else it's called. A "find every C" drill would be ear training, a non-goal.

Screens: **Intervals** (`/intervals`), the interval card (`/intervals/[interval]`) and the note card (`/notes/[note]`).

## INT-1 The user can see interval shapes

| ID | Requirement | Status |
|---|---|---|
| INT-1.1 | The intervals screen shall list the intervals from unison to the octave (and 9th, 11th, 13th), each with its name, short name (`b3`, `#4`) and semitones. | Planned |
| INT-1.2 | Choosing an interval shall open its card (`/intervals/b3`, with sharps as `s`), showing its shapes on the neck from a chosen root: on the same string, on each pair of adjacent strings (with the G–B string offset accounted for in standard tuning), across the fret range. | Planned |
| INT-1.3 | The user can tap to hear the interval, melodic then harmonic (AUD-4.2). | Planned |

## INT-2 The user can find a note

| ID | Requirement | Status |
|---|---|---|
| INT-2.1 | The note card shall show every place the note falls on the neck in the fret range, on the current tuning, and on a keyboard. | Planned |
| INT-2.2 | Tapping any fret on any fretboard shall say which note it is (DIAG-1.6). | Planned |

## INT-3 The user can see enharmonics

| ID | Requirement | Status |
|---|---|---|
| INT-3.1 | The note card shall list the note's enharmonic spellings (F# = Gb; B# = C; E𝄪 = F#). | Planned |
| INT-3.2 | The intervals screen shall list enharmonic intervals (`#4` = `b5`, `#2` = `b3`, `#5` = `b6`) with when each spelling is used. | Planned |
