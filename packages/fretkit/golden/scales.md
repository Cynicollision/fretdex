# Golden table: every scale on every root

Every scale in the Scales list (SCL-1.1) on each of the root picker's 12 buttons (THY-2.2): the root **Auto** opens and its notes, and the button's other spelling, marked *not offered* where its key would need a double sharp or flat and Auto's wouldn't, or where both would (THY-2.5). A root marked *doubles either way* needs a double sharp or flat however it's spelled, so its card says why (SCL-2.6). Signatures count a double sharp or flat as two. Auto takes the spelling with fewer accidentals in its signature, and at a tie, sharps for a scale read in a key with a major 3rd and flats for one with a minor 3rd (THY-2.1).

Written by `src/golden.spec.ts` from `fretkit`'s answers, which fail the test if they change. To change one on purpose, run `npx vitest run -u` in `packages/fretkit` and check the diff by hand.

## Major

Intervals: 1 2 3 4 5 6 7. Signature: its own notes.

| Root | Auto | Notes | Signature | Other | Notes | Signature |
|---|---|---|---|---|---|---|
| C | C | C D E F G A B | none |  |  |  |
| C#/Db | Db | Db Eb F Gb Ab Bb C | 5 flats | C# | C# D# E# F# G# A# B# | 7 sharps |
| D | D | D E F# G A B C# | 2 sharps |  |  |  |
| Eb | Eb | Eb F G Ab Bb C D | 3 flats | D# (not offered) | D# E# F## G# A# B# C## | 9 sharps |
| E | E | E F# G# A B C# D# | 4 sharps |  |  |  |
| F | F | F G A Bb C D E | 1 flat |  |  |  |
| F#/Gb | F# | F# G# A# B C# D# E# | 6 sharps | Gb | Gb Ab Bb Cb Db Eb F | 6 flats |
| G | G | G A B C D E F# | 1 sharp |  |  |  |
| Ab | Ab | Ab Bb C Db Eb F G | 4 flats | G# (not offered) | G# A# B# C# D# E# F## | 8 sharps |
| A | A | A B C# D E F# G# | 3 sharps |  |  |  |
| Bb | Bb | Bb C D Eb F G A | 2 flats | A# (not offered) | A# B# C## D# E# F## G## | 10 sharps |
| B | B | B C# D# E F# G# A# | 5 sharps |  |  |  |

## Natural minor

Intervals: 1 2 b3 4 5 b6 b7. Signature: its own notes.

| Root | Auto | Notes | Signature | Other | Notes | Signature |
|---|---|---|---|---|---|---|
| C | C | C D Eb F G Ab Bb | 3 flats |  |  |  |
| C#/Db | C# | C# D# E F# G# A B | 4 sharps | Db (not offered) | Db Eb Fb Gb Ab Bbb Cb | 8 flats |
| D | D | D E F G A Bb C | 1 flat |  |  |  |
| Eb | Eb | Eb F Gb Ab Bb Cb Db | 6 flats | D# | D# E# F# G# A# B C# | 6 sharps |
| E | E | E F# G A B C D | 1 sharp |  |  |  |
| F | F | F G Ab Bb C Db Eb | 4 flats |  |  |  |
| F#/Gb | F# | F# G# A B C# D E | 3 sharps | Gb (not offered) | Gb Ab Bbb Cb Db Ebb Fb | 9 flats |
| G | G | G A Bb C D Eb F | 2 flats |  |  |  |
| Ab | G# | G# A# B C# D# E F# | 5 sharps | Ab | Ab Bb Cb Db Eb Fb Gb | 7 flats |
| A | A | A B C D E F G | none |  |  |  |
| Bb | Bb | Bb C Db Eb F Gb Ab | 5 flats | A# | A# B# C# D# E# F# G# | 7 sharps |
| B | B | B C# D E F# G A | 2 sharps |  |  |  |

## Harmonic minor

Intervals: 1 2 b3 4 5 b6 7. Signature: read in the natural minor key on its root.

