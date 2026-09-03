# NCSA Zero Trust Cyber Mission — Backend (Prototype)

Node.js + Express + Socket.IO backend that turns the existing Admin Console / Player UI mockups into an actually-playable Kahoot-style multiplayer game. In-memory only (no database) — restarting the server clears all games. Built as a demo/prototype, not for production use.

## Run it locally

```bash
cd backend
npm install
npm start
```

Then open:
- Host (Admin Console): http://localhost:3000/host
- Player: http://localhost:3000/play

For other devices on the same Wi-Fi to join, open the host page using the LAN IP printed in the server's startup log (not `localhost`) — the QR code and PIN join link are generated from whatever URL the host's own browser is on.

## Deploy it for real (Render or Railway)

This app needs a host that runs a **persistent Node process** — it does not work on serverless platforms (Vercel, Netlify Functions, etc.) because game state lives in server memory and players stay connected over a live WebSocket the whole game. Render and Railway both run a normal long-lived process, so this deploys with **zero code changes**.

1. Push this repo to GitHub.
2. **Render**: New → Web Service → connect the repo. A `render.yaml` at the repo root already configures it (root dir `backend`, `npm install` / `npm start`, free plan) — Render should pick it up automatically via "New → Blueprint".
   **Railway**: New Project → Deploy from GitHub repo → set **Root Directory** to `backend` in the service settings. Railway auto-detects `npm start`.
3. Once deployed, open the service's public URL + `/host` to run a game — the QR code will automatically embed that public URL, so anyone can scan and join from anywhere (no shared Wi-Fi needed).

Both platforms' free tiers spin the service down after inactivity and take a few seconds to wake back up on the next request — fine for a demo, just expect a short delay if nobody's used it in a while.

## How a game works

1. Host opens `/host`, clicks "เล่นเกม", selects missions and (optionally) a custom time-per-round, clicks through to the Joining Room screen — this creates a real game room and Game PIN on the server, with a scannable QR code.
2. Players open `/play` (or scan the QR, which skips straight to name entry), enter the PIN and a name to join the lobby. The host's screen updates with each player in real time.
3. Host clicks "เริ่มเกม" to start. All players are pushed the same Mission Alert simultaneously.
4. Players answer the Security Decision screen (single choice, multi-select, sequencing, or risk analysis, depending on the mission). The host sees a live "answered X / Y" count and a countdown; the round auto-reveals when everyone's answered or time runs out.
5. Every player gets their real score (including a speed bonus for answering faster) and the recommended action; the host sees the real aggregate answer distribution.
6. Host advances through the rest of the selected missions, then a real scored **Final Attack** round (players build a Zero Trust defense layer-by-layer on their own device), then ends the game — everyone gets the final leaderboard with an animated podium.

## What's included

- 20 fully-scored missions across all four question types, plus a scored Final Attack round (`backend/gameContent.js`)
- Real scoring: single-choice (recommended/acceptable/risky/dangerous tiers), multi-select (partial credit), sequencing (position matching), risk analysis (level + action), Final Attack (layers unlocked)
- Speed bonus: faster correct answers score higher (Kahoot-style)
- Server-side round timer with auto-reveal (host can also reveal early manually); host can override the time-per-round from Mission Select
- Server never sends the correct answer to players before they submit (except Final Attack, which gives immediate per-question feedback by design)
- `backend/gameManager.js` holds the in-memory room/game state; `backend/server.js` wires it to Socket.IO events

## Known limitations (prototype scope)

- No persistence — a server restart (or free-tier cold start) drops all active games
- No auth — anyone with the PIN can join as any name; anyone with the `/host` link can host
