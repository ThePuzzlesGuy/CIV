// Simple static SPA: hash routing (#/f/:slug).
// Data is sourced from data/factions.json. Players are edited in GitHub only.

const App = (() => {
  const state = {
    factions: [],
    filtered: null,
  };

  const els = {
    app: document.getElementById("app"),
    search: document.getElementById("searchInput"),
    clear: document.getElementById("clearSearch"),
  };

  const slugify = (s) =>
    s.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');

  const avatarUrl = (username, size=64) =>
    `https://mc-heads.net/avatar/${encodeURIComponent(username)}/${size}.png`;

  async function loadData() {
    const res = await fetch('data/factions.json', { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to load factions.json');
    const data = await res.json();

    // Normalize & ensure slugs
    state.factions = data.factions.map(f => ({
      name: f.name,
      slug: f.slug || slugify(f.name),
      players: Array.isArray(f.players) ? f.players : []
    }));
  }

  function homeView() {
    const q = (state.filtered ?? '').trim().toLowerCase();
    const matches = state.factions.filter(f => {
      if (!q) return true;
      const inName = f.name.toLowerCase().includes(q);
      const inPlayers = f.players.some(p => (p.username || '').toLowerCase().includes(q));
      return inName || inPlayers;
    });

    const grid = matches.map(f => {
      const playerCount = f.players.length;
      return `<article class="card" data-href="#/f/${f.slug}" tabindex="0" role="button" aria-label="Open ${f.name}">
        <h3>${f.name}</h3>
        <div class="meta">
          <span class="badge">${playerCount} player${playerCount===1?'':'s'}</span>
          <span class="badge">slug: ${f.slug}</span>
        </div>
      </article>`;
    }).join('');

    els.app.innerHTML = `<section class="stack">
      <div class="grid">${grid || `<p class="empty">No factions match your search.</p>`}</div>
    </section>`;

    // click handlers
    els.app.querySelectorAll("[data-href]").forEach(card => {
      card.addEventListener('click', () => location.hash = card.getAttribute('data-href'));
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          location.hash = card.getAttribute('data-href');
        }
      });
    });
  }

  function factionView(slug) {
    const faction = state.factions.find(f => f.slug === slug);
    if (!faction) {
      els.app.innerHTML = `<a class="back-link" href="#">&larr; Back</a>
        <p class="empty">Faction not found.</p>`;
      return;
    }

    const players = faction.players.map(p => {
      const u = p.username;
      return `<div class="player">
        <img src="${avatarUrl(u, 96)}" alt="${u}'s head">
        <div>
          <div class="u">${u}</div>
          <small>Member of ${faction.name}</small>
        </div>
      </div>`;
    }).join('');

    els.app.innerHTML = `<a class="back-link" href="#">&larr; Back to all factions</a>
      <section class="stack">
        <h2>${faction.name}</h2>
        ${faction.players.length ? `<div class="player-list">${players}</div>`
          : `<p class="empty">No players listed yet. Add usernames in <code>data/factions.json</code> under <b>${faction.name}</b>.</p>`}
      </section>`;
  }

  function router() {
    const hash = location.hash || "#";
    const parts = hash.slice(1).split("/").filter(Boolean); // ["f", "slug"]
    if (!parts.length) {
      homeView();
      return;
    }
    if (parts[0] === "f" && parts[1]) {
      factionView(parts[1]);
      return;
    }
    homeView();
  }

  function bindSearch() {
    els.search.addEventListener("input", (e) => {
      state.filtered = e.target.value;
      router();
    });
    els.clear.addEventListener("click", () => {
      els.search.value = "";
      state.filtered = "";
      router();
      els.search.focus();
    });
  }

  async function init() {
    try {
      await loadData();
      bindSearch();
      window.addEventListener("hashchange", router);
      router();
      console.log("%cFaction Tracker ready","color:#6ca8ff");
    } catch (err) {
      console.error(err);
      els.app.innerHTML = `<p class="empty">Failed to load data. Ensure <code>data/factions.json</code> exists in your deployed site.</p>`;
    }
  }

  return { init };
})();

App.init();
