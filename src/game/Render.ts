import type { VehicleState } from "./VehicleController";

export function clear(ctx: CanvasRenderingContext2D, width: number, height: number): void {
  ctx.fillStyle = "#f0f7f0";
  ctx.fillRect(0, 0, width, height);
}

export function renderVehicle(
  ctx: CanvasRenderingContext2D,
  state: VehicleState
): void {
  const vw = 50;
  const vh = 30;

  ctx.save();
  ctx.translate(state.position.x, state.position.y);
  ctx.rotate(state.rotation);

  ctx.fillStyle = "#000000";
  ctx.fillRect(-vw / 2, -vh / 2, vw, vh);

  ctx.restore();
}

export function renderHUD(
  ctx: CanvasRenderingContext2D,
  state: VehicleState,
  fps: number
): void {
  const speed = Math.hypot(state.velocity.x, state.velocity.y).toFixed(1);

  ctx.fillStyle = "#000000";
  ctx.font = "16px monospace";
  ctx.textBaseline = "top";
  ctx.fillText(`Speed: ${speed}`, 16, 16);
  ctx.fillText(`FPS: ${fps}`, 16, 40);
}
