# Scales and Positions (`SCL`)

The scales module: any scale on any root, the modes included, on the full neck and in positions, with degrees highlighted. Positions are what make it a guitar reference rather than a theory chart: five CAGED shapes and seven 3-notes-per-string patterns on guitar, one- and two-octave boxes on bass.

Screens: **Scales** (`/scales`) and the scale card (`/scales/[root]/[scale]`, options `pos` 1–5 for a CAGED position or pentatonic box, `nps` 1–7, and on bass `oct1` 1–2 for a one-octave box or `oct2` 1–2 for a two-octave one, `deg` for the highlighted degrees, `labels`); the list takes `root` (`/scales?root=Eb`).

## SCL-1 The user can find a scale

| ID | Requirement | Status |
|---|---|---|
| SCL-1.1 | The list shall offer a root picker and about 20 scales, grouped as **Major and minor** (major, natural minor, harmonic minor, melodic minor ascending), **Pentatonic and blues** (major and minor pentatonic, major and minor blues), **Modes** (the seven modes of the major scale, brightest first, SCL-5, with a link to the Modes overview, MODE-1) and **Other** (Phrygian dominant, Lydian dominant, altered, whole tone, half-whole and whole-half diminished). | Implemented |
| SCL-1.2 | With a current key, the list shall open each scale on the key's root, with the key's own scale first. | Implemented |
| SCL-1.3 | Pinned scales shall be listed first (PIN-3). | Implemented |

## SCL-2 The card shows the scale on the whole neck

| ID | Requirement | Status |
|---|---|---|
| SCL-2.1 | The card shall show the scale's notes spelled (THY-1.1), its intervals and its formula in steps (`W W H W W W H`). | Implemented |
| SCL-2.2 | The card shall show every note of the scale across the fret range (CTX-1.7) on the current tuning (DIAG-1). | Implemented |
| SCL-2.3 | The user can highlight one or more degrees (for example 1, 3 and 5, or the characteristic note) with the rest dimmed, kept in the URL as their numbers in order (`deg=135`). | Implemented |
| SCL-2.4 | The card shall show the scale on a small keyboard (DIAG-3). | Implemented |
| SCL-2.5 | The user can switch label mode on the card (`labels`), overriding the global one for that card only. | Implemented |
| SCL-2.6 | Where the scale needs a double sharp or flat however its root is spelled (C# altered has D𝄪 and F𝄪, Db altered E𝄫 and B𝄫; E altered has F𝄪), the card shall say why in a line: the notes are named by their intervals from the root (`1 b2 #2 3 #4 b6 b7`), and on this root that takes doubles either way (THY-2.5). | Implemented |

## SCL-3 The user can learn the scale in positions (guitar)

| ID | Requirement | Status |
|---|---|---|
| SCL-3.1 | For the major scale, its modes and natural minor in standard tuning, the card shall offer five CAGED positions, numbered in order up the neck from the lowest that fits, each highlighting its notes on the neck with the rest dimmed (DIAG-1.3), the choice being the URL's `pos`. A mode and natural minor take their parent major's five positions, the same fingerings with only the root moved, named by the parent's shapes ("G shape of C major"), as CAGED traditionally teaches modes (owner, 2026-11-25). Each position is five frets, each note of the scale in it played once, on the higher string where it falls on two. | Implemented |
| SCL-3.2 | For seven-note scales, the card shall offer seven 3-notes-per-string patterns, one starting on each degree on the lowest string, numbered by that degree and stepped through up the neck, the choice being `nps`. | Implemented |
| SCL-3.3 | For pentatonic and blues scales in standard tuning, the card shall offer the five pentatonic boxes, two notes on each string, with the blue note added in the blues scales wherever it falls within the box's frets. They're numbered as traditionally taught, Box 1 having the minor pentatonic's root on the lowest string and the rest following up the neck, the major pentatonic sharing its relative minor's numbers, and named by their relative major's CAGED shape (owner, 2026-11-25). Each is placed as low as it fits and they're stepped through up the neck; the choice is `pos`. | Implemented |
| SCL-3.4 | Each position shall name its shape ("Position 2 · E shape"; for a mode, "Position 3 · G shape of C major"; a 3-notes-per-string pattern, "Pattern 3 · from the ♭3"). Its frets are read off the neck's numbers, and named in the fretboard's text alternative (owner, 2026-11-25). | Implemented |
| SCL-3.5 | The user can step through positions with previous and next, and each position plays on its own (AUD-3). The choice is above the neck: **Full neck**, then the kinds the scale offers (**CAGED** or **Boxes**, and **3 per string**; on bass **1 octave** and **2 octaves**, SCL-4.1), then Previous, the position's name and Next (owner, 2026-11-25). Highlighted degrees (SCL-2.3) work within the position. | Implemented |
| SCL-3.6 | In tunings other than standard, CAGED positions and pentatonic boxes shall be hidden, leaving the 3-notes-per-string patterns and the full neck. A capo isn't another tuning: positions move up with it, so only those at or above the capo are offered. | Implemented |
| SCL-3.7 | Scales that are neither seven-note nor pentatonic (whole tone, the diminished scales) shall show the full neck only, on bass too. | Implemented |

## SCL-4 Bass shows boxes

| ID | Requirement | Status |
|---|---|---|
| SCL-4.1 | On bass, the card shall offer a one-octave box and a two-octave box from the root on each of the lowest two strings, as two kinds on the Positions row, **1 octave** (`oct1`) and **2 octaves** (`oct2`). Each kind's boxes are numbered up the neck from the lowest, as CAGED positions are, so Next always goes up the neck, and each is named by its root's string ("Box 1 · from the A string") (owner, 2026-11-27). A one-octave box climbs from the root one finger a fret on at most three strings (a sixth fret where a string is a 5th above the one below, as Drop D's low D is); a two-octave box is that box, then a shift to the octave on the next string and the same box from there, so it needs three strings above its root's, and a four-string bass has one two-octave box, from its lowest string (owner, 2026-11-25). | Implemented |
| SCL-4.2 | Bass shall offer no CAGED positions or 3-notes-per-string patterns, which are guitar's (owner, 2026-11-25). | Implemented |

## SCL-5 A mode's card shows what makes it a mode

For the seven modes of the major scale (MODE-1.7), which have no card of their own (owner, 2026-11-25).

| ID | Requirement | Status |
|---|---|---|
| SCL-5.1 | The card shall show the mode's parent scale and key ("D Dorian is the 2nd mode of C major") and its characteristic note (Dorian's natural 6), marked on the neck by a mark of its own with no other note dimmed (owner, 2026-11-25). Ionian's is its natural 4, the note that sets it apart from Lydian (owner, 2026-11-25). | Implemented |
| SCL-5.2 | The card shall show the mode's place in the brightness order as a row of the seven modes with this one marked, each a link to that mode's card on the same root, and a link to the Modes overview of its parent major (MODE-1.10). | Implemented |
| SCL-5.3 | The card shall list the mode's diatonic triads and sevenths with roman numerals relative to the mode (`i ii bIII IV v vi° bVII` for Dorian), linking to chord cards. | Partial |

## Known gaps

- **SCL-5.3:** the chords are listed by name, without links, until chord cards exist (M02).
