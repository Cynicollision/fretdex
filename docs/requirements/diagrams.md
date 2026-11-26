# Diagrams (`DIAG`)

The hero visuals: the fretboard and the chord box for guitar and bass, with a small piano keyboard, the circle of fifths and a key-signature staff as companions. Diagrams draw what the theory engine computed; they never work out notes themselves.

## DIAG-1 Fretboard

| ID | Requirement | Status |
|---|---|---|
| DIAG-1.1 | The fretboard shall draw the current tuning's strings, the frets in the view's range, the nut when fret 0 is in range, and inlay markers at frets 3, 5, 7, 9, 12 (double), 15, 17, 19, 21 and 24. | Implemented |
| DIAG-1.2 | Each note shown shall be a dot labeled per the label mode (CTX-1.5). The root shall be visually distinct by shape as well as color (APP-6.3). | Implemented |
| DIAG-1.3 | A card can highlight a subset (a position, a degree, the playing note) with the rest dimmed, not hidden. | Implemented |
| DIAG-1.4 | Fret numbers shall be shown below the neck at inlay frets, and at the first fret of a position when it's not 0. | Implemented |
| DIAG-1.5 | Left-handed mode shall mirror the neck so the nut is on the right, keeping labels upright. | Implemented |
| DIAG-1.6 | Tapping a dot shall play its note (AUD-4.1); tapping an empty fret shall name and play that note too. | Implemented |
| DIAG-1.7 | The root shall be a square and other notes circles; where a card highlights chord tones within a scale, chord tones shall be filled and other notes outlined. Color adds to these and never replaces them. The design task may refine the look, not these distinctions. | Implemented |
| DIAG-1.8 | Frets shall narrow gently up the neck, each 0.98 the width of the one below it rather than a real guitar's 0.944, so the neck reads as a neck while the highest frets stay readable and easy to tap. Where that would make a fret narrower than the tap target (APP-5.1), the narrowing eases toward even. Decided 2026-11-25, replacing evenly spaced frets. | Implemented |
| DIAG-1.9 | With a capo (CTX-3), the fretboard shall draw it as a bar across the strings at its fret, with the frets below it dimmed and empty. | Implemented |
| DIAG-1.10 | With the phone upright, the fretboard shall show at most six frets across the width: the chosen position (with previous and next along it only where it's wider than that), or a stretch of the neck when the card has none, with previous and next to move along it. A strip of the whole fret range below it shall mark that stretch and the roots, and tapping the strip shall move to that part of the neck. In landscape it shows the whole fret range (APP-5.4). | Implemented |

## DIAG-2 Chord box

| ID | Requirement | Status |
|---|---|---|
| DIAG-2.1 | A chord box shall show a voicing vertically: strings left to right lowest to highest (mirrored when left-handed), at least 4 frets, with `x` above muted strings and `o` above open ones. | Planned |
| DIAG-2.2 | A voicing above the 1st fret shall show its starting fret number beside the box; one starting at the 1st fret shall show the nut. | Planned |
| DIAG-2.3 | Barres shall be drawn as one bar across the strings they cover. | Planned |
| DIAG-2.4 | Dots shall be labeled per the label mode, with finger numbers under the box when the voicing has them (CHD-3.8). | Planned |
| DIAG-2.5 | Tapping the box shall play the voicing (AUD-2). | Planned |
| DIAG-2.6 | With a capo, a chord box shall draw the capo as its nut, with "Capo 2" beside it. | Planned |

## DIAG-3 Keyboard

| ID | Requirement | Status |
|---|---|---|
| DIAG-3.1 | A small keyboard of at least two octaves shall mark the notes shown, the root distinct, and enlarge to full width when tapped. | Partial |
| DIAG-3.2 | Tapping a key on the enlarged keyboard shall play it (AUD-4.1). | Implemented |

## DIAG-4 Circle of fifths and staff

| ID | Requirement | Status |
|---|---|---|
| DIAG-4.1 | The circle shall show the 12 major keys outside and their relative minors inside, with the current key highlighted and its neighbours (IV and V) marked. | Planned |
| DIAG-4.2 | Tapping a key on the circle shall select it (KEY-1). | Planned |
| DIAG-4.3 | The staff shall show a key's signature in treble clef (and bass clef on bass), in standard order of sharps or flats. | Planned |

## DIAG-5 Mini renders

| ID | Requirement | Status |
|---|---|---|
| DIAG-5.1 | Every diagram shall have a compact form for pin tiles (PIN-2.2) that stays legible at about 150 px wide: dots without labels, the root marked. | Partial |

## Known gaps

- **DIAG-3.1:** the keyboard marks the notes, enlarges when tapped and plays its keys, on the scale cards, the modes' included.
- **DIAG-5.1:** the fretboard has its compact form (`FretboardMini.svelte`); the chord box's comes in M02, and the pin tiles that show them in M01 T12.
