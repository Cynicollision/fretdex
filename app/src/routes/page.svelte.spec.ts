import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';
import Page from './+page.svelte';

describe('home page placeholder', () => {
    it('names the app', async () => {
        await render(Page);

        await expect.element(page.getByRole('heading', { level: 1 })).toHaveTextContent('Fretdex');
    });
});
