# Car Physics Sandbox

Top-down physics driving sandbox. A single black rectangle vehicle you drive through momentum, grip, steering, drifting, and collision physics.

## Tech Stack

- Next.js, TypeScript, React
- Matter.js (rigid bodies, collision detection)
- HTML Canvas (rendering)
- Tailwind CSS (styling)

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Kilo Skills

Kilo discovers project-local skills in `.kilo/skills/`. This project includes four selected skills from [ECC](https://github.com/affaan-m/ECC) at commit `d2ef2680594f9a17526a6e1a2e18b3d242c5d17b`:

- [Frontend patterns](./.kilo/skills/frontend-patterns/SKILL.md)
- [Git workflow](./.kilo/skills/git-workflow/SKILL.md)
- [Next.js and Turbopack](./.kilo/skills/nextjs-turbopack/SKILL.md)
- [Security review](./.kilo/skills/security-review/SKILL.md)

These are Agent Skills only; ECC's agents, hooks, and commands are not installed. The ECC license is in `.kilo/skills/ECC-LICENSE`.

## Controls

| Key | Action |
|-----|--------|
| W / ↑ | Accelerate |
| S / ↓ | Brake / Reverse |
| A / ← | Steer Left |
| D / → | Steer Right |
| Space | Handbrake Drift |

## Project Philosophy

Make a single vehicle feel great to drive. If driving is not fun, improve physics first — do not add features.
