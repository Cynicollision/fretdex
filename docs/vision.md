# Vision

Fretdex is a personal, ad-free, offline-capable reference for guitar and bass: chords, scales and positions, modes, keys and progressions in one place, with pins for what the owner reaches for most. It is a lookup tool for a working player, not a course.

Today the owner has no app or site for this. Most of the reference lives in their head, backed by comprehensive books such as the *Keyboard & Guitar Grimoire*, which don't sit on a music stand or answer "this, in F#, in Drop D" in two taps. Fretdex puts that reference on the phone. It's built for one person first, the owner, and published as a static site anyone can install.

Written from the [concept brief](concept-brief.md) of 2026-11-23.

## Who it's for

A player who already knows what they're looking for and wants it now: on a phone, on a music stand, mid-rehearsal, in a key someone just called out. They know what a Dorian mode or a drop 2 voicing is; they want to see it on the neck in F# and hear it.

## Goals

1. **Every reference in one place, in every key.** What today is memory and a shelf of reference books, on the phone.
2. **Fast on a phone on a music stand:** two taps from the home board to any diagram.
3. **Pin anything** to a home board.
4. **Hear what's on screen.**
5. **Static hosting** on the owner's personal site, at `fretdex.seannormoyle.net`, working offline once installed.
6. **Tune and keep time** in the same app, after version 1: a tuner and a metronome, so the stand needs nothing else.

## Non-goals

- Lessons, quizzes, ear training, progress tracking. (A tuner and a metronome are tools for playing, not training.)
- Accounts, sync, or any backend.
- Instruments beyond 6-string guitar and 4-string bass. The tuning model must not rule them out later.
- Tab or notation editing.

## Design principles

Every requirement and design decision is checked against these. When two pull against each other, the earlier one usually wins.

1. **Compute, don't enter.** A theory engine generates scales, modes, keys, progressions and fretboard positions for any root and tuning. Hand-curated data is limited to guitar chord voicings, where taste matters.
2. **One context, everywhere.** A global "current key" and display settings carry across every view, so the whole app re-centers on the song being played.
3. **Every view is a URL.** Each card's full state lives in its route and query string. Pins, back navigation and deep links all fall out of that.
4. **Guitar first, piano second.** Fretboard and chord boxes are the hero visuals; piano is a small companion that taps to enlarge.
5. **Phone first, stand-friendly, upright.** Every screen works with the phone held upright; turning it may show more, such as the whole neck, but is never needed. A screen that would need turning is discussed with the owner before it's built. Large tap targets, no hover-only interactions, readable at arm's length, dark by default.
6. **Offline and private.** Installable PWA, no network after first load, no analytics, no accounts. The microphone is used only by the tuner, and nothing it hears leaves the phone.

## What "version 1" means

All eight modules (chords, scales and positions, arpeggios, triads and string sets, modes, keys and the circle of fifths, progressions, intervals and notes), Identify (naming a chord from its frets), the global context and settings with a capo, pins and the home board, search, and audio, installed on the owner's phone from `fretdex.seannormoyle.net` and used at rehearsals and gigs as the owner's reference.

It's built in three milestones, each released and used on the phone along the way: scales, modes, arpeggios, intervals and pins first ([M01](planning/milestones/M01-foundation-and-scales.md), v0.1.0), then chords and triads (M02), then keys, progressions and search (M03, v1.0.0). The tuner and metronome follow (M04); version 1 leaves room for them in the navigation, the audio engine and the privacy rules.

## Later, not never

Things the design leaves room for without building them in v1: 5-string bass and 7-string guitar (a tuning is just a list of strings), sampled instruments, saving your own progressions, other position systems, and reusing `fretkit` and the audio package in the owner's synth-toy projects.