| Root | Auto | Notes | Signature | Other | Notes | Signature |
|---|---|---|---|---|---|---|
| C | C | C D Eb F G Ab B | 3 flats |  |  |  |
| C#/Db | C# | C# D# E F# G# A B# | 4 sharps | Db (not offered) | Db Eb Fb Gb Ab Bbb C | 8 flats |
| D | D | D E F G A Bb C# | 1 flat |  |  |  |
| Eb | Eb | Eb F Gb Ab Bb Cb D | 6 flats | D# | D# E# F# G# A# B C## | 6 sharps |
| E | E | E F# G A B C D# | 1 sharp |  |  |  |
| F | F | F G Ab Bb C Db E | 4 flats |  |  |  |
| F#/Gb | F# | F# G# A B C# D E# | 3 sharps | Gb (not offered) | Gb Ab Bbb Cb Db Ebb F | 9 flats |
| G | G | G A Bb C D Eb F# | 2 flats |  |  |  |
| Ab | G# | G# A# B C# D# E F## | 5 sharps | Ab | Ab Bb Cb Db Eb Fb G | 7 flats |
| A | A | A B C D E F G# | none |  |  |  |
| Bb | Bb | Bb C Db Eb F Gb A | 5 flats | A# | A# B# C# D# E# F# G## | 7 sharps |
| B | B | B C# D E F# G A# | 2 sharps |  |  |  |

## Melodic minor

Intervals: 1 2 b3 4 5 6 7. Signature: read in the natural minor key on its root.

| Root | Auto | Notes | Signature | Other | Notes | Signature |
|---|---|---|---|---|---|---|
| C | C | C D Eb F G A B | 3 flats |  |  |  |
| C#/Db | C# | C# D# E F# G# A# B# | 4 sharps | Db (not offered) | Db Eb Fb Gb Ab Bb C | 8 flats |
| D | D | D E F G A B C# | 1 flat |  |  |  |
| Eb | Eb | Eb F Gb Ab Bb C D | 6 flats | D# | D# E# F# G# A# B# C## | 6 sharps |
| E | E | E F# G A B C# D# | 1 sharp |  |  |  |
| F | F | F G Ab Bb C D E | 4 flats |  |  |  |
| F#/Gb | F# | F# G# A B C# D# E# | 3 sharps | Gb (not offered) | Gb Ab Bbb Cb Db Eb F | 9 flats |
| G | G | G A Bb C D E F# | 2 flats |  |  |  |
| Ab | G# | G# A# B C# D# E# F## | 5 sharps | Ab | Ab Bb Cb Db Eb F G | 7 flats |
| A | A | A B C D E F# G# | none |  |  |  |
| Bb | Bb | Bb C Db Eb F G A | 5 flats | A# | A# B# C# D# E# F## G## | 7 sharps |
| B | B | B C# D E F# G# A# | 2 sharps |  |  |  |

## Major pentatonic

Intervals: 1 2 3 5 6. Signature: read in the major key on its root.

| Root | Auto | Notes | Signature | Other | Notes | Signature |
|---|---|---|---|---|---|---|
| C | C | C D E G A | none |  |  |  |
| C#/Db | Db | Db Eb F Ab Bb | 5 flats | C# | C# D# E# G# A# | 7 sharps |
| D | D | D E F# A B | 2 sharps |  |  |  |
| Eb | Eb | Eb F G Bb C | 3 flats | D# (not offered) | D# E# F## A# B# | 9 sharps |
| E | E | E F# G# B C# | 4 sharps |  |  |  |
| F | F | F G A C D | 1 flat |  |  |  |
| F#/Gb | F# | F# G# A# C# D# | 6 sharps | Gb | Gb Ab Bb Db Eb | 6 flats |
| G | G | G A B D E | 1 sharp |  |  |  |
| Ab | Ab | Ab Bb C Eb F | 4 flats | G# (not offered) | G# A# B# D# E# | 8 sharps |
| A | A | A B C# E F# | 3 sharps |  |  |  |
| Bb | Bb | Bb C D F G | 2 flats | A# (not offered) | A# B# C## E# F## | 10 sharps |
| B | B | B C# D# F# G# | 5 sharps |  |  |  |

## Minor pentatonic

