let state = { teams: [], fixtures: [], standings: [], ready: false, allPlayed: false };
let busy = false;

const teamForm = document.getElementById('teamForm');
const teamNameInput = document.getElementById('teamName');
const addTeamBtn = document.getElementById('addTeamBtn');
const playerForm = document.getElementById('playerForm');
const playerTeamSelect = document.getElementById('playerTeam');
const playerNameInput = document.getElementById('playerName');
const playerIgnInput = document.getElementById('playerIgn');
const playerRoleSelect = document.getElementById('playerRole');
const playerGameIdInput = document.getElementById('playerGameId');
const teamsGrid = document.getElementById('teamsGrid');
const fixturesContainer = document.getElementById('fixturesContainer');
const generateBtn = document.getElementById('generateBtn');
const printBtn = document.getElementById('printBtn');
const demoBtn = document.getElementById('demoBtn');
const resetBtn = document.getElementById('resetBtn');
const messageBox = document.getElementById('message');
const teamCountEl = document.getElementById('teamCount');
const playerCountEl = document.getElementById('playerCount');
const fixtureHint = document.getElementById('fixtureHint');
const standingsBlock = document.getElementById('standingsBlock');
const standingsBody = document.getElementById('standingsBody');
const finalCard = document.getElementById('finalCard');

function createEl(tag, className, text) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (text !== undefined) el.textContent = text;
  return el;
}

let messageTimer;
function showMessage(text, type) {
  messageBox.textContent = text;
  messageBox.className = 'message show ' + type;
  clearTimeout(messageTimer);
  messageTimer = setTimeout(() => {
    messageBox.className = 'message';
  }, 4000);
}

function totalPlayers() {
  return state.teams.reduce((sum, team) => sum + team.players.length, 0);
}

function avatarUrl(seed) {
  return `https://api.dicebear.com/10.x/bottts-neutral/svg?seed=${encodeURIComponent(seed)}`;
}

async function run(request, successMessage) {
  if (busy) return false;
  busy = true;
  document.body.classList.add('loading');

  const hadFixtures = state.fixtures.length > 0;
  try {
    state = await request();
    render();
    let text = successMessage;
    if (text && hadFixtures && state.fixtures.length === 0) {
      text += ' Fixtures were cleared, so generate them again.';
    }
    if (text) showMessage(text, 'success');
    return true;
  } catch (error) {
    showMessage(error.message, 'error');
    return false;
  } finally {
    busy = false;
    document.body.classList.remove('loading');
  }
}

function render() {
  renderStatus();
  renderTeamOptions();
  renderTeams();
  renderFixtures();
  renderStandings();
}

function renderStatus() {
  teamCountEl.textContent = `${state.teams.length}/5`;
  playerCountEl.textContent = `${totalPlayers()}/25`;
  addTeamBtn.disabled = state.teams.length >= 5;
  generateBtn.disabled = !state.ready;
  generateBtn.textContent = state.fixtures.length ? 'Regenerate fixtures' : 'Generate fixtures';
  printBtn.hidden = state.fixtures.length === 0;

  if (!state.ready) {
    fixtureHint.textContent = 'Fixtures unlock when you have 5 teams with 5 players each.';
  } else if (state.fixtures.length === 0) {
    fixtureHint.textContent = 'All 25 players registered. Generate the fixtures.';
  } else {
    fixtureHint.textContent = '5 rounds, 10 matches. Every team rests once.';
  }
}

function renderTeamOptions() {
  const previous = playerTeamSelect.value;
  playerTeamSelect.innerHTML = '';

  const placeholder = createEl('option', '', 'Select team');
  placeholder.value = '';
  playerTeamSelect.appendChild(placeholder);

  state.teams.forEach((team) => {
    const option = createEl('option', '', `${team.name} (${team.players.length}/5)`);
    option.value = team.id;
    option.disabled = team.players.length >= 5;
    playerTeamSelect.appendChild(option);
  });

  const stillOk = state.teams.find((t) => t.id === previous && t.players.length < 5);
  playerTeamSelect.value = stillOk ? previous : '';
}

