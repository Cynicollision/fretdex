import adapter from '@sveltejs/adapter-static';
import { sveltekit } from '@sveltejs/kit/vite';
import { playwright } from '@vitest/browser-playwright';
import { defineConfig } from 'vitest/config';

export default defineConfig({
    plugins: [
        sveltekit({
            compilerOptions: {
                // Runes mode for our components; libraries in node_modules decide for themselves.
                runes: ({ filename }) => (filename.split(/[/\\]/).includes('node_modules') ? undefined : true)
            },
            // Every page is prerendered to static HTML (src/routes/+layout.ts).
            adapter: adapter()
        })
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
