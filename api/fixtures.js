import { getState, saveState, sendState, sendError } from '../lib/db.js';
import { isTournamentReady, isValidScore } from '../lib/validation.js';
import { shuffle, generateRoundRobin } from '../lib/fixtures.js';

export default async function handler(req, res) {
  try {
    const state = await getState();

    if (req.method === 'POST') {
      if (!isTournamentReady(state.teams)) {
        return sendError(res, 400, 'You need exactly 5 teams with 5 players each.');
      }
      const names = shuffle(state.teams.map((t) => t.name));
      state.fixtures = generateRoundRobin(names);
      await saveState(state);
      return sendState(res, state, 201);
    }

    if (req.method === 'PATCH') {
      const { matchId, homeScore, awayScore } = req.body || {};

      if (!isValidScore(homeScore) || !isValidScore(awayScore)) {
        return sendError(res, 400, 'Scores must be whole numbers from 0 to 99.');
      }

      let match = null;
      for (const round of state.fixtures) {
        const found = round.matches.find((m) => m.id === matchId);
        if (found) match = found;
      }
      if (!match) return sendError(res, 404, 'Match not found. Generate fixtures again.');

      match.homeScore = homeScore;
      match.awayScore = awayScore;
      await saveState(state);
      return sendState(res, state);
    }

    res.setHeader('Allow', 'POST, PATCH');
    return sendError(res, 405, `Method ${req.method} not allowed.`);
  } catch (err) {
    console.error(err);
    return sendError(res, 500, 'Server error. Please try again.');
  }
}