Intervals: 1 b3 4 5 b7. Signature: read in the natural minor key on its root.

| Root | Auto | Notes | Signature | Other | Notes | Signature |
|---|---|---|---|---|---|---|
| C | C | C Eb F G Bb | 3 flats |  |  |  |
| C#/Db | C# | C# E F# G# B | 4 sharps | Db (not offered) | Db Fb Gb Ab Cb | 8 flats |
| D | D | D F G A C | 1 flat |  |  |  |
| Eb | Eb | Eb Gb Ab Bb Db | 6 flats | D# | D# F# G# A# C# | 6 sharps |
| E | E | E G A B D | 1 sharp |  |  |  |
| F | F | F Ab Bb C Eb | 4 flats |  |  |  |
| F#/Gb | F# | F# A B C# E | 3 sharps | Gb (not offered) | Gb Bbb Cb Db Fb | 9 flats |
| G | G | G Bb C D F | 2 flats |  |  |  |
| Ab | G# | G# B C# D# F# | 5 sharps | Ab | Ab Cb Db Eb Gb | 7 flats |
| A | A | A C D E G | none |  |  |  |
| Bb | Bb | Bb Db Eb F Ab | 5 flats | A# | A# C# D# E# G# | 7 sharps |
| B | B | B D E F# A | 2 sharps |  |  |  |

## Major blues

Intervals: 1 2 b3 3 5 6. Signature: read in the major key on its root.

| Root | Auto | Notes | Signature | Other | Notes | Signature |
|---|---|---|---|---|---|---|
| C | C | C D Eb E G A | none |  |  |  |
| C#/Db | Db | Db Eb Fb F Ab Bb | 5 flats | C# | C# D# E E# G# A# | 7 sharps |
| D | D | D E F F# A B | 2 sharps |  |  |  |
| Eb | Eb | Eb F Gb G Bb C | 3 flats | D# (not offered) | D# E# F# F## A# B# | 9 sharps |
| E | E | E F# G G# B C# | 4 sharps |  |  |  |
| F | F | F G Ab A C D | 1 flat |  |  |  |
| F#/Gb | F# | F# G# A A# C# D# | 6 sharps | Gb | Gb Ab Bbb Bb Db Eb | 6 flats |
| G | G | G A Bb B D E | 1 sharp |  |  |  |
| Ab | Ab | Ab Bb Cb C Eb F | 4 flats | G# (not offered) | G# A# B B# D# E# | 8 sharps |
| A | A | A B C C# E F# | 3 sharps |  |  |  |
| Bb | Bb | Bb C Db D F G | 2 flats | A# (not offered) | A# B# C# C## E# F## | 10 sharps |
| B | B | B C# D D# F# G# | 5 sharps |  |  |  |

## Minor blues

Intervals: 1 b3 4 b5 5 b7. Signature: read in the natural minor key on its root.

| Root | Auto | Notes | Signature | Other | Notes | Signature |
|---|---|---|---|---|---|---|
| C | C | C Eb F Gb G Bb | 3 flats |  |  |  |
| C#/Db | C# | C# E F# G G# B | 4 sharps | Db (not offered) | Db Fb Gb Abb Ab Cb | 8 flats |
| D | D | D F G Ab A C | 1 flat |  |  |  |
| Eb | Eb | Eb Gb Ab Bbb Bb Db | 6 flats | D# | D# F# G# A A# C# | 6 sharps |
| E | E | E G A Bb B D | 1 sharp |  |  |  |
| F | F | F Ab Bb Cb C Eb | 4 flats |  |  |  |
| F#/Gb | F# | F# A B C C# E | 3 sharps | Gb (not offered) | Gb Bbb Cb Dbb Db Fb | 9 flats |
| G | G | G Bb C Db D F | 2 flats |  |  |  |
| Ab | G# | G# B C# D D# F# | 5 sharps | Ab | Ab Cb Db Ebb Eb Gb | 7 flats |
| A | A | A C D Eb E G | none |  |  |  |
| Bb | Bb | Bb Db Eb Fb F Ab | 5 flats | A# | A# C# D# E E# G# | 7 sharps |
| B | B | B D E F F# A | 2 sharps |  |  |  |

