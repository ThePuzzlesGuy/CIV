import { query, isAdmin } from './_db.js';

export async function handler(event) {
  try {
    if (!isAdmin(event)) return { statusCode: 401, body: JSON.stringify({ error: 'Unauthorized' }) };
    const id = Number(new URLSearchParams(event.queryStringParameters).get('id'));
    if (!id) return { statusCode: 400, body: JSON.stringify({ error: 'Missing id' }) };
    if (event.httpMethod === 'PUT') {
      const body = JSON.parse(event.body || '{}');
      const { name, is_leader = false, notes = '' } = body;
      await query(`UPDATE members SET name=$1, is_leader=$2, notes=$3 WHERE id=$4`, [name, !!is_leader, notes, id]);
      return { statusCode: 200, body: JSON.stringify({ ok: true }) };
    }
    if (event.httpMethod === 'DELETE') {
      await query(`DELETE FROM members WHERE id=$1`, [id]);
      return { statusCode: 200, body: JSON.stringify({ ok: true }) };
    }
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  } catch (e) {
    return { statusCode: 400, body: JSON.stringify({ error: e.message }) };
  }
}
