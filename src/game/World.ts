import Matter from "matter-js";
import { VEHICLE_CONFIG } from "./config/vehicle";

export type Obstacle = {
  body: Matter.Body;
  x: number;
  y: number;
  w: number;
  h: number;
};

export class World {
  public engine: Matter.Engine;
  public world: Matter.World;
  public boundaries: Matter.Body[] = [];
  public obstacles: Obstacle[] = [];

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

  destroy(): void {
    Matter.World.clear(this.world, false);
    Matter.Engine.clear(this.engine);
  }
}
