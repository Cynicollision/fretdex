# Scales and Positions (`SCL`)

The scales module: any scale on any root, the modes included, on the full neck and in positions, with degrees highlighted. Positions are what make it a guitar reference rather than a theory chart: five CAGED shapes and seven 3-notes-per-string patterns on guitar, one- and two-octave boxes on bass.

Screens: **Scales** (`/scales`) and the scale card (`/scales/[root]/[scale]`, options `pos` 1–5 CAGED or `nps` 1–7, `deg` for the highlighted degrees, `labels`); the list takes `root` (`/scales?root=Eb`).

## SCL-1 The user can find a scale

| ID | Requirement | Status |
|---|---|---|
| SCL-1.1 | The list shall offer a root picker and about 20 scales, grouped as **Major and minor** (major, natural minor, harmonic minor, melodic minor ascending), **Pentatonic and blues** (major and minor pentatonic, major and minor blues), **Modes** (the seven modes of the major scale, brightest first, SCL-5, with a link to the Modes overview, MODE-1) and **Other** (Phrygian dominant, Lydian dominant, altered, whole tone, half-whole and whole-half diminished). | Implemented |
| SCL-1.2 | With a current key, the list shall open each scale on the key's root, with the key's own scale first. | Implemented |
| SCL-1.3 | Pinned scales shall be listed first (PIN-3). | Planned |

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
| SCL-3.1 | For the major scale and its modes in standard tuning, the card shall offer five CAGED positions, numbered in order up the neck from the lowest that fits below fret 12, each highlighting its notes on the neck with the rest dimmed (DIAG-1.3), the choice being the URL's `pos`. | Planned |
| SCL-3.2 | For seven-note scales, the card shall offer seven 3-notes-per-string patterns, one starting on each degree on the lowest string, the choice being `nps`. | Planned |
| SCL-3.3 | For pentatonic and blues scales in standard tuning, the card shall offer the five pentatonic boxes, numbered up the neck as in SCL-3.1 and named by their CAGED shape, with the blue note added in the blues scales. | Planned |
| SCL-3.4 | Each position shall name its starting fret and its shape ("Position 2 · E shape · frets 4–8"). | Planned |
| SCL-3.5 | The user can step through positions with previous and next, and each position plays on its own (AUD-3). | Planned |
| SCL-3.6 | In tunings other than standard, CAGED positions and pentatonic boxes shall be hidden, leaving the 3-notes-per-string patterns and the full neck. A capo isn't another tuning: positions move up with it. | Planned |
| SCL-3.7 | Scales that are neither seven-note nor pentatonic (whole tone, the diminished scales) shall show the full neck only. | Planned |

## SCL-4 Bass shows boxes

| ID | Requirement | Status |
|---|---|---|
| SCL-4.1 | On bass, the card shall offer a one-octave box and a two-octave box from the root on each of the lowest two strings. | Planned |

## SCL-5 A mode's card shows what makes it a mode

For the seven modes of the major scale (MODE-1.7), which have no card of their own (owner, 2026-11-25).

| ID | Requirement | Status |
|---|---|---|
| SCL-5.1 | The card shall show the mode's parent scale and key ("D Dorian is the 2nd mode of C major") and its characteristic note (Dorian's natural 6), marked on the neck by a mark of its own with no other note dimmed (owner, 2026-11-25). Ionian's is its natural 4, the note that sets it apart from Lydian (owner, 2026-11-25). | Implemented |
| SCL-5.2 | The card shall show the mode's place in the brightness order as a row of the seven modes with this one marked, each a link to that mode's card on the same root, and a link to the Modes overview on this root (MODE-1). | Partial |
| SCL-5.3 | The card shall list the mode's diatonic triads and sevenths with roman numerals relative to the mode (`i ii bIII IV v vi° bVII` for Dorian), linking to chord cards. | Partial |

## Known gaps

- **SCL-1.3:** pinned scales aren't listed first until pins exist (M01 T12).
- **SCL-3 and SCL-4:** positions come in M01 T9b, and scale runs in T9c.
- **SCL-5.2:** the link to the Modes overview opens `/modes`, on the current key's root, until the overview takes a root (`/modes/[root]`, M01 T10).
- **SCL-5.3:** the chords are listed by name, without links, until chord cards exist (M02).
