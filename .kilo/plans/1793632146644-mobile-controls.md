# Plan: Minimal ECC Skills Integration — Driving Feel + Deployment Only

## Goal

Apply only the ECC skill patterns that directly improve:
1. **Driving feel** — responsiveness, smoothness, input handling
2. **Deployment** — reliable Vercel production builds, cache, CSP

Everything else is out of scope (process, testing, accessibility, team workflows).

---

## What Stays (Current Implementation is Good)

- `GameCanvas.tsx` single component — fine for canvas game loop
- `Input.ts` class — fine, already has gamepad polling + haptics
- `VehicleController.ts` — physics feel is the product
- Direct commits to `main` — solo project
- No CSP needed — no external scripts, no user data

---

## What to Add (Minimal, High Impact)

### 1. nextjs-turbopack → Reliable Production Build
**File:** `next.config.ts`

```typescript
// Add CSP for canvas game (prevents any future injection)
const csp = `
  default-src 'self';
  script-src 'self';
  style-src 'self' 'unsafe-inline';  // Tailwind JIT
  img-src 'self' data:;
  font-src 'self';
  connect-src 'self';
`.replace(/\s+/g, ' ').trim()

const nextConfig: NextConfig = {
  turbopack: {
    rules: {
      "*.css": { loaders: ["@tailwindcss/turbopack"], as: "*.css" },
    },
  },
  async headers() {
    return [{ source: "/:path*", headers: [{ key: "Content-Security-Policy", value: csp }] }];
  },
}
```

**Validation:** `next build` succeeds, CSP header present in production response.

---

### 2. security-review → Gamepad Input Sanitization (Driving Feel)
**File:** `src/game/Input.ts` — `pollGamepad()` only

```typescript
// Add at top of pollGamepad():
const axes = gp.axes.map(a => (typeof a === "number" && !isNaN(a) ? Math.max(-1, Math.min(1, a)) : 0));
const lx = axes[0] ?? 0;
const ly = axes[1] ?? 0;
```

**Why:** Prevents corrupted gamepad data from causing jittery movement (directly affects driving feel).

**Validation:** Connect gamepad, verify no NaN/Infinity crashes, movement smooth.

---

### 3. frontend-patterns → `useCallback` for `bindButton` (Driving Feel)
**File:** `src/components/GameCanvas.tsx`

```typescript
const bindButton = useCallback((id: string, action: keyof InputState) => {
  // ... existing logic
}, [input]);
```

**Why:** Stable reference prevents re-binding on every render (micro-optimization, keeps input responsive).

**Validation:** `npx tsc --noEmit`, `eslint src` pass; no input lag.

---

### 4. frontend-patterns → `React.memo` for Render Components (Driving Feel)
**File:** `src/game/Render.ts` — extract + memoize

```typescript
export const Vehicle = React.memo(({ state }: { state: VehicleState }) => {
  // ... existing renderVehicle logic
});
```

**Why:** Prevents re-render of vehicle when HUD/fps updates (keeps 60fps stable).

**Validation:** `npx tsc --noEmit`, `eslint src` pass; 60fps sustained.

---

## What NOT to Do (Out of Scope)

| Skill Proposal | Reason |
|----------------|--------|
| Compound components, Context+Reducer, Error Boundaries | Overhead for single canvas component |
| `npm audit` CI, Dependabot | 7 deps, low risk, noise > signal |
| Conventional commits, PR template, CI pipeline | Solo project, direct commits fine |
| CSP report-only mode | No external resources to report on |
| Bundle Analyzer | Bundle already small (~100KB JS) |
| Semantic versioning, changelog, GitHub Actions | Not releasing packages |

---

## Implementation Order (2 files max)

1. `next.config.ts` — add CSP headers (deployment)
2. `src/game/Input.ts` — sanitize gamepad axes (driving feel)
3. `src/components/GameCanvas.tsx` — `useCallback` for `bindButton` (driving feel)
4. `src/game/Render.ts` — extract `Vehicle` component + `React.memo` (driving feel)

Each change is <10 lines, independently revertible.

---

## Validation Checklist

- [ ] `npx tsc --noEmit` — no errors
- [ ] `npx eslint src` — no warnings/errors
- [ ] `next build` — succeeds, CSP header in production
- [ ] Manual: Gamepad movement smooth, no jitter; 60fps sustained; keyboard/D-pad unchanged

---

## Rollback

Revert individual file — no cross-dependencies.