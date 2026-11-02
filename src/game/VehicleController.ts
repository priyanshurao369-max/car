import Matter from "matter-js";
import { VEHICLE_CONFIG } from "./config/vehicle";
import { updateSteering } from "./systems/SteeringSystem";
import { updateEngine } from "./systems/EngineSystem";
import { calculateGrip, applyLateralGrip } from "./systems/GripSystem";
import { calculateWeightTransfer } from "./systems/WeightTransferSystem";
import { applyDrag, applyAngularDrag } from "./systems/DragSystem";

export type VehicleState = {
  position: { x: number; y: number };
  velocity: { x: number; y: number };
  rotation: number;
  angularVelocity: number;
  steeringAngle: number;
  throttleInput: boolean;
  brakeInput: boolean;
  handbrakeState: boolean;
};

export type VehicleInput = {
  throttle: boolean;
  brake: boolean;
  steerLeft: boolean;
  steerRight: boolean;
  handbrake: boolean;
};

export class VehicleController {
  public body: Matter.Body;
  public state: VehicleState;
  private steering: { angle: number; targetAngle: number };

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
      steeringAngle: 0,
      throttleInput: false,
      brakeInput: false,
      handbrakeState: false,
    };

    this.steering = { angle: 0, targetAngle: 0 };
  }

  update(input: VehicleInput): void {
    const { brakeForce } = VEHICLE_CONFIG;

    const vx = this.body.velocity.x;
    const vy = this.body.velocity.y;
    const angle = this.body.angle;
    const speed = Math.hypot(vx, vy);

    this.state.throttleInput = input.throttle;
    this.state.brakeInput = input.brake;
    this.state.handbrakeState = input.handbrake;

    this.steering = updateSteering(this.steering, {
      steerLeft: input.steerLeft,
      steerRight: input.steerRight,
    });
    this.state.steeringAngle = this.steering.angle;

    const engine = updateEngine(
      {
        throttle: input.throttle,
        brake: input.brake,
        handbrake: input.handbrake,
      },
      speed
    );

    const weightTransfer = calculateWeightTransfer(
      engine.isAccelerating,
      engine.isBraking,
      this.state.steeringAngle
    );

    const grip = calculateGrip(
      { x: vx, y: vy },
      angle,
      input.handbrake,
      weightTransfer
    );

    const ax = Math.cos(angle) * engine.forwardForce;
    const ay = Math.sin(angle) * engine.forwardForce;

    let bx = 0;
    let by = 0;
    if (engine.isBraking && speed > 0.01) {
      bx = -(vx / speed) * brakeForce;
      by = -(vy / speed) * brakeForce;
    }

    let nvx = vx + ax + bx;
    let nvy = vy + ay + by;

    const gripped = applyLateralGrip({ x: nvx, y: nvy }, angle, grip.gripFactor);
    nvx = gripped.x;
    nvy = gripped.y;

    const dragged = applyDrag({ x: nvx, y: nvy });
    nvx = dragged.x;
    nvy = dragged.y;

    const turnGating = Math.min(1, speed / 4);
    let nav = applyAngularDrag(this.body.angularVelocity);
    nav += this.state.steeringAngle * 0.06 * turnGating;

    Matter.Body.setVelocity(this.body, { x: nvx, y: nvy });
    Matter.Body.setAngularVelocity(this.body, nav);

    this.state.velocity = { x: nvx, y: nvy };
    this.state.rotation = angle;
    this.state.angularVelocity = nav;
    this.state.position = { x: this.body.position.x, y: this.body.position.y };
  }
}
