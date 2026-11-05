import Matter from "matter-js";
import { VEHICLE_CONFIG } from "./config/vehicle";
import { applyDrag } from "./systems/DragSystem";

export type VehicleState = {
  position: { x: number; y: number };
  velocity: { x: number; y: number };
  rotation: number;
  angularVelocity: number;
  inputDirection: { x: number; y: number };
};

export type VehicleInput = {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
};

export class VehicleController {
  public body: Matter.Body;
  public state: VehicleState;

  constructor(x: number, y: number) {
    this.body = Matter.Bodies.rectangle(x, y, VEHICLE_CONFIG.width, VEHICLE_CONFIG.height, {
      label: "vehicle",
      mass: VEHICLE_CONFIG.mass,
      restitution: 0.3,
      friction: 0.7,
    });

    this.state = {
      position: { x, y },
      velocity: { x: 0, y: 0 },
      rotation: 0,
      angularVelocity: 0,
      inputDirection: { x: 0, y: 0 },
    };
  }

  update(input: VehicleInput): void {
    const { moveForce, maxSpeed } = VEHICLE_CONFIG;

    const vx = this.body.velocity.x;
    const vy = this.body.velocity.y;

    const dx = (input.right ? 1 : 0) - (input.left ? 1 : 0);
    const dy = (input.down ? 1 : 0) - (input.up ? 1 : 0);

    const inputMag = Math.hypot(dx, dy);
    let dirX = 0;
    let dirY = 0;
    if (inputMag > 0) {
      dirX = dx / inputMag;
      dirY = dy / inputMag;
    }

    this.state.inputDirection = { x: dirX, y: dirY };

    let nvx = vx + dirX * moveForce;
    let nvy = vy + dirY * moveForce;

    const dragged = applyDrag({ x: nvx, y: nvy });
    nvx = dragged.x;
    nvy = dragged.y;

    const newSpeed = Math.hypot(nvx, nvy);
    if (newSpeed > maxSpeed) {
      nvx = (nvx / newSpeed) * maxSpeed;
      nvy = (nvy / newSpeed) * maxSpeed;
    }

    const angle = newSpeed > 0.01 ? Math.atan2(nvy, nvx) : this.state.rotation;

    Matter.Body.setVelocity(this.body, { x: nvx, y: nvy });
    Matter.Body.setAngularVelocity(this.body, 0);

    this.state.velocity = { x: nvx, y: nvy };
    this.state.rotation = angle;
    this.state.angularVelocity = 0;
    this.state.position = { x: this.body.position.x, y: this.body.position.y };
  }
}
