import { randomUUID } from 'crypto';

export function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function generateRoundRobin(teamNames) {
  const list = [...teamNames];
  if (list.length % 2 !== 0) {
    list.push('BYE');
  }

  const n = list.length;
  const rounds = [];

  for (let r = 0; r < n - 1; r++) {
    const matches = [];
    let bye = null;

    for (let i = 0; i < n / 2; i++) {
      const home = list[i];
      const away = list[n - 1 - i];

      if (home === 'BYE') {
        bye = away;
      } else if (away === 'BYE') {
        bye = home;
      } else {
        matches.push({ id: randomUUID(), home: home, away: away, homeScore: null, awayScore: null });
      }
    }

    rounds.push({ round: r + 1, matches: matches, bye: bye });

    const last = list.pop();
    list.splice(1, 0, last);
  }

  return rounds;
}

export function calculateStandings(teams, fixtures) {
  const table = {};
  teams.forEach((team) => {
    table[team.name] = {
      name: team.name, played: 0, won: 0, drawn: 0, lost: 0,
      scoreFor: 0, scoreAgainst: 0, points: 0
    };
  });

  fixtures.forEach((round) => {
    round.matches.forEach((match) => {
      if (match.homeScore === null || match.awayScore === null) {
        return;
      }
      const home = table[match.home];
      const away = table[match.away];

      home.played++;
      away.played++;
      home.scoreFor += match.homeScore;
      home.scoreAgainst += match.awayScore;
      away.scoreFor += match.awayScore;
      away.scoreAgainst += match.homeScore;

      if (match.homeScore > match.awayScore) {
        home.won++; away.lost++; home.points += 3;
      } else if (match.homeScore < match.awayScore) {
        away.won++; home.lost++; away.points += 3;
      } else {
        home.drawn++; away.drawn++; home.points += 1; away.points += 1;
      }
    });
  });

  return Object.values(table).sort((a, b) =>
    (b.points - a.points) ||
    ((b.scoreFor - b.scoreAgainst) - (a.scoreFor - a.scoreAgainst)) ||
    (b.scoreFor - a.scoreFor)
  );
}

export function allMatchesPlayed(fixtures) {
  return fixtures.length > 0 && fixtures.every((round) =>
    round.matches.every((match) => match.homeScore !== null && match.awayScore !== null)
  );
}