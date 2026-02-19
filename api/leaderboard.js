import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
    // 1. CORS Headers (Essential for Vercel)
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle Pre-flight request
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // 2. Connect to Neon
        const sql = neon(process.env.DATABASE_URL);

        // 3. Fetch Top 10 Players
        // We select only nickname and points to keep data light
        const leaderboard = await sql`
            SELECT nickname, points 
            FROM users 
            ORDER BY points DESC 
            LIMIT 10
        `;

        return res.status(200).json(leaderboard);

    } catch (error) {
        console.error("Leaderboard Error:", error);
        return res.status(500).json({ error: 'Failed to fetch rankings' });
    }
}