# Backlog

Work outside the milestone being built. The milestones in order are in the [roadmap](roadmap.md); the one being built has its own file in [milestones/](milestones/), and work for it goes there, not here.

Each section says what happens to its items next:

- **Inbox**: found but not sorted yet. Follow-up work noticed during other work, and anything a review turns up, lands here. Only the owner moves an item out.
- **A milestone not planned yet** (M02 ...): what's known so far about it, until a planning session writes its file.
- **Anytime**: self-contained work with a clear end that needs no decision first, small enough for a PR of its own between milestone tasks.
- **Parked**: waiting on something. Each item says what, as **Revisit when**.
- **Ideas**: not committed to.

An item is one bullet: a bold title, what's wrong or wanted, and where (file and symbol, or requirement IDs). Items added from now on end with where they came from, such as `(PR 12)` or `(noticed in T4)`. Delete an item once it's done; git history is the changelog.

---

## Inbox

- **Licence notices in the built app.** The production build minifies Svelte's and SvelteKit's code into `app/build/_app/` without their MIT copyright notices, which the licence asks to travel with the code, and the same will go for Tonal.js and the chord dataset. Something should ship them, such as a generated third-party licences file in the build or a credits screen that shows `CREDITS.md`'s notices. (noticed in M01 T1)

---

## M02 Chords and triads

- **Triads as a module, or part of the chord card.** Triads stays a module for now (TRI), but may not earn its place once chords exist: its shapes could be a view on the chord card for the four triad qualities, next to inversions (CHD-5). Decide in M02's planning, from how the chord card turns out. (owner, 2026-11-25, when Intervals and Arpeggios were retired)

---

## Anytime

Nothing yet.

---

## Parked

- **Sampled instruments**, if the synth voices aren't good enough: a few MB added to the offline cache. **Revisit when** M01's audio task (T8) has judged the voices.
- **Curated voicings for alternate tunings**, starting with the tunings the owner plays most (CHD-3.5). **Revisit when** M02's voicing dataset exists.
- **More instruments.** 5-string bass (B E A D G) and 7-string guitar: tunings with more strings (THY-3.2), and positions and voicings that use them. **Revisit when** planning the milestones after version 1.
- **Your own progressions**, saved like pins. **Revisit when** planning the milestones after version 1.
- **Reuse `fretkit` and the audio package in the synth-toy projects**: decide whether to publish them or copy them. **Revisit when** a synth-toy project needs them.

---

## Ideas

- **Spread triads and sus triads** on string sets.
- **Modes of harmonic and melodic minor** with the brightness and comparison views.
- **Modal interchange beyond the parallel key** in borrowed chords (KEY-2.5).
- **Rhythm patterns and 3/4** for progression playback.
- **Identify for scales**: which scales contain these notes.
- **An adjustable reference pitch** (A4 other than 440 Hz) for the tuner and audio.
- **A setlist mode**: a pin group that steps through its pins in order, one tap each, for a gig.
