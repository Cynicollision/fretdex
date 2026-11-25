/**
 * Keeps the screen awake while the app is open and the setting is on (APP-5.5, CTX-1.10), where the browser has a
 * wake lock. The browser releases the lock whenever the page is hidden, so it's taken again each time the page is
 * shown. Gives a function that releases it and stops taking it again.
 */
export function keepScreenAwake(): () => void {
    if (!('wakeLock' in navigator)) return () => {};
    const wakeLock = navigator.wakeLock;

    let sentinel: WakeLockSentinel | undefined;
    let stopped = false;

    const take = async () => {
        if (stopped || document.visibilityState !== 'visible' || (sentinel && !sentinel.released)) return;
        try {
            const taken = await wakeLock.request('screen');
            if (stopped) void taken.release();
            else sentinel = taken;
        } catch {
            // Refused (low battery, a browser policy): the screen dims as usual.
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
