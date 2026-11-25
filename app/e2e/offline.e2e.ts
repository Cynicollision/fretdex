import { expect, test } from '@playwright/test';

test('the page links the manifest, which names the app and its icons (APP-4.1)', async ({ page, request }) => {
    await page.goto('/');

    const href = await page.locator('link[rel="manifest"]').getAttribute('href');
    expect(href).toBeTruthy();
    const manifest = (await (await request.get(new URL(href ?? '', page.url()).href)).json()) as {
        name: string;
        start_url: string;
        display: string;
        icons: { sizes: string; purpose?: string }[];
    };
    expect(manifest.name).toBe('Fretdex');
    expect(manifest.start_url).toBe('/');
    expect(manifest.display).toBe('standalone');
    expect(manifest.icons.map(icon => icon.sizes)).toEqual(expect.arrayContaining(['192x192', '512x512']));
    expect(manifest.icons.some(icon => icon.purpose === 'maskable')).toBe(true);
});

test('after the first load the app opens with no network (APP-4.2)', async ({ page, context, browserName }) => {
    // Playwright drives service workers in Chromium only.
    test.skip(browserName !== 'chromium', 'service workers are tested in Chromium');

    await page.goto('/');
    await page.evaluate(async () => {
        await navigator.serviceWorker.ready;
        if (!navigator.serviceWorker.controller) {
            await new Promise(resolve => navigator.serviceWorker.addEventListener('controllerchange', resolve));
        }
    });

    await context.setOffline(true);
    await page.reload();

    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Fretdex');
});
