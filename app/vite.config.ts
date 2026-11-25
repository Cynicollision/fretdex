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
                // Every page is prerendered to static HTML (src/routes/+layout.ts).
                adapter: adapter()
            },
            {
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
                    // Placeholder colours and icons until the design pass (M01 T3).
                    theme_color: '#16181d',
                    background_color: '#16181d',
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
                    ]
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
