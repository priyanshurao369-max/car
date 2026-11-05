# Plan: Omnidirectional square, velocity-aligning rotation, gamepad, haptics

## Goal

Transform the vehicle into an omnidirectional square that:
- Moves freely in all 4 directions + diagonals via D-pad/keyboard/gamepad left stick
- Rotates to face its velocity direction (velocity-aligning, no independent heading)
- Supports Gamepad API input
- Triggers haptic vibration on wall collisions

## Current state

- `src/game/VehicleController.ts`: Car physics — steering angle, engine force, lateral grip, weight transfer, reverse, rotation applied to Matter body.
- `src/game/Input.ts`: InputState = throttle/brake/steerLeft/steerRight/handbrake. Keyboard W/A/S/D + arrows.
- `src/game/Render.ts`: renderVehicle applies `ctx.rotate(state.rotation)`.
- `src/components/GameCanvas.tsx`: Bottom-left D-pad + bottom-right action buttons. No gamepad, no haptics.
- `src/game/config/vehicle.ts`: Car-specific config (engineForce, brakeForce, steeringSpeed, etc.).
- Previous plan (this file) decided "no rotation" — that decision is now **superseded** by velocity-aligning rotation.

## Decisions

| Decision | Value | Rationale |
|----------|-------|-----------|
| Control scheme | Direction-based (up/down/left/right) | User decided; D-pad + keyboard + gamepad left stick all map to same 4 directions |
| Diagonal movement | Allowed, vector normalized so diagonal isn't faster | Standard for 4-direction input |
| Momentum | Keep with drag | Reuses existing `applyDrag`, fits physics sandbox |
| Speed cap | `VEHICLE_CONFIG.maxSpeed` (10) | Already defined |
| Rotation | Velocity-aligning: `angle = Math.atan2(vy, vx)` when moving | User chose option C; square always faces movement direction |
| Rotation when stopped | Hold last angle (don't snap to 0) | Smoother visual, no jitter when idle |
| Gamepad | Gamepad API, left stick → direction, buttons → actions | Standard web API, no dependencies |
| Haptics | `navigator.vibrate()` + GamepadAPI vibration on collision | Simple, dependency-free |
| Collision | Keep Matter.js walls/boundaries | Already implemented |

## Files affected

### 1. `src/game/config/vehicle.ts`
- Remove: `engineForce`, `brakeForce`, `steeringSpeed`, `maxSteeringAngle`, `lateralGrip`, `rearGripMultiplier`, `handbrakeRearGripMultiplier`, `weightTransferAccel`, `weightTransferBrake`, `reverseSpeed`, `angularDrag`
- Keep: `width`, `height`, `mass`, `maxSpeed`, `dragCoefficient`, `rollingResistance`, `arenaSize`, `obstacleCount`, `frictionCoefficient`
- Add: `moveForce` (acceleration per frame when direction held)

### 2. `src/game/Input.ts`
- `InputState`: `up`, `down`, `left`, `right` (replace throttle/brake/steerLeft/steerRight/handbrake)
- `KEYS` map: W/ArrowUp→up, S/ArrowDown→down, A/ArrowLeft→left, D/ArrowRight→right. Space removed.
- `setKey`: up↔down mutually exclusive; left↔right mutually exclusive; diagonal (up+left) allowed
- Add gamepad polling: `pollGamepad()` reads `navigator.getGamepads()[0]`, maps left stick to up/down/left/right, maps buttons to actions if needed
- Add `vibrate(ms)` helper wrapping `navigator.vibrate()` and gamepad vibration actuator

### 3. `src/game/VehicleController.ts`
Rewrite `update()`:
- Read `input.up/down/left/right`
- Compute direction: `dx = (right?1:0)-(left?1:0)`, `dy = (down?1:0)-(up?1:0)`; normalize if magnitude > 0
- `vx += dx * moveForce; vy += dy * moveForce`
- Apply `applyDrag({x, y})`
- Cap speed at `maxSpeed`
- `angle = speed > 0.01 ? Math.atan2(vy, vx) : this.state.rotation` (hold last angle when stopped)
- `Matter.Body.setVelocity(body, {x, y}); Matter.Body.setAngularVelocity(body, 0)`
- `state.rotation = angle; state.angularVelocity = 0`
- Remove steering/engine/grip/weight-transfer/reverse logic and imports

### 4. `src/game/Render.ts`
- `renderVehicle`: keep `ctx.rotate(state.rotation)` (now velocity-derived, square faces movement)
- No other changes needed

### 5. `src/components/GameCanvas.tsx`
- Replace CONTROLS/DPAD arrays with single `DIRECTIONS`: up/▲, down/▼, left/◀, right/▶
- Single D-pad cluster bottom-left: up above, left/right/down below
- Remove right-side action buttons entirely
- Bind `dpad-up/down/left/right` to `up/down/left/right`
- Keep `touch-action: none`, `select-none`
- Add `gamepadconnected`/`gamepaddisconnected` listeners; start gamepad polling loop
- On wall collision (`hitWalls` non-empty): call `navigator.vibrate(100)` and gamepad vibration

### 6. `src/game/systems/` — delete unused
- Delete: SteeringSystem.ts, EngineSystem.ts, GripSystem.ts, WeightTransferSystem.ts
- DragSystem.ts: keep `applyDrag`, remove `applyAngularDrag`

## Data flow

```
D-pad/keyboard/gamepad → Input.setKey(up/down/left/right)
    ↓ (mutual exclusivity)
Input.pollGamepad() → merges gamepad stick into same InputState
Physics.tick() → input.get() → VehicleController.update(input)
    ↓
direction vector → normalize → velocity += direction * moveForce
velocity *= applyDrag → cap at maxSpeed
angle = atan2(vy, vx) when moving
Matter.Body.setVelocity + setAngularVelocity(0)
    ↓
Collision check → hitWalls → navigator.vibrate() + gamepad.vibration
    ↓
Render: translate + rotate(state.rotation) + fillRect
```

## Edge cases

- **Stopped square**: holds last angle (no snap to 0, no jitter)
- **Opposing inputs** (up+down): mutually exclusive, last wins
- **Diagonal**: normalized vector, same speed as axis
- **Gamepad disconnected mid-play**: input falls back to keyboard/D-pad only
- **Vibration unsupported**: `navigator.vibrate` is no-op, safe to call
- **Wall collision**: Matter.js bounce + haptic pulse

## Out of scope

- Multiplayer / networking
- Separate mobile-only layout variant
- Custom gamepad button remapping UI

## Validation

- `npx tsc --noEmit` — no errors
- `npx eslint src` — no warnings/errors
- `npx next build` — completes successfully
- Manual: D-pad/keyboard/gamepad moves square in all directions; square faces movement direction; vibration on wall hit; gamepad connect/disconnect works

## Rollback

Revert `VehicleController.ts`, `Input.ts`, `Render.ts`, `GameCanvas.tsx`, `vehicle.ts`; delete systems folder changes; restore keyboard-only car physics.