## Lydian

Intervals: 1 2 3 #4 5 6 7. Signature: its own notes.

| Root | Auto | Notes | Signature | Other | Notes | Signature |
|---|---|---|---|---|---|---|
| C | C | C D E F# G A B | 1 sharp |  |  |  |
| C#/Db | Db | Db Eb F G Ab Bb C | 4 flats | C# (not offered) | C# D# E# F## G# A# B# | 8 sharps |
| D | D | D E F# G# A B C# | 3 sharps |  |  |  |
| Eb | Eb | Eb F G A Bb C D | 2 flats | D# (not offered) | D# E# F## G## A# B# C## | 10 sharps |
| E | E | E F# G# A# B C# D# | 5 sharps |  |  |  |
| F | F | F G A B C D E | none |  |  |  |
| F#/Gb | Gb | Gb Ab Bb C Db Eb F | 5 flats | F# | F# G# A# B# C# D# E# | 7 sharps |
| G | G | G A B C# D E F# | 2 sharps |  |  |  |
| Ab | Ab | Ab Bb C D Eb F G | 3 flats | G# (not offered) | G# A# B# C## D# E# F## | 9 sharps |
| A | A | A B C# D# E F# G# | 4 sharps |  |  |  |
| Bb | Bb | Bb C D E F G A | 1 flat | A# (not offered) | A# B# C## D## E# F## G## | 11 sharps |
| B | B | B C# D# E# F# G# A# | 6 sharps |  |  |  |

## Ionian

Intervals: 1 2 3 4 5 6 7. Signature: its own notes.

| Root | Auto | Notes | Signature | Other | Notes | Signature |
|---|---|---|---|---|---|---|
| C | C | C D E F G A B | none |  |  |  |
| C#/Db | Db | Db Eb F Gb Ab Bb C | 5 flats | C# | C# D# E# F# G# A# B# | 7 sharps |
| D | D | D E F# G A B C# | 2 sharps |  |  |  |
| Eb | Eb | Eb F G Ab Bb C D | 3 flats | D# (not offered) | D# E# F## G# A# B# C## | 9 sharps |
| E | E | E F# G# A B C# D# | 4 sharps |  |  |  |
| F | F | F G A Bb C D E | 1 flat |  |  |  |
| F#/Gb | F# | F# G# A# B C# D# E# | 6 sharps | Gb | Gb Ab Bb Cb Db Eb F | 6 flats |
| G | G | G A B C D E F# | 1 sharp |  |  |  |
| Ab | Ab | Ab Bb C Db Eb F G | 4 flats | G# (not offered) | G# A# B# C# D# E# F## | 8 sharps |
| A | A | A B C# D E F# G# | 3 sharps |  |  |  |
| Bb | Bb | Bb C D Eb F G A | 2 flats | A# (not offered) | A# B# C## D# E# F## G## | 10 sharps |
| B | B | B C# D# E F# G# A# | 5 sharps |  |  |  |

## Mixolydian

Intervals: 1 2 3 4 5 6 b7. Signature: its own notes.

| Root | Auto | Notes | Signature | Other | Notes | Signature |
|---|---|---|---|---|---|---|
| C | C | C D E F G A Bb | 1 flat |  |  |  |
| C#/Db | C# | C# D# E# F# G# A# B | 6 sharps | Db | Db Eb F Gb Ab Bb Cb | 6 flats |
| D | D | D E F# G A B C | 1 sharp |  |  |  |
| Eb | Eb | Eb F G Ab Bb C Db | 4 flats | D# (not offered) | D# E# F## G# A# B# C# | 8 sharps |
| E | E | E F# G# A B C# D | 3 sharps |  |  |  |
| F | F | F G A Bb C D Eb | 2 flats |  |  |  |
| F#/Gb | F# | F# G# A# B C# D# E | 5 sharps | Gb | Gb Ab Bb Cb Db Eb Fb | 7 flats |
| G | G | G A B C D E F | none |  |  |  |
| Ab | Ab | Ab Bb C Db Eb F Gb | 5 flats | G# | G# A# B# C# D# E# F# | 7 sharps |
| A | A | A B C# D E F# G | 2 sharps |  |  |  |
| Bb | Bb | Bb C D Eb F G Ab | 3 flats | A# (not offered) | A# B# C## D# E# F## G# | 9 sharps |
| B | B | B C# D# E F# G# A | 4 sharps |  |  |  |

