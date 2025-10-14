# GitHub Copilot Instructions

This file provides instructions to help GitHub Copilot generate code that aligns with this project's standards and practices.

## Project Overview

**Tech Stack:**
- Next.js 15 (App Router) with TypeScript
- React 19 with Tailwind CSS
- Fumadocs for documentation UI
- Directus CMS for headless content management
- Cloudflare Workers/Pages for deployment (via OpenNext)
- Orama for search functionality
- TipTap/ProseMirror for rich text editing

**Key Features:**
- MDX-based documentation system
- Custom search integration
- Dynamic content from Directus CMS
- ProseMirror integration for editing

## Development Setup

**Prerequisites:**
- Node.js 20+
- npm (or pnpm)
- Optional: `wrangler` for Cloudflare deployment

**Installation:**
```bash
npm ci
```

**Environment Setup:**
1. Copy `.env.local.example` to `.env.local`
2. Configure Directus and public variables (see AGENTS.md for full example)

**Development Server:**
```bash
npm run dev  # Starts on port 3002
```

**Content Sync:**
```bash
npm run sync         # One-time sync from Directus
npm run sync:watch   # Continuous sync
```

## Build and Test Commands

- `npm run build` - Production build (always run before committing significant changes)
- `npm run start` - Serve the built app
- `npm run preview` - Cloudflare preview via OpenNext
- `npm run build:cloudflare` - Build for Cloudflare deployment
- `npm run cf-typegen` - Wrangler type generation
- `npx tsx scripts/<script>.ts` - Run ad-hoc scripts

## Project Structure

- `app/` - Next.js App Router routes, layouts, and global styles
- `components/` - Reusable React components
- `lib/` - Data utilities (Directus clients, sources, MDX helpers)
- `public/` - Static assets
- `scripts/` - Operational and debugging scripts
- `styles/` and `app/global.css` - Tailwind styles
- Config files: `source.config.ts`, `next.config.*`, `tailwind.config.ts`, `wrangler.jsonc`, `tsconfig.json`

## Coding Style and Conventions

### Language and Framework
- Use TypeScript exclusively
- Write React function components (not class components)
- Use Tailwind CSS utility classes for styling

### Naming Conventions
- Files: Use kebab-case (e.g., `enhanced-table-v3.tsx`)
- Components and exports: Use PascalCase
- Imports: Prefer `@/path/to/file` using tsconfig alias

### Code Organization
- Keep data access logic in `lib/` directory
- Place server-side logic in `app/` server components/handlers
- Use colocated `.test.ts(x)` files for unit tests (e.g., `lib/__tests__/status-helpers.test.ts`)

### Style Guidelines
- Follow the existing code style in the repository
- Avoid adding comments unless they match the style of other comments or are necessary to explain complex logic
- Use existing libraries whenever possible

## Security Guidelines

- **Never commit secrets** - Use `.env.local` for sensitive data
- Check `lib/env-config.ts` for required environment variables
- Keep tokens out of commits and logs
- Validate all external input

## Testing

- Tests are minimal and excluded from TypeScript build
- Use colocated `.test.ts(x)` files for unit tests
- Run diagnostics with `npx tsx scripts/<script>.ts`
- If adding a test runner (e.g., Vitest), keep it simple and fast

## Architecture

### Data Flow
- Data source: Directus CMS via `lib/directus-*` clients
- Content: MDX/content collections powered by `lib/source.ts`
- Rendering: Next.js App Router with Fumadocs UI components

### Deployment
- Target: Cloudflare Workers/Pages
- Build: OpenNext adapter
- Config: `wrangler.jsonc` and `open-next.config.ts`

## Commit Guidelines

Follow Conventional Commits format:
- `feat:` - New features
- `fix:` - Bug fixes
- `chore:` - Maintenance tasks
- `docs:` - Documentation changes
- `refactor:` - Code refactoring
- `test:` - Test additions or modifications

## Pull Request Guidelines

- Provide clear description
- Link related issues
- Include before/after screenshots for UI changes
- Note any data/content changes
- Verify with `npm run build` locally
- For Cloudflare changes, test with `npm run preview`

## Important Notes

- The development server runs on port 3002 (not the default 3000)
- Always use the `@/` import alias for project files
- Environment variable `DEPLOYMENT_ENV` controls which Directus instance to use (`local` or `production`)
- Content sync scripts pull data from Directus - run sync before developing content-related features
