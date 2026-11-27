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
- **Keep a global current key, or pick the key in each module?** Vision principle 2 has one current key re-centering every module, but it never changes an open card (CTX-2.8), and its uses are lists and key-relative views: the Scales list's root (SCL-1.2), the Modes overview (MODE-1.10), chords in the key (CHD-1.3, CHD-2.3, CHD-2.5), keys, the circle and progressions (KEY-1.1, PROG-1.2, PROG-2.1), capo shapes (CTX-3.3), pins that follow the key (PIN-1.5) and **Show in E minor** (CTX-2.9). The owner asked whether a key picked inside Progressions (and the like) would do instead, dropping it from the context bar (`ContextBar.svelte`) and the sheet. Decide before M02's planning, as chords lean on it; PIN-1.5 waits for it too (owner, 2026-11-26, T12a). (PR 18, owner's feedback on the context bar)
- **A tap before a prerendered list hydrates is lost.** The Scales list smoke test (`SCL-1.1 lists every scale on the root picked` in `app/e2e/scales.e2e.ts`) failed once on Android: the root picker's tap left the URL at `/scales`, and 30 reruns passed. A tap on `Choice` in a prerendered page (`app/src/routes/scales/+page.svelte`, `/modes`) before hydration changes the radio but runs no handler, which a slow phone could hit too. Either the test waits for hydration or the lists read the checked radio once mounted. (noticed in PR 20)
- **One bottom sheet.** `Sheet.svelte` is a small bottom sheet with the context sheet's look and its close-on-backdrop handling, which `ContextSheet.svelte` still has its own copy of; the context sheet could be built on it, its heading changing for the tuning editor. (noticed in T12a)

---

## M02 Chords and triads

- **Triads as a module, or part of the chord card.** Triads stays a module for now (TRI), but may not earn its place once chords exist: its shapes could be a view on the chord card for the four triad qualities, next to inversions (CHD-5). Decide in M02's planning, from how the chord card turns out. (owner, 2026-11-25, when Intervals and Arpeggios were retired)

---

## M03 Version one

- **Recents with search.** PIN-4 moved here from M01's T12c: recents show in search while nothing is typed (PIN-4.2, SRCH-1.9), not on Home, so they're built with search and stored as a record of their own. (owner's feedback, 2026-11-27, M01 decision 15)

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
- **Collapsible groups on Home.** A long board pushes everything under it down; groups that fold, each remembering whether it's open, would shorten it without hiding the newest pins as a cap with a See all would (`PinBoard.svelte`, PIN-2). **Revisit when** M01's trial shows the board getting long. (owner's feedback, 2026-11-27, M01 decision 15)

---

## Ideas

- **Spread triads and sus triads** on string sets.
- **Modes of harmonic and melodic minor** with an overview like the major scale's (MODE-1).
- **Modal interchange beyond the parallel key** in borrowed chords (KEY-2.5).
- **Rhythm patterns and 3/4** for progression playback.
- **Identify for scales**: which scales contain these notes.
- **An adjustable reference pitch** (A4 other than 440 Hz) for the tuner and audio.
- **A setlist mode**: a pin group that steps through its pins in order, one tap each, for a gig.
- **Starter packs**: curated groups of pins shipped with the app, kept out of the way, that the user adds to their board whole to start exploring, built on PIN-5.2's **Add to what's here**. To weigh against the vision's "a lookup tool for a working player, not a course" and principle 1's limit on hand-curated data; worth more once chords and progressions exist, after M03. (owner's feedback, 2026-11-27)
