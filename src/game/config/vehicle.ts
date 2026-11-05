export const VEHICLE_CONFIG = {
  width: 50,
  height: 30,
  mass: 900,
  engineForce: 0.55,
  brakeForce: 0.5,
  maxSpeed: 10,
  reverseSpeed: 8,
  steeringSpeed: 0.09,
  maxSteeringAngle: 0.55,
  lateralGrip: 0.9,
  rearGripMultiplier: 1.0,
  handbrakeRearGripMultiplier: 0.40,
  dragCoefficient: 0.994,
  rollingResistance: 0.992,
  angularDrag: 0.88,
  weightTransferAccel: 0.35,
  weightTransferBrake: 0.35,
  arenaSize: 5000,
  obstacleCount: 35,
  frictionCoefficient: 0.07,
} as const;

export type VehicleConfig = typeof VEHICLE_CONFIG;
