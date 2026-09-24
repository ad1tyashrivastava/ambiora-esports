export const MAX_TEAMS = 5;
export const PLAYERS_PER_TEAM = 5;
export const ROLES = ['IGL', 'Entry Fragger', 'Support', 'Sniper', 'Flex'];

function sameText(a, b) {
  return a.trim().toLowerCase() === b.trim().toLowerCase();
}

export function validateTeamName(name, teams, ignoreId) {
  const cleanName = String(name ?? '').trim();

  if (!ignoreId && teams.length >= MAX_TEAMS) {
    return 'You already have 5 teams. Delete one to add another.';
  }
  if (cleanName.length < 2 || cleanName.length > 20) {
    return 'Team name must be 2 to 20 characters.';
  }
  if (sameText(cleanName, 'BYE')) {
    return '"BYE" is reserved for rest rounds. Pick another name.';
  }
  const duplicate = teams.some((team) => team.id !== ignoreId && sameText(team.name, cleanName));
  if (duplicate) {
    return `A team called "${cleanName}" already exists.`;
  }
  return '';
}

export function validatePlayer(player, team, teams) {
  if (!team) {
    return 'Choose a team for this player.';
  }
  if (team.players.length >= PLAYERS_PER_TEAM) {
    return `${team.name} already has 5 players.`;
  }
  if (!player.name || !player.ign || !player.role || !player.gameId) {
    return 'Fill in all four player fields.';
  }
  if (player.name.length > 30 || player.ign.length > 20 || player.gameId.length > 20) {
    return 'Name max 30 characters, IGN and Game ID max 20.';
  }

  if (!ROLES.includes(player.role)) {
    return 'Choose a valid role.';
  }

  for (const t of teams) {
    for (const p of t.players) {
      if (sameText(p.ign, player.ign)) {
        return `IGN "${player.ign}" is already used in ${t.name}.`;
      }
      if (sameText(p.gameId, player.gameId)) {
        return `Game ID "${player.gameId}" is already registered in ${t.name}.`;
      }
    }
  }
  return '';
}

export function isTournamentReady(teams) {
  return teams.length === MAX_TEAMS && teams.every((team) => team.players.length === PLAYERS_PER_TEAM);
}

export function isValidScore(score) {
  return score === null || (Number.isInteger(score) && score >= 0 && score <= 99);
}