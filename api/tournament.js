import { getState, saveState, clearState, sendState, sendError } from '../lib/db.js';
import { createDemoState } from '../lib/demo.js';

export default async function handler(req, res) {
  try {
    if (req.method === 'POST') {
      const demo = createDemoState();
      await saveState(demo);
      return sendState(res, demo, 201);
    }

    if (req.method === 'DELETE') {
      await clearState();
      return sendState(res, await getState());
    }

    res.setHeader('Allow', 'POST, DELETE');
    return sendError(res, 405, `Method ${req.method} not allowed.`);
  } catch (err) {
    console.error(err);
    return sendError(res, 500, 'Server error. Please try again.');
  }
}