# Plan: Obsidian stage background + visible world boundaries

## Goal

Make the game background match the DESIGN.md Obsidian stage (`#000000`) and make all game world components (vehicle, HUD, boundaries, obstacles, hit-wall flashes) visible against it using DESIGN.md color tokens. Remove the dull green grid which doesn't fit the aesthetic and extends beyond actual world bounds.

## Root cause

- `clear()` fills canvas `#f0f7f0` (light gray) but container is Obsidian `#000000`
- Vehicle fills `#000000` → invisible on black background
- HUD text fills `#000000` → invisible on black background
- Boundaries fill `#000000` → invisible except on hit (red glow)
- Obstacles fill `#999999` → low contrast against black
- Boundary frame stroke `#000000` → invisible
- Grid `#a8c0a8` → dull green, doesn't match Apple aesthetic, loops to arenaSize (7500) while Physics is constructed at 5000
- Arena size mismatch: `VEHICLE_CONFIG.arenaSize` = 7500 but `Physics` instantiated with `5000, 5000` (`GameCanvas.tsx:43`)

## Decisions

| Element | Current | New | Token |
|---------|---------|-----|-------|
| Canvas clear | `#f0f7f0` | `#000000` | Obsidian |
| Vehicle fill | `#000000` | `#f5f5f7` | Porcelain |
| HUD text | `#000000` | `#f5f5f7` | Porcelain |
| Boundary fill | `#000000` | `#333336` | Steel |
| Boundary hit fill | `#ff0000` | `#2997ff` | Electric Link |
| Boundary stroke | `#111111` | `#6e6e73` | Slate |
| Obstacle fill | `#999999` | `#6e6e73` | Slate |
| Grid | `#a8c0a8` dull green | removed | — |

## Changes

### 1. `src/game/Render.ts`
- `clear()`: change `ctx.fillStyle` from `"#f0f7f0"` to `"#000000"`
- `renderVehicle()`: change `ctx.fillStyle` from `"#000000"` to `"#f5f5f7"`
- `renderHUD()`: change `ctx.fillStyle` from `"#000000"` to `"#f5f5f7"`

### 2. `src/components/GameCanvas.tsx`
- Remove the dull green grid block (lines 97-111)
- Boundary fill: `"#000000"` → `"#333336"` (Steel); hit fill: `"#ff0000"` → `"#2997ff"` (Electric Link)
- Boundary stroke: `"#111111"` → `"#6e6e73"` (Slate)
- Obstacle fill: `"#999999"` → `"#6e6e73"` (Slate)
- Closed boundary frame stroke: `"#000000"` → `"#6e6e73"` (Slate)

### 3. Arena size consistency (config fix)
- `VEHICLE_CONFIG.arenaSize`: `7500` → `5000` to match `Physics(0, 0, 5000, 5000)` instantiation in `GameCanvas.tsx:43`

## No new dependencies

All colors already exist as CSS custom properties in `globals.css` (Apple Blue `#0071e3`, Electric Link `#2997ff`, Slate `#6e6e73`, Steel `#333336`, Porcelain `#f5f5f7`, Obsidian `#000000`).

## Validation

- `npx tsc --noEmit` — no errors
- `npx eslint src` — no warnings/errors
- Visual: vehicle, HUD text, walls, obstacles visible against black background; hit walls flash Electric Link; no grid

## Risks

- None beyond color swaps; geometry unchanged
- Arena size change to 5000 aligns config with runtime instantiation
