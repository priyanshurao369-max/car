import { VEHICLE_CONFIG } from "../config/vehicle";

export type EngineInput = {
  throttle: boolean;
  brake: boolean;
  handbrake: boolean;
};

export type EngineState = {
  forwardForce: number;
  brakeForce: number;
  isAccelerating: boolean;
  isBraking: boolean;
};

export function updateEngine(
  input: EngineInput,
  speed: number
): EngineState {
  const { engineForce, brakeForce, maxSpeed } = VEHICLE_CONFIG;

  let forwardForce = 0;
  let brakeF = 0;
  let isAccelerating = false;
  let isBraking = false;

  if (input.throttle) {
    const cap = speed > maxSpeed ? 0 : engineForce;
    forwardForce = cap;
    isAccelerating = true;
  }

  if (input.brake) {
    brakeF = brakeForce;
    isBraking = true;
  }

  return { forwardForce, brakeForce: brakeF, isAccelerating, isBraking };
}
