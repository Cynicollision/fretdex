# Fretdex

Offline, installable reference app for guitar and bass: a SvelteKit static site with a framework-free theory package (`fretkit`) and audio package. No backend. npm workspaces: the app in `app/`, the packages in `packages/fretkit/` and `packages/audio/`. M01 is in progress; so far there's the repository, CI, the design tokens, fonts and icon, the theory core in `fretkit` (spelling, roots, tunings, fretboard mapping, modes), settings and custom tunings stored on the device, the context bar with its sheet, a Settings screen, the app shell (Home in the context bar, the modules, a URL for every M01 route, Not found, wake lock), the fretboard and keyboard, the Scales list and scale card (the modes' cards included, with their parent scale, brightness row and chords; their positions: CAGED, pentatonic boxes, 3-notes-per-string and bass boxes; and scale runs that light the playing note), the Modes overview (a major key's seven modes by degree, each with its step pattern and a 3-notes-per-string position), the audio engine (synthesized voices that play a tapped fret or key, volume and mute, and the scheduler), pins (a Pin button on scale cards and filtered lists, Home's board of tiles with rename, move, groups and dragging, and pinned scales first in the Scales list), and the app deployed to https://fretdex.seannormoyle.net, where it installs and works offline.

Read the doc that fits the task before starting:

- [docs/vision.md](docs/vision.md): what Fretdex is and isn't, and the design principles every decision is checked against
- [docs/architecture.md](docs/architecture.md): packages, layers, tech stack, routes and the URL scheme, storage, offline
- [docs/conventions.md](docs/conventions.md): code conventions: formatting, layers, TypeScript, Svelte, tests
- [docs/development.md](docs/development.md): setup, day-to-day commands, adding dependencies, trying a change, the checks before a PR, releases
- [docs/deployment.md](docs/deployment.md): how a merge to `main` reaches GitHub Pages and the phone, installing, and the one-time domain setup
- [docs/testing.md](docs/testing.md): how the unit, component and smoke tests are set up
- [docs/requirements/](docs/requirements/README.md): requirements by domain, with stable IDs and each domain's open questions
- [docs/planning/](docs/planning/roadmap.md): the roadmap (one line per milestone), the backlog, and one file per milestone in `milestones/`: the plan, its tasks in order, decisions, progress notes and the outcome. The current one is [M01](docs/planning/milestones/M01-foundation-and-scales.md)
- [docs/concept-brief.md](docs/concept-brief.md): the brief Fretdex was planned from (2026-11-23), a dated record; the docs above win where they differ
- [CREDITS.md](CREDITS.md): every third-party library, dataset, font and image that ships, with its licence

## Workflow

Where the workflow's pieces live:

- **Backlog**: [docs/planning/backlog.md](docs/planning/backlog.md); its introduction says what each section is for and how an item is written
- **Milestones**: [docs/planning/milestones/](docs/planning/milestones/); the current one is the one [the roadmap](docs/planning/roadmap.md) marks planned or in progress, and the roadmap says how a milestone file works
- **Specs**: [docs/requirements/](docs/requirements/README.md), with each domain's open questions, checked against [docs/vision.md](docs/vision.md)'s principles
- **Checks**: [docs/development.md](docs/development.md#before-opening-a-pr), "Before opening a PR": format, lint, type check, unit tests and smoke tests, all from the root; CI runs the same
- **Upkeep**: none yet
- **Try it**: [docs/development.md](docs/development.md#trying-a-change-in-the-app): `preview_start` with the `app` configuration in `.claude/launch.json` (`npm run dev`, http://localhost:5173), on a phone-sized viewport
- **Second review**: `packages/fretkit/` (the theory every screen relies on, and its golden table), the service worker and offline caching, anything that stores or migrates the user's data (pins, settings), and `.github/workflows/`

Rules for every change:

- When behavior changes, update the matching requirement in `docs/requirements/` (status or wording) in the same PR.
- An open question has a default, which is built unless the owner decides otherwise; the owner decides it at the latest when the task that needs it starts. Once decided, it becomes a requirement (or a decision in the milestone file, for plan and code choices) and leaves the Open questions list.
- Bringing in a third-party library, dataset, font or image that ships adds a row to `CREDITS.md` in the same PR, with any notice its licence asks for.
