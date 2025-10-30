const adminKeyInput = document.getElementById('adminKey');
const saveKeyBtn = document.getElementById('saveKey');

const factionForm = document.getElementById('factionForm');
const resetFormBtn = document.getElementById('resetForm');
const deleteFactionBtn = document.getElementById('deleteFaction');
const factionList = document.getElementById('factionList');

const memberForm = document.getElementById('memberForm');
const memberList = document.getElementById('memberList');
const membersTitle = document.getElementById('membersTitle');
const seedBtn = document.getElementById('seedBtn');

function getKey() { return localStorage.getItem('civdex.adminKey') || ''; }
function setKey(k) { localStorage.setItem('civdex.adminKey', k); }
adminKeyInput.value = getKey();
saveKeyBtn.addEventListener('click', () => setKey(adminKeyInput.value.trim()));

let factions = [];
let selectedFaction = null;

async function api(path, options={}) {
  options.headers = Object.assign({}, options.headers || {}, {
    'Content-Type': 'application/json',
    'x-admin-key': getKey()
  });
  const res = await fetch(path, options);
  if (!res.ok) {
    const err = await res.json().catch(()=>({}));
    throw new Error(err.error || res.statusText);
  }
  return res.json();
}

function renderFactionList() {
  factionList.innerHTML = '';
  factions.forEach(f => {
    const btn = document.createElement('button');
    btn.className = 'text-left p-3 rounded-xl border border-neutral-800 bg-neutral-900 hover:bg-neutral-800/70';
    btn.innerHTML = `
      <div class="flex items-center justify-between gap-3">
        <div>
          <div class="font-semibold">${f.name}</div>
          <div class="text-xs text-neutral-400">${f.size_note || ''}</div>
        </div>
        <div class="text-[11px]">${(f.tags||[]).join(' • ')}</div>
      </div>
    `;
    btn.addEventListener('click', async () => {
      const full = await api(`/api/faction?id=${f.id}`, { headers: { 'x-admin-key': getKey() }});
      selectedFaction = full.faction;
      selectedFaction.members = full.members;
      membersTitle.textContent = selectedFaction.name;
      factionForm.name.value = selectedFaction.name;
      factionForm.size_note.value = selectedFaction.size_note || '';
      factionForm.description.value = selectedFaction.description || '';
      factionForm.tags.value = (selectedFaction.tags||[]).join(',');
      factionForm.id.value = selectedFaction.id;
      deleteFactionBtn.classList.remove('hidden');
      renderMembers();
    });
    factionList.appendChild(btn);
  });
}

function renderMembers() {
  memberList.innerHTML = '';
  if (!selectedFaction) return;
  memberForm.faction_id.value = selectedFaction.id;
  for (const m of selectedFaction.members) {
    const li = document.createElement('li');
    li.className = 'py-2 flex items-center justify-between';
    li.innerHTML = `
      <span>${m.name} ${m.is_leader ? '<span class="text-[11px] px-2 py-1 rounded-full bg-neutral-800 border border-neutral-700 ml-2">Leader</span>' : ''}</span>
      <div class="flex gap-2">
        <button class="px-2 py-1 rounded bg-neutral-800 hover:bg-neutral-700" data-action="toggle">${m.is_leader ? 'Unset Leader' : 'Set Leader'}</button>
        <button class="px-2 py-1 rounded bg-red-700 hover:bg-red-600" data-action="delete">Delete</button>
      </div>
    `;
    li.querySelector('[data-action="toggle"]').addEventListener('click', async () => {
      await api(`/api/member?id=${m.id}`, { method: 'PUT', body: JSON.stringify({ name: m.name, is_leader: !m.is_leader, notes: m.notes || '' }) });
      m.is_leader = !m.is_leader;
      renderMembers();
    });
    li.querySelector('[data-action="delete"]').addEventListener('click', async () => {
      await api(`/api/member?id=${m.id}`, { method: 'DELETE' });
      selectedFaction.members = selectedFaction.members.filter(x => x.id !== m.id);
      renderMembers();
    });
    memberList.appendChild(li);
  }
}

factionForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = factionForm.id.value;
  const payload = {
    name: factionForm.name.value.trim(),
    size_note: factionForm.size_note.value.trim(),
    description: factionForm.description.value.trim(),
    tags: factionForm.tags.value.split(',').map(s => s.trim()).filter(Boolean)
  };
  if (!id) {
    const res = await api('/api/factions', { method: 'POST', body: JSON.stringify(payload) });
    payload.id = res.id;
    factions.push(payload);
  } else {
    await api(`/api/faction?id=${id}`, { method: 'PUT', body: JSON.stringify(payload) });
    const f = factions.find(x => x.id == id);
    if (f) Object.assign(f, payload);
  }
  renderFactionList();
  factionForm.reset();
  deleteFactionBtn.classList.add('hidden');
  selectedFaction = null;
  membersTitle.textContent = '—';
  memberList.innerHTML = '';
});

resetFormBtn.addEventListener('click', () => {
  factionForm.reset();
  deleteFactionBtn.classList.add('hidden');
  selectedFaction = null;
  membersTitle.textContent = '—';
  memberList.innerHTML = '';
});

deleteFactionBtn.addEventListener('click', async () => {
  if (!factionForm.id.value) return;
  if (!confirm('Delete this faction and all its members?')) return;
  await api(`/api/faction?id=${factionForm.id.value}`, { method: 'DELETE' });
  factions = factions.filter(x => x.id != factionForm.id.value);
  renderFactionList();
  resetFormBtn.click();
});

memberForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!selectedFaction) return alert('Select a faction above first.');
  const payload = {
    name: memberForm.name.value.trim(),
    is_leader: memberForm.is_leader.checked
  };
  await api(`/api/members?faction_id=${selectedFaction.id}`, { method: 'POST', body: JSON.stringify(payload) });
  const full = await api(`/api/faction?id=${selectedFaction.id}`);
  selectedFaction.members = full.members;
  memberForm.reset();
  renderMembers();
});

seedBtn.addEventListener('click', async () => {
  if (!confirm('Seed starter data?')) return;
  await api('/api/seed', { method: 'POST' });
  alert('Seeded. Refreshing list...');
  load();
});

async function load() {
  const res = await fetch('/api/factions');
  factions = await res.json();
  renderFactionList();
}
load();
