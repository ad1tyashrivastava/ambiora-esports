import { randomUUID } from 'crypto';
import { ROLES } from './validation.js';

const TEAM_NAMES = ['Shadow Wolves', 'Neon Vipers', 'Iron Titans', 'Crimson Hawks', 'Storm Riders'];

const PLAYER_NAMES = [
  'Aarav', 'Vihaan', 'Arjun', 'Kabir', 'Rohan',
  'Ishaan', 'Aditya', 'Reyansh', 'Kunal', 'Dev',
  'Yash', 'Karan', 'Neel', 'Om', 'Ritvik',
  'Sahil', 'Tanay', 'Varun', 'Zaid', 'Pranav',
  'Harsh', 'Manav', 'Rudra', 'Shaurya', 'Ayaan'
];

export function createDemoState() {
  const teams = TEAM_NAMES.map((teamName, t) => ({
    id: randomUUID(),
    name: teamName,
    players: ROLES.map((role, p) => {
      const n = t * 5 + p;
      const shortName = teamName.split(' ')[1];
      return {
        id: randomUUID(),
        name: PLAYER_NAMES[n],
        ign: `${shortName}_${PLAYER_NAMES[n]}`,
        role: role,
        gameId: `AMB${1000 + n}`
      };
    })
  }));
  return { teams, fixtures: [] };
}