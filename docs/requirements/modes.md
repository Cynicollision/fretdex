# Modes (`MODE`)

The seven modes of one major scale side by side, in order of the degree each starts on (Ionian, Dorian, Phrygian, Lydian, Mixolydian, Aeolian, Locrian), as guitar references teach them: the same notes from a different start, so each mode's shape and its slice of the scale's step pattern show at a glance (owner, 2026-11-26). The seven modes on one root, brightest to darkest, are on each mode's scale card (SCL-5.2). A mode's own card is its scale card (SCL), which adds what makes it a mode (SCL-5).

Screens: **Modes** (`/modes`, on the current key's parent major, and `/modes/[root]`, the modes of that major scale; option `labels`). The mode cards were folded into the scale cards on 2026-11-25 (owner), as a mode card was a scale card with a few more sections.

## MODE-1 The user can see the seven modes of a major scale

| ID | Requirement | Status |
|---|---|---|
| MODE-1.1 | The overview shall show the seven modes of one major scale, a row per mode in order of the degree it starts on, Ionian to Locrian, each spelled as the major scale spells it (D Dorian, E Phrygian … in C): its roman numeral (`I`, `ii`, `iii`, `IV`, `V`, `vi`, `viiø`), its name, its intervals, and a small fretboard of one position on the current instrument, tuning and capo (owner, 2026-11-26). | Implemented |
| MODE-1.2 | Retired 2026-11-25: the parent scale and characteristic note are on the mode's scale card (SCL-5.1). | Retired |
| MODE-1.3 | Retired 2026-11-25: a mode's card is its scale card, which has the full neck, positions and keyboard (SCL-2, SCL-3). | Retired |
| MODE-1.4 | Retired 2026-11-25: the brightness row is on the mode's scale card (SCL-5.2). | Retired |
| MODE-1.5 | Retired 2026-11-25: the diatonic chords are on the mode's scale card (SCL-5.3). | Retired |
| MODE-1.6 | Retired 2026-11-25: the overview keeps the brightness order; a mode is pinned from its scale card, and pinned scales are listed first (SCL-1.3). | Retired |
| MODE-1.7 | Each mode shall have one card, its scale card (`/scales/[root]/dorian`): tapping an overview row opens it (owner, 2026-11-26), and the Scales list's **Modes** group links to it. | Implemented |
| MODE-1.8 | Modes of harmonic and melodic minor (Phrygian dominant, Lydian dominant, altered) shall be scales (SCL-1.1), not in the overview, and their cards without SCL-5. | Implemented |
| MODE-1.9 | Retired 2026-11-26 (owner): in degree order the rows share their notes, so no note changes from one row to the next; the characteristic note is marked instead (MODE-1.13). | Retired |
| MODE-1.10 | The overview shall offer a picker of the major keys the key picker offers (CTX-2.6), the key being the path's root (`/modes/Db`), with at most one sharp or flat. `/modes` opens on the current key's parent major (C for D Dorian or A minor), or C (CTX-2.8). | Implemented |
| MODE-1.11 | Retired 2026-11-26 (owner): tapping a row opens the mode's scale card, which shows it on the whole neck, so the overview has no neck of its own and no `mode` option. | Retired |
| MODE-1.12 | Each row's fretboard shall show the mode's 3-notes-per-string pattern starting on its root on the lowest string (SCL-3.2), or on bass its one-octave box from the root on the lowest string (SCL-4.1), with the scale's other notes in those frets faded (DIAG-1.3); tapping the row opens the scale card on that position (owner, 2026-11-26). | Implemented |
| MODE-1.13 | Each row shall ring the mode's characteristic note on its fretboard, as the scale card does, and name it: "♮6 characteristic" for Dorian (SCL-5.1). | Implemented |
| MODE-1.14 | Each row shall show its steps as its slice of the major scale's repeating pattern: a strip of that pattern with the mode's seven steps lit, starting one step further along than the row above, so down the page the lit slices step right as in a shifted grid (owner, 2026-11-26). The lit steps are in the neck's note colour, leaving the accent to the root (owner, 2026-11-28). | Implemented |
| MODE-1.15 | The overview shall offer the scale card's labels choice at the top (CTX-2.4, `labels`), for every row's fretboard at once, starting from the labels setting (owner, 2026-11-26). | Implemented |

## MODE-2 The user can compare modes from one root

| ID | Requirement | Status |
|---|---|---|
| MODE-2.1 | Retired 2026-11-26 (owner): the overview compares all seven modes at once, so picking two to compare adds nothing. | Retired |
| MODE-2.2 | Retired 2026-11-25: choosing the second row is choosing the mode (MODE-2.1). | Retired |
| MODE-2.3 | A drone of the root (AUD-6) shall be one tap away on the card. Retired 2026-11-25 with the drone (AUD-6). | Retired |
