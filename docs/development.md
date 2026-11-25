# Development

Everything runs from the repository root: it's one set of npm workspaces (`app/`, `packages/fretkit/`, `packages/audio/`), described in [architecture.md](architecture.md#repository-layout). There's no backend and no Docker.

## Prerequisites

- Node.js 24 (`.nvmrc`; `.npmrc` sets `engine-strict`, so an older Node refuses to install) and the npm that comes with it
- Any OS. Development has mostly happened on Windows.

## First-time setup

1. `npm ci` at the root installs every workspace.
2. `npx -w app playwright install chromium webkit` downloads the browsers the tests use: Chromium for the component tests, and Chromium and WebKit for the smoke tests.

## Day to day

| What | Command | Notes |
|---|---|---|
| Dev server | `npm run dev` | http://localhost:5173, with hot reload of the app and both packages |
| Production build | `npm run build` | Static site in `app/build/` |
| Serve the build | `npm run preview` | http://localhost:4173 |
| Unit and component tests | `npm test` | Every workspace; `npm run test:watch -w <workspace>` to watch one |
| Smoke tests | `npm run test:e2e` | Builds the app and runs Playwright against it |
| Type check | `npm run check` | `tsc` in the packages, `svelte-check` in the app |
| Lint | `npm run lint` | |
| Format | `npm run format` | `npm run format:check` to only check |

The packages have no build step: each one's `package.json` exports its TypeScript source (`src/index.ts`), and the app's Vite compiles it along with the app. A change in a package shows in the dev server straight away.

## Adding a dependency

Install it into the workspace that uses it: `npm install <name> -w packages/fretkit` (or `-w app`). Libraries that ship in the built app are `dependencies`; build and test tools are `devDependencies`, at the root when every workspace uses them (Prettier, ESLint, TypeScript, Vitest), otherwise in their workspace. Anything that ships gets a row in [CREDITS.md](../CREDITS.md) in the same PR.

TypeScript stays on 6.x until `svelte-check` and `typescript-eslint` support 7 (their peer ranges stop at 6).

## Trying a change in the app

For anything the screen shows, try the change in the running app as well as its tests, on a phone-sized viewport. Claude uses the desktop app's built-in browser: `preview_start` with the `app` configuration in `.claude/launch.json` starts the dev server. Once it's merged and deployed ([deployment.md](deployment.md)), try it on the owner's phone too.

## Before opening a PR

- `npm run format`
- `npm run lint`
- `npm run check`
- `npm test`
- `npm run test:e2e`

CI (`.github/workflows/ci.yml`) runs the same on every PR and push to `main`, in three jobs: format, lint and type check; unit tests; and smoke tests on phone viewports. On `main`, a fourth job deploys the site once those pass ([deployment.md](deployment.md)). See [testing.md](testing.md) for how the tests are set up.

## Releases

Releases follow the milestones in the [roadmap](planning/roadmap.md): each one finished is a minor version (`v0.1.0`, `v0.2.0`), and the one that finishes M03 is `v1.0.0`. A fix released between milestones is a patch version (`v0.1.1`).

To release, set `version` in `app/package.json` to the release's number in its last PR (`npm version 0.1.0 --no-git-tag-version -w app`), then tag the merge commit on `main` and publish the release with notes generated from the merged PRs:

```bash
gh release create v0.1.0 --target main --generate-notes
```
