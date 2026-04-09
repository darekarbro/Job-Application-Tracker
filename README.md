# MERN TypeScript Project Setup

This repository is set up as a workspace-based full-stack MERN project with separate frontend and backend apps.

## Tech Stack

- Frontend: React + TypeScript + Vite + Tailwind CSS
- Backend: Node.js + Express + TypeScript + Mongoose
- Tooling: ESLint + Prettier

## Folder Structure

```text
Job-Application-Tracker/
  client/
    src/
      app/
      components/
      features/
      hooks/
      pages/
      services/
      types/
    .env.example
    eslint.config.js
    postcss.config.js
    tailwind.config.js
    tsconfig.json
    tsconfig.app.json
    tsconfig.node.json
    vite.config.ts
    package.json
  server/
    src/
      config/
      constants/
      controllers/
      middlewares/
      models/
      routes/
      services/
      types/
      utils/
      validations/
      app.ts
      server.ts
    .env.example
    eslint.config.mjs
    tsconfig.json
    package.json
  .prettierrc.json
  .prettierignore
  package.json
```

## Installation Commands

Run from the repository root:

```bash
npm install
```

If recreating manually from scratch, install app-specific deps:

```bash
# Frontend
cd client
npm install

# Backend
cd ../server
npm install
```

## Scripts

Run from root:

```bash
npm run dev
npm run build
npm run typecheck
npm run lint
npm run lint:fix
npm run format
npm run format:check
```

## Base Configurations

### TypeScript

- Frontend TypeScript configs:
  - `client/tsconfig.json`
  - `client/tsconfig.app.json`
  - `client/tsconfig.node.json`
- Backend TypeScript config:
  - `server/tsconfig.json`

### ESLint

- Frontend ESLint config:
  - `client/eslint.config.js`
- Backend ESLint config:
  - `server/eslint.config.mjs`

### Prettier

- Workspace Prettier config: `.prettierrc.json`
- Workspace ignore file: `.prettierignore`

## Environment Variables

Create `.env` files from examples:

```bash
cp client/.env.example client/.env
cp server/.env.example server/.env
```

For Windows PowerShell:

```powershell
Copy-Item client/.env.example client/.env
Copy-Item server/.env.example server/.env
```

### Frontend (`client/.env`)

```env
VITE_API_URL=http://localhost:5000/api
```

### Backend (`server/.env`)

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/job_tracker
JWT_SECRET=replace-with-a-long-random-secret
JWT_EXPIRES_IN=7d
OPENAI_API_KEY=replace-with-your-openai-key
OPENAI_MODEL=gpt-4o-mini
CORS_ORIGIN=http://localhost:5173
```

## Notes

- This stage is setup/structure only.
- Business features can now be implemented in isolated layers under `server/src` and `client/src/features`.
