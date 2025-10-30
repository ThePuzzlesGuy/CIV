import { query, isAdmin } from './_db.js';

export async function handler(event) {
  try {
    if (event.httpMethod === 'GET') {
      const rows = await query(`
        SELECT id, name, description, size_note, tags
        FROM factions
        ORDER BY name COLLATE "C"
      `);
      const out = rows.map(r => ({ ...r, tags: (r.tags || '').split(',').map(s=>s.trim()).filter(Boolean) }));
      return { statusCode: 200, body: JSON.stringify(out) };
    }
    if (event.httpMethod === 'POST') {
      if (!isAdmin(event)) return { statusCode: 401, body: JSON.stringify({ error: 'Unauthorized' }) };
      const body = JSON.parse(event.body || '{}');
      const { name, description = '', size_note = '', tags = [] } = body;
      const tagstr = Array.isArray(tags) ? tags.join(',') : String(tags || '');
      const rows = await query(
        `INSERT INTO factions (name, description, size_note, tags) VALUES ($1,$2,$3,$4) RETURNING id`,
        [name, description, size_note, tagstr]
      );
      return { statusCode: 200, body: JSON.stringify({ id: rows[0].id }) };
    }
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  } catch (e) {
    return { statusCode: 400, body: JSON.stringify({ error: e.message }) };
  }
}
