# Plan: Vercel deployment readiness

## Goal

Get the Next.js physics driving sandbox ready to deploy on Vercel. The app is already committed locally (commit `359047a`) on `main` but has not been pushed to GitHub yet (earlier push failed due to missing auth). No `vercel.json` exists.

## Current state

- Next.js 16.4.3, App Router, React 19.3.0, Tailwind CSS v4, TypeScript, Turbopack
- Scripts present: `dev`, `build`, `start`, `lint`
- `.gitignore` covers `.next/`, `out/`, `.vercel`, `node_modules`, `*.tsbuildinfo`
- `next.config.ts` has turbopack rules for Tailwind CSS (dev-focused; ignored by standard production build)
- `globals.css` uses `@import "tailwindcss"` (Tailwind v4 syntax)
- Client-side canvas app (`page.tsx` → `GameCanvas.tsx` → `Physics`/`Input`/`VehicleController`) using `window`/`document`/canvas APIs — all client-side, no SSR browser-API dependencies
- No environment variables required
- Layout uses `next/font/google` (Geist) — works on server and client
- Code committed locally but not pushed to GitHub

## Decisions

| Decision | Value | Rationale |
|----------|-------|-----------|
| Build command | `next build` | Already in `package.json`; Vercel auto-detects Next.js |
| Output directory | `.next/` | Next.js default; already gitignored |
| Framework preset | Next.js | Auto-detected by Vercel |
| `vercel.json` | Add | Explicit framework/build config for clarity and route control |
| Environment variables | None needed | App has no secrets or API keys |
| Install command | `npm install` | Default; `package-lock.json` committed |
| Development command | `next dev` | Already in `package.json` |
| Turbopack for production | No | Use standard Next.js compiler for `next build`; turbopack block in `next.config.ts` is dev-only and harmless |

## Tasks (in order)

### 1. Verify local production build succeeds

Run `npx next build` locally. Confirm no errors, especially:
- Tailwind CSS v4 `@import "tailwindcss"` compiles in production
- Turbopack block in `next.config.ts` doesn't break standard build
- Client-side canvas APIs (`window`, `document`, `canvas`) don't cause SSR errors

### 2. Add `vercel.json`

Create `vercel.json` with explicit Next.js framework config:

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "cleanUrls": true,
  "trailingSlash": false
}
```

### 3. Push committed code to GitHub

The local commit `359047a` on `main` needs to be pushed to `https://github.com/priyanshurao369-max/car.git`. Earlier push failed due to missing credential (no TTY). User must authenticate via:
- HTTPS with personal access token: `git remote set-url origin https://<token>@github.com/priyanshurao369-max/car.git`
- Or SSH: `git remote set-url origin git@github.com:priyanshurao369-max/car.git` with SSH key on GitHub

Then run `git push -u origin main`.

### 4. Connect repo to Vercel

- Import `priyanshurao369-max/car` in Vercel dashboard
- Vercel auto-detects Next.js; confirm build command `npm run build` and output `.next/`
- Add no environment variables (none needed)
- Deploy

### 5. Validate deployment

- Open the Vercel deployment URL
- Verify canvas renders (black Obsidian background, visible Porcelain vehicle)
- Verify controls work (WASD + Space)
- Verify reverse (hold S while stopped)

## Validation

- `npx tsc --noEmit` — no errors
- `npx eslint src` — no warnings/errors
- `npx next build` — completes successfully
- Deployed site loads and is interactive

## Risks

- Tailwind CSS v4 production build may need `postcss.config.js` if `@import "tailwindcss"` doesn't resolve — verify in task 1
- `next.config.ts` turbopack rules are dev-only; if production build complains, remove the `turbopack` block
- Git push blocked by auth — user must provide credentials (out of scope for this plan)

## Out of scope

- Custom domains
- Environment variables (none needed)
- CI/CD beyond Vercel auto-deploy
- Database or backend setup
