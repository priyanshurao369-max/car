# Plan: integrate `react-snowfall`

## Goal
- Satisfy “npm install snowfall” by integrating a snowfall visual effect using `react-snowfall` in this Next.js app.

## Current context (inspected)
- Stack: Next.js App Router, React, TypeScript, Tailwind (`package.json`, `README.md`).
- UI entry: `src/app/layout.tsx` (root layout), `src/app/page.tsx` renders `<GameCanvas />`, `src/components/GameCanvas.tsx` is a `"use client"` canvas-driven fullscreen view.
- No existing `snow`/`snowfall` usage in source; `package.json` lacks snowfall deps.

## Decisions
- Package choice: `react-snowfall` (React component, fits Next 16/React 19). Raw `snowfall`/`snowfall.js` would need custom DOM/canvas wiring and is less idiomatic here.
- Render scope (recommended default): global overlay from root layout so effect is consistent site-wide and isolated from game canvas logic.
- Rendering boundary: mount in a small client component (e.g. `src/components/SnowfallOverlay.tsx` with `"use client"`) and include it in `src/app/layout.tsx` `<body>` to avoid making the layout itself a client component.
- Visual/UX guardrails: `pointer-events: none`, fixed/fullscreen positioning, high z-index but not blocking controls; tune conservative defaults (`snowflakeCount`, `speed`, `wind`, `radius`, color/opacity) so it doesn’t obscure gameplay/HUD.
- Configurability: keep props/constants local unless future toggle requested (out of scope).

## Implementation steps (for implementation agent)
1. **Dependencies**
   - Run `npm install react-snowfall` in project root.
   - Confirm `package.json` and `package-lock.json` updated; no unrelated dependency churn.
2. **Add overlay component** (`src/components/SnowfallOverlay.tsx`)
   - `"use client"`, default export.
   - Render `<Snowfall />` from `react-snowfall` with chosen props and wrapper/styles ensuring non-interactive overlay (`pointerEvents: "none"`), full viewport coverage.
   - Consider `aria-hidden`/decorative intent if applicable.
3. **Wire into layout** (`src/app/layout.tsx:20-34`)
   - Import and render `<SnowfallOverlay />` inside `<body>` (e.g. before `{children}`) so it layers predictably above background/canvas as designed.
4. **Optional styling touchpoints** (only if needed)
   - `src/app/globals.css` for shared overlay class; avoid changing game render logic in `src/game/*` or `src/components/GameCanvas.tsx`.

## Affected boundaries & data flow
- UI-only: new client component → root layout composition. No changes to physics/game loop (`src/game/*`), input, or state.
- Bundle impact: adds `react-snowfall` to client bundle; SSR remains unchanged if component is client-only and used safely.

## Risks / edge cases
- Visual interference with dark “Apple-style” canvas/HUD and D-pad controls — mitigate with opacity/count/speed tuning and `pointer-events: none`.
- Performance on low-end/mobile during canvas game loop — start with modest `snowflakeCount`; verify frame feel.
- Layering/z-index conflicts with existing absolute canvas/UI (`GameCanvas.tsx` uses fullscreen canvas and absolute controls) — verify overlay does not capture input.
- React/Next compatibility (React 19 / Next 16.4) — validate types/build; prefer stable API usage.

## Validation plan
- `npm run lint` (and `npm run build` or `npx tsc --noEmit` if appropriate) to catch type/import issues.
- `npm run dev` and manually verify: snowfall visible, controls/canvas interaction unaffected, no console errors/hydration warnings, acceptable performance.
- Out of scope: automated visual tests (none present).

## Out of scope / open items
- User-configurable toggle, seasonal logic, or design-token alignment beyond reasonable defaults.
- If “snowfall” was meant as the literal npm package name `snowfall` (not `react-snowfall`), implementation must confirm before diverging — **current plan assumes `react-snowfall` per user answer.**
