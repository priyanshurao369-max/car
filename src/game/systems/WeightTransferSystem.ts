import { VEHICLE_CONFIG } from "../config/vehicle";

export type WeightTransferState = {
  frontGrip: number;
  rearGrip: number;
};

export function calculateWeightTransfer(
  isAccelerating: boolean,
  isBraking: boolean,
  steeringAngle: number
): WeightTransferState {
  const { weightTransferAccel, weightTransferBrake } = VEHICLE_CONFIG;

  let frontGrip = 1.0;
  let rearGrip = 1.0;

  if (isAccelerating) {
    rearGrip += weightTransferAccel;
    frontGrip -= weightTransferAccel * 0.5;
  }

  if (isBraking) {
    frontGrip += weightTransferBrake;
    rearGrip -= weightTransferBrake * 0.5;
  }

  const turnLoad = Math.abs(steeringAngle) * 0.3;
  if (steeringAngle > 0) {
    frontGrip += turnLoad * 0.5;
    rearGrip -= turnLoad * 0.2;
  } else if (steeringAngle < 0) {
    frontGrip += turnLoad * 0.5;
    rearGrip -= turnLoad * 0.2;
  }

  frontGrip = Math.max(0.1, Math.min(1.5, frontGrip));
  rearGrip = Math.max(0.1, Math.min(1.5, rearGrip));

  return { frontGrip, rearGrip };
}
