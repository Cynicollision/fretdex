# Keys and the Circle of Fifths (`KEY`)

The key card is the hub for playing a song: its signature, its relative key, its diatonic triads and sevenths, and the chords commonly borrowed into it, each linking to its chord card. The circle of fifths is how the user moves between keys.

Screens: **Keys**, which opens on the circle (`/circle`, option `key`; `/keys` redirects there), and the key card (`/keys/[key]`, such as `/keys/Bb-major`, option `sevenths`).

## KEY-1 The user can move around the circle of fifths

| ID | Requirement | Status |
|---|---|---|
| KEY-1.1 | The circle (DIAG-4.1) shall open on the current key, or C major with none. | Planned |
| KEY-1.2 | Tapping a key on the circle shall highlight it and show a summary under the circle: its signature, relative key, and diatonic triads, with a link to its key card. | Planned |
| KEY-1.3 | The user can set the tapped key as the current key from the summary (CTX-1.1). | Planned |

## KEY-2 The key card shows what's in the key

| ID | Requirement | Status |
|---|---|---|
| KEY-2.1 | The card shall show the key's signature on a staff (DIAG-4.3) and as a count ("2 flats: Bb Eb") and on a small keyboard. | Planned |
| KEY-2.2 | The card shall show the relative minor or major, the parallel key, and the neighbouring keys on the circle, each a link. | Planned |
| KEY-2.3 | The card shall list the seven diatonic chords with roman numerals and names (`I C`, `ii Dm`, … `vii° Bdim`), switching to sevenths (`Imaj7 Cmaj7`, … `viiø7 Bm7b5`) with `sevenths`, each linking to its chord card in the card's instrument and tuning. | Planned |
| KEY-2.4 | A minor key shall show the natural minor chords and, marked as such, the harmonic-minor V and V7 (`V E`, `V7 E7` in A minor). | Planned |
| KEY-2.5 | The card shall list borrowed chords, each with where it's from: for a major key, the parallel minor's `iv`, `bIII`, `bVI`, `bVII` and `ii°`, and the secondary dominants `V/ii` to `V/vi`; for a minor key, the parallel major's `IV` and `I` (picardy third). Modal interchange beyond the parallel key is later. | Planned |
| KEY-2.6 | The card shall offer **Set as current key** (CTX-1.1). | Planned |
| KEY-2.7 | The card shall link to the key's scale card (SCL) and to the progressions library in this key (PROG-1.2). | Planned |
| KEY-2.8 | Key cards shall be major and minor only. With a mode as the current key (CTX-2.6), links and buttons that would open a key card shall open the mode's scale card (SCL-5). | Planned |
