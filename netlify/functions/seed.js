import { query, isAdmin } from './_db.js';

const data = {
  "The Peak": {},
  "Ace_censation": {},
  "HD Clan": {},
  "Greeko Boys": {
    "size_note": "30-40; greek civ; only soldiers+builders?",
    "members": [
      {
        "name": "Ryzzie"
      },
      {
        "name": "Zeus"
      }
    ]
  },
  "Men in Suits": {},
  "Forbes": {},
  "Civ Event Veterans": {},
  "Goober Bay": {
    "size_note": "~60; chill; slightly better; led by Pear",
    "members": [
      {
        "name": "Pear",
        "is_leader": true
      }
    ]
  },
  "The Pharaonate": {
    "size_note": "~30; Egypt theme; Mudaakk",
    "members": [
      {
        "name": "Mudaakk",
        "is_leader": true
      },
      {
        "name": "Anubis"
      },
      {
        "name": "MolaftR"
      }
    ]
  },
  "Ironcrest Clan": {
    "size_note": "80-90; concerning; kind of cultish",
    "members": [
      {
        "name": "Isaiah Prior"
      }
    ]
  },
  "Boys Next Door": {
    "size_note": "~60; kind of cultish, but chill(?)",
    "members": [
      {
        "name": "Dowdens"
      },
      {
        "name": "Lionheart7"
      }
    ]
  },
  "F.U.N. Fellas": {
    "size_note": "~12",
    "description": "Friendship \u2022 Unity \u2022 Neutrality. Resource hub & peacekeepers."
  },
  "The Boys Coalition": {
    "size_note": "Not really a group; discord hub for boys"
  },
  "The Archivists' Library": {
    "size_note": "chill; note-taking on events"
  },
  "The Blue Order": {
    "size_note": "~20; bringing us together",
    "members": [
      {
        "name": "Bear"
      },
      {
        "name": "Adamello"
      }
    ]
  },
  "Domnul University": {
    "size_note": "~100; building a university",
    "members": [
      {
        "name": "Linguini",
        "is_leader": true
      },
      {
        "name": "Lingulini"
      }
    ]
  },
  "DUDE CITY": {
    "size_note": "~15? duck theme; everyone welcome; \u201cdude strong\u201d",
    "members": [
      {
        "name": "Ramseyer"
      }
    ]
  },
  "The Egalitarian Order": {
    "size_note": "private? no current info",
    "members": [
      {
        "name": "Rein"
      }
    ]
  }
};

export async function handler(event) {
  try {
    if (!isAdmin(event)) return { statusCode: 401, body: JSON.stringify({ error: 'Unauthorized' }) };
    for (const [name, info] of Object.entries(data)) {
      const f = await query('SELECT id FROM factions WHERE name=$1', [name]);
      let id;
      if (f.length) {
        id = f[0].id;
      } else {
        const rows = await query('INSERT INTO factions (name, description, size_note, tags) VALUES ($1,$2,$3,$4) RETURNING id',
          [name, info.description || '', info.size_note || '', '']);
        id = rows[0].id;
      }
      if (Array.isArray(info.members)) {
        for (const m of info.members) {
          const exists = await query('SELECT id FROM members WHERE faction_id=$1 AND name=$2', [id, m.name]);
          if (!exists.length) {
            await query('INSERT INTO members (faction_id, name, is_leader, notes) VALUES ($1,$2,$3,$4)',
              [id, m.name, !!m.is_leader, m.notes || '']);
          }
        }
      }
    }
    return { statusCode: 200, body: JSON.stringify({ ok: true }) };
  } catch (e) {
    return { statusCode: 400, body: JSON.stringify({ error: e.message }) };
  }
}
