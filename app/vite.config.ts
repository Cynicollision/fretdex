import adapter from '@sveltejs/adapter-static';
import { withPwa } from '@vite-pwa/sveltekit';
import { playwright } from '@vitest/browser-playwright';
import { defineConfig } from 'vitest/config';

export default defineConfig({
    plugins: [
        // withPwa runs SvelteKit's plugin with the first options, and adds the manifest and service worker (APP-4).
        withPwa(
            {
                compilerOptions: {
                    // Runes mode for our components; libraries in node_modules decide for themselves.
                    runes: ({ filename }) => (filename.split(/[/\\]/).includes('node_modules') ? undefined : true)
                },
                // Every list and screen is prerendered to static HTML (src/routes/+layout.ts). Cards are drawn in the
                // browser from the fallback page, which GitHub Pages serves for any path it has no file for.
                adapter: adapter({ fallback: '404.html' })
            },
            {
                // The fallback page is precached, and the service worker answers any navigation it hasn't precached
                // with it, so every card opens offline (APP-4.2).
                kit: { adapterFallback: '404.html', spa: true },
                // A new version installs in the background, takes over and reloads the app, so a launch picks it up (APP-4.3).
                registerType: 'autoUpdate',
                // Registered from src/routes/+layout.svelte.
                injectRegister: false,
                manifest: {
                    id: '/',
                    name: 'Fretdex',
                    short_name: 'Fretdex',
                    description: 'A reference for guitar and bass that works offline.',
                    start_url: '/',
                    scope: '/',
                    display: 'standalone',
                    // The Dark theme's page colour (src/lib/styles/tokens.css); icons drawn from static/icon.svg.
                    theme_color: '#14161b',
                    background_color: '#14161b',
                    icons: [
                        { src: '/pwa-192x192.png', sizes: '192x192', type: 'image/png' },
                        { src: '/pwa-512x512.png', sizes: '512x512', type: 'image/png' },
                        { src: '/pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
                    ]
                },
                generateSW: {
                    // Everything the build makes, so the whole app works offline after the first load (APP-4.2).
                    globPatterns: [
                        'client/**/*.{js,css,html,svg,png,ico,webmanifest,json,woff2}',
                        'prerendered/**/*.{html,json}'
                    ],
                    // A screen's prerendered data (`__data.json`) is fetched with SvelteKit's own query
                    // (`x-sveltekit-invalidated`, `x-sveltekit-trailing-slash`), which the precached copy hasn't got;
                    // ignored, with Workbox's defaults, so Credits and licences opens offline (APP-1.6, APP-4.2).
                    ignoreURLParametersMatching: [/^utm_/, /^fbclid$/, /^x-sveltekit-/]
                }
            }
        )
    ],
    test: {
        expect: { requireAssertions: true },
        projects: [
            {
                // Component tests, in a real headless Chromium
                extends: './vite.config.ts',
                test: {
                    name: 'components',
                    browser: {
                        enabled: true,
                        provider: playwright(),
                        instances: [{ browser: 'chromium', headless: true }]
                    },
                    include: ['src/**/*.svelte.spec.ts']
                }
            },
            {
                // Plain TypeScript logic, in Node
                extends: './vite.config.ts',
                test: {
                    name: 'logic',
                    environment: 'node',
                    include: ['src/**/*.spec.ts'],
                    exclude: ['src/**/*.svelte.spec.ts']
                }
            }
        ]
    }
});
