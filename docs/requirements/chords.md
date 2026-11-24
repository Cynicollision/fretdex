# Chords (`CHD`)

The chords module: a list of chords by root and quality, and a card per chord with its notes, intervals and formula, its voicings as chord boxes, and its inversions. Voicings are the one place Fretdex uses hand-curated data (vision, principle 1); computed voicings fill the gaps.

Screens: **Chords** (`/chords`) and the chord card (`/chords/[root]/[quality]`, options `v` voicing and `inv` inversion), and **Identify** (`/chords/identify`, CHD-6).

## CHD-1 The user can find a chord

| ID | Requirement | Status |
|---|---|---|
| CHD-1.1 | The list shall offer a root picker (THY-2.2) and about 32 chord qualities, grouped as **Triads** (`major m dim aug`), **Sixths and sevenths** (`6 m6 7 maj7 m7 m(maj7) m7b5 dim7 7sus4`), **Extended** (`9 maj9 m9 11 m11 13 maj13 m13`), **Suspended and added** (`sus2 sus4 add9 madd9 6/9`) and **Altered** (`7b9 7#9 7b5 7#5 7#11 7b13 7alt`). | Planned |
| CHD-1.2 | Pinned chords shall be listed first (PIN-3). | Planned |
| CHD-1.3 | With a current key, the list can be filtered to that key's diatonic triads and sevenths (KEY-2), shown with their roman numerals. | Planned |

## CHD-2 The chord card explains the chord

| ID | Requirement | Status |
|---|---|---|
| CHD-2.1 | The card shall show the chord's name with its common alternative symbols (`Am7b5`, `Aø7`), its notes spelled (THY-1.2), its intervals from the root, and its formula (`1 b3 b5 b7`). | Planned |
| CHD-2.2 | The card shall show the chord on a small keyboard (DIAG-3). | Planned |
| CHD-2.3 | Where the chord is diatonic to the current key, the card shall show its roman numeral there (`ii` in G major). | Planned |
| CHD-2.4 | The card shall link to the same root and quality as an arpeggio (ARP) and, for triads, to Triads (TRI). | Planned |

## CHD-3 The user can browse a chord's voicings (guitar)

| ID | Requirement | Status |
|---|---|---|
| CHD-3.1 | The card shall show one voicing at a time as a chord box (DIAG-2), with its family (**Open**, **Barre** with its CAGED shape, **Drop 2**, **Drop 3**, **Shell**) and its position on the neck. | Planned |
| CHD-3.2 | The user can move between voicings by swiping the box or with previous and next buttons (APP-5.2), and by a strip of small boxes under it; the chosen voicing is the URL's `v` (APP-3.1). | Planned |
| CHD-3.3 | Voicings shall be ordered open first, then by position up the neck within each family. | Planned |
| CHD-3.4 | In standard tuning, voicings shall come from the curated dataset, with computed drop 2, drop 3 and shell voicings for qualities the dataset lacks. | Planned |
| CHD-3.5 | In any other tuning, voicings shall be computed for that tuning, within the limits of CHD-3.9. Curated sets for alternate tunings are later (TODO.md). | Planned |
| CHD-3.6 | The user can hide a voicing they'd never play; hidden voicings are remembered on the device, left out of the list, and can be shown again from the card's menu. | Planned |
| CHD-3.7 | Every chord quality the list offers shall have at least one voicing in standard tuning. | Planned |
| CHD-3.8 | Curated voicings shall show finger numbers under the box where the dataset has them; computed voicings show none. | Planned |
| CHD-3.9 | A computed voicing shall span at most 4 frets (5 with an open string), use at most 4 fretted fingers plus one barre, mute only outer strings or one inner string, and have the root lowest unless an inversion is chosen; there shall be at most 8 per family. The chords task may adjust these numbers. | Planned |
| CHD-3.10 | Drop 2 voicings shall be offered on strings 1–4, 2–5 and 3–6; drop 3 with the bass on string 6 or 5; shells (1, 3, 7) with the root on string 6 or 5. | Planned |
| CHD-3.11 | The curated set shall start from an open-source chord dataset whose licence allows it (chords-db, MIT, credited in CREDITS.md), keep at most 6 voicings per chord, and record which voicings were changed by hand. | Planned |

## CHD-4 Bass shows the chord as an arpeggio shape

| ID | Requirement | Status |
|---|---|---|
| CHD-4.1 | On bass, the card shall show the chord's root-position arpeggio shape on the fretboard in place of chord boxes, at the lowest position that starts on the root on the 4th or 3rd string. | Planned |

## CHD-5 The user can see a chord's inversions

| ID | Requirement | Status |
|---|---|---|
| CHD-5.1 | The card shall offer **Root position**, **1st inversion**, **2nd inversion** and, for four-note chords, **3rd inversion**, the choice being the URL's `inv`. | Planned |
| CHD-5.2 | Choosing an inversion shall show its slash-chord name (`C/E`) and narrow the voicings to those with that chord tone in the bass. | Planned |
| CHD-5.3 | Slash chords that aren't inversions (`C/D`) shall not have cards; search opens the chord above the slash with a note naming the bass (SRCH-1.3). | Planned |

## CHD-6 The user can name a chord from its frets

**Identify** (`/chords/identify`, option `f` for the frets) works the other way round: play a shape, find out what it's called.

| ID | Requirement | Status |
|---|---|---|
| CHD-6.1 | On guitar, Identify shall offer a blank chord box where the user sets a fret, open or mute on each string; on bass, a fretboard where the user taps notes. | Planned |
| CHD-6.2 | As notes are set, it shall list the chord names they fit, simplest first, each linking to its chord card: inversions and slash chords included (`C/E`, `Am7/G`), and every name where the notes fit more than one (`Am7` and `C6/A`). Two notes shall be named as an interval (INT). | Planned |
| CHD-6.3 | It shall work in the current tuning and with a capo, naming the shape (CTX-3.2). | Planned |
| CHD-6.4 | The frets set shall be in the URL (`f=x32010`), so a shape can be pinned, and the box shall play like any chord box (AUD-2). | Planned |
