import { localDB } from '../db'; // Ensure this matches your Dexie export

export const syncGameData = async (user, newPoints) => {
    if (!user) return;

    // 1. SAVE TO INDEXEDDB (Compulsory & Instant)
    // Using the direct Dexie 'put' for reliability
    try {
        await localDB.profile.put({
            uid: user.uid,
            nickname: user.displayName || user.email.split('@')[0],
            points: newPoints
        });
    } catch (dbErr) {
        console.error("Local Save Failed:", dbErr);
    }

    // 2. SAVE TO NEON POSTGRESQL (Cloud)
    // Use the relative path to trigger your Vercel Serverless Function
    try {
        const response = await fetch('/api/submit-score', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                uid: user.uid,
                nickname: user.displayName || user.email.split('@')[0],
                points: newPoints
            })
        });

        if (response.ok) {
            console.log("✅ Neon Database Synced via /api/submit-score");
        }
    } catch (err) {
        // Essential for Lubuntu/Offline logic [cite: 2025-10-25]
        console.warn("Neon Sync failed. Data is safe in IndexedDB.");
    }
};