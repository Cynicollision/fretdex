# Search (`SRCH`)

One box at the top of every screen that jumps straight to a card from what a player would say: "Am7b5", "F# dorian", "ii V I in Bb", "drop d", "E".

## SRCH-1 The user can jump to a card by typing

| ID | Requirement | Status |
|---|---|---|
| SRCH-1.1 | Search shall be one tap from every screen (APP-1.4). | Planned |
| SRCH-1.2 | As the user types, it shall show up to 8 matching cards, best first, each with its module; choosing one opens it. **Enter** opens the first. | Planned |
| SRCH-1.3 | It shall read chord symbols with their common spellings: `Am7b5`, `Aø`, `A-7b5`, `Amin7b5`, `C△7`, `Cmaj7`, `CM7`, `C7#9`, `D/F#`. A slash chord that isn't an inversion (`C/D`) opens the chord above the slash (CHD-5.3). | Planned |
| SRCH-1.4 | It shall read scales and modes as root plus name, in any case, with sharps as `#` or `s` and flats as `b`: `F# dorian`, `fs dorian`, `Bb minor pentatonic`, `a harmonic minor`. | Planned |
| SRCH-1.5 | It shall read progressions by numerals or name, with an optional key: `ii V I in Bb`, `2 5 1 Bb`, `12 bar blues in A`, `andalusian in E`. | Planned |
| SRCH-1.6 | It shall read keys (`Bb major`, `key of E`, `C#m`) and notes (`F#`), offering both the note and the key where ambiguous. | Planned |
| SRCH-1.7 | It shall also match module, tool and screen names (`circle`, `triads`, `identify`, `settings`, and later `tuner` and `metronome`), tunings (`drop d`, which offers to switch tuning) and the capo (`capo 2`, which offers to set it). | Planned |
| SRCH-1.8 | Search shall work offline and return results as the user types, within 50 ms per keystroke. | Planned |
| SRCH-1.9 | With nothing typed, it shall show recents (PIN-4). | Planned |
| SRCH-1.10 | Where the text names several things (`E`), results shall rank the chord first, then the key, the note, and scales on that root. | Planned |
| SRCH-1.11 | Names shall match despite small misspellings (`dorain`, `pentatonc`); chord symbols shall match only exactly, since a near match is a different chord. | Planned |
