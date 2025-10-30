import { query, isAdmin } from './_db.js';

export async function handler(event) {
  try {
    const id = Number(new URLSearchParams(event.queryStringParameters).get('id'));
    if (!id) return { statusCode: 400, body: JSON.stringify({ error: 'Missing id' }) };
    if (event.httpMethod === 'GET') {
      const f = await query(`SELECT id, name, description, size_note, tags FROM factions WHERE id = $1`, [id]);
      if (!f.length) return { statusCode: 404, body: JSON.stringify({ error: 'Not found' }) };
      const members = await query(`SELECT id, name, is_leader, notes FROM members WHERE faction_id = $1 ORDER BY is_leader DESC, name COLLATE "C"`, [id]);
      const faction = f[0];
      faction.tags = (faction.tags || '').split(',').map(s => s.trim()).filter(Boolean);
      return { statusCode: 200, body: JSON.stringify({ faction, members }) };
    }
    if (event.httpMethod === 'PUT') {
      if (!isAdmin(event)) return { statusCode: 401, body: JSON.stringify({ error: 'Unauthorized' }) };
      const body = JSON.parse(event.body || '{}');
      const { name, description = '', size_note = '', tags = [] } = body;
      const tagstr = Array.isArray(tags) ? tags.join(',') : String(tags || '');
      await query(`UPDATE factions SET name=$1, description=$2, size_note=$3, tags=$4 WHERE id=$5`, [name, description, size_note, tagstr, id]);
      return { statusCode: 200, body: JSON.stringify({ ok: true }) };
    }
    if (event.httpMethod === 'DELETE') {
      if (!isAdmin(event)) return { statusCode: 401, body: JSON.stringify({ error: 'Unauthorized' }) };
      await query(`DELETE FROM factions WHERE id=$1`, [id]);
      return { statusCode: 200, body: JSON.stringify({ ok: true }) };
    }
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  } catch (e) {
    return { statusCode: 400, body: JSON.stringify({ error: e.message }) };
  }
}