## Dorian

Intervals: 1 2 b3 4 5 6 b7. Signature: its own notes.

| Root | Auto | Notes | Signature | Other | Notes | Signature |
|---|---|---|---|---|---|---|
| C | C | C D Eb F G A Bb | 2 flats |  |  |  |
| C#/Db | C# | C# D# E F# G# A# B | 5 sharps | Db | Db Eb Fb Gb Ab Bb Cb | 7 flats |
| D | D | D E F G A B C | none |  |  |  |
| Eb | Eb | Eb F Gb Ab Bb C Db | 5 flats | D# | D# E# F# G# A# B# C# | 7 sharps |
| E | E | E F# G A B C# D | 2 sharps |  |  |  |
| F | F | F G Ab Bb C D Eb | 3 flats |  |  |  |
| F#/Gb | F# | F# G# A B C# D# E | 4 sharps | Gb (not offered) | Gb Ab Bbb Cb Db Eb Fb | 8 flats |
| G | G | G A Bb C D E F | 1 flat |  |  |  |
| Ab | Ab | Ab Bb Cb Db Eb F Gb | 6 flats | G# | G# A# B C# D# E# F# | 6 sharps |
| A | A | A B C D E F# G | 1 sharp |  |  |  |
| Bb | Bb | Bb C Db Eb F G Ab | 4 flats | A# (not offered) | A# B# C# D# E# F## G# | 8 sharps |
| B | B | B C# D E F# G# A | 3 sharps |  |  |  |

## Aeolian

Intervals: 1 2 b3 4 5 b6 b7. Signature: its own notes.

| Root | Auto | Notes | Signature | Other | Notes | Signature |
|---|---|---|---|---|---|---|
| C | C | C D Eb F G Ab Bb | 3 flats |  |  |  |
| C#/Db | C# | C# D# E F# G# A B | 4 sharps | Db (not offered) | Db Eb Fb Gb Ab Bbb Cb | 8 flats |
| D | D | D E F G A Bb C | 1 flat |  |  |  |
| Eb | Eb | Eb F Gb Ab Bb Cb Db | 6 flats | D# | D# E# F# G# A# B C# | 6 sharps |
| E | E | E F# G A B C D | 1 sharp |  |  |  |
| F | F | F G Ab Bb C Db Eb | 4 flats |  |  |  |
| F#/Gb | F# | F# G# A B C# D E | 3 sharps | Gb (not offered) | Gb Ab Bbb Cb Db Ebb Fb | 9 flats |
| G | G | G A Bb C D Eb F | 2 flats |  |  |  |
| Ab | G# | G# A# B C# D# E F# | 5 sharps | Ab | Ab Bb Cb Db Eb Fb Gb | 7 flats |
| A | A | A B C D E F G | none |  |  |  |
| Bb | Bb | Bb C Db Eb F Gb Ab | 5 flats | A# | A# B# C# D# E# F# G# | 7 sharps |
| B | B | B C# D E F# G A | 2 sharps |  |  |  |

## Phrygian

Intervals: 1 b2 b3 4 5 b6 b7. Signature: its own notes.

