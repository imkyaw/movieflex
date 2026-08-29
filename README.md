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

## Database

Local development uses SQLite; production uses PostgreSQL on Amazon RDS. The schemas and migration histories are intentionally separate because Prisma datasource providers cannot be selected through an environment variable:

```text
server/prisma/sqlite/    # local development and smoke tests
server/prisma/postgres/  # production deployment to RDS
```

Set up and seed the local database from the repository root:

```bash
npm run db:migrate
npm run db:seed
```

The seed creates one local admin identity, one local user identity, and 15 movies. These identities contain no passwords; authentication will be delegated to Cognito in Phase 3.

Docker applies committed SQLite migrations automatically when the server starts. Seed once with:

```bash
docker compose exec server npm run db:seed --workspace=server
```

## Team setup with Docker (recommended)

This gives every team member the same Node.js 20 environment. Install Docker Desktop, clone the repository, and run:

```bash
git clone https://github.com/imkyaw/movieflex.git
cd movieflex
docker compose up --build
```

Open the client at `http://localhost:5173` and the API health check at `http://localhost:3000/health`. Source files are mounted into both containers, so edits reload automatically.

Stop the containers with `Ctrl+C`, then run `docker compose down`. If dependencies become stale after a package change, run `docker compose down --volumes` and start again.

The containers are for consistent local development only. The required cloud architecture remains physically separated: React through CloudFront/S3, Express through Elastic Beanstalk, PostgreSQL through RDS, Cognito for identity, and a private S3 bucket for posters.

### Four-person Git workflow

Each member should work on their own branch and open a pull request. Do not rebase, squash, or force-push because the assignment requires visible contribution history.

```bash
git switch master
git pull
git switch -c feature/<member-name>-<task>

# after making and checking changes
git add <files>
git commit -m "feat(scope): describe the change"
git push -u origin feature/<member-name>-<task>
```

Merge pull requests with ordinary merge commits. Give all four members collaborator access under GitHub repository **Settings → Collaborators**.

## Scripts

| Command | Description |
|---|---|
| `npm run dev:server` | Start API in watch mode |
| `npm run dev:client` | Start Vite dev server |
| `npm run lint` | ESLint (flat config) |
| `npm run build` | Build server and client |
| `npm run db:migrate` | Create/apply a local SQLite development migration |
| `npm run db:seed` | Load the local users and 15-movie catalogue |
| `npm run db:reset` | Rebuild and reseed the local SQLite database |
| `npm run docker:up` | Build and start the development containers |
| `npm run docker:down` | Stop the development containers |
| `npm run docker:clean` | Stop containers and reset dependency volumes |

## Phase status

- [x] Phase 1 — Skeleton
- [x] Phase 2 — Data layer
- [ ] Phase 3 — Auth
- [ ] Phase 4 — Catalogue + S3
- [ ] Phase 5 — Orders
- [ ] Phase 6 — Docs + client features
- [ ] Phase 7 — Deployment artefacts
- [ ] Phase 8 — Report pack
