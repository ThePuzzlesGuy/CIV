# CivDex — Netlify Edition (Functions + Netlify DB)

Browse factions, click for details & members, and manage everything via a simple admin key.
This version is **ready for GitHub + Netlify**.

## Stack
- Static frontend (vanilla HTML/JS + Tailwind CDN)
- **Netlify Functions** for API
- **Netlify DB** (serverless Postgres powered by Neon) for persistence

## One-time setup (local + Netlify)
1. **Install Netlify CLI** (optional for local dev)
   ```bash
   npm i -g netlify-cli
   ```

2. **Create the database**
   - Either in your project folder run:
     ```bash
     npx netlify db init
     ```
     (or set `DATABASE_URL` manually to a Neon / Postgres URL)
   - In Netlify UI you can also add Netlify DB (Neon) to your site later.

3. **Environment variables**
   - Set `ADMIN_KEY` to any secret string (in Netlify → Site settings → Environment variables).
   - If you didn’t use `netlify db init`, set `DATABASE_URL` to your Postgres connection string.

4. **Local dev**
   ```bash
   netlify dev
   ```
   Visit http://localhost:8888

5. **Deploy**
   - Push this repo to GitHub.
   - In Netlify, “Import from Git”, select the repo, and deploy.
   - Build settings are picked up from `netlify.toml`.

## API (serverless)
- `GET /.netlify/functions/factions` — list factions
- `POST /.netlify/functions/factions` — create (admin)
- `GET /.netlify/functions/faction?id=123` — get single with members
- `PUT /.netlify/functions/faction?id=123` — update faction (admin)
- `DELETE /.netlify/functions/faction?id=123` — delete faction (admin)
- `POST /.netlify/functions/members?faction_id=123` — add member (admin)
- `PUT /.netlify/functions/member?id=456` — update member (admin)
- `DELETE /.netlify/functions/member?id=456` — delete member (admin)

Admin calls require header `x-admin-key: <ADMIN_KEY>`.

## Data model
```sql
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
```

---

### Seeding
Run the “Seed” button at the bottom of `/admin.html` **locally** (it calls a seed function) or use the admin UI to enter data by hand. You can delete the seed function after initial import.
