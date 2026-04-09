# AI-Assisted Job Application Tracker

Full-stack MERN-style application for tracking job applications with AI-assisted workflows.

## Stack

- Frontend: React, TypeScript, Vite, Tailwind CSS, React Query, React Router
- Backend: Node.js, Express, TypeScript, Mongoose, Zod
- AI integration: OpenAI SDK with structured JSON responses and fallback parsing
- Tooling: ESLint, Prettier, TypeScript strict checks

## Project Structure

```text
Job-Application-Tracker/
  client/                # React app
  server/                # Express API
  package.json           # npm workspaces + root scripts
```

## Prerequisites

- Node.js 20+
- npm 10+
- MongoDB instance (local or hosted)
- OpenAI API key

## How To Run The Project

1. Install dependencies from repository root:

```bash
npm install
```

2. Create environment files:

```bash
cp client/.env.example client/.env
cp server/.env.example server/.env
```

PowerShell:

```powershell
Copy-Item client/.env.example client/.env
Copy-Item server/.env.example server/.env
```

3. Fill required values in both .env files (see Environment Variables section).

4. Start client and server together from root:

```bash
npm run dev
```

5. Open the app at:

- Frontend: http://localhost:5173
- Backend health check: http://localhost:5000/health

## Scripts

Root (runs across workspaces):

```bash
npm run dev
npm run dev:client
npm run dev:server
npm run build
npm run typecheck
npm run lint
npm run lint:fix
npm run format
npm run format:check
```

Per-workspace:

- Client: `npm run dev --workspace client`, `npm run build --workspace client`
- Server: `npm run dev --workspace server`, `npm run build --workspace server`, `npm run start --workspace server`

## Environment Variables

### Client (client/.env)

| Variable | Required | Description | Example |
| --- | --- | --- | --- |
| VITE_API_URL | Yes | Base URL for frontend API calls | http://localhost:5000/api |
| VITE_BYPASS_AUTH | No | Development-only auth bypass for viewing protected pages without login | false |

To view protected pages without logging in during local development, set:

```env
VITE_BYPASS_AUTH=true
```

Important: keep this value false in production.

### Server (server/.env)

| Variable | Required | Description | Example |
| --- | --- | --- | --- |
| NODE_ENV | No | Runtime mode (`development`, `test`, `production`) | development |
| PORT | No | API port | 5000 |
| MONGODB_URI | Yes | MongoDB connection string | mongodb://localhost:27017/job_tracker |
| JWT_SECRET | Yes | JWT signing secret (min 16 chars) | replace-with-a-long-random-secret |
| JWT_EXPIRES_IN | No | JWT expiration window | 7d |
| JWT_COOKIE_NAME | No | Auth cookie name | accessToken |
| JWT_COOKIE_MAX_AGE_DAYS | No | Cookie max age in days | 7 |
| OPENAI_API_KEY | Yes | OpenAI API key used for AI endpoints | replace-with-your-openai-key |
| OPENAI_MODEL | No | OpenAI model name | gpt-4o-mini |
| CORS_ORIGIN | No | Allowed frontend origin | http://localhost:5173 |

## Key Decisions Made

1. npm workspaces monorepo
   Single root command runs both apps while keeping client and server dependency trees separated.

2. Clean architecture style on backend
   Routes -> controllers -> services -> models/validation keeps business logic testable and avoids fat route handlers.

3. Zod for request/environment validation
   Input schemas fail fast with consistent error messages and reduce runtime surprises.

4. Cookie-based JWT auth
   Uses httpOnly cookie transport instead of localStorage token persistence for better browser-side security defaults.

5. React Query for server state
   Handles caching, loading/error states, optimistic status moves in Kanban, and cache invalidation after mutations.

6. Defensive AI response handling
   AI endpoints request strict JSON schema output and fall back to json_object mode with post-validation to prevent malformed payloads.

7. Shared quality gates
   Root lint/typecheck/build commands enforce consistency across both frontend and backend before shipping.

## Production Notes

- Set `NODE_ENV=production` in deployment.
- Use a strong random `JWT_SECRET` and secure secret management.
- Update `CORS_ORIGIN` to your deployed frontend domain.
- Ensure HTTPS in production so secure cookies are transmitted properly.
