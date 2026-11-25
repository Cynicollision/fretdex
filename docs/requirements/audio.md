# Audio (`AUD`)

Tap to hear anything on screen, synthesized in the browser with no sample files: chords strummed or blocked in the exact voicing shown, scales and modes run up and down with the playing note lit, progressions looped as a backing to jam over, and a drone for modal practice.

## AUD-1 Audio works on phones

| ID | Requirement | Status |
|---|---|---|
| AUD-1.1 | The first play button tapped shall start audio, as mobile browsers require a tap; no sound shall play before a tap. | Planned |
| AUD-1.2 | The app shall have a master volume and a global mute, remembered on the device, reachable from every screen that plays sound. | Planned |
| AUD-1.3 | Starting any sound shall stop the previous one, except the drone (AUD-6) and the metronome (MET), which play under everything until stopped. | Planned |
| AUD-1.4 | Audio shall play on iPhones with the ring/silent switch on silent, by routing it through a media element. If that proves impossible, the app shall say once: "Turn off silent mode to hear audio." | Planned |
| AUD-1.5 | Scale runs and progressions shall offer an optional click and a one-bar count-in, both off by default and remembered, using the metronome's click (MET). | Planned |
| AUD-1.6 | Scale runs and the metronome shall use one global tempo (CTX-1.11); progressions keep their own in the URL (`bpm`, PROG-3.1). | Planned |

## AUD-2 Chords

| ID | Requirement | Status |
|---|---|---|
| AUD-2.1 | **Strum** shall play the shown voicing's notes, low to high, about 30 ms apart, at the pitches the voicing sounds (THY-4.1). | Planned |
| AUD-2.2 | **Block** shall play them all at once. The last choice is remembered. | Planned |

## AUD-3 Scales and modes

| ID | Requirement | Status |
|---|---|---|
| AUD-3.1 | **Play** shall run the shown position's notes (or one octave from the lowest root on the full neck) ascending then descending at the tempo setting, default 100 bpm in eighth notes. | Planned |
| AUD-3.2 | The playing note shall be highlighted on the fretboard and keyboard as it sounds. | Planned |

## AUD-4 Taps play notes

| ID | Requirement | Status |
|---|---|---|
| AUD-4.1 | Tapping a dot on a fretboard, or a key on an enlarged keyboard, shall play that note in the instrument's voice. | Planned |
| AUD-4.2 | An interval (INT-1.3) shall play melodically, then both notes together. Retired 2026-11-25 with Intervals (INT). | Retired |

## AUD-5 Progressions

| ID | Requirement | Status |
|---|---|---|
| AUD-5.1 | A progression shall loop at its tempo (PROG-3.1), each chord strummed in its shown voicing on each beat, with its root an octave below in the bass voice. | Planned |
| AUD-5.2 | Timing shall stay steady for at least 10 minutes of looping, with no drift a player could hear. | Planned |

## AUD-6 Drone

| ID | Requirement | Status |
|---|---|---|
| AUD-6.1 | **Drone** shall sustain the current key's root (or the card's root), optionally with its fifth, until stopped, from any card that plays sound and from the context bar. | Planned |

## AUD-7 Voices

| ID | Requirement | Status |
|---|---|---|
| AUD-7.1 | Guitar shall sound as a plucked string (Karplus–Strong), bass as a rounder sine-plus-saw voice, and the keyboard as a simple electric piano. | Planned |
| AUD-7.2 | Audio shall need no files beyond the app's code. | Planned |
