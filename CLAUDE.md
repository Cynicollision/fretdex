# Fretdex

Offline, installable reference app for guitar and bass: a SvelteKit static site with a framework-free theory package (`fretkit`) and audio package. No backend. There's no code yet: the first milestone is planned, and its first task sets up the repository.

Read the doc that fits the task before starting:

- [docs/vision.md](docs/vision.md): what Fretdex is and isn't, and the design principles every decision is checked against
- [docs/architecture.md](docs/architecture.md): packages, layers, tech stack, routes and the URL scheme, storage, offline
- [docs/requirements/](docs/requirements/README.md): requirements by domain, with stable IDs and each domain's open questions
- [docs/milestones/](docs/milestones/README.md): one file per milestone: the plan, its tasks in order, decisions, progress notes and the outcome. The current one is [M01](docs/milestones/M01-foundation-and-scales.md)
- [docs/concept-brief.md](docs/concept-brief.md): the brief Fretdex was planned from (2026-11-23), a dated record; the docs above win where they differ
- [CREDITS.md](CREDITS.md): every third-party library, dataset, font and image that ships, with its licence

`docs/conventions.md`, `docs/development.md`, `docs/testing.md` and `docs/deployment.md` are written by M01's first tasks, when there's code for them to describe.

## Workflow

- Every change goes through a PR to `main`. Branch as `claude/<short-kebab-summary>`, keep branches short-lived, and open the PR with `gh pr create`.
- When behavior changes, update the matching requirement in `docs/requirements/` (status or wording) in the same PR.
- An open question has a default, which is built unless the owner decides otherwise; the owner decides it at the latest when the task that needs it starts. Once decided, it becomes a requirement (or a decision in the milestone file, for plan and code choices) and leaves the Open questions list.
- Bringing in a third-party library, dataset, font or image that ships adds a row to `CREDITS.md` in the same PR, with any notice its licence asks for.
- Keep docs short and accurate. When code makes a doc wrong, fix the doc in the same PR.

## Backlog

`TODO.md` is the high-level backlog: one line per milestone, then Unscheduled, with Ideas last. The milestone being built has its own file in `docs/milestones/`, which holds its tasks; work for it goes there.

- Delete a `TODO.md` item once it's done; git history is the changelog. A milestone task is ticked instead, with a *Changed while doing it* note in the PR that finishes it.
- When you notice follow-up work that's out of scope for the current change, add it to the milestone's tasks or to `TODO.md`'s Unscheduled, instead of fixing it on the side.
- Point at code by file and symbol name, not line numbers.
