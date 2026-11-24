# Global Context and Settings (`CTX`)

One context drives every view, so the whole app re-centers on the song being played: the current key, the instrument and tuning, and how diagrams are drawn. Settings live in the context bar (APP-2) and on **Settings** (`/settings`), and are stored on the device (PIN-6). A capo (CTX-3) is part of the context too.

## CTX-1 The user sets the context once

| ID | Setting | Options | Default | Status |
|---|---|---|---|---|
| CTX-1.1 | Current key | None, or any of 12 roots in any of the seven modes of the major scale (CTX-2.6) | None | Planned |
| CTX-1.2 | Instrument | 6-string guitar, 4-string bass | Guitar | Planned |
| CTX-1.3 | Tuning | Guitar: Standard, Drop D, DADGAD, Open G, Open D, Half-step down. Bass: Standard (E A D G), Drop D, Half-step down. Custom (THY-3.3), up to 10 saved by name (CTX-2.7) | Standard | Planned |
| CTX-1.4 | Handedness | Right, Left (mirrors fretboards and chord boxes, DIAG-1.5) | Right | Planned |
| CTX-1.5 | Labels | Note names, Intervals (1, b3, 5), Scale degrees, None | Intervals | Planned |
| CTX-1.6 | Accidentals | Auto by key, Prefer sharps, Prefer flats (THY-2) | Auto | Planned |
| CTX-1.7 | Fret range | First and last fret of the full-neck view, from 0 to 24 | 0–15 | Planned |
| CTX-1.8 | Theme | Dark, Light, High contrast | Dark | Planned |
| CTX-1.9 | Capo | None, or frets 1 to 11 (CTX-3) | None | Planned |
| CTX-1.10 | Keep screen awake | On, Off (APP-5.5) | On | Planned |
| CTX-1.11 | Tempo | 30 to 250 bpm, for scale runs and the metronome (AUD-1.6) | 100 | Planned |

## CTX-2 Every view follows the context

| ID | Requirement | Status |
|---|---|---|
| CTX-2.1 | Switching instrument shall switch the tuning list with it, keeping the tuning's name where both instruments have it (Drop D, Half-step down) and otherwise falling back to Standard. | Planned |
| CTX-2.2 | On bass, chord cards shall show root-position arpeggio shapes instead of chord boxes (CHD-4), and Triads shall say it's a guitar module (TRI-1.4). | Planned |
| CTX-2.3 | With a current key set, module lists shall offer to filter to that key (CHD-1.3, SCL-1.2, PROG-1.2), and key-relative views (progressions, keys, the circle) shall open in it. | Planned |
| CTX-2.4 | Label mode, handedness, accidentals and fret range shall apply to every diagram, unless the card's URL sets them (`labels`). | Planned |
| CTX-2.5 | Settings shall be remembered on the device across launches. | Planned |
| CTX-2.6 | With a mode as the current key (D Dorian), key-relative views shall use that mode's diatonic chords and numerals (MODE-1.5), and where a key card would open, the mode card shall (KEY-2.8). The key picker shall show major and minor first, with the other modes one tap away. | Planned |
| CTX-2.7 | The user can save up to 10 custom tunings per instrument by name; they're listed with the built-in tunings. | Planned |
| CTX-2.8 | A card's URL shall always decide what the card shows: the current key never re-centers an open card, so pins and links show the same thing whatever the key. The current key decides only which items lists show or put first, the root a list opens a card on, and the key that progressions, keys and the circle open in (CTX-2.3). | Planned |
| CTX-2.9 | When a card's root differs from the current key's, the card shall offer a one-tap **Show in E minor** that opens the same card on the key's root. | Planned |

## CTX-3 The user can play with a capo

With a capo, the app treats it as the nut: chords are named and drawn as the shapes the hands play, with what they sound beside them.

| ID | Requirement | Status |
|---|---|---|
| CTX-3.1 | With a capo set, fretboards and chord boxes shall draw it (DIAG-1.9, DIAG-2.6), and the context bar shall show it ("Capo 2"). | Planned |
| CTX-3.2 | Chords shall be named by the shape played, with what it sounds beside it: "G · sounds A" with the capo at 2. A chord card's URL names the shape. | Planned |
| CTX-3.3 | The current key is the key that sounds. With a capo, key-relative views (diatonic chords, progressions, a list filtered to the key) shall list the shapes that sound it: "Key of A, capo 2: G C D". | Planned |
| CTX-3.4 | Scales, modes, arpeggios, intervals and notes shall show the notes that sound, on the frets above the capo. | Planned |
| CTX-3.5 | Audio shall play the pitch that sounds (THY-4.1). | Planned |
