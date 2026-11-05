import { VEHICLE_CONFIG } from "../config/vehicle";

export function applyDrag(
  velocity: { x: number; y: number }
): { x: number; y: number } {
  const { dragCoefficient, rollingResistance } = VEHICLE_CONFIG;

  const speed = Math.hypot(velocity.x, velocity.y);
  const dragFactor = dragCoefficient - speed * 0.0005;
  const rollingFactor = rollingResistance;

  const combined = Math.max(0.85, dragFactor * rollingFactor);

  return {
    x: velocity.x * combined,
    y: velocity.y * combined,
  };
}
