# Repository Guidelines

## Local Development Setup
- Prereqs: Node.js 20+, npm (or pnpm), optional `wrangler` for Cloudflare.
- Install: `npm ci` (or `npm install`).
- Env: copy `.env.local.example` → `.env.local`, then fill Directus and public vars (see example below).
- Run: `npm run dev` (listens on port 3002).
- Content: `npm run sync` to pull once or `npm run sync:watch` for continuous sync from Directus.
- Build/Preview: `npm run build`; Cloudflare preview with `npm run preview`.

## Project Structure & Module Organization
- `app/`: Next.js App Router routes, layouts, and global styles (`app/global.css`).
- `components/`: Reusable React components (files are kebab-case; components are PascalCase).
- `lib/`: Data + utilities (Directus clients, sources, MDX helpers). See `lib/source.ts` and `lib/directus-*`.
- `public/`: Static assets.  `styles/` and `app/global.css` hold Tailwind styles.
- `scripts/`: Operational and debugging scripts (e.g., Directus sync).
- Config: `source.config.ts`, `next.config.*`, `tailwind.config.ts`, `wrangler.jsonc`, `tsconfig.json` (alias `@/` → project root).

## Build, Test, and Development Commands
- `npm run dev`: Start Next.js on port 3002 for local development.
- `npm run build`: Production build.  `npm run start`: Serve the built app.
- `npm run preview`: Cloudflare preview via OpenNext (build + local preview).
- `npm run build:cloudflare`: Build for Cloudflare.  `npm run cf-typegen`: Wrangler type generation.
- Content sync: `npm run sync` (one-off) and `npm run sync:watch` (watch mode) to pull from Directus.
- Ad‑hoc scripts: `npx tsx scripts/final-verify.ts` (replace with any script in `scripts/`).

## Coding Style & Naming Conventions
- Language: TypeScript + React function components. Use Tailwind CSS (utility-first).
- Files: kebab-case for filenames (e.g., `enhanced-table-v3.tsx`). Components/exports use PascalCase.
- Imports: prefer `@/path/to/file` using the tsconfig alias; keep data access in `lib/`.
- Keep server-side logic in `app/` server components/handlers where possible.

## Testing Guidelines
- Tests are minimal and excluded from TypeScript build (`lib/__tests__`, `**/*.test.ts(x)`).
- Use colocated `.test.ts(x)` files for units (example: `lib/__tests__/status-helpers.test.ts`).
- Run diagnostics/ad‑hoc checks with `npx tsx scripts/<script>.ts`. If adding a runner (e.g., Vitest), keep it simple and fast.

## Commit & Pull Request Guidelines
- Follow Conventional Commits: `feat: …`, `fix: …`, `chore: …`, etc. (see current git history).
- PRs: clear description, linked issues, before/after screenshots for UI, and notes on data/content changes.
- Verify: run `npm run build` locally; for Cloudflare changes, test with `npm run preview`.

## Security & Configuration Tips
- Configure secrets in `.env.local` (never commit). Check `lib/env-config.ts` for required vars.
- Cloudflare settings live in `wrangler.jsonc`. Keep tokens out of commits and logs.

## Architecture Overview
- Data source: Directus via `lib/directus-*` and `lib/source.ts` powering MDX/content collections.
- Rendering: Next.js App Router (`app/`), Fumadocs packages for docs UI, Tailwind + Radix UI components.
- Deployment: OpenNext → Cloudflare (Workers/Pages). Config in `wrangler.jsonc` and `open-next.config.ts`.

## Environment Variables
- Core: `DEPLOYMENT_ENV` (`local`|`production`); `NODE_ENV` set by scripts.
- Local Directus: `LOCAL_DIRECTUS_URL`, `LOCAL_DIRECTUS_TOKEN` or `LOCAL_DIRECTUS_EMAIL`/`LOCAL_DIRECTUS_PASSWORD`.
- Production Directus: `PRODUCTION_DIRECTUS_URL`, `PRODUCTION_DIRECTUS_TOKEN` or `PRODUCTION_DIRECTUS_EMAIL`/`PRODUCTION_DIRECTUS_PASSWORD`.
- Tips: Prefer tokens where possible; never commit `.env.local`. Validate with `npx tsx scripts/test-auth.ts`.

### Example `.env.local` (redacted)
```
# Runtime mode
DEPLOYMENT_ENV=local

# Frontend (public) endpoints
NEXT_PUBLIC_DIRECTUS_URL=http://localhost:8056
NEXT_PUBLIC_ORAMA_ENDPOINT=https://api.orama.cloud/v1/indexes/your-index
NEXT_PUBLIC_ORAMA_API_KEY=your-public-orama-key

# Local Directus (use token OR email/password)
LOCAL_DIRECTUS_URL=http://localhost:8056
# LOCAL_DIRECTUS_TOKEN=xxxxx
# LOCAL_DIRECTUS_EMAIL=admin@example.com
# LOCAL_DIRECTUS_PASSWORD=xxxxx

# Production Directus (used when DEPLOYMENT_ENV=production)
PRODUCTION_DIRECTUS_URL=https://admin.charlotteudo.org
# PRODUCTION_DIRECTUS_TOKEN=xxxxx
# PRODUCTION_DIRECTUS_EMAIL=robot@example.com
# PRODUCTION_DIRECTUS_PASSWORD=xxxxx

# Optional: Webflow sync (server-side tasks)
# WEBFLOW_SITE_ID=xxxxx
# WEBFLOW_SITE_API_TOKEN=xxxxx
```
