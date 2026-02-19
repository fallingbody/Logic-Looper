import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// 1. Get the current file path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 2. Load .env from the root folder (one level up)
dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function testConnection() {
    console.log("Checking for Connection String...");

    if (!process.env.VITE_DATABASE_URL) {
        console.error("❌ ERROR: VITE_DATABASE_URL is missing!");
        console.log("Make sure your .env file is in the root folder.");
        return;
    }

    try {
        const sql = neon(process.env.VITE_DATABASE_URL);
        const result = await sql`SELECT version()`;

        console.log("✅ Connection Successful!");
        console.log("Database Version:", result[0].version);
    } catch (error) {
        console.error("❌ Connection Failed:", error);
    }
}

testConnection();