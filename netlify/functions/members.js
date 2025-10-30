import { query, isAdmin } from './_db.js';

export async function handler(event) {
  try {
    if (!isAdmin(event)) return { statusCode: 401, body: JSON.stringify({ error: 'Unauthorized' }) };
    const faction_id = Number(new URLSearchParams(event.queryStringParameters).get('faction_id'));
    if (event.httpMethod === 'POST') {
      const body = JSON.parse(event.body || '{}');
      const { name, is_leader = false, notes = '' } = body;
      const rows = await query(
        `INSERT INTO members (faction_id, name, is_leader, notes) VALUES ($1,$2,$3,$4) RETURNING id`,
        [faction_id, name, !!is_leader, notes]
      );
      return { statusCode: 200, body: JSON.stringify({ id: rows[0].id }) };
    }
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  } catch (e) {
    return { statusCode: 400, body: JSON.stringify({ error: e.message }) };
  }
}