function renderTeams() {
  teamsGrid.innerHTML = '';

  if (state.teams.length === 0) {
    teamsGrid.appendChild(createEl('p', 'empty', 'No teams yet. Create one above, or load the demo data.'));
    return;
  }

  state.teams.forEach((team, index) => {
    const card = createEl('article', 'team-card');

    const head = createEl('div', 'team-head');
    const logo = createEl('img', 'team-logo');
    logo.src = avatarUrl(team.name);
    logo.alt = `${team.name} logo`;
    logo.loading = 'lazy';
    logo.onerror = () => logo.remove();
    head.appendChild(logo);
    head.appendChild(createEl('span', 'team-num', '#' + (index + 1)));
    head.appendChild(createEl('h3', '', team.name));
    head.appendChild(createEl('span', team.players.length === 5 ? 'badge full' : 'badge', `${team.players.length}/5`));
    card.appendChild(head);

    const list = createEl('ul', 'player-list');
    if (team.players.length === 0) {
      list.appendChild(createEl('li', 'empty-small', 'No players yet'));
    }
    team.players.forEach((player) => {
      const row = createEl('li', 'player-row');
      const info = createEl('div', 'player-info');
      info.appendChild(createEl('strong', '', player.ign));
      info.appendChild(createEl('span', '', `${player.name}, ${player.role}, ID ${player.gameId}`));

      const removeBtn = createEl('button', 'icon-btn', '✕');
      removeBtn.title = `Remove ${player.ign}`;
      removeBtn.setAttribute('aria-label', `Remove ${player.ign}`);
      removeBtn.addEventListener('click', () => removePlayer(team, player));

      row.append(info, removeBtn);
      list.appendChild(row);
    });
    card.appendChild(list);

    const actions = createEl('div', 'team-actions');
    const renameBtn = createEl('button', 'btn btn-small btn-outline', 'Rename');
    renameBtn.addEventListener('click', () => renameTeam(team));
    const deleteBtn = createEl('button', 'btn btn-small btn-danger', 'Delete');
    deleteBtn.addEventListener('click', () => deleteTeam(team));
    actions.append(renameBtn, deleteBtn);
    card.appendChild(actions);

    teamsGrid.appendChild(card);
  });
}

function renderFixtures() {
  fixturesContainer.innerHTML = '';

  state.fixtures.forEach((round) => {
    const card = createEl('div', 'round-card');
    card.appendChild(createEl('h3', 'round-title', `Round ${round.round}`));

    round.matches.forEach((match) => {
      const row = createEl('div', 'match-row');
      const homeInput = createScoreInput(match.homeScore, `${match.home} score`);
      const awayInput = createScoreInput(match.awayScore, `${match.away} score`);

      const save = () => saveScore(match.id, homeInput, awayInput);
      homeInput.addEventListener('change', save);
      awayInput.addEventListener('change', save);

      const scoreBox = createEl('div', 'score-box');
      scoreBox.append(homeInput, createEl('span', 'vs', 'VS'), awayInput);

      row.appendChild(createEl('span', 'team-name', match.home));
      row.appendChild(scoreBox);
      row.appendChild(createEl('span', 'team-name away', match.away));
      card.appendChild(row);
    });

    if (round.bye) {
      card.appendChild(createEl('p', 'bye', `Resting this round: ${round.bye}`));
    }
    fixturesContainer.appendChild(card);
  });
}

function createScoreInput(value, label) {
  const input = createEl('input', 'score-input');
  input.type = 'number';
  input.min = '0';
  input.max = '99';
  input.placeholder = '-';
  input.value = value === null ? '' : value;
  input.setAttribute('aria-label', label);
  return input;
}

