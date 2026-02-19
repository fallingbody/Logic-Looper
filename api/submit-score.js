import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
    // 1. Setup Headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    try {
        const { uid, nickname, points, gameId, level } = req.body;

        if (!uid) return res.status(400).json({ error: 'Missing UID' });

        const sql = neon(process.env.DATABASE_URL);

        // 2. Sync User Points & Nickname
        await sql`
            INSERT INTO users (uid, nickname, points, updated_at) 
            VALUES (${uid}, ${nickname}, ${points}, NOW())
            ON CONFLICT (uid) 
            DO UPDATE SET 
                points = EXCLUDED.points, 
                nickname = EXCLUDED.nickname,
                updated_at = NOW()
        `;

        // 3. Sync Specific Game Progress
        // This stops the "Reset to Level 1" issue
        if (gameId && level) {
            await sql`
                INSERT INTO user_progress (uid, game_id, max_level, updated_at)
                VALUES (${uid}, ${gameId}, ${level}, NOW())
                ON CONFLICT (uid, game_id)
                DO UPDATE SET 
                    max_level = GREATEST(user_progress.max_level, EXCLUDED.max_level),
                    updated_at = NOW()
            `;
        }

        return res.status(200).json({ success: true });
    } catch (error) {
        console.error("Neon Sync Error:", error);
        return res.status(500).json({ error: error.message });
    }
}