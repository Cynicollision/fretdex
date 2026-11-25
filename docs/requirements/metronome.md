# Metronome (`MET`)

A metronome with a click, tap tempo, time signatures and subdivisions, which keeps time under any card. It's built after version 1 (M04 in the [roadmap](../planning/roadmap.md)). It's written down now because the first milestones build what it rests on: the audio package's scheduler, which already times scale runs and progressions, the click and count-in (AUD-1.5), the global tempo (CTX-1.11) and a place in the navigation (APP-1.1).

Screen: **Metronome** (`/metronome`, options `bpm`, `sig` time signature and `sub` subdivision).

## MET-1 The user can keep time

| ID | Requirement | Status |
|---|---|---|
| MET-1.1 | **Start** and **Stop** shall play a click at the tempo, from 30 to 250 bpm. | Planned |
| MET-1.2 | The user can set the tempo with plus and minus buttons, a slider, by typing it, and by tapping a **Tap** button, which takes the average of the last four taps. | Planned |
| MET-1.3 | The user can choose 2/4, 3/4, 4/4, 5/4, 6/8, 7/8 or 12/8, with beat one accented; the accent can be turned off. | Planned |
| MET-1.4 | The user can add subdivisions (eighths, triplets, sixteenths), clicked more quietly than the beats. | Planned |
| MET-1.5 | The current beat shall show large enough to follow from a music stand, without animation when the system asks for reduced motion (APP-6.5). | Planned |
| MET-1.6 | Time shall stay steady for at least 10 minutes, with no drift a player could hear (AUD-5.2). | Planned |
| MET-1.7 | The tempo, time signature and subdivision shall be in the URL, so a song's setting can be pinned ("Song X · 132 · 6/8"). | Planned |

## MET-2 It keeps time under everything

| ID | Requirement | Status |
|---|---|---|
| MET-2.1 | The metronome can be started, stopped and its tempo changed from the context bar's sheet (APP-2), so it keeps time under any card. | Planned |
| MET-2.2 | It shall keep playing under other sounds (AUD-1.3), and keep going when the user moves to another screen. | Planned |
| MET-2.3 | Its tempo is the global tempo (CTX-1.11), shared with scale runs; opening a metronome URL with `bpm` sets it. | Planned |

## Open questions

- **MET-Q1 Click sound and silent mode.** *Default:* one short woodblock-like click synthesized in the browser, with a higher one for the accent, plus a **Silent** option that only flashes the beat. Decided when the metronome is built.
