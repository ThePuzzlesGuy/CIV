# Civ Faction Tracker (Static, Netlify-ready)

A zero-build static website to track factions and the players in each faction for your Minecraft civilization event.

- **No local tooling required** — just push to GitHub and connect to Netlify.
- **Edit rosters in GitHub only** by updating `data/factions.json` (your "backend").
- **Player avatars** are pulled by username via `mc-heads.net` (no keys, no CORS issues).
- **Fast** single-file HTML/CSS/JS. Hash routing works on any static host.

## ✨ Features
- Home view: grid of faction cards with player counts
- Click a faction to see its members (MC head + username)
- Search across factions *and* players
- Clean, responsive UI

## 📁 Project Structure
```
/
├── index.html
├── style.css
├── app.js
├── data/
│   └── factions.json
└── assets/
    └── favicon.png
```

## 🛠️ How to Deploy (GitHub → Netlify)
1. Create a new **GitHub repository** (public or private).
2. Upload all files from this folder to the repo root.
3. Go to **Netlify → Add new site → Import from Git** and connect your repo.
4. **Build command:** _(leave empty)_  
   **Publish directory:** `/` (root)
5. Deploy. That’s it.

> If you prefer Netlify to build from a subfolder, keep this at the root. No framework, no build steps required.

## 🧰 How to Update Factions/Players (Your "Backend")
Edit `data/factions.json` in GitHub’s UI and commit. The site will auto-deploy via Netlify.

- **Add a player** by username to a faction’s `players` array.
- **Remove a player** by deleting their entry.
- **Rename a faction** by changing its `name` (the `slug` will be auto-generated on the client if you omit it).

### factions.json format
```json
{
  "factions": [
    {
      "name": "F.U.N. Fellas",
      "slug": "fun-fellas",
      "players": [
        { "username": "ExampleUser1" },
        { "username": "AnotherUser" }
      ]
    }
  ]
}
```

> **Note:** Player head images are retrieved from `https://mc-heads.net/avatar/{username}/96.png`. No UUID lookup necessary.

## 🔎 Search Tips
Use the search box in the header to find a faction by name or locate a player by username. Clear the search with the **×** button.

## ❓ Troubleshooting
- **I see “Failed to load data.”** — Ensure `data/factions.json` exists in your deployed site at `/data/factions.json` and is valid JSON.
- **Images don’t load** — Some usernames might be invalid. Double-check the spelling.
- **SEO/Branding** — Update `<title>` and `<meta description>` in `index.html`.

---

Made for quick, reliable hosting on Netlify with edits managed in GitHub.
