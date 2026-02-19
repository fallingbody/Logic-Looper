import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
    try {
        if (!process.env.DATABASE_URL) {
            throw new Error("DATABASE_URL is missing in Environment Variables!");
        }

        const sql = neon(process.env.DATABASE_URL);

        // Simple query to check connection
        const result = await sql`SELECT version()`;

        return res.status(200).json({
            status: "✅ Connected!",
            version: result[0].version
        });

    } catch (error) {
        return res.status(500).json({
            status: "❌ Connection Failed",
            error: error.message
        });
    }
}