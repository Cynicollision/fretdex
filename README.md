# Fretdex

A personal, ad-free, offline reference for guitar and bass: chords, scales and positions, triads, modes, keys and the circle of fifths, and progressions, in every key and tuning, with pins for what you reach for most. It's a lookup tool for a working player, not a course.

> **Status:** early development. So far there are scales and modes, with pins on the home board. Version 1 is built in three milestones, starting with [M01](docs/planning/milestones/M01-foundation-and-scales.md); what the app does is in [docs/requirements/](docs/requirements/README.md). It lives at `fretdex.seannormoyle.net`.

## What it will do

- **Look anything up in two taps** on a phone on a music stand: a chord's voicings, a scale's positions on the neck, a key's diatonic chords, a progression in your key.
- **Re-center on the song you're playing.** Set the key and instrument once and every view follows.
- **Name what you're playing**: set frets on a chord box and see every chord name they fit.
- **Play with a capo**: shapes named as you play them, with what they sound.
- **Pin anything** to a home board, with live mini diagrams, groups and recents.
- **Hear what's on screen**: strummed chords, scales played up and down, and progressions looped at a tempo.
- **Work offline and stay private**: an installable web app with no accounts, no analytics and no network after the first load.

Guitar (6 strings) and bass (4 strings), in standard and alternate tunings, right- or left-handed. A tuner and a metronome follow version 1.

## Docs

- [Vision](docs/vision.md): goals, non-goals and design principles
- [Architecture](docs/architecture.md): packages, layers, tech stack, routes
- [Development](docs/development.md): setting up, running and testing it locally
- [Requirements](docs/requirements/README.md): what the app does, by domain, with stable IDs
- [Roadmap](docs/planning/roadmap.md): version 1's plan, one line per milestone
- [Backlog](docs/planning/backlog.md): everything outside the current milestone
- [Concept brief](docs/concept-brief.md): the original brief, kept as written

Built with SvelteKit (static), TypeScript, Tonal.js and the Web Audio API. MIT licence (see [LICENSE](LICENSE)); third-party credits are in [CREDITS.md](CREDITS.md).
