# Star Collect Score Screen — Plan

## Goal
Add a timed star-collection mode to the Car Physics Sandbox: 7 stars spawn randomly across the arena, the player drives to collect them, a timer runs, and a score screen shows the completion time plus the best time.

## Design Decisions (confirmed with user)

1. **Flow:** Separate mode, not continuous. Start screen → timer runs → collect 7 stars → score screen. Existing sandbox stays playable from the start screen.
2. **High score:** Single best (lowest) time, persisted in `localStorage`, shown on the score screen next to the current attempt's time.
3. **Par time:** None. Goal is simply to collect all 7 as fast as possible; score screen compares to personal best.

## Scope

### In scope
- New game mode state machine in `GameCanvas.tsx` (menu / playing / score).
- 7 star entities spawned at random non-overlapping positions inside the arena, avoiding obstacles.
- Star collection via vehicle-overlap detection (Matter collision or distance check).
- Real-time timer (started on mode entry, stopped on last star).
- Score screen overlay with final time and best time.
- Best-time persistence in `localStorage`.
- Reset/restart action from the score screen.
- HUD showing remaining stars and elapsed time during play.

### Out of scope
- Obstacle regeneration, difficulty scaling, par time, multi-attempt accumulation, online leaderboards.
- Changes to existing sandbox physics, controls, or rendering.

## Files to modify

| File | Change |
|------|--------|
| `src/game/config/vehicle.ts` | Add `starCount: 7`, `starRadius`, `arenaSize` already present. |
| `src/game/World.ts` | Add `stars: Star[]` array, `spawnStars()`, `removeStar(id)`, expose via `getStars()` / `clearStars()`. |
| `src/game/Physics.ts` | Expose star collection callback; add `onStarCollected` hook; wire star collision detection. |
| `src/components/GameCanvas.tsx` | Add mode state (`menu`/`playing`/`score`), timer logic, star rendering, HUD, start/score screens. |
| `src/game/Render.ts` | Add `renderStars(ctx, stars)` and `renderTimer(ctx, elapsed)` helpers. |

## Implementation steps

1. **Config** — Add `starCount: 7` and `starRadius: 18` to `VEHICLE_CONFIG`.
2. **Star entity** — In `World`, generate 7 random positions within the arena margin, ensuring no overlap with each other and with obstacles. Store as `{ id, x, y, collected: false }`.
3. **Collision** — In `Physics.tick`, after vehicle update, check each uncollected star against the vehicle body. On overlap, mark collected, remove from world, invoke callback.
4. **Timer** — Track `startTime` and `elapsed` in `GameCanvas`; start on mode entry to `playing`, freeze on last star.
5. **Rendering** — Draw stars as filled circles (gold/yellow) in world space; draw elapsed time and remaining count in HUD.
6. **Score screen** — Overlay with "Time: X.XXs", "Best: X.XXs", "Restart" button. Read/write `localStorage` key `carStarBestTime`.
7. **Menu screen** — "Start" button to enter star mode; keep sandbox accessible.

## Validation

- `npm run lint` passes.
- Manual playtest: start mode, collect all 7 stars, verify timer stops, score screen shows, restart resets timer and respawns stars, best time persists across reloads.

## Open questions

None — all resolved with the user.