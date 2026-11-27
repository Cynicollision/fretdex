# Code Conventions

Rules that apply across the codebase. Match the surrounding code for anything not listed here.

## Files

- UTF-8, LF line endings, final newline, no trailing whitespace. `.editorconfig` sets this for editors and `.gitattributes` makes Git store and check out LF on every OS.

## Formatting

- **Prettier formats the code**: TypeScript, JavaScript, Svelte, CSS and HTML in every workspace, from the root `.prettierrc.json` (4-space indentation, 120 columns, single quotes, no trailing commas) with `prettier-plugin-svelte`. Run `npm run format` at the repository root before committing; CI fails on anything it would change. Don't hand-format against it.
- Files Prettier doesn't format (JSON, YAML, Markdown) follow `.editorconfig`: 4-space indentation, 2 for YAML.

## Layers

- **Theory lives in `fretkit`.** Views, diagrams and audio never work out notes, intervals or positions themselves; they ask `@fretdex/fretkit` ([architecture.md](architecture.md#layers)). A wrong note is a `fretkit` bug with a unit test to write.
- **The packages are framework-free.** `packages/fretkit` and `packages/audio` don't import Svelte or SvelteKit. `fretkit`'s `tsconfig.json` has no DOM types, so it can't touch the browser; `audio`'s has them for Web Audio only.
- The app imports the packages by name (`import { pitchClass } from '@fretdex/fretkit'`), never by relative path into `packages/`. Each package exports only what its `src/index.ts` exports.

## TypeScript

- Strict, with `noUncheckedIndexedAccess`: indexing an array or record gives `T | undefined`, so handle the missing case rather than asserting it away with `!`.
- Import types with `import type` (`verbatimModuleSyntax` requires it).
- In the app, import shared modules from `app/src/lib` as `#lib/<path>`, with the file's extension (`#lib/settings/store.svelte.ts`): SvelteKit 3's subpath imports, which replaced `$lib`, map the path as written and add no extension.

## Svelte

- Svelte 5 runes everywhere: `$props()`, `$state`, `$derived` and `$effect`, and snippets with `{@render}` rather than slots. `app/vite.config.ts` turns runes mode on for every component, so the old syntax is a compile error.
- A screen is drawn inside `Screen.svelte` (`app/src/lib/components/`), which sets its `<title>` ("G major · Fretdex", APP-3.6), its heading and its back control.
- Links to the app's own pages go through `resolve` from `$app/paths` (ESLint's `svelte/no-navigation-without-resolve`); a card's link comes from `cardHref` (`app/src/lib/url/href.ts`).

## Styling

- Colours, fonts, type sizes, the corner radius and the tap target come from the tokens in `app/src/lib/styles/tokens.css` (`var(--text)`, `var(--text-m)`), never literal values, so every theme works ([architecture.md](architecture.md#styling)). A new colour is a token with a value in all three themes, and if it carries text, a pair in `tokens.spec.ts`.
- Font sizes are in `rem` (through the tokens), so the system's text size applies (APP-6.5). Nothing a user taps is smaller than `var(--tap)`.
- Write accidentals as the characters ♯ ♭ ♮ 𝄪 𝄫 in anything shown, never `#` or `b`; the font stack draws them.

## Tests

- Unit tests are `*.spec.ts` next to the code they test; component tests are `*.svelte.spec.ts`; Playwright smoke tests are `app/e2e/*.e2e.ts`. See [testing.md](testing.md).
- Name a test for new or changed behavior after its requirement ID: `it('THY-4.1 tunes A4 to 440 Hz', …)`.

## Requirements

- Requirements live in [requirements/](requirements/README.md) with stable IDs (`SCL-3.2`). Reference them by ID in test names, commits, PRs and backlog items where it helps.

## Lint

- `npm run lint` at the root runs ESLint over every workspace: `typescript-eslint`'s type-checked recommended rules (which catch, for example, a promise that's never awaited) and `eslint-plugin-svelte`'s recommended rules. It skips everything in `.gitignore`, and `.claude/`, where Claude Code keeps its worktrees.
