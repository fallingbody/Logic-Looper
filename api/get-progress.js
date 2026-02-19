import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
    // 1. CORS Headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    try {
        const { uid } = req.query;

        if (!uid) return res.status(400).json({ error: 'Missing UID' });

        const sql = neon(process.env.DATABASE_URL);

        // 2. Fetch all game progress for this user
        // We use the 'max_level' column we created in the database
        const progress = await sql`
            SELECT game_id, max_level 
            FROM user_progress 
            WHERE uid = ${uid}
        `;

        return res.status(200).json(progress);

    } catch (error) {
        console.error("Fetch Progress Error:", error);
        return res.status(500).json({ error: 'Failed to fetch progress' });
    }
}