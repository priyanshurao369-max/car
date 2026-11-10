# Fix: Obstacles rebuild every frame during star mode

## Root cause

In `src/components/GameCanvas.tsx`, the physics setup `useEffect` (lines 121–258) has the dependency array `[bindButton, mode, elapsed, best, remaining]` (line 258).

During play, the render loop calls `setElapsed(...)` on every RAF frame (line 160). That mutates `elapsed`, which React sees as a dependency change, so the effect re-runs. Re-running the effect:

1. Calls `physics.destroy()` (cleanup)
2. Re-creates `new Physics(0, 0, 5000, 5000)` (line 135)
3. `Physics` constructor builds a `new World(...)`, which calls `createObstacles()` — generating 35 obstacles at **fresh random positions**
4. A new RAF loop is scheduled

Result: the obstacle layout is regenerated every frame → visible glitching/jumping of obstacle blocks. Same trigger fires on each star collection via `setRemaining`.

Obstacles are genuinely static (`isStatic: true`, never moved anywhere in code); the glitch is the entire arena being torn down and rebuilt.

## Goal

Keep the physics world (and therefore obstacle positions) **constant and stable** for the lifetime of the component. Timer/remaining/best values that change during play must not cause the physics effect to re-run.

## Scope

- In scope: fix the `useEffect` dependency array and the data flow that feeds the render loop.
- Out of scope: changes to obstacle generation, physics, rendering, star mode logic, or the star-collect feature itself.

## Approach

Move play-time-changing values out of the physics effect's dependency array, and drive the render loop from refs instead of state so React doesn't re-run the effect.

1. **Remove `mode`, `elapsed`, `best`, `remaining` from the physics `useEffect` deps.** The effect should only depend on `bindButton` (stable). This stops the teardown/rebuild on every timer tick and star collection.

2. **Read play state from refs inside the render loop instead of React state.** The render closure currently reads `mode`, `elapsed`, `remaining` from component state, which is why they were in the deps. Convert to refs:
   - `modeRef` (update on mode transitions)
   - `elapsedRef` (updated every frame from `performance.now() - startTimeRef.current`)
   - `remainingRef` (updated on star collection)
   - `bestRef` (updated when a new best is saved)

3. **Keep `useState` only for React-rendered UI** (the HTML overlays/buttons that need re-render to appear/disappear). The menu/score overlays can read from `modeRef` and conditionally render, or stay state-driven since they don't feed back into the physics effect — either is fine, but the physics effect deps must not include them.

4. **Preserve existing behavior:** same start/restart flow, same star spawning, same collection detection, same localStorage persistence, same overlays and HUD.

## Files to modify

| File | Change |
|------|--------|
| `src/components/GameCanvas.tsx` | Convert `mode`/`elapsed`/`remaining`/`best` to refs for use inside the physics effect + render loop; trim the physics `useEffect` deps to `[bindButton]`; keep `useState` only for overlay re-rendering if needed. |

## Validation

- `npm run lint` passes.
- `npx tsc --noEmit` passes.
- `npm run build` succeeds.
- Manual playtest: start star mode, drive around, confirm obstacle blocks stay fixed in world space (no jitter/repositioning) while the timer still advances and stars still collect; complete the set, confirm score screen shows, restart, confirm obstacles stay put across the restart; reload page, confirm best time persists.

## Open questions

None.