| Root | Auto | Notes | Signature | Other | Notes | Signature |
|---|---|---|---|---|---|---|
| C | C | C Db Eb F G Ab Bb | 4 flats |  |  |  |
| C#/Db | C# | C# D E F# G# A B | 3 sharps | Db (not offered) | Db Ebb Fb Gb Ab Bbb Cb | 9 flats |
| D | D | D Eb F G A Bb C | 2 flats |  |  |  |
| Eb | D# | D# E F# G# A# B C# | 5 sharps | Eb | Eb Fb Gb Ab Bb Cb Db | 7 flats |
| E | E | E F G A B C D | none |  |  |  |
| F | F | F Gb Ab Bb C Db Eb | 5 flats |  |  |  |
| F#/Gb | F# | F# G A B C# D E | 2 sharps | Gb (not offered) | Gb Abb Bbb Cb Db Ebb Fb | 10 flats |
| G | G | G Ab Bb C D Eb F | 3 flats |  |  |  |
| Ab | G# | G# A B C# D# E F# | 4 sharps | Ab (not offered) | Ab Bbb Cb Db Eb Fb Gb | 8 flats |
| A | A | A Bb C D E F G | 1 flat |  |  |  |
| Bb | Bb | Bb Cb Db Eb F Gb Ab | 6 flats | A# | A# B C# D# E# F# G# | 6 sharps |
| B | B | B C D E F# G A | 1 sharp |  |  |  |

## Locrian

Intervals: 1 b2 b3 4 b5 b6 b7. Signature: its own notes.

| Root | Auto | Notes | Signature | Other | Notes | Signature |
|---|---|---|---|---|---|---|
| C | C | C Db Eb F Gb Ab Bb | 5 flats |  |  |  |
| C#/Db | C# | C# D E F# G A B | 2 sharps | Db (not offered) | Db Ebb Fb Gb Abb Bbb Cb | 10 flats |
| D | D | D Eb F G Ab Bb C | 3 flats |  |  |  |
| Eb | D# | D# E F# G# A B C# | 4 sharps | Eb (not offered) | Eb Fb Gb Ab Bbb Cb Db | 8 flats |
| E | E | E F G A Bb C D | 1 flat |  |  |  |
| F | F | F Gb Ab Bb Cb Db Eb | 6 flats |  |  |  |
| F#/Gb | F# | F# G A B C D E | 1 sharp | Gb (not offered) | Gb Abb Bbb Cb Dbb Ebb Fb | 11 flats |
| G | G | G Ab Bb C Db Eb F | 4 flats |  |  |  |
| Ab | G# | G# A B C# D E F# | 3 sharps | Ab (not offered) | Ab Bbb Cb Db Ebb Fb Gb | 9 flats |
| A | A | A Bb C D Eb F G | 2 flats |  |  |  |
| Bb | A# | A# B C# D# E F# G# | 5 sharps | Bb | Bb Cb Db Eb Fb Gb Ab | 7 flats |
| B | B | B C D E F G A | none |  |  |  |

## Phrygian dominant

Intervals: 1 b2 3 4 5 b6 b7. Signature: its own notes (no key).

| Root | Auto | Notes | Signature | Other | Notes | Signature |
|---|---|---|---|---|---|---|
| C | C | C Db E F G Ab Bb | 3 flats |  |  |  |
| C#/Db | C# | C# D E# F# G# A B | 4 sharps | Db (not offered) | Db Ebb F Gb Ab Bbb Cb | 8 flats |
| D | D | D Eb F# G A Bb C | 2 flats, 1 sharp |  |  |  |
| Eb | Eb | Eb Fb G Ab Bb Cb Db | 6 flats | D# (not offered) | D# E F## G# A# B C# | 6 sharps |
| E | E | E F G# A B C D | 1 sharp |  |  |  |
| F | F | F Gb A Bb C Db Eb | 4 flats |  |  |  |
| F#/Gb | F# | F# G A# B C# D E | 3 sharps | Gb (not offered) | Gb Abb Bb Cb Db Ebb Fb | 9 flats |
| G | G | G Ab B C D Eb F | 2 flats |  |  |  |
| Ab | G# | G# A B# C# D# E F# | 5 sharps | Ab (not offered) | Ab Bbb C Db Eb Fb Gb | 7 flats |
| A | A | A Bb C# D E F G | 1 flat, 1 sharp |  |  |  |
| Bb | Bb | Bb Cb D Eb F Gb Ab | 5 flats | A# (not offered) | A# B C## D# E# F# G# | 7 sharps |
| B | B | B C D# E F# G A | 2 sharps |  |  |  |

## Lydian dominant

Intervals: 1 2 3 #4 5 6 b7. Signature: its own notes (no key).

