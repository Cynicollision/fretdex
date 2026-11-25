# Tuner (`TUN`)

A chromatic tuner that listens through the phone's microphone and tunes to the current tuning, so the stand needs no separate tuner app. It's built after version 1 (M04 in the [roadmap](../planning/roadmap.md)). It's written down now so the first milestones leave room for it: a place in the navigation (APP-1.1), the microphone rule (APP-4.6), and an audio package with an input side as well as an output side.

Screen: **Tuner** (`/tuner`).

## TUN-1 The user can tune to the current tuning

| ID | Requirement | Status |
|---|---|---|
| TUN-1.1 | The tuner shall show the current tuning's strings as targets, and for the note it hears: the nearest target string, the note's name and how many cents sharp or flat it is, updated at least 20 times a second. | Planned |
| TUN-1.2 | The user can pick one string to tune to instead of the nearest, for a string far out of tune or a change of tuning. | Planned |
| TUN-1.3 | It shall be readable from a music stand: a large note name and a needle or bar that shows clearly when the note is within ±3 cents. | Planned |
| TUN-1.4 | Tapping a target string shall play its pitch as a reference tone (AUD-4.1). | Planned |
| TUN-1.5 | It shall hear pitches from the bass's low E (41 Hz) up to the 24th fret of the guitar's high E, and the low B (31 Hz) a 5-string bass would add later. | Planned |
| TUN-1.6 | Targets shall be the open strings at concert pitch (THY-4.1), ignoring the capo, since strings are tuned without one. | Planned |

## TUN-2 The microphone stays private

| ID | Requirement | Status |
|---|---|---|
| TUN-2.1 | The app shall ask for the microphone only when the tuner opens, and release it when the user leaves the screen (APP-4.6). | Planned |
| TUN-2.2 | Nothing the microphone hears shall be recorded, stored or sent. | Planned |
| TUN-2.3 | If the microphone is refused, the tuner shall say how to allow it and still offer the reference tones (TUN-1.4). | Planned |
