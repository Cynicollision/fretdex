# M01 design: diagrams

How M01's diagrams are drawn, settled in T3 from mockups checked on the owner's phone (the [design pass artifact](https://claude.ai/artifact/Diq4EXpN1UtAib538CAFLS), 2026-11-25). T7 builds them from this; when they ship, what stays true moves to [architecture.md](../../architecture.md#styling) and this file is deleted. Colours are the tokens in `app/src/lib/styles/tokens.css`; sizes are CSS pixels at the default text size.

## Fretboard

- **Landscape, the whole fret range.** Low string at the bottom, nut on the left (mirrored when left-handed). An open-string column 40 wide left of the nut, the nut 7 wide in `--nut`, frets evenly spaced across the rest (DIAG-1.8) as 2.5-wide lines in `--fret`, on a `--neck` board. Strings 44 apart, in `--string`, getting thinner from the lowest (3.2) to the highest (1). At 15 frets the narrowest phone in landscape still gives each fret about 45, above the 44 tap target.
- **Dots.** 30 across. The root a square with corners rounded by about 4, in `--root` with its label in `--root-ink`; other notes circles in `--note` with labels in `--note-ink`. An outlined note (a scale note that isn't a chord tone, DIAG-1.7) is a 3-wide `--note` ring filled with `--neck`, its label in `--note`. Labels 14, bold, centred. Dimmed notes (DIAG-1.3) at 30% opacity.
- **Inlays and numbers.** Inlays are 7-radius circles in `--inlay`, centred between the middle strings, with 12's pair one string-gap either side. Fret numbers at the inlay frets, 14 and semibold in `--muted`, below the neck.
- **Upright (DIAG-1.10).** A stretch of five or six frets across the width, the same sizes, the position's frets at full strength and the frets either side dimmed. Above it, position buttons (44 square, the chosen one in `--accent`). Below it, a 44-high strip of the whole fret range: a small `--neck` bar with hairline frets, the roots as small `--root` squares at their string's height, and the stretch shown outlined in `--accent`. The owner found the strip enough to see where a position sits without turning the phone.

## Keyboard

- Two octaves from C. White keys a fourteenth of the width in `--key-white`, black keys 0.6 as wide and 0.62 as tall in `--key-black`, edged in `--key-edge`.
- Notes marked near the bottom of their key: the root a square in `--root`, others circles in `--note` (on black keys, `--key-white` circles edged in `--key-black`), at most 20 across and never wider than the key.
- Compact (in a card): no labels. Enlarged (full width, DIAG-3.1): labels 14 and bold in two rows under the keys, black keys' notes in the upper row and white keys' in the lower, so neighbouring semitones never collide; the root's label in `--accent`.

## Pin tiles (DIAG-5)

- Two tiles across a phone, each about 170 wide: a `--surface` tile with a 10 radius and a `--line` border, the mini render, then the label (16, bold) and a sub-label (14, `--muted`).
- The mini fretboard is 150 by 72: hairline frets and strings, the nut when fret 0 is in range, dots 8 across without labels and the root a 9 square.
- A tile without a diagram (an interval) shows its symbol at 40 in `--accent`.
