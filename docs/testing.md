# Testing

| What | Runner | Where | Command | CI |
|---|---|---|---|---|
| `fretkit` and `audio` | Vitest, in Node | `packages/*/src/**/*.spec.ts` | `npm test` | Unit tests job |
| App logic | Vitest, in Node (the `logic` project) | `app/src/**/*.spec.ts` | `npm test` | Unit tests job |
| App components | Vitest browser mode, in headless Chromium (the `components` project) | `app/src/**/*.svelte.spec.ts` | `npm test` | Unit tests job |
| Smoke tests | Playwright, on phone viewports | `app/e2e/*.e2e.ts` | `npm run test:e2e` | Smoke tests job |

Every Vitest run sets `expect.requireAssertions`, so a test that checks nothing fails.

## The packages

Plain unit tests of pure functions, in Node, with each package's `vitest.config.ts`. This is where most of the testing goes (M01 decision 4): every `fretkit` behavior gets a test named after its requirement ID before a diagram draws it, and a golden table covers every scale on all 12 roots: `src/golden.spec.ts` writes `fretkit`'s answers to `golden/scales.md` and fails if they change, so after a deliberate change, `npx vitest run -u` in the package rewrites it and the diff is checked by hand (`toMatchFileSnapshot`; in CI nothing is rewritten). `audio` tests what can run without a sound card, such as pitches and the scheduler's timing.

## The app

`app/vite.config.ts` defines two Vitest projects. `logic` runs plain TypeScript tests in Node. `components` renders Svelte components in a real Chromium with `vitest-browser-svelte`: `await render(Component, props)`, then check what's on the page through `page` from `vitest/browser`, by role or text, with `await expect.element(...)` (`app/src/routes/page.svelte.spec.ts`). A real browser means CSS, SVG geometry and layout behave as they do in the app, which the fretboard and chord box tests will need (M01 T7).

## Smoke tests

Playwright builds the app and serves it with `vite preview` on :4173 (`app/playwright.config.ts`; locally it reuses a preview that's already running), then runs every test in two projects: `android` (Pixel 7, Chromium) and `iphone` (iPhone 15, WebKit), for APP-8.1's two browsers. WebKit on Linux and Windows is close to iOS Safari, not the same, so the owner's phone remains the check for anything Safari-specific. Keep these few: one per module, plus pinning and offline (M01's definition of done). The offline test (`offline.e2e.ts`) runs in `android` only, since Playwright drives service workers only in Chromium. A failed run in CI uploads its traces as the `playwright-traces` artifact; open one with `npx playwright show-trace <file>`.
