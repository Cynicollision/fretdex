# M01 — Foundation and scales

Status: in progress. Release: v0.1.0.

# Plan

## Question

Can Fretdex be the owner's scale, mode and arpeggio reference on their phone, installed from `fretdex.seannormoyle.net`, on a music stand, offline?

"Yes" means: for at least a week that includes a rehearsal or practice session, the owner looked up scales, modes, arpeggios, intervals and notes in Fretdex rather than working them out from memory or a reference book; every card they opened was right (no wrong note, spelling or position found); any card was two taps from the home board, through a pin or a module's list; and it worked with the phone in airplane mode. Anything they still had to work out or look up elsewhere, within this milestone's scope, is listed in the Outcome. "Not yet" is an answer too, if the Outcome says what was missing.

## Scope

In:

- The repository as in [architecture.md](../../architecture.md): the app plus the `fretkit` and audio packages, CI, and the docs that describe them (`conventions.md`, `development.md`, `testing.md`, `deployment.md`).
- Deploying to `fretdex.seannormoyle.net` on every merge to `main`, and installing on the owner's phone.
- Requirements: THY; CTX, capo included; APP (the shell, URLs, install and offline, stand use, themes, accessibility, speed, browsers); DIAG-1, DIAG-3 and DIAG-5; SCL, MODE, ARP and INT; PIN, including Android shortcuts (APP-4.4); and audio for what this milestone shows: AUD-1, AUD-3, AUD-4, AUD-6 and AUD-7.
- The trial (the Question), and the fixes it leads to.

Out (and where it goes instead):

- Chords, triads, chord boxes (DIAG-2), Identify, and strummed audio (AUD-2): M02. Until then, links to chord cards (ARP-1.5, MODE-1.5) show the chord's name without a link.
- Keys and the circle (DIAG-4), progressions and their loop (AUD-5), and search (SRCH): M03, which releases v1.0.0. Until then, the bottom bar's Search slot is left out.
- The click and count-in (AUD-1.5) arrive with progressions in M03; the tuner and metronome in M04. This milestone builds what they rest on: their places in the navigation, the audio scheduler and the global tempo.
- Everything in the vision's non-goals, and everything in the backlog's Parked and Ideas.

## Decisions taken in this plan

From the concept brief (2026-11-23) and the planning session of 2026-11-24; each is cheap to change before its task starts.

1. **Documents.** The vision says why and what not; the requirements say what the app does; `architecture.md` says how it's built; this file says what to build in what order and how it went. The [concept brief](../../concept-brief.md) is a dated record.
2. **Milestones and releases**, as in the owner's other projects: version 1 is built in three milestones, each answering its own question and ending in a release. M01 is v0.1.0, M02 (chords and triads) v0.2.0, M03 (keys, progressions, search, and the full trial) v1.0.0. The tuner and metronome follow as M04 (v1.1.0). `main` is deployed on every merge; only releases are tagged.
3. **Stack** as in `architecture.md`: SvelteKit with `adapter-static`, Svelte 5, strict TypeScript, Tonal.js wrapped by `fretkit`, Web Audio, `idb-keyval`, `@vite-pwa/sveltekit`, plain CSS tokens, Vitest and Playwright.
4. **Theory is tested first.** Every `fretkit` behavior has a unit test named after its requirement ID before a diagram draws it, and a golden table covers every key's scale on all 12 roots.
5. **No backend, no network.** Nothing in this milestone may need a server beyond static hosting.
6. **Hosting.** GitHub Pages for this repository, deployed by a GitHub Action on each merge to `main`, at the custom domain `fretdex.seannormoyle.net` (a CNAME record pointing at `cynicollision.github.io`). Served from the root of its own origin, so there's no base path and the service worker's scope is the whole site.
7. **Repository.** Public, under the MIT licence, like Moped Finance. Every third-party library, dataset, font or image that ships is credited in `CREDITS.md`, with any notice its licence asks for.
8. **Workspaces and tooling.** npm workspaces (`app/`, `packages/fretkit/`, `packages/audio/`), Node 24, Prettier with Moped Finance's settings (4 spaces, 120 columns, single quotes), ESLint with the Svelte plugin, and GitHub Actions running lint, type check, unit tests and a Playwright smoke test on each PR.
9. **Package names.** `@fretdex/fretkit` and `@fretdex/audio`, unpublished; renamed if the synth toys ever import them from npm.
10. **A design pass first.** Before the diagram components, a short task settles the look: tokens for the three themes, the type scale, and the fretboard (landscape and portrait, APP-Q2), the keyboard and a pin tile as static SVG mockups, checked on the phone at arm's length.
11. **Open questions have defaults.** A requirement's open question is built as its default unless the owner decides otherwise, at the latest when the task that needs it starts.

