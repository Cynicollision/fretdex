import { defineConfig, devices } from '@playwright/test';

const ci = !!process.env['CI'];

// Smoke tests of the built app on phone viewports: Chrome on Android and Safari on iOS (APP-8.1).
export default defineConfig({
    testDir: 'e2e',
    testMatch: '**/*.e2e.ts',
    forbidOnly: ci,
    retries: ci ? 1 : 0,
    reporter: ci ? [['github'], ['list']] : 'list',
    use: { trace: 'retain-on-failure' },
    projects: [
        { name: 'android', use: { ...devices['Pixel 7'] } },
        { name: 'iphone', use: { ...devices['iPhone 15'] } }
    ],
    webServer: {
        command: 'npm run build && npm run preview',
        port: 4173,
        reuseExistingServer: !ci
    }
});
