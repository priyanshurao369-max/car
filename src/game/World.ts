import Matter from "matter-js";
import { VEHICLE_CONFIG } from "./config/vehicle";

export type Obstacle = {
  body: Matter.Body;
  x: number;
  y: number;
  w: number;
  h: number;
};

export type Star = {
  id: number;
  x: number;
  y: number;
  collected: boolean;
};

export class World {
  public engine: Matter.Engine;
  public world: Matter.World;
  public boundaries: Matter.Body[] = [];
  public obstacles: Obstacle[] = [];
  public stars: Star[] = [];

  constructor(width: number, height: number) {
    this.engine = Matter.Engine.create();
    this.engine.gravity.y = 0;
    this.world = this.engine.world;
    this.createBoundaries(width, height);
    this.createObstacles();
  }

  private createBoundaries(width: number, height: number): void {
    const thickness = 60;
    const halfW = width / 2;
    const halfH = height / 2;

    const makeWall = (x: number, y: number, w: number, h: number) =>
      Matter.Bodies.rectangle(x, y, w, h, {
        isStatic: true,
        label: "wall",
      });

    this.boundaries = [
      makeWall(0, -halfH - thickness / 2, width, thickness),
      makeWall(0, halfH + thickness / 2, width, thickness),
      makeWall(-halfW - thickness / 2, 0, thickness, height),
      makeWall(halfW + thickness / 2, 0, thickness, height),
    ];

    Matter.World.add(this.world, this.boundaries);
  }

  private createObstacles(): void {
    const { arenaSize, obstacleCount } = VEHICLE_CONFIG;
    const margin = 300;
    const half = arenaSize / 2;

    for (let i = 0; i < obstacleCount; i++) {
      const w = 120 + Math.random() * 180;
      const h = 120 + Math.random() * 180;
      const x =
        -half +
        margin +
        Math.random() * (arenaSize - margin * 2 - w);
      const y =
        -half +
        margin +
        Math.random() * (arenaSize - margin * 2 - h);

      const body = Matter.Bodies.rectangle(x, y, w, h, {
        isStatic: true,
        label: "obstacle",
        restitution: 0.3,
        friction: 0.7,
      });

      this.obstacles.push({ body, x, y, w, h });
    }

    Matter.World.add(this.world, this.obstacles.map((o) => o.body));
  }

  update(): void {
    Matter.Engine.update(this.engine, 1000 / 60);
  }

  spawnStars(): void {
    const { arenaSize, starCount, starRadius, starMargin } = VEHICLE_CONFIG;
    const half = arenaSize / 2;
    const minDist = starRadius * 2 * 1.6;
    const stars: Star[] = [];
    let guard = 0;

    const overlapsObstacle = (x: number, y: number): boolean => {
      for (const obs of this.obstacles) {
        const dx = x - obs.x;
        const dy = y - obs.y;
        if (Math.abs(dx) < obs.w / 2 + starRadius + 20 && Math.abs(dy) < obs.h / 2 + starRadius + 20) {
          return true;
        }
      }
      return false;
    };

    const overlapsStar = (x: number, y: number): boolean => {
      for (const s of stars) {
        if (Math.hypot(x - s.x, y - s.y) < minDist) return true;
      }
      return false;
    };

    while (stars.length < starCount && guard < 1000) {
      guard++;
      const x = -half + starMargin + Math.random() * (arenaSize - starMargin * 2);
      const y = -half + starMargin + Math.random() * (arenaSize - starMargin * 2);
      if (overlapsObstacle(x, y)) continue;
      if (overlapsStar(x, y)) continue;
      stars.push({ id: stars.length, x, y, collected: false });
    }

    this.stars = stars;
  }

  removeStar(id: number): void {
    this.stars = this.stars.filter((s) => s.id !== id);
  }

  clearStars(): void {
    this.stars = [];
  }

  destroy(): void {
    Matter.World.clear(this.world, false);
    Matter.Engine.clear(this.engine);
  }
}
