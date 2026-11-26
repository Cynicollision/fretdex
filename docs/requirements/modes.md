# Modes (`MODE`)

Modes on their own terms: each mode's parent scale, its characteristic note and its place in the brightness order, and a comparison of modes from one root so the differences show on the neck.

Screens: **Modes** (`/modes`) and the mode card (`/modes/[root]/[mode]`, option `compare`).

## MODE-1 The user can understand a mode

| ID | Requirement | Status |
|---|---|---|
| MODE-1.1 | The list shall offer a root picker and the seven modes of the major scale, in brightness order from Lydian (brightest) to Locrian (darkest). | Planned |
| MODE-1.2 | The card shall show the mode's notes and intervals, its parent scale and key ("D Dorian is the 2nd mode of C major"), and its characteristic note (Dorian's natural 6), highlighted on the neck. | Planned |
| MODE-1.3 | The card shall show the mode on the full neck and in positions, as the scale card does (SCL-2, SCL-3), and on a small keyboard. | Planned |
| MODE-1.4 | The card shall show the mode's place in the brightness order as a row of the seven modes with this one marked, each a link to that mode on the same root. | Planned |
| MODE-1.5 | The card shall list the mode's diatonic triads and sevenths with roman numerals relative to the mode (`i ii bIII IV v vi° bVII` for Dorian), linking to chord cards. | Planned |
| MODE-1.6 | Pinned modes shall be listed first (PIN-3). | Planned |
| MODE-1.7 | Each mode shall have one card, here: the Scales list's **Modes** group links to it, and `/scales/[root]/dorian` and the like redirect to it. | Planned |
| MODE-1.8 | Modes of harmonic and melodic minor (Phrygian dominant, Lydian dominant, altered) shall be scales (SCL-1.1), without the brightness and comparison views. | Planned |

## MODE-2 The user can compare modes from one root

| ID | Requirement | Status |
|---|---|---|
| MODE-2.1 | The user can turn on **Compare** (`compare`), which shows the mode against another on the same root (default: the nearest brighter or darker major or minor, such as Dorian against Aeolian), with the notes that differ marked on the neck and in the interval list. | Planned |
| MODE-2.2 | The user can choose which mode to compare with. | Planned |
| MODE-2.3 | A drone of the root (AUD-6) shall be one tap away on the card. Retired 2026-11-25 with the drone (AUD-6). | Retired |
