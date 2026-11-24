# Architecture

Fretdex is a static web app with no backend: a SvelteKit site built with `adapter-static`, TypeScript throughout, with the music theory and the audio in framework-free packages so they can be reused (the owner's synth-toy projects) and tested on their own. Everything runs in the browser; only settings, pins and recents are stored, and only on the device.

This describes the intended design. Nothing is built yet; when code proves part of it wrong, fix this file in the same PR.

## Layers

```
 Views (SvelteKit routes)          one route per card; state in the URL
   │ current context (key, instrument, tuning, capo, labels…)
   ▼
 Theory engine (fretkit)           notes, intervals, chords, scales, keys, modes,
   │ notes · positions · voicings    roman numerals, fretboard mapping, positions,
   │                                 voicing search
   ├──────────────► Diagrams        Svelte SVG components: Fretboard, ChordBox,
   │                                 Keyboard, Circle, Staff
   └──────────────► Audio engine    Web Audio voices and a scheduler; later the
                                     tuner's pitch detection
 Storage (IndexedDB)               settings, pins, recents, hidden voicings
```

A view reads the current context and its own URL, asks the theory engine for notes, positions and voicings, and hands them to diagrams to draw and to the audio engine to play. Diagrams and audio never compute theory themselves, so a wrong note is always a `fretkit` bug with a unit test to write.

## Repository layout

npm workspaces in one repository (M01, decision 8):

| Folder | Package | What | Depends on |
|---|---|---|---|
| `app/` | `fretdex` | The SvelteKit app: routes, diagrams, stores, storage, PWA | `fretkit`, `audio` |
| `packages/fretkit/` | `@fretdex/fretkit` | Theory engine: wraps Tonal.js and adds tunings, fretboard mapping, positions, voicing search and the chord-voicing dataset | Tonal.js |
| `packages/audio/` | `@fretdex/audio` | Audio engine: voices (plucked string, bass, electric piano), strum and sequence scheduling, drone, click and metronome, master volume; later pitch detection for the tuner | Web Audio API only |

Neither package imports Svelte or touches the DOM beyond Web Audio (the app opens the microphone and hands the audio package its stream), so both run under Vitest without a browser.

## Tech stack

| Layer | Choice | Why |
|---|---|---|
| App framework | SvelteKit + `adapter-static`, Svelte 5 | Small bundles; fine-grained reactivity suits SVG diagrams; file-based routes map to the URL-as-state design |
| Language | TypeScript (strict) | Theory code is small pure functions; types catch interval and enharmonic bugs |
| Theory | Tonal.js, wrapped by `fretkit` | Notes, intervals, chords, scales, keys, modes and roman numerals. `fretkit` adds what Tonal.js doesn't have: fretboard mapping, CAGED and 3-notes-per-string positions, triad string sets, voicing search |
| Chord voicings | Seeded from an open-source chord dataset (for example chords-db, MIT), trimmed and extended by hand, shipped inside `fretkit` as JSON | Good voicings are taste, not math; computed shapes cover the long tail and alternate tunings |
| Diagrams | Hand-built Svelte SVG components | Full control of the look, left-handed mirroring, tunings and labels |
| Audio | Web Audio API in `@fretdex/audio`; Tone.js only if scheduling gets painful | No sample files |
| State | Svelte stores (runes) for the context and settings; the URL for view state | Nothing global except settings and pins |
| Storage | IndexedDB through `idb-keyval` | Settings, pins, recents |
| Offline and install | `@vite-pwa/sveltekit` (Workbox) | Precaches the whole app; manifest, icons, shortcuts |
| Styling | Plain CSS with custom properties as design tokens, no UI kit; fonts self-hosted, one with ♯ ♭ 𝄪 𝄫 | Small surface, themeable (dark, light, high contrast); no font requests to other sites |
| Testing | Vitest for the packages and app logic; Playwright for a few phone-viewport smoke tests | The theory engine is the part that must be right |
| Tooling | npm workspaces, Node 24, Prettier (4 spaces, 120 columns, single quotes), ESLint with the Svelte plugin, GitHub Actions | As in Moped Finance |
| Hosting | GitHub Pages at `fretdex.seannormoyle.net`, deployed by a GitHub Action on each merge to `main` | No server to run; the personal site is on GitHub Pages too |

## The theory engine (`fretkit`)

- **Pitch and spelling.** Every note is spelled, not just a pitch class: F# major contains E#, not F. Spelling follows the key or the chord's root, with the accidentals setting (CTX-1.6) deciding ambiguous cases (THY).
- **Tuning model.** A tuning is an ordered list of open-string pitches, lowest string first, with octaves (`E2 A2 D3 G3 B3 E4`). Every fretboard computation takes a tuning, so other string counts are a data change. A capo raises every open string for what sounds (THY-3.5), while chord shapes are computed against the open strings and named by shape (CTX-3).
- **Fretboard mapping.** Given a set of notes (a scale, an arpeggio, a chord) and a tuning, list every fret on every string within a fret range, each with its note, interval from the root and scale degree.
- **Positions.** CAGED shapes and 3-notes-per-string patterns for standard guitar tuning, and bass boxes, each a set of fretboard cells. In other tunings only 3-notes-per-string patterns and the full neck apply (SCL-3.6).
- **Voicings.** A chord's voicings come from the curated dataset (standard tuning) and from a voicing search over the fretboard for families (drop 2, drop 3, shells) and for alternate tunings, with playability limits (fret span, open strings, muted strings).
- **Chord identification.** Given frets in a tuning, every chord name the notes fit, simplest first, inversions and slash chords included (Identify, CHD-6).
- **Progressions.** A roman-numeral library, resolved to chords in a key (or mode) by Tonal.js.

## Routes and the URL scheme

Paths name the thing; query parameters hold view options. Global settings stay out of the URL unless a view overrides them (APP-3).

| Route | Example | Query options |
|---|---|---|
| `/` | Home board | — |
| `/chords`, `/chords/[root]/[quality]` | `/chords/A/m7b5` | `v` voicing, `inv` inversion |
| `/chords/identify` | `/chords/identify?f=x32010` | `f` frets, lowest string first |
| `/scales`, `/scales/[root]/[scale]` | `/scales/G/major` | `pos` 1–5 (CAGED) or `nps` 1–7, `labels` |
| `/arpeggios`, `/arpeggios/[root]/[quality]` | `/arpeggios/D/maj7` | `pos` |
| `/triads`, `/triads/[root]/[quality]` | `/triads/C/major` | `set` 1–4 (all four when absent), `inv` |
| `/modes`, `/modes/[root]/[mode]` | `/modes/Fs/dorian` | `compare` |
| `/keys/[key]` (`/keys` redirects to `/circle`) | `/keys/Bb-major` | `sevenths` |
| `/circle` | Circle of fifths | `key` |
| `/progressions`, `/progressions/[slug]` | `/progressions/ii-v-i` | `key`, `bpm` |
| `/intervals`, `/intervals/[interval]`, `/notes/[note]` | `/intervals/b3`, `/notes/Fs` | — |
| `/settings` | Settings, export and import | — |
| `/tuner` (M04) | Tuner | — |
| `/metronome` (M04) | `/metronome?bpm=132&sig=6-8` | `bpm`, `sig`, `sub` |

Any route may also carry `inst`, `tuning` and `capo`, so a pin keeps its own instrument, tuning and capo whatever the global setting is. A custom tuning is written as its pitches (`tuning=D2-A2-D3-G3-A3-D4`), so its URL works on a device that hasn't saved it. Sharps are written `s` in paths (`Fs`); `%23` is accepted too. Each module's list route takes the same filters its list offers (for example `/chords?key=E-minor`).

## Storage

IndexedDB, through `idb-keyval`, holds five things: settings, custom tunings, pins (with groups and order), recents (the last 20 views) and hidden voicings. Each is one versioned record, so a later schema change is a migration in code. The app asks for persistent storage (`navigator.storage.persist()`) when installed; JSON export and import of pins and settings is the backup. Nothing leaves the device.

## Offline and install

The service worker precaches the whole build (app, voicing dataset, icons, fonts), so after the first load the app needs no network. A new version is fetched in the background and applied on the next launch. The manifest gives the app its name, icon, theme colors and, on Android, shortcuts to the top three pins. The app is served from the root of its own subdomain, so it needs no base path and the service worker's scope is the whole origin.

## Audio

`@fretdex/audio` builds voices from oscillators and noise (a Karplus–Strong plucked string for guitar, sine-plus-saw for bass, a simple electric piano for keys) and schedules notes ahead of time on the audio clock, so strums, scale runs and progression loops stay in time. Audio starts only after a user tap (mobile browsers require one), which the first play button provides.

One scheduler runs everything that keeps time: scale runs, progression loops, the click and count-in, and the metronome (M04), which plays under other sounds. The tuner (M04) adds an input side: the app opens the microphone only on the tuner screen and passes its stream to the audio package, whose pitch detector runs on the phone (autocorrelation in an AudioWorklet). Nothing is recorded.

## To confirm

Assumptions from the brief and from what the libraries are known to offer, not yet tested. The milestone's first tasks check them and fix this file:

- Tonal.js covers spelling, chord and scale dictionaries, keys, modes and roman numerals as needed, and has no fretboard, position or voicing logic.
- The chord dataset's voicings are for standard tuning only, so alternate tunings need computed voicings.
- On iPhones, Web Audio is silenced by the ring/silent switch unless the page plays through a media element; check what an installed PWA does.
- `@vite-pwa/sveltekit` precaches an `adapter-static` build, and GitHub Pages serves every route on a fresh load (prerendered pages, or a `404.html` fallback to the app).
- Tonal.js's chord detection names inversions and slash chords well enough for Identify, or `fretkit` adds the ranking.
- chords-db covers the qualities in CHD-1.1, has fingerings, and its licence and notice are as expected.
- A phone's microphone and an autocorrelation pitch detector are accurate down to the bass's low E (M04).
