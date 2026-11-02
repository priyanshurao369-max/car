import { VEHICLE_CONFIG } from "../config/vehicle";

export type GripState = {
  forwardVelocity: number;
  lateralVelocity: number;
  gripFactor: number;
  isSliding: boolean;
};

export function calculateGrip(
  velocity: { x: number; y: number },
  angle: number,
  handbrake: boolean,
  weightTransfer: { frontGrip: number; rearGrip: number }
): GripState {
  const { handbrakeRearGripMultiplier } = VEHICLE_CONFIG;

  const forwardX = Math.cos(angle);
  const forwardY = Math.sin(angle);
  const lateralX = -Math.sin(angle);
  const lateralY = Math.cos(angle);

  const forwardVelocity =
    velocity.x * forwardX + velocity.y * forwardY;
  const lateralVelocity =
    velocity.x * lateralX + velocity.y * lateralY;

  const baseRearGrip = handbrake
    ? handbrakeRearGripMultiplier
    : 1.0;
  const rearGrip = weightTransfer.rearGrip * baseRearGrip;
  const frontGrip = weightTransfer.frontGrip;

  const gripFactor = Math.min(1.0, (frontGrip + rearGrip) / 2);
  const isSliding = Math.abs(lateralVelocity) > 1.5 * gripFactor;

  return { forwardVelocity, lateralVelocity, gripFactor, isSliding };
}

export function applyLateralGrip(
  velocity: { x: number; y: number },
  angle: number,
  gripFactor: number
): { x: number; y: number } {
  const { lateralGrip } = VEHICLE_CONFIG;

  const forwardX = Math.cos(angle);
  const forwardY = Math.sin(angle);
  const lateralX = -Math.sin(angle);
  const lateralY = Math.cos(angle);

  const lateralVelocity =
    velocity.x * lateralX + velocity.y * lateralY;

  const reducedLateral = lateralVelocity * lateralGrip * gripFactor;

  const vx =
    velocity.x * forwardX + velocity.y * forwardY;
  const vy = reducedLateral;

  return {
    x: vx * forwardX - vy * Math.sin(angle),
    y: vx * forwardY + vy * Math.cos(angle),
  };
}
