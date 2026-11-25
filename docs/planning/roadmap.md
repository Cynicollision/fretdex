# Roadmap

The milestones, one line each. Each milestone ends in a release (M01 is v0.1.0); version 1 is the release that finishes M03.

| Milestone | Release | What it adds | Status |
|---|---|---|---|
| [M01 Foundation and scales](milestones/M01-foundation-and-scales.md) | v0.1.0 | The repository, deploys and offline install; context and settings with the capo; scales, modes, arpeggios, intervals and notes; pins and the home board; tap-to-play, scale runs and the drone | Planned |
| M02 Chords and triads | v0.2.0 | The voicing dataset and voicing search, chord boxes, chords and inversions, Identify, triads and string sets, strummed audio | Not planned yet |
| M03 Version one | v1.0.0 | Keys and the circle, progressions and their loop, the click and count-in, search, and a two-week trial that includes a rehearsal or gig | Not planned yet |
| M04 Tuner and metronome | v1.1.0 | The tuner (TUN) and the metronome (MET) | Not planned yet |

Each milestone being built has a file in [milestones/](milestones/), numbered in order (`M01-foundation-and-scales.md`) and named by milestone, not version. It holds the plan, the tasks and what was learned building it. The next milestone's file is written when the one before it closes; until then, anything known about it is a section in [backlog.md](backlog.md).

## How a milestone file works

- **The plan half is living** while the milestone is built: tasks are ticked, and each PR adds a *Changed while doing it* note under its task. **The outcome half is written once**, when the milestone closes. After that the file is a dated record and isn't edited again.
- **It holds the plan, not the spec.** What the app does is in [requirements/](../requirements/README.md), with each sub-requirement's status. How a part is built is in [architecture.md](../architecture.md), or in a design doc beside the milestone file (`M01-design.md`) while that part is being worked out; when it ships, what stays true is folded into `architecture.md` and the design doc is deleted. The milestone file says what to build in what order, why, and how it went.
- **Only the current milestone has a full plan.** Later ones are a line in the table above (and a section in the backlog, once anything is known about them) until a planning session writes their file.

## Skeleton

```markdown
# MNN — Title

Status: planned | in progress | released YYYY-MM-DD as vX.Y.0

# Plan

## Question

The one question the milestone answers, and what "yes" means, in checks a person could run.

## Scope

In: ... Out (and where it goes instead): ...

## Decisions taken in this plan

Numbered, each cheap to change before its task starts.

## How to work on a task

## Tasks

- [ ] **T1 — Name.** Requirements, what to build. *Done when:* an observable check.

## Definition of done

- [ ] Checks that, together, answer the question.

# Outcome

## Answer
## What was built
## What we learned
## Changes to the plan
## Follow-ups
```
