import { randomUUID } from 'crypto';
import { getState, saveState, sendState, sendError } from '../lib/db.js';
import { validateTeamName } from '../lib/validation.js';

export default async function handler(req, res) {
  try {
    const state = await getState();

    if (req.method === 'GET') {
      return sendState(res, state);
    }

    if (req.method === 'POST') {
      const name = String(req.body?.name ?? '').trim();
      const error = validateTeamName(name, state.teams);
      if (error) return sendError(res, 400, error);

      state.teams.push({ id: randomUUID(), name: name, players: [] });
      await saveState(state);
      return sendState(res, state, 201);
    }

    if (req.method === 'PATCH') {
      const team = state.teams.find((t) => t.id === req.query.id);
      if (!team) return sendError(res, 404, 'Team not found.');

      const name = String(req.body?.name ?? '').trim();
      const error = validateTeamName(name, state.teams, team.id);
      if (error) return sendError(res, 400, error);

      team.name = name;
      state.fixtures = [];
      await saveState(state);
      return sendState(res, state);
    }

    if (req.method === 'DELETE') {
      const countBefore = state.teams.length;
      state.teams = state.teams.filter((t) => t.id !== req.query.id);
      if (state.teams.length === countBefore) return sendError(res, 404, 'Team not found.');

      state.fixtures = [];
      await saveState(state);
      return sendState(res, state);
    }

    res.setHeader('Allow', 'GET, POST, PATCH, DELETE');
    return sendError(res, 405, `Method ${req.method} not allowed.`);
  } catch (err) {
    console.error(err);
    return sendError(res, 500, 'Server error. Please try again.');
  }
}