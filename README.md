# Demo video link 
https://drive.google.com/drive/folders/1F10AKuPyAej6hIESNcZryHno7MZdqB_S?usp=sharing




# CivicSync

CivicSync is a civic infrastructure coordination prototype. It brings public works, contractors, municipal review, and citizen feedback into one web app, with a map and tools for spotting overlapping work schedules.

> **One city. One plan. No unnecessary digging.**

## What it includes

- **Public homepage:** project statistics, contractor leaderboard, map, workflow overview, community reports, suggestions, and outcome metrics.
- **Project map:** Leaflet map tiles and address search through Geoapify; filter projects by status and search by project, street, or area. On homepage load the browser is asked for location permission to sort nearby projects. Location is optional; deny it and use search or area shortcuts instead.
- **Citizen workspace:** browse projects, submit issue reports, and suggest improvements.
- **Contractor workspace:** submit project proposals, check schedule conflicts, respond to schedule proposals, upload project documents, and request completion inspection.
- **Municipal workspace:** review project proposals and documents, propose schedule changes, triage reports, convert suggestions into proposals, and record inspection outcomes.
- **Conflict detection:** flags overlapping date ranges on the same road segment for projects in relevant statuses. Conflicts are warnings for human review, not automatic decisions.
- **Contractor rankings:** ranks contractors from projects with final outcomes. The score weights completion rate at 60% and verified-complaint-free rate at 40%; a minimum of five eligible projects is required for the featured leaderboard.
- **Persistent demo data:** the Express server reads and writes JSON files under `server/data/` and can restore the seed dataset through its reset endpoint.

## Technology

- React 19, Vite, and Tailwind CSS
- Node.js and Express
- Leaflet maps with Geoapify tiles/geocoding and OpenStreetMap attribution
- JSON file persistence for the prototype

## Requirements

- Node.js (use a current LTS release)
- npm
- Internet access for map tiles and Geoapify geocoding

## Run locally

```powershell
npm install
npm run dev
```

This starts the Express API on `http://localhost:3001` and the Vite client on `http://localhost:5173`. The Vite development server proxies `/api` requests to the API. If either port is already in use, stop the existing process or configure another port; the client proxy target is set in `vite.config.js`.

Useful scripts:

```powershell
npm run dev          # Start API and web client together
npm run dev:server   # Start only the API
npm run dev:client   # Start only Vite
npm run build        # Build the client into dist/
npm start            # Start the API; serves dist/ when it exists
```

For a production-style local run, build the client first, then start the server:

```powershell
npm run build
npm start
```

## Deploy on Render

This repository includes a `render.yaml` Blueprint for a single Node web service. It installs dependencies, builds the Vite client, and starts Express, which serves both the app and `/api` routes.

1. Push this repository, including `render.yaml`, to GitHub.
2. In Render, choose **New → Blueprint**, connect the GitHub repository, and apply the `civicsync` service. The Blueprint uses Render's free plan in Singapore; change `plan` or `region` in `render.yaml` if needed.
3. Wait for the first deploy, then open the `onrender.com` URL shown on the service page. Render redeploys automatically when you push commits to the connected branch.

The app stores its runtime database in `server/data/civicsync_db.json`. Render's free service filesystem is ephemeral, so writes made through the deployed app can be lost when the service restarts or redeploys. Persistent disks require a paid web service; for important or production data, migrate this prototype's JSON storage to a managed database.

The Express server serves `dist/` when that directory exists. Set the API port with the `PORT` environment variable; it defaults to `3001`.

## Demo access

Open the app and choose **Demo sign in** on the sign-in page. Select a workspace first to enter the citizen, contractor, or municipal demo persona. The demo personas use sample data and are not real accounts.

The client routes are `/`, `/login`, `/signup`, `/citizen`, `/contractor`, and `/municipal`. A guest selecting a contractor or municipal entry is sent to sign-in with that role selected.

## Data and configuration

- Seed records are stored in `server/data/initial_seed.json`.
- Runtime records are persisted in `server/data/civicsync_db.json`.
- Set `VITE_GEOAPIFY_API_KEY` in `.env` for local development (copy `.env.example`). In Render, add the same variable under **Environment** and redeploy. Vite embeds `VITE_` variables in the browser bundle, so this key is visible to visitors; restrict it in Geoapify to the deployed site and the required APIs. Do not use an unrestricted secret here.
- Browser geolocation works on `localhost` and secure HTTPS origins. The permission prompt can be denied or blocked in browser settings without preventing project browsing.

## API overview

The Express API is mounted under `/api`. Main route groups include:

- `/auth`: personas, demo login, signup, and current-user lookup
- `/stats`, `/contractors`, `/contractors/leaderboard`, `/road-segments`
- `/conflicts` and `/projects/check-conflicts`
- `/projects`: list/detail, create, status, documents, schedule proposals/responses, completion requests, and inspections
- `/reports`: list, submit, and status updates
- `/suggestions`: list, submit, upvote, and convert to a project proposal
- `/audit-logs` and `/reset-data`

## Prototype limitations

- Data is local JSON, not a managed database or live municipal system.
- Authentication is for demonstration only. The API's login flow does not provide production-grade password verification, authorization, or session security.
- Municipal approvals, document checks, reports, metrics, and contractor scores use sample/demo records and must not be represented as official government decisions or verified real-world performance.
- The map and geocoding require an active Geoapify key and network access. Keep required provider attribution visible and review provider terms and quotas before deployment.
- There is no automated test script in `package.json`; `npm run build` verifies that the client bundles successfully.

## Project layout

```text
server/
  data/                 Seed and persisted JSON records
  services/             Conflict detection and contractor scoring
  index.js              Express API and production static hosting
src/
  components/           Homepage sections, map, and reusable dialogs
  context/              Authentication and role state
  pages/                Login and signup pages
  portals/              Citizen, contractor, and municipal workspaces
  services/             Geoapify map and geocoding helpers
  App.jsx               Routes, shared data loading, and page composition
```

See [README_Antigravity_CivicSync.md](README_Antigravity_CivicSync.md) for the original product requirements and design brief.
