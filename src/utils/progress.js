import { localDB } from '../db';

export const getTodayKey = () => new Date().toISOString().split('T')[0];

const DAILY_POINTS = 20;
const LEVEL_POINTS = { EASY: 6, MED: 10, HARD: 15 };

// --- NEW: Persistent Identity for Guests ---
export function getIdentity(user) {
    if (user) return user.uid;

    let guestUid = localStorage.getItem('guest_uid');
    if (!guestUid) {
        // Generate a random unique ID for the guest device
        guestUid = 'guest_' + Math.random().toString(36).substring(2, 10);
        localStorage.setItem('guest_uid', guestUid);
    }
    return guestUid;
}

// --- CLOUD SYNC (Now works for Guests too!) ---
async function cloudSync(uid, points, nickname, gameId = null, level = null) {
    try {
        const payload = {
            uid: uid,
            nickname: nickname || 'Guest Player',
            points: points
        };
        if (gameId && level) {
            payload.gameId = gameId;
            payload.level = level;
        }
        await fetch('/api/submit-score', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
    } catch (e) {
        console.error("Cloud Sync Failed:", e);
    }
}

// --- SAVE PROGRESS ---
export async function saveProgress(user, gameId, level) {
    const uid = getIdentity(user);
    const profile = await localDB.profile.get(uid);
    const nickname = profile?.nickname || (user ? user.displayName : 'Guest Player');

    let pointsAwarded = level <= 50 ? LEVEL_POINTS.EASY : level <= 100 ? LEVEL_POINTS.MED : LEVEL_POINTS.HARD;
    const currentPoints = profile?.points || 0;
    const newTotal = currentPoints + pointsAwarded;

    await localDB.profile.put({ uid, nickname, points: newTotal });
    await localDB.progress.put({ gameId, level, date: getTodayKey() });

    // Sync to cloud (Logged in OR Guest)
    cloudSync(uid, newTotal, nickname, gameId, level);

    return { points: pointsAwarded, newTotal };
}

// --- SAVE DAILY HUNT ---
export async function saveDailyHunt(user) {
    const uid = getIdentity(user);
    const profile = await localDB.profile.get(uid);
    const nickname = profile?.nickname || (user ? user.displayName : 'Guest Player');

    const dateKey = getTodayKey();
    const alreadyDone = await localDB.history.get(dateKey);
    if (alreadyDone) return false;

    const currentPoints = profile?.points || 0;
    const newTotal = currentPoints + DAILY_POINTS;

    await localDB.profile.put({ uid, nickname, points: newTotal });
    await localDB.history.put({ date: dateKey, gameId: 'daily', level: 1 });

    cloudSync(uid, newTotal, nickname, 'daily', 1);

    return true;
}

// --- UPDATE NICKNAME (FIXED ZERO SCORE BUG) ---
// Now requires currentPoints to guarantee we don't wipe the score
export async function updateNickname(user, newName, currentPoints) {
    const uid = getIdentity(user);

    // Save locally
    await localDB.profile.put({ uid, nickname: newName, points: currentPoints });

    // Sync to Cloud immediately
    await cloudSync(uid, currentPoints, newName);
    return newName;
}

// --- MIGRATE GUEST -> USER ---
export async function migrateGuestToUser(user) {
    const guestUid = localStorage.getItem('guest_uid');
    if (!guestUid) return;

    const guestProfile = await localDB.profile.get(guestUid);
    if (!guestProfile || guestProfile.points === 0) return;

    console.log("🔄 Migrating Guest Data to User...");

    const userProfile = await localDB.profile.get(user.uid);
    const combinedPoints = (userProfile?.points || 0) + guestProfile.points;

    await localDB.profile.put({
        uid: user.uid,
        nickname: user.displayName || user.email.split('@')[0],
        points: combinedPoints
    });

    // Sync to cloud
    await cloudSync(user.uid, combinedPoints, user.displayName);

    // Wipe Guest so we don't migrate again
    await localDB.profile.delete(guestUid);
    localStorage.removeItem('guest_uid');

    console.log("✅ Migration Complete!");
}

// --- LOAD USER DATA ---
export async function loadUserData(user) {
    const uid = getIdentity(user);

    const loadLocal = async (targetUid) => {
        const profile = await localDB.profile.get(targetUid);
        const historyRows = await localDB.history.toArray();
        const progressRows = await localDB.progress.toArray();

        const progressMap = {};
        progressRows.forEach(p => {
            progressMap[`progress_${p.gameId}`] = p.level;
            progressMap[p.gameId] = p.level;
        });

        return {
            nickname: profile?.nickname || (user ? 'Player' : 'Guest Player'),
            points: profile?.points || 0,
            history: historyRows.map(h => h.date),
            progress: progressMap
        };
    };

    try {
        if (user) await migrateGuestToUser(user);

        const lbResponse = await fetch('/api/leaderboard');
        const scores = await lbResponse.json();
        const cloudProfile = scores.find(u => u.uid === uid);

        const progResponse = await fetch(`/api/get-progress?uid=${uid}`);
        let cloudLevels = [];
        if (progResponse.ok) cloudLevels = await progResponse.json();

        if (Array.isArray(cloudLevels)) {
            for (const row of cloudLevels) {
                const existing = await localDB.progress.get(row.game_id);
                if (!existing || existing.level < row.max_level) {
                    await localDB.progress.put({
                        gameId: row.game_id,
                        level: row.max_level,
                        date: getTodayKey()
                    });
                }
            }
        }

        const localData = await loadLocal(uid);
        return {
            ...localData,
            points: cloudProfile ? cloudProfile.points : localData.points,
            nickname: cloudProfile ? cloudProfile.nickname : localData.nickname
        };

    } catch (e) {
        console.warn("API Error. Using Local Data.");
    }

    return await loadLocal(uid);
}