# Fretdex Requirements

This folder is Fretdex's requirements: what it does and what it's planned to do, as numbered requirements grouped by domain. It's also the feature backlog: every `Planned` or `Partial` sub-requirement is work to do. The [roadmap](../planning/roadmap.md) lists the milestones, and the milestone's file in [milestones/](../planning/milestones/) orders the work into tasks by requirement ID.

The first set was written on 2026-11-24 from the [concept brief](../concept-brief.md), before any code, and most of its open questions were decided the same day. Every sub-requirement is `Planned`; which milestone builds it is in the [roadmap](../planning/roadmap.md) and the milestone files.

A domain may end with **Open questions**, each with a **default**: what gets built unless the owner decides otherwise, so work never waits on a question. The owner decides one at the latest when the milestone task that needs it starts; a decided question becomes a sub-requirement (or a decision in the milestone file, for plan and code choices) and leaves the list.

## Domains

| Prefix | Domain | File |
|---|---|---|
| `APP` | App shell: navigation, the context bar, URLs as state, installing and offline, themes, phone and stand use, accessibility | [app.md](app.md) |
| `CTX` | Global context and settings: current key, instrument, tuning, handedness, labels, accidentals, fret range | [context.md](context.md) |
| `THY` | Theory correctness: spelling, enharmonics, the tuning model, what every module can rely on | [theory.md](theory.md) |
| `DIAG` | Diagrams: fretboard, chord box, keyboard, circle, staff, and how they label, mirror and respond to taps | [diagrams.md](diagrams.md) |
| `CHD` | Chords: list, detail card, voicings, inversions | [chords.md](chords.md) |
| `SCL` | Scales and positions: full neck, CAGED, 3-notes-per-string, bass boxes | [scales.md](scales.md) |
| `ARP` | Arpeggios (retired) | [arpeggios.md](arpeggios.md) |
| `TRI` | Triads and string sets | [triads.md](triads.md) |
| `MODE` | Modes side by side from one root | [modes.md](modes.md) |
| `KEY` | Keys and the circle of fifths | [keys.md](keys.md) |
| `PROG` | Progressions | [progressions.md](progressions.md) |
| `INT` | Intervals and notes (retired) | [intervals.md](intervals.md) |
| `PIN` | Pins, the home board, recents, backup | [pins.md](pins.md) |
| `SRCH` | Search | [search.md](search.md) |
| `AUD` | Audio | [audio.md](audio.md) |
| `TUN` | Tuner (after v1) | [tuner.md](tuner.md) |
| `MET` | Metronome (after v1) | [metronome.md](metronome.md) |

## Numbering

| Level | ID format | Example | What it is |
|---|---|---|---|
| Requirement | `DOMAIN-n` | `CHD-2` | An outcome the user needs, in plain language. Says *what and why*, not how. It's the heading of a table. |
| Sub-requirement | `DOMAIN-n.m` | `CHD-2.3` | A specific, testable behavior that supports its requirement. It's a row in that table, with a status. |
| Open question | `DOMAIN-Qn` | `SCL-Q2` | Not decided yet, with a default. Leaves the list once decided; its number isn't reused. |

- IDs are **stable**. Never renumber. New requirements take the next free number in their domain.
- A removed sub-requirement keeps its ID with status `Retired` and a one-line reason.
- Reference requirements by ID from test names (`THY-1.2 spells F# major with E#`), commits, PRs and backlog items.
- Cross-cutting quality requirements (performance, accessibility, privacy) go under `APP`.

## Status

| Status | Meaning |
|---|---|
| `Implemented` | Works as written today. |
| `Partial` | Some of it works; the domain's **Known gaps** says what doesn't. |
| `Planned` | Decided, not built. |
| `Retired` | No longer applies. Kept for reference. |

## Domain files

Each domain file has an introduction, then one table per requirement, then up to four sections: **Known gaps** (once there's code), **Housekeeping**, **Open questions** and **Notes**.

## Writing style

- Sub-requirements are one behavior each, phrased "The app shall …" or "The user can …", specific enough that a test could pass or fail against them.
- Describe behavior, not implementation. Code names belong in Known gaps at most.
- Spell music the way the app shows it: `F#`, `Bb`, `m7b5`, `maj7`, intervals as `1 b3 5`, roman numerals as `ii–V–I`.

## Terms

| Term | Meaning |
|---|---|
| Capo | A clamp across the strings at a fret. Chords are named by the shape played, with what they sound beside them (CTX-3). |
| Card | The detail view of one thing (a chord, a scale in a key, a progression). Every card has its own URL and can be pinned. |
| List | A module's index of cards, filterable, with pinned items first. |
| Context | The global current key, instrument, tuning, capo and display settings (CTX). |
| Root | The note a chord, scale or mode is built on. |
| Quality | A chord's type: `m`, `7`, `maj7`, `m7b5` and so on. |
| Tuning | The ordered list of open-string pitches, lowest string first (THY-3). |
| Voicing | One way to play a chord on the instrument: a fret (or mute) per string. |
| Position | A region of the neck where a scale is played: a CAGED shape, a 3-notes-per-string pattern or a bass box. |
| String set | Three adjacent strings (TRI). Set 1 is strings 1–3 (high E, B, G), set 4 is strings 4–6. |
| Label mode | What a diagram writes on each note: note names, intervals, scale degrees, or nothing (CTX-1.5). |
| Pin | A saved URL plus a label, shown on the home board (PIN). |
| Tool | A screen that isn't a reference module: Identify (CHD-6), and later Tuner (TUN) and Metronome (MET). |