function renderStandings() {
  if (state.fixtures.length === 0) {
    standingsBlock.hidden = true;
    return;
  }
  standingsBlock.hidden = false;
  standingsBody.innerHTML = '';

  state.standings.forEach((row, index) => {
    const tr = document.createElement('tr');
    if (index < 2) tr.className = 'qualify';
    const diff = row.scoreFor - row.scoreAgainst;
    const cells = [index + 1, row.name, row.played, row.won, row.drawn, row.lost, (diff > 0 ? '+' : '') + diff, row.points];
    cells.forEach((value) => tr.appendChild(createEl('td', '', String(value))));
    standingsBody.appendChild(tr);
  });

  finalCard.innerHTML = '';
  finalCard.hidden = !state.allPlayed;
  if (state.allPlayed) {
    finalCard.appendChild(createEl('h3', '', '🏆 Grand final'));
    finalCard.appendChild(createEl('p', 'final-match', `${state.standings[0].name} vs ${state.standings[1].name}`));
  }
}

teamForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const name = teamNameInput.value.trim();
  const ok = await run(() => apiRequest('/api/teams', 'POST', { name }), `Team "${name}" created.`);
  if (ok) teamForm.reset();
});

playerForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const player = {
    teamId: playerTeamSelect.value,
    name: playerNameInput.value,
    ign: playerIgnInput.value,
    role: playerRoleSelect.value,
    gameId: playerGameIdInput.value
  };
  const ok = await run(() => apiRequest('/api/players', 'POST', player), `${player.ign.trim()} added.`);
  if (ok) {
    playerNameInput.value = '';
    playerIgnInput.value = '';
    playerRoleSelect.value = '';
    playerGameIdInput.value = '';
    playerNameInput.focus();
  }
});

function removePlayer(team, player) {
  if (!confirm(`Remove ${player.ign} from ${team.name}?`)) return;
  const url = `/api/players?teamId=${encodeURIComponent(team.id)}&playerId=${encodeURIComponent(player.id)}`;
  run(() => apiRequest(url, 'DELETE'), `${player.ign} removed.`);
}

function renameTeam(team) {
  const newName = prompt('New team name:', team.name);
  if (newName === null) return;
  const url = `/api/teams?id=${encodeURIComponent(team.id)}`;
  run(() => apiRequest(url, 'PATCH', { name: newName }), `Renamed to "${newName.trim()}".`);
}

function deleteTeam(team) {
  if (!confirm(`Delete "${team.name}" and its ${team.players.length} players?`)) return;
  const url = `/api/teams?id=${encodeURIComponent(team.id)}`;
  run(() => apiRequest(url, 'DELETE'), `"${team.name}" deleted.`);
}

generateBtn.addEventListener('click', async () => {
  if (state.fixtures.length && !confirm('Regenerate fixtures? All scores will be lost.')) return;
  const ok = await run(() => apiRequest('/api/fixtures', 'POST'), 'Fixtures generated: 5 rounds, 10 matches.');
  if (ok) fixturesContainer.scrollIntoView({ behavior: 'smooth' });
});

async function saveScore(matchId, homeInput, awayInput) {
  const toScore = (text) => (text === '' ? null : Number(text));
  try {
    state = await apiRequest('/api/fixtures', 'PATCH', {
      matchId: matchId,
      homeScore: toScore(homeInput.value),
      awayScore: toScore(awayInput.value)
    });
    renderStandings();
  } catch (error) {
    showMessage(error.message, 'error');
  }
}

demoBtn.addEventListener('click', () => {
  if (state.teams.length && !confirm('Replace all current teams with demo data?')) return;
  run(() => apiRequest('/api/tournament', 'POST'), 'Demo data loaded: 5 teams, 25 players.');
});

resetBtn.addEventListener('click', () => {
  if (!confirm('Delete all teams, players and fixtures?')) return;
  run(() => apiRequest('/api/tournament', 'DELETE'), 'Tournament reset.');
});

printBtn.addEventListener('click', () => window.print());

teamsGrid.appendChild(createEl('p', 'empty', 'Loading teams…'));
run(() => apiRequest('/api/teams'), '');