## How to work on a task

1. Read `CLAUDE.md`, this file, `architecture.md` and the task's requirements.
2. Branch `claude/<short-kebab-summary>` from an up-to-date `main`. One PR per task; split a task here (T5a, T5b) before its first PR if it's more than one session.
3. Name tests after their requirement IDs.
4. Try anything the screen shows on a phone-sized viewport, and on the owner's phone once deploys work.
5. In the PR: tick the task, add a *Changed while doing it* note under it, update requirement statuses, credit anything third-party in `CREDITS.md`, and correct `architecture.md` where the code proved it wrong.
6. Let the owner review and merge before starting the next task.

## Tasks

- [x] **T1 — Repository and CI.** Decision 8: npm workspaces with a SvelteKit app (`adapter-static`, Svelte 5, strict TypeScript) and the two packages, Prettier, ESLint, Vitest and Playwright, and a GitHub Actions workflow on each PR. Write `conventions.md`, `development.md` and `testing.md`, and link them from `CLAUDE.md`. Doubles as the Svelte 5 learning spike. *Done when:* a PR's CI runs lint, type check, a unit test in each package and a Playwright test of a placeholder page, and passes.
  - *Changed while doing it:* SvelteKit is on major version 3, which moved its configuration into `app/vite.config.ts` (no `svelte.config.js`) and replaced `$lib` with `#lib` subpath imports. TypeScript is 6, not the native 7, because `svelte-check` and `typescript-eslint` don't support 7 yet. The packages export their TypeScript source with no build step. The app has component tests too, in a real Chromium through Vitest's browser mode, ready for T7. The smoke test runs on two phone projects, Pixel 7 (Chromium) and iPhone 15 (WebKit), for APP-8.1's two browsers. The packages' first tests are small real functions, `pitchClass` in `fretkit` and `midiToFrequency` in `audio` (THY-4.1's A4 = 440 Hz), which T4 and T8 build on.
- [x] **T2 — Deploy, install and offline.** APP-4.1 to APP-4.3 and APP-4.5: the Pages deploy on merge to `main`, the custom domain and HTTPS, the manifest with placeholder icons, and the service worker precaching the build. The owner's steps, in this order: verify `seannormoyle.net` in the GitHub account's Pages settings (a `_github-pages-challenge-cynicollision` TXT record in Squarespace DNS, left in place), so no other account can claim a subdomain of it; then add a `fretdex` CNAME record pointing at `cynicollision.github.io`; then, in this repo's Pages settings, set the source to GitHub Actions, the custom domain to `fretdex.seannormoyle.net`, and turn on Enforce HTTPS. Check architecture's **To confirm** items about the PWA plugin. Write `deployment.md`. *Done when:* the placeholder app installs on the owner's phone from `fretdex.seannormoyle.net`, opens in airplane mode, and picks up a new deploy on its next launch.
  - *Changed while doing it:* `@vite-pwa/sveltekit` 2 is a rewrite for SvelteKit 3: `withPwa` in `app/vite.config.ts` wraps SvelteKit's own plugin, and it needs `magicast` installed as a peer. The deploy is a fourth job in `ci.yml` rather than its own workflow, so it runs only once every check has passed on `main`. A new version takes over and reloads the app within seconds of opening it (`autoUpdate`) rather than waiting for the launch after. The icon (`app/static/icon.svg`, with PNGs drawn from it) and the colour `#16181d` are placeholders for T3. Offline use is tested in Chromium only, since Playwright drives service workers only there; the iPhone is checked by hand. Whether Pages and the service worker open every route on a fresh load waits for T6's routes.
- [ ] **T3 — Design pass.** Decision 10, APP-5, APP-6.1 to APP-6.3, DIAG-1.7, DIAG-1.8, and APP-Q2 decided. Tokens for the three themes, the type scale, a font with ♯ ♭ 𝄪 𝄫 (THY-1.5), and static SVG mockups. *Done when:* the owner has checked the mockups on their phone at arm's length and APP-Q2 is decided.
- [ ] **T4 — Theory core.** THY-1 to THY-4 in `fretkit`: spelling, accidentals, roots, the tuning model with capo, concert pitch. Check what Tonal.js covers (architecture's **To confirm**). *Done when:* golden tests of every key's scale and the modes on all 12 roots pass, and the owner has checked the table by hand once.
- [ ] **T5 — Storage, context and settings.** CTX-1 to CTX-3 and PIN-6: versioned records in IndexedDB, the context bar and its sheet (APP-2), the Settings screen, custom tunings. *Done when:* every setting changes what a test page shows and survives a relaunch of the installed app.
- [ ] **T6 — App shell and URLs.** APP-1, APP-3, APP-5.5, APP-8: the bottom bar and module grid (with places for the later modules and tools), URL parsing and writing for every route, Not found, titles, wake lock. *Done when:* every route of this milestone opens from its URL in a fresh install, and back behaves as APP-1.3 and APP-3.2 say.
- [ ] **T7 — Fretboard and keyboard.** DIAG-1, DIAG-3, DIAG-5: labels, handedness, capo, highlighting, mini renders, and the text alternative (APP-6.4). *Done when:* a fretboard of any tuning, capo and handedness draws a computed note set correctly, checked against `fretkit` in component tests.
- [ ] **T8 — Audio engine.** AUD-1.1 to AUD-1.4, AUD-4, AUD-6, AUD-7: voices, tap to play, the drone, and a scheduler on the audio clock built to carry runs, loops, the click and the metronome. Check the iPhone silent switch (AUD-1.4). *Done when:* taps and the drone play on the owner's phone, on silent too, and the owner has judged the voices; if they sound toy-like, sampled instruments leave the backlog's Parked for a milestone.
- [ ] **T9 — Scales.** SCL: the list, the card, CAGED positions, 3-notes-per-string patterns, pentatonic boxes, bass boxes, and scale runs (AUD-3). *Done when:* every scale in SCL-1.1 opens on every root with correct positions in standard tuning, checked by golden tests and on the phone.
- [ ] **T10 — Modes and arpeggios.** MODE and ARP, reusing the scale card. *Done when:* every mode and arpeggio quality opens on every root, with comparison and the brightness row working.
- [ ] **T11 — Intervals and notes.** INT. *Done when:* every interval's card and every note's card open and play.
- [ ] **T12 — Pins, home board and recents.** PIN-1 to PIN-5 and APP-4.4. *Done when:* a pinned card reopens exactly as pinned after a relaunch, and an export imported on a fresh install restores the board.
- [ ] **T13 — Polish, trial and release.** APP-6.4, APP-6.5 and APP-7 checked across the app; the trial (the Question); fixes it leads to. *Done when:* the definition of done holds.

## Definition of done

- [ ] Every sub-requirement in scope is `Implemented`, or `Retired` or moved to a later milestone or the backlog, with the reason in its row and in Changes to the plan.
- [ ] `fretkit`'s golden tests cover every key's scale and every mode on all 12 roots, checked by hand once.
- [ ] Every card of this milestone loads and plays with the phone in airplane mode after install.
- [ ] Every card is two taps from the home board (APP-1.2), and every view's URL reopens it as it was (APP-3.1).
- [ ] Playwright smoke tests pass on a phone viewport for one card per module, pinning and offline.
- [ ] The trial (the Question) ran for at least a week including a rehearsal or practice session, and its findings are in the Outcome.
- [ ] `architecture.md`, `conventions.md`, `development.md`, `testing.md` and `deployment.md` describe the app as built.
- [ ] v0.1.0 is tagged and deployed; the Outcome is filled in; the roadmap says released, and M02's file is written.

# Outcome

*(Filled in when the milestone closes.)*

## Answer

## What was built

## What we learned

## Changes to the plan

## Follow-ups
