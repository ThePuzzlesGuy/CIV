const grid = document.getElementById('grid');
const search = document.getElementById('search');
const tagFilter = document.getElementById('tagFilter');

const drawer = document.getElementById('drawer');
const drawerClose = document.getElementById('drawerClose');
const drawerBackdrop = document.getElementById('drawerBackdrop');
const drawerTitle = document.getElementById('drawerTitle');
const drawerNote = document.getElementById('drawerNote');
const drawerBody = document.getElementById('drawerBody');

let factions = [];
let allTags = new Set();

function renderCards(list) {
  grid.innerHTML = '';
  if (!list.length) {
    grid.innerHTML = '<p class="text-neutral-400">No factions match your search.</p>';
    return;
  }
  for (const f of list) {
    const card = document.createElement('button');
    card.className = 'text-left p-4 rounded-2xl border border-neutral-800 bg-neutral-900 hover:bg-neutral-800/70 transition';
    card.innerHTML = `
      <div class="flex items-center justify-between gap-3">
        <h3 class="text-lg font-semibold">${f.name}</h3>
        <span class="text-[11px] px-2 py-1 rounded-full bg-neutral-800 border border-neutral-700">${(f.tags||[]).join(' • ') || 'Faction'}</span>
      </div>
      <p class="mt-2 text-sm text-neutral-300">${f.description || ''}</p>
      <p class="mt-2 text-xs text-neutral-400">${f.size_note || ''}</p>
    `;
    card.addEventListener('click', () => openFaction(f.id));
    grid.appendChild(card);
  }
}

async function openFaction(id) {
  const res = await fetch(`/api/faction?id=${id}`);
  const { faction, members } = await res.json();
  drawerTitle.textContent = faction.name;
  drawerNote.textContent = [faction.size_note, (faction.tags||[]).join(' • ')].filter(Boolean).join(' — ');

  const list = members.map(m => `
    <li class="flex items-center justify-between gap-3 py-2 border-b border-neutral-800/60">
      <span>${m.name}</span>
      ${m.is_leader ? '<span class="text-[11px] px-2 py-1 rounded-full bg-neutral-800 border border-neutral-700">Leader</span>' : ''}
    </li>
  `).join('');
  drawerBody.innerHTML = `
    <p class="text-neutral-300">${faction.description || ''}</p>
    <ul class="mt-4">${list || '<li class="text-neutral-500">No known members yet.</li>'}</ul>
  `;
  drawer.classList.remove('hidden');
}

function closeDrawer() {
  drawer.classList.add('hidden');
}

drawerClose.addEventListener('click', closeDrawer);
drawerBackdrop.addEventListener('click', closeDrawer);

async function load() {
  const res = await fetch('/api/factions');
  factions = await res.json();
  // collect tags
  allTags = new Set();
  factions.forEach(f => (f.tags||[]).forEach(t => allTags.add(t)));
  tagFilter.innerHTML = '<option value="">All tags</option>' + Array.from(allTags).sort().map(t => `<option>${t}</option>`).join('');
  renderCards(factions);
}

function applyFilters() {
  const q = (search.value || '').toLowerCase().trim();
  const tag = (tagFilter.value || '').trim();
  let list = factions;
  if (q) {
    list = list.filter(f => f.name.toLowerCase().includes(q) || (f.description||'').toLowerCase().includes(q) || (f.size_note||'').toLowerCase().includes(q));
  }
  if (tag) {
    list = list.filter(f => (f.tags||[]).includes(tag));
  }
  renderCards(list);
}

search.addEventListener('input', applyFilters);
tagFilter.addEventListener('change', applyFilters);

load();
