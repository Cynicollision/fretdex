# Fretdex — Concept Brief

2026-11-23 · Sean Normoyle

> A dated record, not a living doc: the brief Fretdex was planned from, written in a Claude project and copied here as it was. It isn't edited. Where it and the other docs differ, the [vision](vision.md), [requirements](requirements/README.md), [architecture](architecture.md) and [milestones](planning/roadmap.md) win: most of its open questions have since been decided there, and its build plan became milestones. One correction: the first goal's "three or four apps and sites" was an assumption. The owner uses no app or site for this today; the reference is mostly in their head and in books.

## Overview

Fretdex is a personal, ad-free, offline-capable reference for guitar and bass: chords, scales and positions, modes, keys, and progressions in one place, with pins for what I reach for most. It is a lookup tool for a working player, not a course.

**Goals**

- Every reference I currently get from three or four apps and sites, in one place, in every key
- Fast on a phone on a music stand: two taps to any diagram
- Pin anything to a home board
- Hear what's on screen
- Static hosting on my personal site, works offline once installed

**Non-goals**

- Lessons, quizzes, ear training, progress tracking
- Accounts, sync, or any backend
- Instruments beyond 6-string guitar and 4-string bass (the tuning model should not rule them out later)
- Tab or notation editing

## Design principles

1. **Compute, don't enter.** A theory engine generates scales, modes, keys, progressions and fretboard positions for any root and tuning. Hand-curated data is limited to guitar chord voicings, where taste matters.
2. **One context, everywhere.** A global "current key" and display settings carry across every view, so the whole app re-centers on the song I'm playing.
3. **Every view is a URL.** Each card's full state lives in its route and query string. Pins, back-navigation and deep links all fall out of that for free.
4. **Guitar first, piano second.** Fretboard and chord boxes are the hero visuals; piano is a small companion that taps to enlarge.
5. **Phone first, stand-friendly.** Large tap targets, landscape fretboard, no hover-only interactions, readable at arm's length, dark mode by default.
6. **Offline and private.** Installable PWA, no network after first load, no analytics, no accounts.

## Modules

Eight modules ship in v1; each is a list view plus a detail card that can be pinned.

| Module | Detail card shows | Guitar | Bass | Piano mini |
|---|---|---|---|---|
| Chords | Notes, intervals, formula; voicings (open, barre/CAGED, drop 2, drop 3, shell); inversions | Chord boxes, swipe between voicings | Root-position arpeggio shape | Yes |
| Scales & positions | Full neck; 5 CAGED shapes; 7 three-notes-per-string patterns; degree highlighting | Fretboard | Fretboard (one-octave and two-octave boxes) | Yes |
| Arpeggios | Chord tones as a scale filter, same position system | Fretboard | Fretboard | Yes |
| Triads & string sets | Major/minor/dim/aug triads and inversions on each adjacent 3-string set | Fretboard strips | Not applicable | No |
| Modes | Parent scale, characteristic note, brightness order; parallel comparison from one root | Fretboard | Fretboard | Yes |
| Keys & circle of fifths | Interactive circle; key signature, relative minor/major, diatonic triads and 7ths, borrowed chords | Links to chord cards | Links | Signature on staff + keyboard |
| Progressions | Roman-numeral library (I–V–vi–IV, ii–V–I, 12-bar blues, Andalusian, etc.), transposed to current key; play-through | Voicing strip per chord | Root line | Optional |
| Intervals & notes | Interval shapes on the neck, note finder, enharmonics | Fretboard | Fretboard | Yes |

Search across all modules from the top bar: typing "Am7b5", "F# dorian" or "ii V I in Bb" jumps straight to the card.

## Global context and settings

A persistent context bar sets the key and instrument once; every view reads from it.

| Setting | Options | Default |
|---|---|---|
| Current key | Any of 12 roots × major/minor (or any mode) | None (views use their own root) |
| Instrument | 6-string guitar, 4-string bass | Guitar |
| Tuning | Guitar: Standard, Drop D, DADGAD, Open G, Open D, half-step down. Bass: Standard EADG, Drop D, half-step down. Custom string list | Standard |
| Handedness | Right, left (mirrors fretboard and chord boxes) | Right |
| Labels | Note names, intervals (1, b3, 5), scale degrees, none | Intervals |
| Accidentals | Auto by key, prefer sharps, prefer flats | Auto |
| Fret range | Visible frets on the full-neck view | 0–15 |
| Theme | Dark, light, high contrast | Dark |

