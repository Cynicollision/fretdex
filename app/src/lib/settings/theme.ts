import type { Theme } from './settings';

/**
 * The theme is also kept in localStorage under this key. IndexedDB can only be read asynchronously, after the page
 * has painted, so a small script in `app.html` reads this copy to set the theme before the first paint, and a Light
 * or High contrast user never sees a flash of Dark at launch.
 */
export const THEME_COPY_KEY = 'fretdex-theme';

/**
 * Shows a theme (CTX-1.8): `data-theme` on `<html>` picks its tokens (tokens.css), and the `theme-color` meta, which
 * colours the browser's or installed app's bars, takes the theme's page colour.
 */
export function applyTheme(theme: Theme): void {
    const html = document.documentElement;
    html.dataset.theme = theme;
    const background = getComputedStyle(html).getPropertyValue('--bg').trim();
    if (background) document.querySelector('meta[name="theme-color"]')?.setAttribute('content', background);
    try {
        localStorage.setItem(THEME_COPY_KEY, theme);
    } catch {
        // No localStorage (some private windows): the theme still applies, a moment after launch.
    }
}
