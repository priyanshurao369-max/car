name: Top Down Physics Driving Sandbox
version: 1.0
goal: Build a physics-focused top-down driving sandbox where a single black square vehicle feels satisfying to control through momentum, grip, steering, drifting, and collision physics.

---

# PROJECT PHILOSOPHY

This project is a driving physics sandbox.

The objective is NOT to build a game full of features.

The objective is to make a single vehicle feel great to drive.

Everything else is secondary.

If driving is not fun:

DO NOT add more features.

Improve physics first.

---

# NON-GOALS

The following are explicitly out of scope.

DO NOT BUILD:

- Multiplayer
- Socket.IO
- Networking
- Matchmaking
- Online Play
- AI Cars
- NPCs
- Vehicle Selection
- Garage System
- Missions
- Tracks
- Laps
- Scoring
- Drift Scoring
- Inventory
- User Accounts
- Authentication
- Menus beyond basic startup
- Audio System
- Skins
- Upgrades
- Leaderboards

These systems can be considered only after the driving experience feels excellent.

---

# DESIGN DECISIONS

## Camera

Style:

```txt
Follow Camera
```

Behavior:

```txt
Car moves through a large world.

Camera smoothly follows vehicle.

World moves underneath camera.
```

Reference:

```txt
Art of Rally
Absolute Drift
```

---

## Visual Style

Extremely minimal.

Vehicle:

```txt
Black Rectangle
```

World:

```txt
White Background
```

Obstacles:

```txt
Grey Shapes
```

No sprites.

No textures.

No artwork.

No images.

No roads.

No buildings.

No environment assets.

Focus entirely on mechanics.

---

## World Design

Single large sandbox arena.

Size:

```txt
5000 x 5000
```

Player can drive freely.

Arena contains:

- Boundary walls
- Static obstacle blocks

Nothing else.

---

## Goal

No goals.

No objectives.

No missions.

No score.

Player enters world and drives immediately.

Purpose:

```txt
Test Physics
Explore Handling
Drift
Crash Into Obstacles
Experiment
```

---

# CORE GAME LOOP

```txt
Launch Game
      ↓
Spawn Vehicle
      ↓
Drive
      ↓
Experiment
      ↓
Improve Physics
```

Nothing else.

---

# TECH STACK

Framework:

```txt
Next.js
TypeScript
```

Physics:

```txt
Matter.js
```

Rendering:

```txt
HTML Canvas
```

Styling:

```txt
Tailwind
```

---

# MATTER.JS RESPONSIBILITY

Matter.js should only handle:

```txt
Rigid Bodies
Collision Detection
World Boundaries
Obstacle Collision
Physics Helpers
```

Matter.js should NOT control vehicle behavior.

Vehicle movement should be implemented through a custom controller.

---

# VEHICLE DESIGN

Vehicle Type:

```txt
Single Black Physics Block
```

Dimensions:

```txt
Width: 50
Height: 30
```

Rendered as:

```txt
Solid Black Rectangle
```

Optional:

Small front indicator line to show direction.

---

# CONTROLS

Keyboard Only

Supported Inputs:

```txt
W
A
S
D
```

Alternative:

```txt
↑
←
↓
→
```

Mapping:

```txt
W / Up      = Accelerate

S / Down    = Brake / Reverse

A / Left    = Steer Left

D / Right   = Steer Right

Space       = Handbrake Drift
```

---

# PHYSICS ARCHITECTURE

Physics quality is the primary objective.

Vehicle should feel:

```txt
Heavy
Responsive
Controllable
Predictable
Driftable
```

Vehicle should NOT feel:

```txt
Floaty
Weightless
Slippery
Instant
Arcade-only
```

---

# VEHICLE SYSTEM

Vehicle Controller owns:

```ts
position
velocity
rotation
angularVelocity
steeringAngle
throttleInput
brakeInput
handbrakeState
```

---

# PHYSICS PIPELINE

Each Tick:

```txt
Read Input
      ↓
Update Steering
      ↓
Calculate Engine Force
      ↓
Calculate Brake Force
      ↓
Calculate Grip
      ↓
Apply Weight Transfer
      ↓
Apply Drag
      ↓
Update Vehicle Velocity
      ↓
Resolve Collisions
      ↓
Update Camera
      ↓
Render
```

---

# ENGINE PHYSICS

Throttle generates force in the direction the vehicle faces.

```txt
Throttle
      ↓
Engine Force
      ↓
Acceleration
```

Vehicle should gradually gain speed.

No instant acceleration.

---

# BRAKE PHYSICS

Brakes apply force opposite movement.

Effects:

```txt
Slowing Down
Stopping
Reversing
Weight Transfer
```

Vehicle should require stopping distance.

No instant stop.

---

# VELOCITY DECOMPOSITION

Critical system.

Velocity should be split into:

```txt
Forward Velocity
```

and

```txt
Lateral Velocity
```

Purpose:

Simulate tire behavior.

