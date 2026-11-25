# M01 design: pin tiles

How M01's diagrams are drawn, settled in T3 from mockups checked on the owner's phone (the [design pass artifact](https://claude.ai/artifact/Diq4EXpN1UtAib538CAFLS), 2026-11-25). T7 built the fretboard, keyboard and mini fretboard, which [architecture.md](../../architecture.md#styling) now describes; what's left is the pin tiles, for T12, after which this file is deleted. Colours are the tokens in `app/src/lib/styles/tokens.css`; sizes are CSS pixels at the default text size.

## Pin tiles (DIAG-5)

- Two tiles across a phone, each about 170 wide: a `--surface` tile with a 10 radius and a `--line` border, the mini render, then the label (16, bold) and a sub-label (14, `--muted`).
- The mini fretboard is 150 by 72: hairline frets and strings, the nut when fret 0 is in range, dots 8 across without labels and the root a 9 square.
- A tile without a diagram (a pinned list, PIN-2.6) shows its title and filter as text in the label and sub-label.
