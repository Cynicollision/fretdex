/**
 * Keeps the screen awake while the app is open and the setting is on (APP-5.5, CTX-1.10), where the browser has a
 * wake lock. The browser releases the lock whenever the page is hidden, so it's taken again each time the page is
 * shown. Gives a function that releases it and stops taking it again.
 */
export function keepScreenAwake(): () => void {
    if (!('wakeLock' in navigator)) return () => {};
    const wakeLock = navigator.wakeLock;

    let sentinel: WakeLockSentinel | undefined;
    let requesting = false;
    let stopped = false;

    // One request at a time, so a page shown again while the first is pending doesn't take a second lock that
    // `stop` would never release.
    const take = async () => {
        if (stopped || requesting || document.visibilityState !== 'visible' || (sentinel && !sentinel.released)) return;
        requesting = true;
        try {
            const taken = await wakeLock.request('screen');
            if (stopped) void taken.release();
            else sentinel = taken;
        } catch {
            // Refused (low battery, a browser policy): the screen dims as usual.
        } finally {
            requesting = false;
        }
    };
    const onVisibility = () => void take();

    document.addEventListener('visibilitychange', onVisibility);
    void take();
    return () => {
        stopped = true;
        document.removeEventListener('visibilitychange', onVisibility);
        void sentinel?.release();
        sentinel = undefined;
    };
}
