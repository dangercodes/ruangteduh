export const checkClientRateLimit = (actionKey: string, cooldownMs: number): void => {
    if (typeof window === 'undefined') return; // Server side bypass

    const storageKey = `rt_ratelimit_${actionKey}`;
    const lastAction = localStorage.getItem(storageKey);
    const now = Date.now();

    if (lastAction) {
        const lastActionTime = parseInt(lastAction, 10);
        const timePassed = now - lastActionTime;

        if (timePassed < cooldownMs) {
            const waitTimeSec = Math.ceil((cooldownMs - timePassed) / 1000);
            throw new Error(`Mohon tunggu ${waitTimeSec} detik sebelum mengulangi aksi ini. 🍃`);
        }
    }

    // Record the current action time
    localStorage.setItem(storageKey, now.toString());
};
