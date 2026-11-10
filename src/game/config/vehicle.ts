export const VEHICLE_CONFIG = {
  width: 50,
  height: 50,
  mass: 900,
  maxSpeed: 10,
  moveForce: 0.6,
  dragCoefficient: 0.994,
  rollingResistance: 0.992,
  arenaSize: 5000,
  obstacleCount: 35,
  starCount: 7,
  starRadius: 18,
  starMargin: 300,
  frictionCoefficient: 0.07,
} as const;

export type VehicleConfig = typeof VEHICLE_CONFIG;
