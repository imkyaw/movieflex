# MovieFlex

Three-tier cloud movie store for INFS803 Cloud Computing (Option B).

| Layer | Stack |
|---|---|
| Client | React 18 + Vite + TypeScript |
| Backend | Node.js 20 + Express 5 + TypeScript (ESM) |
| Database | SQLite (local) → PostgreSQL on AWS RDS (prod) |

## Packages

- `server/` — REST API
- `client/` — web UI

## Prerequisites

- Node.js 20+
- npm 10+

## Quick start (local)

```bash
# from repo root
npm install

# copy env files
cp server/.env.example server/.env
cp client/.env.example client/.env

# API (http://localhost:3000)
npm run dev:server

# Client (http://localhost:5173) — in a second terminal
npm run dev:client
```

Health check: `GET http://localhost:3000/health`

## Scripts

| Command | Description |
|---|---|
| `npm run dev:server` | Start API in watch mode |
| `npm run dev:client` | Start Vite dev server |
| `npm run lint` | ESLint (flat config) |
| `npm run build` | Build server and client |

## Phase status

- [x] Phase 1 — Skeleton
- [ ] Phase 2 — Data layer
- [ ] Phase 3 — Auth
- [ ] Phase 4 — Catalogue + S3
- [ ] Phase 5 — Orders
- [ ] Phase 6 — Docs + client features
- [ ] Phase 7 — Deployment artefacts
- [ ] Phase 8 — Report pack
