# Progressions (`PROG`)

A library of common progressions written in roman numerals, shown in any key with a voicing for each chord, and played on a loop at a set tempo to jam over. Saving your own is later (TODO.md); a pin already saves a library progression in a key at a tempo.

Screens: **Progressions** (`/progressions`) and the progression card (`/progressions/[slug]`, options `key` and `bpm`).

## PROG-1 The user can find a progression

| ID | Requirement | Status |
|---|---|---|
| PROG-1.1 | The list shall show each progression's name and numerals ("Pop: I–V–vi–IV"), grouped by style (PROG-1.3), with pinned ones first. | Planned |
| PROG-1.2 | With a current key, the list shall also show each progression's chords in that key ("G D Em C"). | Planned |
| PROG-1.3 | The library shall start with about 20 progressions: **Pop** (I–V–vi–IV, vi–IV–I–V, I–vi–IV–V), **Jazz** (ii–V–I major and minor, I–vi–ii–V, iii–vi–ii–V), **Blues** (12-bar, quick-change, minor blues), **Rock** (I–bVII–IV, I–IV–V, i–bVII–bVI–bVII), **Minor** (Andalusian i–bVII–bVI–V, i–iv–v, i–bVI–bIII–bVII) and **Other** (canon, I–IV–I–V, circle progression vi–ii–V–I). | Planned |
| PROG-1.4 | Blues progressions shall use dominant sevenths as written (`I7 IV7 V7`); the others use triads unless their numerals say otherwise. | Planned |

## PROG-2 The card shows the progression in a key

| ID | Requirement | Status |
|---|---|---|
| PROG-2.1 | The card shall show the progression in the URL's `key`, or the current key, or C major (A minor for minor-key progressions), with a key picker. | Planned |
| PROG-2.2 | Each chord shall show its numeral, its name in the key, and, on guitar, a chord box from a strip the user can scroll; tapping a chord opens its chord card. | Planned |
| PROG-2.3 | On guitar, the strip shall pick each chord's voicing by voice leading: the one with least movement from the chord before, within one area of the neck. The user can change any chord's voicing on the card; that choice isn't kept in the URL. | Planned |
| PROG-2.4 | On bass, each chord shall show its root on the fretboard, as a root line through the progression. | Planned |
| PROG-2.5 | The card shall show how many bars each chord lasts where it isn't one (12-bar blues). | Planned |
| PROG-2.6 | The card can show the progression's chords on a small keyboard, one at a time as it plays. | Planned |

## PROG-3 The user can play along

| ID | Requirement | Status |
|---|---|---|
| PROG-3.1 | **Play** shall loop the progression at the card's tempo (`bpm`, default 90, from 40 to 220), one bar of 4/4 per chord unless PROG-2.5 says otherwise, highlighting the chord that's playing (AUD-5). | Planned |
| PROG-3.2 | The user can change the tempo while it plays. | Planned |
| PROG-3.3 | Playback shall be in 4/4, each chord strummed on every beat, with the optional click and count-in of AUD-1.5. 3/4 and rhythm patterns are later (TODO.md). | Planned |
