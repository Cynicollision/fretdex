# TODO / Backlog

High-level backlog: the milestones, then work not scheduled yet, then ideas. Delete an item once it's done (git history is the changelog).

| Milestone | Release | What it adds | Status |
|---|---|---|---|
| [M01 Foundation and scales](docs/milestones/M01-foundation-and-scales.md) | v0.1.0 | The repository, deploys and offline install; context and settings with the capo; scales, modes, arpeggios, intervals and notes; pins and the home board; tap-to-play, scale runs and the drone | Planned |
| M02 Chords and triads | v0.2.0 | The voicing dataset and voicing search, chord boxes, chords and inversions, Identify, triads and string sets, strummed audio | Not planned yet |
| M03 Version one | v1.0.0 | Keys and the circle, progressions and their loop, the click and count-in, search, and a two-week trial that includes a rehearsal or gig | Not planned yet |
| M04 Tuner and metronome | v1.1.0 | The tuner (TUN) and the metronome (MET) | Not planned yet |

The milestone being built has its own file in [docs/milestones/](docs/milestones/README.md), with its tasks in order. Work for it goes there, not here. The next milestone's file is written when the one before it closes.

---

## Unscheduled

- [ ] **More instruments.** 5-string bass (B E A D G) and 7-string guitar: tunings with more strings (THY-3.2), and positions and voicings that use them.
- [ ] **Sampled instruments**, if the synth voices aren't good enough (judged in M01's audio task): a few MB added to the offline cache.
- [ ] **Your own progressions**, saved like pins.
- [ ] **Curated voicings for alternate tunings**, starting with the tunings the owner plays most (CHD-3.5).
- [ ] **Arpeggio positions in alternate tunings**: ARP-1.7 shows the full neck only.
- [ ] **Reuse `fretkit` and the audio package in the synth-toy projects**: decide whether to publish them or copy them.

## Ideas

- Spread triads and sus triads on string sets.
- Modes of harmonic and melodic minor with the brightness and comparison views.
- Modal interchange beyond the parallel key in borrowed chords (KEY-2.5).
- Rhythm patterns and 3/4 for progression playback.
- Identify for scales: which scales contain these notes.
- An adjustable reference pitch (A4 other than 440 Hz) for the tuner and audio.
- A setlist mode: a pin group that steps through its pins in order, one tap each, for a gig.
