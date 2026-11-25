# Credits

Every third-party library, dataset, font, sound and image that ships in Fretdex, with its source and licence. Add a row in the same PR that brings it in, and keep any notice its licence asks for where the licence says (MIT asks for its copyright notice to travel with the code or data).

Development-only tools (test runners, linters, build plugins) that don't ship in the built app aren't listed; `package-lock.json` has them.

## Libraries

| What | Version | Source | Licence | Where |
|---|---|---|---|---|
| Svelte | 5.59.1 | https://github.com/sveltejs/svelte | MIT (`node_modules/svelte/LICENSE.md`) | Compiled into the app's JavaScript in `_app/` |
| SvelteKit | 3.4.0 | https://github.com/sveltejs/kit | MIT (`node_modules/@sveltejs/kit/LICENSE`) | Its client runtime, in the app's JavaScript in `_app/` |
| Workbox (Vite PWA's fork: `@vite-pwa/workbox-swkit`, `@vite-pwa/workbox-window`) | 8.0.15 | https://github.com/vite-pwa/workbox | MIT, © Google LLC and Anthony Fu (`node_modules/@vite-pwa/workbox-swkit/LICENSE`) | The service worker's runtime, `workbox-*.js`, and its registration code in `_app/` |
| `@unplugin-pwa/core` | 0.0.8 | https://github.com/vite-pwa/unplugin-pwa | MIT (`node_modules/@unplugin-pwa/core/LICENSE`) | The service worker registration in `_app/`, made by `@vite-pwa/sveltekit` |

## Data, fonts and images

| What | Author | Source | Licence | Where |
|---|---|---|---|---|
| *(none yet)* | | | | |