The tuning model is just an ordered list of open-string pitches, so 5-string bass or 7-string guitar is a data change later, not a redesign. Instrument and tuning switch together: bass hides chord-box voicings and triad string sets and shows root-plus-arpeggio shapes instead.

## Pins and home board

A pin is a saved URL plus a label; the home screen is a reorderable board of pins.

- **Pin anything:** any detail card, or a list filtered to a context ("all chords in E minor"). Pins capture the full state, including position, voicing and labels.
- **Board:** grid of pin tiles with a live mini-render of the diagram, drag to reorder, optional groups ("Gig: Saturday", "Practice", "Bass").
- **Pinned-first lists:** inside each module, pinned items float to the top of the list.
- **Recents:** last 20 views, automatic, for things not worth pinning.
- **Storage:** IndexedDB on the device; the app calls the browser's persistent-storage request at install so pins aren't evicted.
- **Backup:** export and import pins as a JSON file. No sync, by decision.
- **Install:** PWA manifest and service worker, so it gets its own home-screen icon and opens full-screen and offline. Android app shortcuts (long-press the icon) can deep-link to the three top pins.

## Audio

Audio ships in v1: tap to hear anything on screen, synthesized in the browser with no sample files to start.

- **Chords:** strum (low to high, about 30 ms apart) or block; plays the exact voicing shown, at its real octave.
- **Scales, modes, arpeggios:** ascending and descending at a set tempo, with the playing note highlighted on the fretboard.
- **Progressions:** loop the progression at a set BPM, one bar per chord, as a backing drone to jam over.
- **Fretboard and keyboard taps:** tapping any dot or key plays that note.
- **Drone:** sustain the current key's root (and optional fifth) for modal practice.
- **Voices:** a plucked-string voice (Karplus–Strong) for guitar, a rounder sine-plus-saw voice for bass, a simple electric-piano voice for keys. Sampled instruments are a later option.
- **Controls:** master volume, tempo, and a global mute. iOS and Android need a user tap to unlock audio, which the first play button handles.

## Architecture

Every view reads one theory engine; nothing needs a server. Four layers, no backend, in an installed PWA on the phone that runs offline:

- **Views** (SvelteKit routes): home board, chords, scales, modes, keys, progressions; each view's state lives in its URL.
- **Diagram components** (SVG: fretboard, chord box, keyboard, circle, staff), the **audio engine** (`@audio`: Web Audio voices, strum, scale playback, loops, drone) and **context and settings** (current key, instrument, tuning, labels, handedness).
- **Theory engine** (`fretkit`): Tonal.js core plus fretboard mapping, CAGED and 3NPS positions, transposition, roman numerals, bundled chord-voicing JSON.
- **IndexedDB on the device:** pins, recents, settings; JSON export as backup.

A static host (the personal site, no backend) serves it, and the service worker caches it on first load.

Views pass the current context into the theory engine and get back notes, positions and voicings; diagrams draw them and the audio engine plays them. Only pins and settings are stored, and only on the device.

## Tech stack

Decision: SvelteKit built as a static site, TypeScript throughout, with the theory and audio logic in framework-free packages.

