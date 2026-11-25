# Architecture

Fretdex is a static web app with no backend: a SvelteKit site built with `adapter-static`, TypeScript throughout, with the music theory and the audio in framework-free packages so they can be reused (the owner's synth-toy projects) and tested on their own. Everything runs in the browser; only settings, pins and recents are stored, and only on the device.

The repository layout, tech stack, tooling, hosting and styling below are built (M01 T1 to T3), and so are the theory engine's pitch, spelling and tuning model (T4) storage, settings and the context bar (T5), and the app shell and URLs (T6); the rest describes the intended design. When code proves part of it wrong, fix this file in the same PR.

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

The packages have no build step: each exports its TypeScript source (`"exports": { ".": "./src/index.ts" }`), and the app's Vite compiles it with the app. That's enough while they're unpublished (M01, decision 9); publishing them for the synth toys would add a build to `dist/`. The app is SvelteKit 3, whose configuration lives in the `sveltekit()` plugin's options in `app/vite.config.ts` (there's no `svelte.config.js`), and the root holds the shared tooling: Prettier, ESLint and the base `tsconfig.base.json` the packages extend.

## Tech stack

| Layer | Choice | Why |
|---|---|---|
| App framework | SvelteKit 3 + `adapter-static`, Svelte 5 in runes mode, Vite 8; screens and lists prerendered, cards drawn in the browser from the fallback page ([Routes](#routes-and-the-url-scheme)) | Small bundles; fine-grained reactivity suits SVG diagrams; file-based routes map to the URL-as-state design |
| Language | TypeScript 6 (strict, with `noUncheckedIndexedAccess`) | Theory code is small pure functions; types catch interval and enharmonic bugs. Not TypeScript 7 yet: `svelte-check` and `typescript-eslint` support up to 6 |
| Theory | Tonal.js, wrapped by `fretkit` | Notes, intervals, chords, scales, keys, modes and roman numerals. `fretkit` adds what Tonal.js doesn't have: fretboard mapping, CAGED and 3-notes-per-string positions, triad string sets, voicing search |
| Chord voicings | Seeded from an open-source chord dataset (for example chords-db, MIT), trimmed and extended by hand, shipped inside `fretkit` as JSON | Good voicings are taste, not math; computed shapes cover the long tail and alternate tunings |
| Diagrams | Hand-built Svelte SVG components | Full control of the look, left-handed mirroring, tunings and labels |
| Audio | Web Audio API in `@fretdex/audio`; Tone.js only if scheduling gets painful | No sample files |
| State | Svelte stores (runes) for the context and settings; the URL for view state | Nothing global except settings and pins |
| Storage | IndexedDB through `idb-keyval` | Settings, pins, recents |
| Offline and install | `@vite-pwa/sveltekit` (Workbox), wrapping SvelteKit's Vite plugin (`withPwa` in `app/vite.config.ts`) | Precaches the whole app; manifest, icons, shortcuts |
| Styling | Plain CSS with custom properties as design tokens, no UI kit; Atkinson Hyperlegible Next, with ♯ ♭ 𝄪 𝄫 from a small cut of Noto Music, both self-hosted ([Styling](#styling)) | Small surface, themeable (dark, light, high contrast); no font requests to other sites; letters and digits that stay distinct at arm's length |
| Testing | Vitest for the packages and app logic, and for components in a real Chromium (browser mode); Playwright for a few smoke tests on Android and iPhone viewports | The theory engine is the part that must be right; diagrams need real layout to test |
| Tooling | npm workspaces, Node 24, Prettier (4 spaces, 120 columns, single quotes), ESLint with type-checked `typescript-eslint` and the Svelte plugin, GitHub Actions | As in Moped Finance |
| Hosting | GitHub Pages at `fretdex.seannormoyle.net`, deployed by the CI workflow's `build-pages` and `deploy` jobs on each merge to `main` ([deployment.md](deployment.md)) | No server to run; the personal site is on GitHub Pages too |

## The theory engine (`fretkit`)

- **Pitch and spelling.** Every note is spelled, not just a pitch class: F# major contains E#, not F (THY). A note is a string in Tonal.js's form (`F#`, `Bbb`, `E2`), read from what users type and URLs carry by `parseNote` and shown by `noteLabel` (`note.ts`). `SCALE_TYPES` (`scale.ts`) lists every scale by its intervals, and `spellScale` spells one from its root through Tonal.js. `root.ts` decides which spelling a root takes from the accidentals setting (CTX-1.6): on Auto, by the key signature each scale is read in (`signatureFrom`). Spelling every scale on every root is the golden table, `packages/fretkit/golden/scales.md`.
- **Tuning model.** A tuning is an ordered list of open-string pitches, lowest string first, with octaves (`E2 A2 D3 G3 B3 E4`), at the pitch they sound (`TUNINGS` in `tuning.ts`). Every fretboard computation takes a tuning, so other string counts are a data change. Frets are counted from the nut with or without a capo: a capo only rules out the frets below it, and `openStrings` gives what the open strings sound with it (THY-3.5), while chord shapes are computed against the open strings and named by shape (CTX-3).
- **Fretboard mapping.** `mapScale` (`fretboard.ts`) lists every fret in a range where a scale's notes fall, on any tuning and capo, each with its note spelled as the scale spells it, its octave, its interval from the root and its degree.
- **Positions.** CAGED shapes and 3-notes-per-string patterns for standard guitar tuning, and bass boxes, each a set of fretboard cells. In other tunings only 3-notes-per-string patterns and the full neck apply (SCL-3.6).
- **Voicings.** A chord's voicings come from the curated dataset (standard tuning) and from a voicing search over the fretboard for families (drop 2, drop 3, shells) and for alternate tunings, with playability limits (fret span, open strings, muted strings).
- **Chord identification.** Given frets in a tuning, every chord name the notes fit, simplest first, inversions and slash chords included (Identify, CHD-6).
- **Progressions.** A roman-numeral library, resolved to chords in a key (or mode) by Tonal.js.

## Routes and the URL scheme

Paths name the thing; query parameters hold view options. Global settings stay out of the URL unless a view overrides them (APP-3).

| Route | Example | Query options |
|---|---|---|
| `/` | Home board, with the modules under it (APP-1.2) | — |
| `/modules` | The modules and tools (APP-1.1) | — |
| `/chords`, `/chords/[root]/[quality]` | `/chords/A/m7b5` | `v` voicing, `inv` inversion |
| `/chords/identify` | `/chords/identify?f=x32010` | `f` frets, lowest string first |
| `/scales`, `/scales/[root]/[scale]` | `/scales/G/major` | `pos` 1–5 (CAGED) or `nps` 1–7, `labels` |
| `/arpeggios`, `/arpeggios/[root]/[quality]` | `/arpeggios/D/maj7` | `pos`, `labels` |
| `/triads`, `/triads/[root]/[quality]` | `/triads/C/major` | `set` 1–4 (all four when absent), `inv` |
| `/modes`, `/modes/[root]/[mode]` | `/modes/Fs/dorian` | `pos` or `nps`, `labels`, `compare` |
| `/keys/[key]` (`/keys` redirects to `/circle`) | `/keys/Bb-major` | `sevenths` |
| `/circle` | Circle of fifths | `key` |
| `/progressions`, `/progressions/[slug]` | `/progressions/ii-v-i` | `key`, `bpm` |
| `/intervals`, `/intervals/[interval]`, `/notes/[note]` | `/intervals/b3`, `/intervals/s4`, `/notes/Fs` | — |
| `/settings` | Settings, export and import | — |
| `/tuner` (M04) | Tuner | — |
| `/metronome` (M04) | `/metronome?bpm=132&sig=6-8` | `bpm`, `sig`, `sub` |

Any route may also carry `inst`, `tuning` and `capo`, so a pin keeps its own instrument, tuning and capo whatever the global setting is. A built-in tuning is written by its id (`tuning=drop-d`) and a custom one as its pitches (`tuning=D2-A2-D3-G3-A3-D4`), so its URL works on a device that hasn't saved it; pitches with no `inst` give the instrument with that many strings. Sharps are written `s` in paths (`Fs`); `%23` is accepted too. Each module's list route takes the same filters its list offers (for example `/chords?key=E-minor`).

So far the routes of M01 are built, with the module lists and cards as text until their tasks draw them (`CardSketch.svelte`). Everything about reading and writing URLs is in `app/src/lib/url/`:

- **Cards.** `routes.ts` reads a card's path into a `Card` (`readScaleCard` and the like), writes it back (`cardPath`) and names it (`cardTitle`); `href.ts` gives a card's link through SvelteKit's `resolve`. A card route's `load` (`cardLoad` in `load.ts`) shows Not found for a path it can't read (`+error.svelte`, APP-3.5), and redirects any other spelling to the one the app writes (`%23` and `#` to `s`, a mode under `/scales` to `/modes`, MODE-1.7). Any spelling of a root is read, so a linked root opens as written (THY-2.5).
- **Rendering.** Home, Settings, Modules and the module lists are prerendered. Cards aren't, as every root makes hundreds of them: a card route sets `prerender` and `ssr` off, and is drawn in the browser from `adapter-static`'s fallback page, `404.html`, which GitHub Pages serves for any path it has no file for (with a 404 status, which browsers ignore). A card therefore blinks blank on a first load until the app's JavaScript runs.
- **Query.** `readViewOptions` reads a card's options (`pos`, `nps`, `labels`, `compare`) and `context.ts` the override (`readOverride`). Once the page has hydrated and the settings have loaded, the root layout rewrites the query as the app would write it (`canonicalQuery`), so an option it can't read, or doesn't know, leaves the URL. Changing an option replaces the history entry (`setViewOption` in `navigate.ts`, APP-3.2).
- **The override** shows in the context bar, which offers to clear it (APP-2.3); views read `viewContext`, the override where there is one and the settings elsewhere.
- **Back.** `BackLink.svelte` goes back in the browser's history when the previous entry is one of the app's (the Navigation API's `canGoBack`, or else any history at all), and otherwise follows its link, the card's module list (APP-1.3).
- **The wake lock** (`wake-lock.ts`) is held while **Keep screen awake** is on and taken again each time the app is shown, as the browser drops it when the app is hidden (APP-5.5).

The root layout puts the context bar (`ContextBar.svelte` in `app/src/lib/components/`) at the top of every route and the bottom bar (`BottomBar.svelte`: Home and Modules) at the bottom. Its sheet (`ContextSheet.svelte`) sets the key, instrument, tuning and capo straight into the settings, so whatever screen is open follows at once (APP-2.2); custom tunings are entered there (`TuningEditor.svelte`) and managed on Settings.

## Storage

IndexedDB, through `idb-keyval` (`idbStore` in `app/src/lib/storage/idb.ts`: a `records` object store in a `fretdex` database), holds five things: settings, custom tunings, pins (with groups and order), recents (the last 20 views) and hidden voicings. So far settings and custom tunings are stored. Nothing leaves the device.

- **Versioned records.** Each thing is one record, stored with its format's version (`loadRecord` and `saveRecord` in `storage/record.ts`). Loading migrates an older record forward a step at a time, then reads it field by field, so anything missing or invalid takes its default rather than stopping the app. A record written by a newer version (a tab not yet updated) is read as far as this version understands it and never saved over. If IndexedDB is unavailable, or a migration can't read a record, the app runs on its defaults; if a save fails, the change still applies until the app closes.
- **Settings.** `Settings` and its record format, `SETTINGS_FORMAT`, are in `settings/settings.ts`, which also switches instrument (CTX-2.1) and matches a tuning to a built-in one by its pitches, however they're spelled (`builtInTuning`). The selected tuning is stored as its pitches, not a name. `SettingsStore` (`settings/store.svelte.ts`) holds them as runes state: the `settings` it exports loads them once asked (`ready`) and saves every change, and a change made before they've loaded waits for them (a change that depends on another setting is given as a function of the settings, so it reads them as loaded). Views read `settings.current`, which holds the defaults until the stored settings arrive.
- **Custom tunings** are a second record, `customTunings` (`CUSTOM_TUNINGS_FORMAT` in `settings/tunings.ts`): each instrument's saved tunings, up to 10, each with an id that outlasts renames, a name and its pitches. `CustomTuningsStore` (`settings/tunings.svelte.ts`) works as `SettingsStore` does. A tuning's name is a built-in one's, else a saved one's with the same pitches, else "Custom" (`tuningName`), so deleting the tuning in use leaves it in use as "Custom".
- **Loading after hydration.** Home, Settings and the lists are prerendered with the defaults, and Svelte keeps a prerendered page's text as it was when it hydrates it, so stored values that arrived before hydration would never show. So the stores load nothing until asked: the root layout calls `ready()` on both in `onMount`, once the page has hydrated, and the stored values then arrive as an ordinary change. The context bar stays blank until they have, rather than showing the defaults.
- **The theme** is also copied into `localStorage` (`applyTheme` in `settings/theme.ts`), because IndexedDB can't be read before the first paint: a script in `app.html` sets `data-theme` from the copy, so a Light or High contrast theme shows from the first frame. The root layout then applies the stored theme and sets the `theme-color` meta to the theme's `--bg`.
- **Persistent storage.** Running installed, the app asks the browser to keep its storage (`navigator.storage.persist()`, in `storage/persist.ts`), and Settings says whether it did (PIN-6.2). JSON export and import of pins and settings is the backup (PIN-5).

## Offline and install

The service worker precaches the whole build (app, voicing dataset, icons, fonts), so after the first load the app needs no network. When the app opens with a network and a new version has been deployed, the new service worker installs in the background, takes over and reloads the app (`registerType: 'autoUpdate'`), so a launch picks up the new version within seconds. The root layout (`src/routes/+layout.svelte`) registers the service worker and adds the manifest's link. A navigation the service worker hasn't precached, such as any card, gets the fallback page, `404.html`, which is precached too (`kit.adapterFallback` and `spa` in `app/vite.config.ts`), so every route opens offline. The manifest gives the app its name, icon, theme colors and, on Android, shortcuts to the top three pins. The app is served from the root of its own subdomain, so it needs no base path and the service worker's scope is the whole origin.

## Styling

- **Tokens.** `app/src/lib/styles/tokens.css` holds every colour, the font stack, the type scale (14, 16, 18, 22 and 28px, as `rem` so the system text size applies) and the 44px tap target. `:root` is the Dark theme; `data-theme="light"` or `"contrast"` on `<html>` swaps the colours, set from the theme setting (CTX-1.8, [Storage](#storage)). The diagram colours are tokens too (`--neck`, `--fret`, `--note`, `--root` and so on), so a theme repaints the diagrams. `tokens.spec.ts` checks every text pair's contrast against APP-6.2.
- **Fonts.** Atkinson Hyperlegible Next comes from its Fontsource package, imported in the root layout. It has no musical signs, and no text font checked had 𝄪 and 𝄫, so `fonts.css` adds Fretdex Accidentals: Noto Music's ♭ ♮ ♯ 𝄪 𝄫, raised to sit beside capitals and given Atkinson's line metrics, with a `unicode-range` of just those five. It's made by `app/scripts/make-accidentals-font.py` and committed. Both are bundled into `_app/` (the accidentals inlined in the CSS) and precached.
- **The look.** A charcoal page, a rosewood neck with nickel frets, bone dots and an amber root in Dark; a maple neck with dark dots in Light; black, white and yellow in High contrast. The root is a square and other notes circles (DIAG-1.7), and frets narrow gently up the neck (DIAG-1.8). The pin tiles' sizes are in [M01-design.md](planning/milestones/M01-design.md) until T12 builds them.
- **Diagrams** are SVG drawn by Svelte components in `app/src/lib/components/`, laid out by plain functions in `app/src/lib/diagrams/` that the `logic` tests check. A diagram takes a `NoteSet` (a scale, an arpeggio from `noteSet`, or a lone note) and asks `fretkit` where it falls (`mapScale`, `mapKeyboard`); it never works out a note itself. Each has a visually hidden caption as its text alternative (APP-6.4).
  - `Fretboard.svelte`: strings 44 apart, the lowest at the bottom, with an open-strings column 40 wide left of a 7-wide nut; dots 30 across with 14px labels; inlays, and fret numbers below the neck at the inlay frets. Each fret is 0.98 the width of the one below (`fretWidths`), easing toward even rather than go under the 44px tap target. When the whole fret range fits at that width, as on a phone turned sideways, it's all shown; otherwise, as upright, a stretch of up to six frets with Lower and Higher, over `NeckStrip.svelte`, the whole range in small with its roots, which moves the stretch where it's tapped (DIAG-1.10). Which one is decided by the width available, not the phone's orientation, so a wide window shows the whole neck too; a card's `Screen` is `wide` (72rem) to give it room. Left-handed, every x is mirrored and nothing else changes, so labels stay upright (DIAG-1.5). A capo is a bar in `--nut` across its fret, the frets below it dimmed and empty, and the notes it frets drawn on it (DIAG-1.9). A tap is reported with the fret, its pitch and its note, spelled as a lone note when the set hasn't one (`ontap`, DIAG-1.6).
  - `Keyboard.svelte`: two octaves from C3, a white key a fourteenth of the width and black keys 0.6 as wide and 0.62 as tall. A key's mark is in the other key colour (`--key-black` on white keys, `--key-white` on black) so it shows in every theme. Small in a card; tapped, it fills the width with labels in two rows, black keys' above white keys', so neighbours never collide (DIAG-3.1).
  - `FretboardMini.svelte`: the pin tile's 150 by 72 fretboard, hairlines and unlabelled dots (DIAG-5.1).
- **The icon** is `app/static/icon.svg`, a chord box in the Dark theme's colours; `app/scripts/draw-icons.ts` draws the PNGs from it.

## Audio

`@fretdex/audio` builds voices from oscillators and noise (a Karplus–Strong plucked string for guitar, sine-plus-saw for bass, a simple electric piano for keys) and schedules notes ahead of time on the audio clock, so strums, scale runs and progression loops stay in time. Audio starts only after a user tap (mobile browsers require one), which the first play button provides.

One scheduler runs everything that keeps time: scale runs, progression loops, the click and count-in, and the metronome (M04), which plays under other sounds. The tuner (M04) adds an input side: the app opens the microphone only on the tuner screen and passes its stream to the audio package, whose pitch detector runs on the phone (autocorrelation in an AudioWorklet). Nothing is recorded.

## To confirm

Assumptions from the brief and from what the libraries are known to offer, not yet tested. The milestone's first tasks check them and fix this file:

- Tonal.js's chord dictionary and roman numerals cover what M02 and M03 need. (T4 confirmed it spells notes, intervals, scales, keys and modes, double sharps and flats included, and has no tunings or fretboard, position or voicing logic.)
- The chord dataset's voicings are for standard tuning only, so alternate tunings need computed voicings.
- On iPhones, Web Audio is silenced by the ring/silent switch unless the page plays through a media element; check what an installed PWA does.
- GitHub Pages serves `404.html` for a card's path on a fresh load as `app/scripts/serve-build.ts` does in the smoke tests, which also check that every route opens offline. Checked on the owner's phone once T6 is deployed. (T2 confirmed that `@vite-pwa/sveltekit` 2 works with SvelteKit 3 and precaches the `adapter-static` build.)
- Tonal.js's chord detection names inversions and slash chords well enough for Identify, or `fretkit` adds the ranking.
- chords-db covers the qualities in CHD-1.1, has fingerings, and its licence and notice are as expected.
- A phone's microphone and an autocorrelation pitch detector are accurate down to the bass's low E (M04).
