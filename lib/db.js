import { Redis } from '@upstash/redis';
import { calculateStandings, allMatchesPlayed } from './fixtures.js';
import { isTournamentReady } from './validation.js';

const redis = new Redis({
  url: process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN
});

const KEY = 'ambiora:tournament';

export async function getState() {
  const state = await redis.get(KEY);
  return state || { teams: [], fixtures: [] };
}

export async function saveState(state) {
  await redis.set(KEY, state);
}

export async function clearState() {
  await redis.del(KEY);
}

export function sendState(res, state, status = 200) {
  res.status(status).json({
    teams: state.teams,
    fixtures: state.fixtures,
    standings: calculateStandings(state.teams, state.fixtures),
    ready: isTournamentReady(state.teams),
    allPlayed: allMatchesPlayed(state.fixtures)
  });
}

export function sendError(res, status, message) {
  res.status(status).json({ error: message });
}