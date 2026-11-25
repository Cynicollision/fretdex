import { afterEach, describe, expect, it, vi } from 'vitest';
import { keepScreenAwake } from './wake-lock';

/** A browser's wake lock and page visibility, faked: the lock is released whenever the page is hidden. */
function fakeBrowser() {
    const listeners = new Set<() => void>();
    const sentinels: { released: boolean; release: () => Promise<void> }[] = [];
    const document = {
        visibilityState: 'visible' as 'visible' | 'hidden',
        addEventListener: (_: string, listener: () => void) => listeners.add(listener),
        removeEventListener: (_: string, listener: () => void) => listeners.delete(listener)
    };
    const request = vi.fn(() => {
        const sentinel = {
            released: false,
            release: () => {
                sentinel.released = true;
                return Promise.resolve();
            }
        };
        sentinels.push(sentinel);
        return Promise.resolve(sentinel);
    });
    vi.stubGlobal('document', document);
    vi.stubGlobal('navigator', { wakeLock: { request } });
    const setVisible = async (visible: boolean) => {
        document.visibilityState = visible ? 'visible' : 'hidden';
        if (!visible) for (const sentinel of sentinels) sentinel.released = true;
        for (const listener of listeners) listener();
        await Promise.resolve();
    };
    return { request, sentinels, listeners, setVisible };
}

describe('keepScreenAwake', () => {
    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('APP-5.5 takes the wake lock, takes it again when the page is shown, and releases it when stopped', async () => {
        const browser = fakeBrowser();
        const stop = keepScreenAwake();
        await Promise.resolve();
        expect(browser.request).toHaveBeenCalledTimes(1);

        await browser.setVisible(false);
        expect(browser.request).toHaveBeenCalledTimes(1);
        await browser.setVisible(true);
        expect(browser.request).toHaveBeenCalledTimes(2);

        stop();
        expect(browser.sentinels.every(sentinel => sentinel.released)).toBe(true);
        expect(browser.listeners.size).toBe(0);
    });

    it('APP-5.5 takes one lock when the page is shown again while the first request is pending', async () => {
        const browser = fakeBrowser();
        const stop = keepScreenAwake();
        await browser.setVisible(true);
        await Promise.resolve();
        expect(browser.request).toHaveBeenCalledTimes(1);

        stop();
        await Promise.resolve();
        expect(browser.sentinels.every(sentinel => sentinel.released)).toBe(true);
    });

    it('APP-5.5 does nothing where the browser has no wake lock', () => {
        vi.stubGlobal('navigator', {});
        expect(() => keepScreenAwake()()).not.toThrow();
    });
});
