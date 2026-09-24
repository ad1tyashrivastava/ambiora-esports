# Ambiora Esports Arena
By - Aditya Shrivastava MBA TECH CE 2nd Year

A 5-team esports tournament website with a real backend — teams and players are validated on the server, fixtures are generated with a round-robin algorithm, and everything is stored in a cloud database so it works the same on any device.

**Live:** https://ambiora-esports.vercel.app
**Repo:** https://github.com/ad1tyashrivastava/ambiora-esports

## What it does
- Landing page with a countdown, animated particles, and tournament info
- Register 5 teams of 5 players each (name, IGN, role, game ID)
- Auto-generates a round-robin schedule: 5 rounds, 10 matches, one bye per team
- Enter match scores → live points table → grand final between the top 2
- "Load demo data" fills 25 players instantly; "Reset" clears everything

## How to Register a Team
1. Open the site and click **Teams & fixtures** (or **Register your team**).
2. Under "Create a team," type a name and click **Add team** — repeat until you have 5 teams.
3. Under "Add a player," pick a team, fill in the player's name, IGN, role, and game ID, and click **Add player** — repeat until every team has 5 players (25 total).
4. Once full, click **Generate fixtures** to get the round-robin schedule, then enter scores as matches are played.

## Demo
Click **Load demo data** to instantly fill 5 teams with 25 players so you can test fixture generation, scoring, and the points table without typing anything by hand. Click **Reset tournament** to clear everything and start fresh.

## Benefits
- **Real backend, not just a form** — every rule (team limits, duplicate names, duplicate IGNs) is enforced on the server, so it can't be bypassed
- **Data persists everywhere** — stored in a cloud database, so the same tournament shows up on any device, not just the browser you registered on
- **Fair, provable scheduling** — the round-robin algorithm guarantees every team plays every other team exactly once, with no manual scheduling errors

## Frontend
- `index.html`, `teams.html` — the two pages
- `css/style.css`, `css/landing.css`, `css/teams.css` — styling
- `js/nav.js` — mobile menu
- `js/landing.js` — countdown, prize count-up, particle background
- `js/api.js` — sends requests to the backend
- `js/teams.js` — forms, rendering, all page logic

Pure HTML/CSS/vanilla JavaScript. No framework.

## Backend
- `api/teams.js` — create, rename, delete teams
- `api/players.js` — add, remove players
- `api/fixtures.js` — generate fixtures, save scores
- `api/tournament.js` — load demo data, reset

Node.js serverless functions on Vercel. Each file = one API route (e.g. `api/teams.js` → `/api/teams`).

## Other important components
- `lib/validation.js` — server-side rules (max 5 teams/players, unique IGNs, valid roles)
- `lib/fixtures.js` — round-robin algorithm (circle method) + points table math
- `lib/db.js` — reads/writes the tournament data in the database
- `lib/demo.js` — generates the demo dataset
- **Database:** Upstash Redis — stores the whole tournament as one JSON object, shared across all devices
- **External API:** DiceBear — generates team logo images

Validation happens on the server, so it can't be bypassed. Data is shared across devices, not stuck in one browser. This is a real client-server app, not a static page.

## Run locally
```
npm install
vercel dev
```