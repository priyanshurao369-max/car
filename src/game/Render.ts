import type { VehicleState } from "./VehicleController";

const VEHICLE_WIDTH = 50;
const VEHICLE_HEIGHT = 30;
const VEHICLE_COLOR = "#f5f5f7";

export function clear(ctx: CanvasRenderingContext2D, width: number, height: number): void {
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, width, height);
}

export function renderVehicle(
  ctx: CanvasRenderingContext2D,
  state: VehicleState
): void {
  ctx.save();
  ctx.translate(state.position.x, state.position.y);
  ctx.rotate(state.rotation);

  ctx.fillStyle = VEHICLE_COLOR;
  ctx.fillRect(-VEHICLE_WIDTH / 2, -VEHICLE_HEIGHT / 2, VEHICLE_WIDTH, VEHICLE_HEIGHT);

  ctx.restore();
}

export function renderHUD(
  ctx: CanvasRenderingContext2D,
  state: VehicleState,
  fps: number
): void {
  const speed = Math.hypot(state.velocity.x, state.velocity.y).toFixed(1);

  ctx.fillStyle = "#f5f5f7";
  ctx.font = "16px monospace";
  ctx.textBaseline = "top";
  ctx.fillText(`Speed: ${speed}`, 16, 16);
  ctx.fillText(`FPS: ${fps}`, 16, 40);
}
