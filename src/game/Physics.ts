import Matter from "matter-js";
import { World } from "./World";
import { VehicleController } from "./VehicleController";
import { Camera } from "./Camera";
import { Input } from "./Input";
import { createCollisionSystem } from "./systems/CollisionSystem";

export class Physics {
  private world: World;
  private vehicle: VehicleController;
  private camera: Camera;
  private input: Input;
  private collisionSystem: ReturnType<typeof createCollisionSystem>;
  private running: boolean;

  constructor(vehicleX: number, vehicleY: number, arenaW: number, arenaH: number) {
    this.world = new World(arenaW, arenaH);
    this.vehicle = new VehicleController(vehicleX, vehicleY);
    Matter.World.add(this.world.world, this.vehicle.body);

    this.camera = new Camera(vehicleX, vehicleY);
    this.input = new Input();
    this.collisionSystem = createCollisionSystem(this.world.world);
    this.running = false;
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

  start(): void {
    this.running = true;
    this.tick();
  }

  stop(): void {
    this.running = false;
    this.input.destroy();
  }

  private tick = (): void => {
    if (!this.running) return;

    const input = this.input.get();

    this.vehicle.update(input);
    this.world.update();

    this.collisionSystem.checkCollisions(this.vehicle.body);

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
