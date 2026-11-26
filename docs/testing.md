# Testing

| What | Runner | Where | Command | CI |
|---|---|---|---|---|
| `fretkit` and `audio` | Vitest, in Node | `packages/*/src/**/*.spec.ts` | `npm test` | Unit tests job |
| App logic | Vitest, in Node (the `logic` project) | `app/src/**/*.spec.ts` | `npm test` | Unit tests job |
| App components | Vitest browser mode, in headless Chromium (the `components` project) | `app/src/**/*.svelte.spec.ts` | `npm test` | Unit tests job |
| Smoke tests | Playwright, on phone viewports | `app/e2e/*.e2e.ts` | `npm run test:e2e` | Smoke tests job |

Every Vitest run sets `expect.requireAssertions`, so a test that checks nothing fails.

## The packages

Plain unit tests of pure functions, in Node, with each package's `vitest.config.ts`. This is where most of the testing goes (M01 decision 4): every `fretkit` behavior gets a test named after its requirement ID before a diagram draws it, and a golden table covers every scale on all 12 roots: `src/golden.spec.ts` writes `fretkit`'s answers to `golden/scales.md` and fails if they change, so after a deliberate change, `npx vitest run -u` in the package rewrites it and the diff is checked by hand (`toMatchFileSnapshot`; in CI nothing is rewritten). `audio` tests what can run without a sound card: each voice's pitch (measured from its samples, within 2 cents) and decay, the scheduler's timing over ten simulated minutes with a clock and timer the test moves by hand, and the engine's choices of what to start and stop against a stand-in for the audio context (`engine.spec.ts`). How the engine sounds through real Web Audio is checked in the app's `components` project, which has a browser: it renders notes with an `OfflineAudioContext` (`app/src/lib/audio/engine.svelte.spec.ts`). Whether the voices sound right is the owner's ear, on the phone.

## The app

`app/vite.config.ts` defines two Vitest projects. `logic` runs plain TypeScript tests in Node. `components` renders Svelte components in a real Chromium with `vitest-browser-svelte`: `await render(Component, props)`, then check what's on the page through `page` from `vitest/browser`, by role or text, with `await expect.element(...)` (`app/src/routes/page.svelte.spec.ts`). A real browser means CSS, SVG geometry and layout behave as they do in the app: the fretboard tests check what's drawn against `fretkit`'s `mapScale` and measure the frets, and `page.viewport` sets the width to test the upright stretch against the whole neck (`app/src/lib/components/fretboard.svelte.spec.ts`). It has IndexedDB too, so the settings store is tested against the real thing, each test in a database of its own (`app/src/lib/settings/store.svelte.spec.ts`); code that only reads and checks records is tested in `logic` against a `Map` (`app/src/lib/storage/record.spec.ts`).

## Smoke tests

Playwright builds the app and serves `app/build/` on :4173 as GitHub Pages does, with `npm run preview` (`app/scripts/serve-build.ts`: a path with no file gets the fallback page, `404.html`, with a 404 status), set in `app/playwright.config.ts`; locally it reuses a server that's already running, then runs every test in two projects: `android` (Pixel 7, Chromium) and `iphone` (iPhone 15, WebKit), for APP-8.1's two browsers. WebKit on Linux and Windows is close to iOS Safari, not the same, so the owner's phone remains the check for anything Safari-specific. Keep these few: one per module, plus pinning and offline (M01's definition of done). The offline tests (`offline.e2e.ts`), which open routes from their URLs with no network, run in `android` only, since Playwright drives service workers only in Chromium. A failed run in CI uploads its traces as the `playwright-traces` artifact; open one with `npx playwright show-trace <file>`.