---

Forward Velocity:

```txt
Desired Movement
```

---

Lateral Velocity:

```txt
Unwanted Sideways Sliding
```

Reduce lateral velocity every physics tick.

Example:

```txt
Lateral Grip Force
```

This creates natural vehicle handling.

---

# TIRE GRIP MODEL

Basic grip simulation.

System:

```txt
Available Grip
```

vs

```txt
Required Grip
```

When turning aggressively:

```txt
Grip Limit Exceeded
```

Vehicle enters slide.

This becomes the foundation for drifting.

---

# WEIGHT TRANSFER

Simplified implementation.

During acceleration:

```txt
Weight Moves Rearward
Rear Grip Increases
Front Grip Decreases
```

---

During braking:

```txt
Weight Moves Forward
Front Grip Increases
Rear Grip Decreases
```

---

During hard turning:

```txt
Weight Loads Outer Side
```

Result:

More believable handling.

---

# DRIFT SYSTEM

Available from Version 1.

Input:

```txt
Space Bar
```

Behavior:

Reduce rear grip.

Example:

```txt
Rear Grip × 0.40
```

Result:

```txt
Rear Slides
Vehicle Rotates
Counter Steering Possible
```

This provides a simple but fun drifting mechanic.

---

# DRAG SYSTEM

Simulates air resistance.

Purpose:

```txt
Natural Top Speed
Speed Stabilization
```

Vehicle should never accelerate forever.

---

# ROLLING RESISTANCE

Simulates tire resistance.

Purpose:

```txt
Vehicle Eventually Stops
Car Feels Grounded
```

Without resistance:

```txt
Vehicle Rolls Forever
```

which should not happen.

---

# CAMERA SYSTEM

Camera should smoothly follow vehicle.

Never snap instantly.

Camera target:

```txt
Vehicle Center
```

Movement:

```txt
Smooth Interpolation
```

Behavior:

```txt
Fast Enough To Feel Responsive
Slow Enough To Feel Smooth
```

---

# ARENA DESIGN

Background:

```txt
White
```

Arena Size:

```txt
5000x5000
```

Contains:

```txt
Boundary Walls
Static Boxes
Static Obstacles
```

Obstacle count:

```txt
10-20
```

distributed around arena.

---

# COLLISION SYSTEM

Handled by Matter.js.

Supported Collisions:

```txt
Vehicle ↔ Wall
Vehicle ↔ Obstacle
```

Requirements:

```txt
No Tunneling
No Clipping
Stable Response
```

---

# HUD

Minimal.

Display only:

```txt
Speed
FPS
```

Top Left.

No other interface required.

---

# FILE STRUCTURE

src/

app/
├── page.tsx

components/
├── GameCanvas.tsx

game/
├── VehicleController.ts
├── Physics.ts
├── World.ts
├── Camera.ts
├── Render.ts
├── Input.ts

game/systems/
├── EngineSystem.ts
├── SteeringSystem.ts
├── GripSystem.ts
├── WeightTransferSystem.ts
├── DragSystem.ts
├── CollisionSystem.ts

game/config/
├── vehicle.ts

---

# DEVELOPMENT PHASES

## PHASE 1

Foundation

Deliverables:

✅ Next.js Setup

✅ Fullscreen Canvas

✅ Matter.js Integration

✅ World Creation

✅ Camera Framework

Success:

```txt
World Renders
Camera Works
```

---

## PHASE 2

Vehicle

Deliverables:

✅ Vehicle Spawn

✅ Rotation

✅ Movement

✅ Keyboard Input

Success:

```txt
Vehicle Drives
```

---

## PHASE 3

Physics

Deliverables:

✅ Acceleration

✅ Braking

✅ Drag

✅ Momentum

✅ Steering

Success:

```txt
Vehicle Feels Heavy
```

---

## PHASE 4

Advanced Handling

Deliverables:

✅ Forward Velocity Calculation

✅ Lateral Velocity Calculation

✅ Grip Forces

✅ Sliding Behavior

Success:

```txt
Vehicle Feels Like A Car
Not A Rotating Rectangle
```

---

## PHASE 5

Drifting

Deliverables:

✅ Handbrake

✅ Rear Grip Reduction

✅ Counter Steering

✅ Basic Weight Transfer

Success:

```txt
Controlled Drifting Possible
```

---

## PHASE 6

Sandbox

Deliverables:

✅ Arena Obstacles

✅ Wall Collision

✅ Physics Tuning

✅ Stability Fixes

Success:

```txt
Driving Sandbox Complete
```

---

# SUCCESS CRITERIA

The MVP is successful if:

✅ Vehicle feels satisfying to control

✅ Momentum feels believable

✅ Steering feels responsive

✅ Drifting is possible

✅ Camera feels smooth

✅ Collisions are stable

✅ Player enjoys driving around with no objective

If these requirements are not met:

DO NOT ADD FEATURES.

Continue improving vehicle physics.