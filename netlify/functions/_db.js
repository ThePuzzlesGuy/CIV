import { neon } from '@neondatabase/serverless';

const CONN = process.env.DATABASE_URL;
if (!CONN) {
  console.warn('DATABASE_URL not set. Add Netlify DB or set env var.');
}
const sql = CONN ? neon(CONN) : async () => { throw new Error('No DATABASE_URL configured'); };

let bootstrapped = false;
export async function ensureSchema() {
  if (bootstrapped) return;
  await sql(`
    CREATE TABLE IF NOT EXISTS factions (
      id SERIAL PRIMARY KEY,
      name TEXT UNIQUE NOT NULL,
      description TEXT DEFAULT '',
      size_note TEXT DEFAULT '',
      tags TEXT DEFAULT ''
    );
    CREATE TABLE IF NOT EXISTS members (
      id SERIAL PRIMARY KEY,
      faction_id INTEGER NOT NULL REFERENCES factions(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      is_leader BOOLEAN NOT NULL DEFAULT FALSE,
      notes TEXT DEFAULT ''
    );
  `);
  bootstrapped = true;
}

export async function query(text, params=[]) {
  await ensureSchema();
  return sql(text, params);
}

export function isAdmin(event) {
  const key = event.headers['x-admin-key'] || event.headers['X-Admin-Key'];
  const ADMIN_KEY = process.env.ADMIN_KEY || 'change-me';
  return key && key === ADMIN_KEY;
}