| Root | Auto | Notes | Signature | Other | Notes | Signature |
|---|---|---|---|---|---|---|
| C | C | C D E F# G A Bb | 1 flat, 1 sharp |  |  |  |
| C#/Db | Db | Db Eb F G Ab Bb Cb | 5 flats | C# (not offered) | C# D# E# F## G# A# B | 7 sharps |
| D | D | D E F# G# A B C | 2 sharps |  |  |  |
| Eb | Eb | Eb F G A Bb C Db | 3 flats | D# (not offered) | D# E# F## G## A# B# C# | 9 sharps |
| E | E | E F# G# A# B C# D | 4 sharps |  |  |  |
| F | F | F G A B C D Eb | 1 flat |  |  |  |
| F#/Gb | F# | F# G# A# B# C# D# E | 6 sharps | Gb | Gb Ab Bb C Db Eb Fb | 6 flats |
| G | G | G A B C# D E F | 1 sharp |  |  |  |
| Ab | Ab | Ab Bb C D Eb F Gb | 4 flats | G# (not offered) | G# A# B# C## D# E# F# | 8 sharps |
| A | A | A B C# D# E F# G | 3 sharps |  |  |  |
| Bb | Bb | Bb C D E F G Ab | 2 flats | A# (not offered) | A# B# C## D## E# F## G# | 10 sharps |
| B | B | B C# D# E# F# G# A | 5 sharps |  |  |  |

## Altered

Intervals: 1 b2 #2 3 #4 b6 b7. Signature: its own notes (no key).

| Root | Auto | Notes | Signature | Other | Notes | Signature |
|---|---|---|---|---|---|---|
| C | C | C Db D# E F# Ab Bb | 3 flats, 2 sharps |  |  |  |
| C#/Db | C# (doubles either way) | C# D D## E# F## A B | 6 sharps | Db (not offered) | Db Ebb E F G Bbb Cb | 6 flats |
| D | D | D Eb E# F# G# Bb C | 2 flats, 3 sharps |  |  |  |
| Eb | Eb | Eb Fb F# G A Cb Db | 4 flats, 1 sharp | D# (not offered) | D# E E## F## G## B C# | 8 sharps |
| E | E (doubles either way) | E F F## G# A# C D | 4 sharps |  |  |  |
| F | F | F Gb G# A B Db Eb | 3 flats, 1 sharp |  |  |  |
| F#/Gb | F# (doubles either way) | F# G G## A# B# D E | 5 sharps | Gb (not offered) | Gb Abb A Bb C Ebb Fb | 7 flats |
| G | G | G Ab A# B C# Eb F | 2 flats, 2 sharps |  |  |  |
| Ab | Ab (doubles either way) | Ab Bbb B C D Fb Gb | 5 flats | G# (not offered) | G# A A## B# C## E F# | 7 sharps |
| A | A | A Bb B# C# D# F G | 1 flat, 3 sharps |  |  |  |
| Bb | Bb | Bb Cb C# D E Gb Ab | 4 flats, 1 sharp | A# (not offered) | A# B B## C## D## F# G# | 9 sharps |
| B | B (doubles either way) | B C C## D# E# G A | 4 sharps |  |  |  |

## Whole tone

Intervals: 1 2 3 #4 #5 b7. Signature: its own notes (no key).

| Root | Auto | Notes | Signature | Other | Notes | Signature |
|---|---|---|---|---|---|---|
| C | C | C D E F# G# Bb | 1 flat, 2 sharps |  |  |  |
| C#/Db | Db | Db Eb F G A Cb | 3 flats | C# (not offered) | C# D# E# F## G## B | 7 sharps |
| D | D | D E F# G# A# C | 3 sharps |  |  |  |
| Eb | Eb | Eb F G A B Db | 2 flats | D# (not offered) | D# E# F## G## A## C# | 9 sharps |
| E | E | E F# G# A# B# D | 4 sharps |  |  |  |
| F | F | F G A B C# Eb | 1 flat, 1 sharp |  |  |  |
| F#/Gb | Gb | Gb Ab Bb C D Fb | 4 flats | F# (not offered) | F# G# A# B# C## E | 6 sharps |
| G | G | G A B C# D# F | 2 sharps |  |  |  |
| Ab | Ab | Ab Bb C D E Gb | 3 flats | G# (not offered) | G# A# B# C## D## F# | 8 sharps |
| A | A | A B C# D# E# G | 3 sharps |  |  |  |
| Bb | Bb | Bb C D E F# Ab | 2 flats, 1 sharp | A# (not offered) | A# B# C## D## E## G# | 9 sharps |
| B | B (doubles either way) | B C# D# E# F## A | 5 sharps |  |  |  |

