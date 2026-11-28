# M02 — Chords and triads

Status: planned (2026-11-28, while M01's trial runs; work starts once v0.1.0 is released). Release: v0.2.0.

# Plan

## Question

Can Fretdex be the owner's chord reference on the stand: any chord someone calls out, found in a voicing the owner would play, in the tuning and capo they're in, heard, and a shape they're holding named?

"Yes" means: for at least a week that includes a rehearsal or practice session, the owner looked up chords, voicings and inversions in Fretdex rather than a chord book or memory; every chord they opened was spelled right, and every voicing played what its name says; every chord they needed had a voicing they'd play in standard tuning, and a playable one in the alternate tunings they use; Identify named the shapes they tried; and it all worked in airplane mode. Anything they still had to look up elsewhere, within this milestone's scope, is listed in the Outcome.

## Scope

In:

- Decision 1's change to the context: the key leaves the context bar, and the views that use a key pick it on screen.
- Requirements: CHD; DIAG-2 and DIAG-5.1's compact chord box; AUD-2; TRI, or its string sets on the chord card (decision 9); CTX-2.2, CTX-3.1's chord boxes, CTX-3.2 and CTX-3.3 for the Chords list; THY-1.2 for chord qualities; SCL-5.3's links to chord cards; APP-3.1 and APP-6.4 for the new screens; pins and tiles for the new screens, and hidden voicings in PIN-5.1 and PIN-6.1.
- From the backlog: the lost tap before a prerendered list hydrates (PR 20), and one bottom sheet (T12a), both in T1.
- The trial (the Question), and the fixes it leads to.

Out (and where it goes instead):

- Keys and the circle, progressions, and search with recents: M03. So CHD-5.3's search half and SRCH-1.3's chord symbols wait for search; until then, a slash chord that isn't an inversion has no way in. T1 rewords M03's requirements that name the current key, so they're ready when M03 is planned.
- The click and count-in (AUD-1.5): M03. The tuner and metronome: M04.
- Curated voicings for alternate tunings: the backlog's Parked, until this milestone's dataset exists. Spread and sus triads: Ideas.
- Everything in the vision's non-goals, and everything else in the backlog's Parked and Ideas.

## Decisions taken in this plan

From the planning session of 2026-11-28; each is cheap to change before its task starts.

1. **No global current key** (owner, 2026-11-28, from the backlog's question raised in PR 18). The context bar and its sheet keep the instrument, tuning, capo and sound. A view that depends on a key keeps it in its URL (`key`), with a key picker on screen; with no key in the URL, the picker opens on the last key picked in any of them, remembered on the device (the settings' `key`, which CTX-1.1 stores today). A card never changes with it (CTX-2.8). The chord card takes an optional `key` for its numeral (CHD-2.3) and the key's scale behind its tones (CHD-2.5), and the links from a key's chords (the Chords list filtered to a key, a scale card's diatonic chords) carry it. PIN-1.5 (Follow current key) and CTX-2.9 (Show in E minor) are retired, and vision principle 2 says so. T1 builds it, and rewrites the requirements that name the current key.
2. **A design pass first**, as M01's T3: the chord box and its compact form, the chord card upright, and Identify's blank box, as static mockups checked on the phone at arm's length before they're built.
3. **Theory is tested first.** Chord qualities, spelling, inversions and diatonic chords have unit tests named after their requirement IDs before a screen draws them, and a golden table covers every chord quality on every picker root, as `golden/scales.md` covers scales (THY's Housekeeping).
4. **The curated set** comes from chords-db (MIT), converted by a committed script into JSON inside `fretkit` and trimmed to at most 6 voicings per chord, with every voicing changed by hand marked so in the data (CHD-3.11). It's precached with the build, within APP-7.2's 2 MB. The owner checks a sample the voicings task proposes rather than every voicing; hiding (CHD-3.6) covers the rest.
5. **A voicing's URL is its frets.** `v` names a voicing by its frets, lowest string first, written as Identify's `f` is (`v=x32010`), not by its place in the list, so a pin keeps its voicing when the list changes (a voicing hidden, the dataset trimmed, the search's limits changed). The voicings task writes the format for frets above 9.
6. **Hidden voicings are a record of their own**, versioned like pins (`loadRecord`, `saveRecord`), keyed by tuning, chord and frets, and in the backup file (PIN-5.1). It stores the user's data, so its PR gets the second review.
7. **Strum or block** (AUD-2): tapping a chord box plays the last choice, remembered in the settings.
8. **Chords are named by the shape played with a capo** (CTX-3.2): the card's URL names the shape, and the card says what it sounds ("G · sounds A").
9. **Triads are decided at the start of their task** (owner, 2026-11-28, from the backlog's question of 2026-11-25): once the owner has used the chord card, they decide whether Triads stays a module (TRI) or becomes a view on the chord card for the four triad qualities, next to inversions, with TRI retired.
10. **Open questions have defaults**, built unless the owner decides otherwise at the latest when the task that needs them starts (M01 decision 11). Design over pin compatibility holds as in M01's decision 15.

## How to work on a task

1. Read `CLAUDE.md`, this file, `architecture.md` and the task's requirements.
2. Branch `claude/<short-kebab-summary>` from an up-to-date `main`. One PR per task; split a task here (T4a, T4b) before its first PR if it's more than one session.
3. Name tests after their requirement IDs.
4. Try anything the screen shows on a phone-sized viewport, and on the owner's phone once it's deployed.
5. In the PR: tick the task, add a *Changed while doing it* note under it, update requirement statuses, credit anything third-party in `CREDITS.md`, and correct `architecture.md` where the code proved it wrong.
6. Let the owner review and merge before starting the next task.

## Tasks

- [ ] **T1 — The key leaves the context bar.** Decision 1. CTX-1.1, CTX-2.3, CTX-2.6, CTX-2.8, CTX-3.3, APP-2.1, SCL-1.2 and MODE-1.10 rewritten and built, and the M03 rows that name the current key reworded to match (KEY-1.1, KEY-1.3, KEY-2.6, KEY-2.8, DIAG-4.1, PROG-1.2, PROG-2.1). The context sheet loses its key and is built on `Sheet.svelte`, so there's one bottom sheet (backlog, T12a). What each list remembers and opens on is settled with the owner at the start; the default is that the Scales list's root picker and the Modes overview's key picker open on the last key picked, and picking there remembers it. A tap on a list's picker before the page hydrates is no longer lost (backlog, PR 20). *Done when:* the context bar shows no key, a key picked on one screen is where the other's picker opens after a relaunch, and the lists' smoke tests pass 30 runs in a row on both phone projects.
- [ ] **T2 — Design pass.** Decision 2, DIAG-2 and DIAG-5.1's chord box: the box's sizes, labels and finger numbers, barres, the capo as its nut, left-handed; the chord card upright (the box with previous, next and the strip of small boxes, the family and position, inversions, the tones on the neck, the numeral), Identify's blank box, and a chord pin tile. *Done when:* the owner has checked the mockups on their phone at arm's length.
- [ ] **T3 — Chord theory.** CHD-1.1's qualities in `fretkit` with their symbols, alternative names and formulas, spelled from every root (CHD-2.1, THY-1.2); inversions and their slash names (CHD-5.1, CHD-5.2); a key's diatonic triads and sevenths with numerals, in a mode too (CHD-1.3, CHD-2.3, building on `diatonicChords`); and naming a shape under a capo (CTX-3.2). Check architecture's **To confirm** item on Tonal.js's chord dictionary. *Done when:* the golden table of every quality on every picker root, in both spellings, passes and has been checked once, by the owner or by an independent script as in M01's T4.
- [ ] **T4 — Voicings.** CHD-3.3 to CHD-3.5, CHD-3.7, CHD-3.9 to CHD-3.11 and CHD-5.2's narrowing in `fretkit`: the chords-db import (decision 4; architecture's **To confirm** on its coverage, fingerings and licence; a `CREDITS.md` row), the voicing model (frets, fingers, barre, family, position), the voicing search for drop 2, drop 3 and shells and for any tuning within CHD-3.9's limits, their order, and `v`'s format (decision 5). *Done when:* every quality has a voicing on every root in standard tuning (CHD-3.7), golden tests cover the computed voicings, every voicing sounds the chord's notes and nothing else, the dataset fits APP-7.2, and the owner has checked the sample.
- [ ] **T5 — Chord box and the chord card.** DIAG-2, DIAG-5.1 and APP-6.4 for the chord box; the Chords list (CHD-1, its key filter as decision 1 says, pinned chords first); the card (CHD-2, CHD-3.1, CHD-3.2, CHD-3.6, CHD-3.8, CHD-4, CHD-5.1, CHD-5.2); strum and block (AUD-2, decision 7); the capo (CTX-3.1, CTX-3.2, DIAG-2.6, decision 8); bass (CTX-2.2); hidden voicings stored and backed up (decision 6, PIN-5.1, PIN-6.1); chord pins and their tiles; and the scale card's diatonic chords becoming links (SCL-5.3). Likely split in two before its first PR, the box and card first, then the list, hiding and pins. *Done when:* every quality opens on every root with voicings that play what they show, on guitar and bass, in standard tuning and Drop D, with and without a capo, checked on the phone.
- [ ] **T6 — Identify.** CHD-6: the blank box on guitar and the fretboard on bass, the names the notes fit simplest first with inversions and slash chords, two notes as an interval, the tuning and capo, `f` in the URL, playing and pinning. Check architecture's **To confirm** item on Tonal.js's chord detection. *Done when:* every voicing in the curated set and the search, in standard tuning, is named back as its own chord among Identify's first names, in a golden test, and the owner has named shapes on the phone.
- [ ] **T7 — Triads.** Decision 9 first. TRI as written, or its string sets on the chord card with TRI retired: each triad's shapes on each set of three adjacent strings across the fret range, labeled by inversion, filtered to one inversion, computed for any tuning, playing as a block chord, guitar only. *Done when:* every triad quality on every root, set and inversion shows in standard tuning and DADGAD, checked against `fretkit` in tests and on the phone.
- [ ] **T8 — Polish, trial and release.** APP-5, APP-6.2 to APP-6.5 and APP-7 checked on the new screens; every in-scope requirement's status up to date; the trial (the Question); the fixes it leads to; the release. *Done when:* the definition of done holds.

## Definition of done

- [ ] Every sub-requirement in scope is `Implemented`, or `Retired` or moved to a later milestone or the backlog, with the reason in its row and in Changes to the plan.
- [ ] `fretkit`'s golden tests cover every chord quality on every root and the computed voicings, checked once (T3, T4).
- [ ] Every chord quality has a voicing on every root in standard tuning (CHD-3.7).
- [ ] The context bar has no key, and every view that uses a key has it in its URL (decision 1).
- [ ] Every new screen loads and plays with the phone in airplane mode after install, and every view's URL reopens it as it was (APP-3.1).
- [ ] Playwright smoke tests pass on a phone viewport for a chord card, Identify, triads and pinning a chord.
- [ ] The trial (the Question) ran for at least a week including a rehearsal or practice session, and its findings are in the Outcome.
- [ ] `architecture.md` describes the app as built, its **To confirm** items on chords settled.
- [ ] v0.2.0 is tagged and deployed; the Outcome is filled in; the roadmap says released, and M03's file is written.

# Outcome

*(Filled in when the milestone closes.)*

## Answer

## What was built

## What we learned

## Changes to the plan

## Follow-ups
