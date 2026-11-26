# Modes (`MODE`)

The seven modes of the major scale side by side on one root, so how they relate shows at a glance: from brightest to darkest, each mode is the one above with one note flattened. Answers "which mode fits these notes?" on any root. A mode's own card is its scale card (SCL), which adds what makes it a mode (SCL-5).

Screens: **Modes** (`/modes`, on the current key's root, and `/modes/[root]`, options `mode` and `compare`). The mode cards were folded into the scale cards on 2026-11-25 (owner), as a mode card was a scale card with a few more sections.

## MODE-1 The user can see every mode from one root

| ID | Requirement | Status |
|---|---|---|
| MODE-1.1 | The overview shall show the seven modes of the major scale on one root, in brightness order from Lydian (brightest) to Locrian (darkest), as a grid: a row per mode, a column per semitone from the root, and each row's notes marked by interval. | Planned |
| MODE-1.2 | Retired 2026-11-25: the parent scale and characteristic note are on the mode's scale card (SCL-5.1). | Retired |
| MODE-1.3 | Retired 2026-11-25: a mode's card is its scale card, which has the full neck, positions and keyboard (SCL-2, SCL-3). | Retired |
| MODE-1.4 | Retired 2026-11-25: the brightness row is on the mode's scale card (SCL-5.2). | Retired |
| MODE-1.5 | Retired 2026-11-25: the diatonic chords are on the mode's scale card (SCL-5.3). | Retired |
| MODE-1.6 | Retired 2026-11-25: the overview keeps the brightness order; a mode is pinned from its scale card, and pinned scales are listed first (SCL-1.3). | Retired |
| MODE-1.7 | Each mode shall have one card, its scale card (`/scales/[root]/dorian`): the overview's rows and the Scales list's **Modes** group link to it. | Implemented |
| MODE-1.8 | Modes of harmonic and melodic minor (Phrygian dominant, Lydian dominant, altered) shall be scales (SCL-1.1), not in the overview, and their cards without SCL-5. | Planned |
| MODE-1.9 | Each row shall mark the note that changes from the row above (Ionian's 4 against Lydian's #4) and name the mode's characteristic note (Dorian's natural 6). | Planned |
| MODE-1.10 | The overview shall offer a root picker, the root being the path's (`/modes/Fs`). `/modes` opens on the current key's root, or C (CTX-2.8). | Planned |
| MODE-1.11 | The user can select a row (`mode`), and the overview shows that mode under the grid, across the fret range on the current tuning (DIAG-1), with its characteristic note highlighted. With none chosen, it's the current key's mode when that's on this root, else Ionian. | Planned |

## MODE-2 The user can compare modes from one root

| ID | Requirement | Status |
|---|---|---|
| MODE-2.1 | The user can choose a second row to compare with (`compare`): the neck under the grid shows both modes, with the notes that differ marked there and in the grid. | Planned |
| MODE-2.2 | Retired 2026-11-25: choosing the second row is choosing the mode (MODE-2.1). | Retired |
| MODE-2.3 | A drone of the root (AUD-6) shall be one tap away on the card. Retired 2026-11-25 with the drone (AUD-6). | Retired |