## Half-whole diminished

Intervals: 1 b2 b3 3 #4 5 6 b7. Signature: its own notes (no key).

| Root | Auto | Notes | Signature | Other | Notes | Signature |
|---|---|---|---|---|---|---|
| C | C | C Db Eb E F# G A Bb | 3 flats, 1 sharp |  |  |  |
| C#/Db | C# (doubles either way) | C# D E E# F## G# A# B | 6 sharps | Db (not offered) | Db Ebb Fb F G Ab Bb Cb | 7 flats |
| D | D | D Eb F F# G# A B C | 1 flat, 2 sharps |  |  |  |
| Eb | Eb | Eb Fb Gb G A Bb C Db | 5 flats | D# (not offered) | D# E F# F## G## A# B# C# | 9 sharps |
| E | E | E F G G# A# B C# D | 3 sharps |  |  |  |
| F | F | F Gb Ab A B C D Eb | 3 flats |  |  |  |
| F#/Gb | F# | F# G A A# B# C# D# E | 5 sharps | Gb (not offered) | Gb Abb Bbb Bb C Db Eb Fb | 9 flats |
| G | G | G Ab Bb B C# D E F | 2 flats, 1 sharp |  |  |  |
| Ab | Ab (doubles either way) | Ab Bbb Cb C D Eb F Gb | 6 flats | G# (not offered) | G# A B B# C## D# E# F# | 7 sharps |
| A | A | A Bb C C# D# E F# G | 1 flat, 3 sharps |  |  |  |
| Bb | Bb | Bb Cb Db D E F G Ab | 4 flats | A# (not offered) | A# B C# C## D## E# F## G# | 10 sharps |
| B | B | B C D D# E# F# G# A | 4 sharps |  |  |  |

## Whole-half diminished

Intervals: 1 2 b3 4 b5 b6 6 7. Signature: its own notes (no key).

| Root | Auto | Notes | Signature | Other | Notes | Signature |
|---|---|---|---|---|---|---|
| C | C | C D Eb F Gb Ab A B | 3 flats |  |  |  |
| C#/Db | C# | C# D# E F# G A A# B# | 5 sharps | Db (not offered) | Db Eb Fb Gb Abb Bbb Bb C | 9 flats |
| D | D | D E F G Ab Bb B C# | 2 flats, 1 sharp |  |  |  |
| Eb | Eb (doubles either way) | Eb F Gb Ab Bbb Cb C D | 6 flats | D# (not offered) | D# E# F# G# A B B# C## | 7 sharps |
| E | E | E F# G A Bb C C# D# | 1 flat, 3 sharps |  |  |  |
| F | F | F G Ab Bb Cb Db D E | 4 flats |  |  |  |
| F#/Gb | F# | F# G# A B C D D# E# | 4 sharps | Gb (not offered) | Gb Ab Bbb Cb Dbb Ebb Eb F | 10 flats |
| G | G | G A Bb C Db Eb E F# | 3 flats, 1 sharp |  |  |  |
| Ab | G# (doubles either way) | G# A# B C# D E E# F## | 6 sharps | Ab (not offered) | Ab Bb Cb Db Ebb Fb F G | 7 flats |
| A | A | A B C D Eb F F# G# | 1 flat, 2 sharps |  |  |  |
| Bb | Bb | Bb C Db Eb Fb Gb G A | 5 flats | A# (not offered) | A# B# C# D# E F# F## G## | 9 sharps |
| B | B | B C# D E F G G# A# | 3 sharps |  |  |  |
