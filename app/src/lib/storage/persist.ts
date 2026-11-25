/**
 * Persistent storage (PIN-6.2): without it, a browser short of space may clear the app's records. The app asks when
 * it runs installed, and later the first time something is pinned (M01 T12).
 */

export type Persistence = 'granted' | 'not-granted' | 'unsupported';

/** Whether the browser has agreed to keep the app's storage. */
export async function persistence(): Promise<Persistence> {
    if (typeof navigator === 'undefined' || !('storage' in navigator) || !('persisted' in navigator.storage)) {
        return 'unsupported';
    }
    try {
        return (await navigator.storage.persisted()) ? 'granted' : 'not-granted';
    } catch {
        return 'unsupported';
    }
}

/** Asks for persistent storage unless it's already granted. */
export async function requestPersistence(): Promise<Persistence> {
    const now = await persistence();
    if (now !== 'not-granted' || !('persist' in navigator.storage)) return now;
    try {
        return (await navigator.storage.persist()) ? 'granted' : 'not-granted';
    } catch {
        return 'not-granted';
    }
}

/** Whether the app is running installed, from the home screen, rather than in a browser tab. */
export function isInstalled(): boolean {
    const standalone = (navigator as Navigator & { standalone?: boolean }).standalone === true; // iOS Safari
    return standalone || matchMedia('(display-mode: standalone)').matches;
}
