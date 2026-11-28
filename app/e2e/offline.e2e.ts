import { expect, test, type Page } from '@playwright/test';

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

/** Waits until the service worker has installed and controls the page, as after an install. */
async function installed(page: Page) {
    await page.evaluate(async () => {
        await navigator.serviceWorker.ready;
        if (!navigator.serviceWorker.controller) {
            await new Promise(resolve => navigator.serviceWorker.addEventListener('controllerchange', resolve));
        }
    });
}

test('after the first load the app opens with no network (APP-4.2)', async ({ page, context, browserName }) => {
    // Playwright drives service workers in Chromium only.
    test.skip(browserName !== 'chromium', 'service workers are tested in Chromium');

    await page.goto('/');
    await installed(page);

    await context.setOffline(true);
    await page.reload();

    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Fretdex');
});

test('after the first load every route opens from its URL with no network (APP-4.2, APP-3.1)', async ({
    page,
    context,
    browserName
}) => {
    test.skip(browserName !== 'chromium', 'service workers are tested in Chromium');

    await page.goto('/');
    await installed(page);
    await context.setOffline(true);

    // A prerendered list, cards drawn from the fallback page, a redirect and Not found.
    for (const [path, heading] of [
        ['/scales', 'Scales'],
        ['/scales/Ab/minor-blues?labels=notes', 'A♭ minor blues'],
        ['/modes', 'Modes of C major'],
        ['/modes/Bb', 'Modes of B♭ major'],
        ['/scales/F%23/lydian', 'F♯ Lydian'],
        ['/scales/C/bebop', 'Not found'],
        ['/licences/', 'Credits and licences']
    ] as const) {
        await page.goto(path);
        await expect(page.getByRole('heading', { level: 1 }), path).toHaveText(heading);
    }

    // A link to a prerendered screen with data, which the app fetches with a query of its own (APP-1.6).
    await page.goto('/about');
    await page.getByRole('link', { name: 'Credits and licences' }).click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Credits and licences');
    await expect(page.getByText('Permission is hereby granted').first()).toBeVisible();
});
