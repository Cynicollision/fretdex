import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const tokensCss = readFileSync(path.join(import.meta.dirname, 'tokens.css'), 'utf8');

// Each theme's tokens, read from tokens.css. A theme block only overrides; Dark (:root) supplies the rest.
function themes(): Record<string, Record<string, string>> {
    const blocks: Record<string, Record<string, string>> = {};
    for (const match of tokensCss.matchAll(/:root(?:\[data-theme='(\w+)'\])?\s*\{([^}]*)\}/g)) {
        const tokens: Record<string, string> = {};
        for (const [, name, value] of (match[2] ?? '').matchAll(/--([\w-]+):\s*([^;]+);/g)) {
            if (name && value) tokens[name] = value.trim();
        }
        blocks[match[1] ?? 'dark'] = tokens;
    }
    const dark = blocks['dark'] ?? {};
    return Object.fromEntries(Object.entries(blocks).map(([theme, tokens]) => [theme, { ...dark, ...tokens }]));
}

// WCAG 2 relative luminance and contrast ratio.
function luminance(hex: string): number {
    const channels = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255);
    const [r = 0, g = 0, b = 0] = channels.map(c => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a: string, b: string): number {
    const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x);
    return ((light ?? 0) + 0.05) / ((dark ?? 0) + 0.05);
}

// Every pair of tokens that puts text on a colour: [text, background].
const TEXT_PAIRS = [
    ['text', 'bg'],
    ['text', 'surface'],
    ['text', 'surface-2'],
    ['muted', 'bg'],
    ['muted', 'surface'],
    ['accent', 'bg'],
    ['accent', 'surface'],
    ['accent-ink', 'accent'],
    ['note-ink', 'note'],
    ['note', 'neck'],
    ['root-ink', 'root'],
    ['muted', 'neck']
] as const;

describe('design tokens', () => {
    const all = themes();

    it('APP-6.1 defines Dark, Light and High contrast', () => {
        expect(Object.keys(all).sort()).toEqual(['contrast', 'dark', 'light']);
    });

    it.each([
        ['dark', 4.5],
        ['light', 4.5],
        ['contrast', 7]
    ] as const)('APP-6.2 gives text in %s a contrast of at least %d : 1', (theme, minimum) => {
        const tokens = all[theme] ?? {};
        for (const [text, background] of TEXT_PAIRS) {
            const ratio = contrast(tokens[text] ?? '', tokens[background] ?? '');
            expect(ratio, `${text} on ${background}`).toBeGreaterThanOrEqual(minimum);
        }
    });
});
