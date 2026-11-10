import Matter from "matter-js";
import { World } from "./World";
import { VehicleController } from "./VehicleController";
import { Camera } from "./Camera";
import { Input } from "./Input";
import { createCollisionSystem } from "./systems/CollisionSystem";
import { VEHICLE_CONFIG } from "./config/vehicle";

export class Physics {
  private world: World;
  private vehicle: VehicleController;
  private camera: Camera;
  private input: Input;
  private collisionSystem: ReturnType<typeof createCollisionSystem>;
  private running: boolean;
  private onStarCollected: (() => void) | null = null;

  constructor(vehicleX: number, vehicleY: number, arenaW: number, arenaH: number) {
    this.world = new World(arenaW, arenaH);
    this.vehicle = new VehicleController(vehicleX, vehicleY);
    Matter.World.add(this.world.world, this.vehicle.body);

    this.camera = new Camera(vehicleX, vehicleY);
    this.input = new Input();
    this.collisionSystem = createCollisionSystem(this.world.world);
    this.running = false;
  }

  setOnStarCollected(callback: (() => void) | null): void {
    this.onStarCollected = callback;
  }

  getVehicleState() {
    return this.vehicle.state;
  }

  getCamera() {
    return this.camera;
  }

  getWorld() {
    return this.world;
  }

  getInput() {
    return this.input;
  }

  getHitWalls() {
    return this.collisionSystem.getHitWalls();
  }

  spawnStars(): void {
    this.world.spawnStars();
  }

  resetStars(): void {
    this.world.clearStars();
  }

  start(): void {
    this.running = true;
    this.tick();
  }

  stop(): void {
    this.running = false;
    this.input.destroy();
  }

  private checkStarCollection(): void {
    const vehicleBody = this.vehicle.body;
    const vx = vehicleBody.position.x;
    const vy = vehicleBody.position.y;
    const vHalfW = VEHICLE_CONFIG.width / 2;
    const vHalfH = VEHICLE_CONFIG.height / 2;

    for (const star of this.world.stars) {
      if (star.collected) continue;
      const dx = Math.abs(star.x - vx);
      const dy = Math.abs(star.y - vy);
      if (dx < vHalfW + VEHICLE_CONFIG.starRadius && dy < vHalfH + VEHICLE_CONFIG.starRadius) {
        star.collected = true;
        this.world.removeStar(star.id);
        this.onStarCollected?.();
      }
    }
  }

  private tick = (): void => {
    if (!this.running) return;

    const input = this.input.get();

    this.vehicle.update(input);
    this.world.update();

    this.collisionSystem.checkCollisions(this.vehicle.body);
    this.checkStarCollection();

    const pos = this.vehicle.body.position;
    this.camera.setTarget(pos.x, pos.y);
    this.camera.update();

    requestAnimationFrame(this.tick);
  };

  destroy(): void {
    this.stop();
    this.world.destroy();
  }
}
