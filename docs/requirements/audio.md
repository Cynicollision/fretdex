# Audio (`AUD`)

Tap to hear anything on screen, synthesized in the browser with no sample files: chords strummed or blocked in the exact voicing shown, scales and modes run up and down with the playing note lit, and progressions looped as a backing to jam over.

## AUD-1 Audio works on phones

| ID | Requirement | Status |
|---|---|---|
| AUD-1.1 | The first play button tapped shall start audio, as mobile browsers require a tap; no sound shall play before a tap. | Implemented |
| AUD-1.2 | The app shall have a master volume and a global mute, remembered on the device, in the context sheet's **Sound** section (APP-2), so they're one tap from every screen (owner, 2026-11-25). | Implemented |
| AUD-1.3 | Starting any sound shall stop the previous one, except the metronome (MET), which plays under everything until stopped. A tapped note (AUD-4.1) stops only the note sounding on the same string, so notes tapped on other strings, or other keys, ring on as on the instrument (owner, 2026-11-25). | Implemented |
| AUD-1.4 | Audio shall play on iPhones with the ring/silent switch on silent, by routing it through a media element. If that proves impossible, the app shall say once: "Turn off silent mode to hear audio." | Partial |
| AUD-1.5 | Scale runs and progressions shall offer an optional click and a one-bar count-in, both off by default and remembered, using the metronome's click (MET). | Planned |
| AUD-1.6 | Scale runs and the metronome shall use one global tempo (CTX-1.11); progressions keep their own in the URL (`bpm`, PROG-3.1). | Partial |

## AUD-2 Chords

| ID | Requirement | Status |
|---|---|---|
| AUD-2.1 | **Strum** shall play the shown voicing's notes, low to high, about 30 ms apart, at the pitches the voicing sounds (THY-4.1). | Planned |
| AUD-2.2 | **Block** shall play them all at once. The last choice is remembered. | Planned |

## AUD-3 Scales and modes

| ID | Requirement | Status |
|---|---|---|
| AUD-3.1 | **Play** shall run the shown position's notes, lowest to highest (or one octave up from the lowest root on the full neck, each note on the lowest fret it falls on), ascending then descending, the top note played twice so the way down mirrors the way up (owner, 2026-11-28), once, at the tempo setting, default 100 bpm in eighth notes. **Play** is a small ▶ button, ■ while playing, at the end of the line under the neck, and the tempo is set on Settings, as runs are a minor feature that shouldn't take a row of the card (owner, 2026-11-26). A run stops when the card closes, when what it plays changes (the position, root, instrument, tuning or capo), and with any other sound (AUD-1.3). | Implemented |
| AUD-3.2 | The playing note shall be highlighted on the fretboard and keyboard as it sounds: its dot filled in the accent colour and ringed, its key filled, with every other note left as drawn (owner, 2026-11-26). Upright, the neck's stretch moves to show each note as it sounds, so a run never plays off screen (owner, 2026-11-28). On the keyboard's two octaves, the run is moved by whole octaves to light as many of its notes as fit, its lowest note in the lower octave where that fits as many; a note that still falls off the keyboard lights no key, rather than one in the wrong octave, and nothing is added to the screen to show it (owner, 2026-11-28). | Implemented |

## AUD-4 Taps play notes

| ID | Requirement | Status |
|---|---|---|
| AUD-4.1 | Tapping a dot on a fretboard, or a key on an enlarged keyboard, shall play that note in the instrument's voice. | Implemented |
| AUD-4.2 | An interval (INT-1.3) shall play melodically, then both notes together. Retired 2026-11-25 with Intervals (INT). | Retired |

## AUD-5 Progressions

| ID | Requirement | Status |
|---|---|---|
| AUD-5.1 | A progression shall loop at its tempo (PROG-3.1), each chord strummed in its shown voicing on each beat, with its root an octave below in the bass voice. | Planned |
| AUD-5.2 | Timing shall stay steady for at least 10 minutes of looping, with no drift a player could hear. | Planned |

## AUD-6 Drone

| ID | Requirement | Status |
|---|---|---|
| AUD-6.1 | **Drone** shall sustain the current key's root (or the card's root), optionally with its fifth, until stopped, from any card that plays sound and from the context bar. Retired 2026-11-25: the owner doesn't want a drone (M01 decision 13). | Retired |

## AUD-7 Voices

| ID | Requirement | Status |
|---|---|---|
| AUD-7.1 | Guitar shall sound as a plucked string (Karplus–Strong), bass as a rounder sine-plus-saw voice, and the keyboard as a simple electric piano. | Implemented |
| AUD-7.2 | Audio shall need no files beyond the app's code. | Implemented |

## Known gaps

- **AUD-1.4:** where Safari has `navigator.audioSession` (16.4 and later) the app asks for playback audio, and on older iPhones it plays a silent media element; neither has been checked on the owner's iPhone with the switch on silent yet.
- **AUD-1.3:** the engine plays a run marked `under` beneath the rest, but nothing uses it until the metronome (M04).
- **AUD-1.6:** scale runs play at the tempo setting; the metronome that shares it comes in M04.
- **AUD-7.1:** the voices wait for the owner to judge them on the phone (M01 T8's *Done when*).
