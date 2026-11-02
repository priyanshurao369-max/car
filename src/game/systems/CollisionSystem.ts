import Matter from "matter-js";

export type CollisionData = {
  collided: boolean;
  with: "wall" | "obstacle" | null;
};

const HOLD_FRAMES = 6;

export function createCollisionSystem(
  world: Matter.World
): {
  checkCollisions: (body: Matter.Body) => CollisionData;
  getHitWalls: () => Set<number>;
} {
  const collisions = new Set<number>();
  const hitWalls = new Map<number, number>();

  Matter.Events.on(world, "collisionStart", (event: unknown) => {
    const ev = event as {
      pairs: Array<{ bodyA: Matter.Body; bodyB: Matter.Body }>;
    };
    for (const pair of ev.pairs) {
      const { bodyA, bodyB } = pair;
      const labelA = bodyA.label;
      const labelB = bodyB.label;
      if (labelA === "vehicle" || labelB === "vehicle") {
        const other = labelA === "vehicle" ? bodyB : bodyA;
        if (other.label === "wall") {
          hitWalls.set(other.id, HOLD_FRAMES);
        }
      }
    }
  });

  return {
    checkCollisions: (body: Matter.Body): CollisionData => {
      const collided = collisions.has(body.id);
      collisions.clear();
      if (!collided) {
        return { collided: false, with: null };
      }
      return { collided: true, with: null };
    },

    getHitWalls: () => {
      for (const [id, remaining] of hitWalls) {
        if (remaining <= 0) {
          hitWalls.delete(id);
        } else {
          hitWalls.set(id, remaining - 1);
        }
      }
      return new Set(hitWalls.keys());
    },
  };
}
