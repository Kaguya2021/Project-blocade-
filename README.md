# BLOCADE — Full Tactical Board Strategy Game

## Project Structure
- `src/App.jsx` — Complete React game client (Menu, 5-tier AI Bot engine, Press-and-Hold Horizontal/Vertical Wall Dock, Skin Shop, Customization Studio, Daily Rewards, Leaderboard, Profile, and Login/Password Auth + RU/EN localization).
- `server/index.js` — Node.js + Express + Socket.IO real-time multiplayer server with authoritative BFS pathfinding validation, matchmaking queue, private room codes, and user auth endpoints.

## Quick Start

### 1. Frontend (Vite + React + Tailwind)
```bash
npm install
npm run dev
```

### 2. Multiplayer Backend (Node.js + Socket.IO)
```bash
cd server
npm install
npm start
```
