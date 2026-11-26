# Modes (`MODE`)

The seven modes of the major scale side by side on one root, so how they relate shows at a glance: from brightest to darkest, each mode is the one above with one note flattened. Answers "which mode fits these notes?" on any root. A mode's own card is its scale card (SCL), which adds what makes it a mode (SCL-5).

Screens: **Modes** (`/modes`, on the current key's root, and `/modes/[root]`; no options). The mode cards were folded into the scale cards on 2026-11-25 (owner), as a mode card was a scale card with a few more sections.

## MODE-1 The user can see every mode from one root

| ID | Requirement | Status |
|---|---|---|
| MODE-1.1 | The overview shall show the seven modes of the major scale on one root, in brightness order from Lydian (brightest) to Locrian (darkest), a row per mode: its name, its intervals, and a small fretboard of the mode on the current instrument, tuning and capo. Every row's fretboard shows the same six frets, from a fret below the root on the lowest string (or from the nut or capo), so from row to row only the changed note moves (owner, 2026-11-26). | Implemented |
| MODE-1.2 | Retired 2026-11-25: the parent scale and characteristic note are on the mode's scale card (SCL-5.1). | Retired |
| MODE-1.3 | Retired 2026-11-25: a mode's card is its scale card, which has the full neck, positions and keyboard (SCL-2, SCL-3). | Retired |
| MODE-1.4 | Retired 2026-11-25: the brightness row is on the mode's scale card (SCL-5.2). | Retired |
| MODE-1.5 | Retired 2026-11-25: the diatonic chords are on the mode's scale card (SCL-5.3). | Retired |
| MODE-1.6 | Retired 2026-11-25: the overview keeps the brightness order; a mode is pinned from its scale card, and pinned scales are listed first (SCL-1.3). | Retired |
| MODE-1.7 | Each mode shall have one card, its scale card (`/scales/[root]/dorian`): tapping an overview row opens it (owner, 2026-11-26), and the Scales list's **Modes** group links to it. | Implemented |
| MODE-1.8 | Modes of harmonic and melodic minor (Phrygian dominant, Lydian dominant, altered) shall be scales (SCL-1.1), not in the overview, and their cards without SCL-5. | Implemented |
| MODE-1.9 | Each row's fretboard shall mark the note that changed from the row above, filled in the accent colour, with a hollow dot on the fret it moved from (Ionian's 4, where Lydian's ♯4 was), and ring the mode's characteristic note as the scale card does (SCL-5.1). The row's text names both: "♮6 characteristic · ♭3, was 3" for Dorian, and "♮4 characteristic, was ♯4" for Ionian, where they're the same note (owner, 2026-11-26). Lydian, the first row, has no changed note. | Implemented |
| MODE-1.10 | The overview shall offer a root picker, the root being the path's (`/modes/Fs`). `/modes` opens on the current key's root, or C (CTX-2.8). | Implemented |
| MODE-1.11 | Retired 2026-11-26 (owner): tapping a row opens the mode's scale card, which shows it on the whole neck, so the overview has no neck of its own and no `mode` option. | Retired |

## MODE-2 The user can compare modes from one root

| ID | Requirement | Status |
|---|---|---|
| MODE-2.1 | Retired 2026-11-26 (owner): the overview compares all seven modes at once, so picking two to compare adds nothing. | Retired |
| MODE-2.2 | Retired 2026-11-25: choosing the second row is choosing the mode (MODE-2.1). | Retired |
| MODE-2.3 | A drone of the root (AUD-6) shall be one tap away on the card. Retired 2026-11-25 with the drone (AUD-6). | Retired |
