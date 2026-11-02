import { VEHICLE_CONFIG } from "../config/vehicle";

export type SteeringInput = {
  steerLeft: boolean;
  steerRight: boolean;
};

export type SteeringState = {
  angle: number;
  targetAngle: number;
};

export function updateSteering(
  state: SteeringState,
  input: SteeringInput
): SteeringState {
  const { steeringSpeed, maxSteeringAngle } = VEHICLE_CONFIG;

  let target = state.targetAngle;
  if (input.steerLeft) target -= steeringSpeed;
  else if (input.steerRight) target += steeringSpeed;
  else target *= 0.9;
  target = Math.max(-maxSteeringAngle, Math.min(maxSteeringAngle, target));

  return {
    angle: state.angle + (target - state.angle) * 0.5,
    targetAngle: target,
  };
}