| Layer | Choice | Why |
|---|---|---|
| App framework | SvelteKit + adapter-static | Small bundles, fine-grained reactivity suits SVG diagrams; file-based routes map to the URL-as-state design; a deliberate step outside Angular |
| Language | TypeScript (strict) | Theory code is all small pure functions; types catch interval and enharmonic bugs |
| Theory | Tonal.js, wrapped in a local `fretkit` package | Mature notes/intervals/chords/scales/keys/modes/roman numerals; the wrapper adds fretboard mapping, CAGED and 3NPS position logic, voicing search |
| Chord voicings | Seeded from an open-source JSON chord dataset (e.g. chords-db, MIT), trimmed and extended by hand | Good voicings are taste, not math; computed shapes cover the long tail |
| Diagrams | Hand-built Svelte SVG components: Fretboard, ChordBox, Keyboard, Circle, Staff (key signature) | Full control over the look; libraries box you in on left-handed, tunings, labels |
| Audio | Web Audio API in a local `@audio` package; Tone.js only if scheduling gets painful | Shares ideas with the synth-toy projects; zero sample files |
| State | Svelte stores for context; URL for view state | Nothing global except settings and pins |
| Storage | IndexedDB via a tiny wrapper (idb-keyval) | Pins, settings, recents |
| Offline / install | @vite-pwa/sveltekit (Workbox) | Precache the whole app; manifest, icons, shortcuts |
| Styling | Plain CSS with custom properties (design tokens), no UI kit | Small surface, themeable for dark/light/high contrast |
| Testing | Vitest for theory/audio packages; Playwright for a few mobile-viewport smoke tests | The theory engine is the part that must be right |
| Hosting | Static files under a path or subdomain on my personal site | No backend, no NAS |

The `fretkit` and `@audio` packages live in the same repo as workspaces so they can be reused by the synth toys later.

## Routes and URL scheme

Paths name the thing; query parameters hold view options. Global settings are not in the URL unless a pin overrides them.

| Route | Example | Query options |
|---|---|---|
| `/` | Home board | — |
| `/chords/[root]/[quality]` | `/chords/A/m7b5` | `v` voicing index, `inv` inversion |
| `/scales/[root]/[scale]` | `/scales/G/major` | `pos` 1–5 (CAGED) or `nps` 1–7, `labels` |
| `/arpeggios/[root]/[quality]` | `/arpeggios/D/maj7` | `pos` |
| `/triads/[root]/[quality]` | `/triads/C/major` | `set` 1–4 (string set), `inv` |
| `/modes/[root]/[mode]` | `/modes/F%23/dorian` | `compare` (parallel modes) |
| `/keys/[key]` | `/keys/Bb-major` | `sevenths` |
| `/circle` | Circle of fifths | `key` highlight |
| `/progressions/[slug]` | `/progressions/ii-v-i` | `key`, `bpm` |
| `/settings` | Settings, export/import | — |

Any route may also carry `tuning` and `inst` so a pin like "Drop D riff shapes" or a bass pin keeps its own instrument regardless of the global setting. Sharps are written as `%23` or `s` (`Fs`) in URLs.

## Build plan

Five phases, each ending in something usable on the phone.

1. **Foundation.** Repo with app plus `fretkit` and `@audio` workspaces; Fretboard and Keyboard components; tuning model for guitar and bass; settings store; PWA install working on the static host.
2. **Scales, modes, arpeggios.** Full-neck view, CAGED and 3NPS positions, label modes, parallel mode compare; tap-to-play notes and scale playback.
3. **Chords and triads.** Voicing dataset import, ChordBox component, voicing swipe, inversions, triad string sets; strum playback.
4. **Keys, circle, progressions.** Interactive circle, key detail with diatonic chords, progression library transposed to the current key; progression loop and drone.
5. **Pins and polish.** Home board, pinned-first lists, recents, search bar, export/import, app shortcuts, left-handed mode, themes, accessibility pass.

Pins could move earlier (after phase 2) if I want to use the app on stage before chords land.

## Open questions and risks

- **Personal site stack:** what serves it today, and does the app live at a subpath (`/guitar`) or a subdomain? A subpath needs SvelteKit's `paths.base` set and a scoped service worker.
- **Voicing curation effort:** the dataset will have voicings I'd never play. Budget time to trim it, or add a "hide" action on voicings in-app.
- **Position systems:** CAGED and 3NPS only, or also a 5-box pentatonic system and "one-octave" boxes for bass?
- **Progression library scope:** how many progressions to seed, and whether to allow saving my own (stored like pins).
- **Audio realism:** synthesized plucks may sound toy-like; samples would add a few MB to the offline cache.
- **Storage eviction:** browsers can still clear storage in edge cases; JSON export is the safety net.
- **Svelte learning curve:** new framework plus Svelte 5's runes model; phase 1 doubles as the learning spike.
