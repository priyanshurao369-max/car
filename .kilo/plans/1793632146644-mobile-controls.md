# Plan: Mobile-friendly controls (Virtual D-pad + action buttons)

## Goal

Make the game playable on mobile touch devices. Add a virtual D-pad on the left side for steering and action buttons on the right side for throttle/brake/handbrake. Keyboard controls remain fully intact for desktop. Prevent page scrolling and text selection during play.

## Current state (from code inspection)

- `src/components/GameCanvas.tsx`: Five small on-screen buttons (`px-4 py-2 text-xs`, Apple Blue pills) at bottom corners; separate DOM `pointerdown/up/leave/cancel` listeners plus empty React `onPointerDown/Up` handlers (redundant); no `touch-action: none`; canvas can scroll the page while playing.
- `src/game/Input.ts`: Keyboard-only `Input` class with `setKey(action, value)` public method. Opposing inputs (throttle+brake, steerLeft+steerRight) can both be true simultaneously.
- `src/app/layout.tsx`: No viewport meta tag → mobile browsers scale the page like desktop.
- `src/app/globals.css`: Apple DESIGN.md tokens defined (Apple Blue `#0071e3`, Porcelain `#f5f5f7`, pills `9999px` radius) but no touch-specific styles.
- `plan.md` CONTROLS section says "Keyboard Only" — will need updating to document touch controls.

## Decisions

| Decision | Value | Rationale |
|----------|-------|-----------|
| Layout | Virtual D-pad (left) + action buttons (right) | User selected |
| D-pad | Left = steerLeft, Right = steerRight, Up = throttle, Down = brake | Left/right steer; up/down throttle/brake enables single-thumb play; duplicates right-side actions as convenience |
| Action buttons | Throttle, Brake, Handbrake stacked vertically on right | Matches existing three right-side actions; larger touch targets |
| Touch target size | Minimum 60px diameter | Apple HIG minimum is 44px; 60px gives comfortable mobile play |
| Button style | Apple Blue `#0071e3` pills (`9999px` radius) per DESIGN.md, larger | Consistent with existing design system |
| Scroll prevention | `touch-action: none` on canvas and all control buttons; viewport `user-scalable=no` | Stops page scroll/zoom during play |
| Text selection | `user-select: none` on buttons; `-webkit-user-select: none` | Prevents selection on long press |
| Opposing input guard | throttle+brake mutually exclusive; steerLeft+steerRight mutually exclusive | Prevents touch inputs fighting each other |
| Keyboard | Fully unchanged | Desktop experience preserved |
| Viewport meta | `<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">` | Proper mobile scaling |

## Files affected

### 1. `src/app/layout.tsx`
Add viewport meta tag inside `<head>`.

### 2. `src/components/GameCanvas.tsx`
- Replace bottom-corner button rows with left D-pad + right action button column
- Add `touch-action: none` to canvas container and all buttons
- Add `user-select: none` via Tailwind `select-none`
- Remove redundant empty React `onPointerDown/Up` handlers (DOM listeners already handle input)
- Keep `pointer-events-none` wrapper + `pointer-events-auto` inner pattern
- Increase button size to at least 60px, larger text (`text-sm` instead of `text-xs`)

### 3. `src/game/Input.ts`
Add mutual exclusivity in `setKey`:
- Setting `throttle: true` sets `brake: false`; setting `brake: true` sets `throttle: false`
- Setting `steerLeft: true` sets `steerRight: false`; setting `steerRight: true` sets `steerLeft: false`

### 4. `plan.md` (optional documentation)
Update CONTROLS section from "Keyboard Only" to "Keyboard + Touch". Out of scope for this plan — mark as out of scope.

## Data flow

```
Touch start/end on button → Input.setKey(action, true/false)
                                ↓
Physics.tick() → input.get() → VehicleController.update(input)
                                ↓
Opposing-input guard in setKey prevents throttle+brake / steerLeft+steerRight
                              ↑
D-pad: left=steerLeft, right=steerRight, up=throttle, down=brake
Right: throttle, brake, handbrake (same actions as D-pad up/down)
```

## Edge cases handled

- **Simultaneous thumb touches**: Multiple fingers on D-pad and action buttons work (pointer events are per-element)
- **Rapid tap-release**: pointerup releases key even if finger slides off (pointerleave/pointercancel also release)
- **Opposing directions**: Holding left+right on D-pad → mutually exclusive, last wins; holding up+down → throttle/brake mutually exclusive, last wins
- **Throttle+brake**: Last one wins; brake takes priority if pressed last — acceptable for mobile
- **Single-thumb play**: Right thumb on D-pad alone can steer (left/right) and accelerate/brake (up/down)
- **Canvas scroll**: `touch-action: none` prevents viewport scroll when thumb is on canvas or buttons
- **Mobile ergonomics**: D-pad on left bottom for left thumb, actions on right bottom for right thumb; both within natural thumb zones

## Out of scope

- Multiplayer / networking
- Gamepad support
- Haptic feedback
- Separate mobile-only UI variant (responsive design via single layout)

## Validation

- `npx tsc --noEmit` — no errors
- `npx eslint src` — no warnings/errors
- `npx next build` — completes successfully
- Manual mobile test: open on phone, D-pad steers, action buttons accelerate/brake/drift, no page scroll, no text selection, keyboard still works on desktop

## Rollback

Revert `src/components/GameCanvas.tsx` and `src/game/Input.ts` to pre-change state; remove viewport meta from `layout.tsx`.
