import type { VehicleState } from "./VehicleController";
import type { Star } from "./World";

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

export function renderStars(ctx: CanvasRenderingContext2D, stars: Star[]): void {
  ctx.save();
  for (const star of stars) {
    if (star.collected) continue;
    ctx.save();
    ctx.translate(star.x, star.y);

    ctx.fillStyle = "#ffd60a";
    ctx.shadowColor = "#ffd60a";
    ctx.shadowBlur = 16;

    const spikes = 5;
    const outerR = 18;
    const innerR = 8;
    ctx.beginPath();
    for (let i = 0; i < spikes * 2; i++) {
      const r = i % 2 === 0 ? outerR : innerR;
      const angle = (i * Math.PI) / spikes - Math.PI / 2;
      const px = Math.cos(angle) * r;
      const py = Math.sin(angle) * r;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }
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

export function renderStarHUD(
  ctx: CanvasRenderingContext2D,
  elapsed: number,
  remaining: number
): void {
  ctx.fillStyle = "#f5f5f7";
  ctx.font = "16px monospace";
  ctx.textBaseline = "top";
  ctx.fillText(`Time: ${elapsed.toFixed(2)}s`, 16, 16);
  ctx.fillText(`Stars: ${remaining}`, 16, 40);
}

export function renderScoreOverlay(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  elapsed: number,
  best: number | null
): void {
  ctx.save();
  ctx.fillStyle = "rgba(0, 0, 0, 0.72)";
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = "#f5f5f7";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = "bold 48px -apple-system, BlinkMacSystemFont, sans-serif";
  ctx.fillText("All Stars Collected!", width / 2, height / 2 - 60);

  ctx.font = "28px -apple-system, BlinkMacSystemFont, sans-serif";
  ctx.fillText(`Time: ${elapsed.toFixed(2)}s`, width / 2, height / 2);

  const bestStr = best !== null ? `${best.toFixed(2)}s` : "--";
  ctx.fillText(`Best: ${bestStr}`, width / 2, height / 2 + 40);

  ctx.fillStyle = "#0071e3";
  ctx.fillRect(width / 2 - 90, height / 2 + 90, 180, 50);

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 20px -apple-system, BlinkMacSystemFont, sans-serif";
  ctx.fillText("Restart", width / 2, height / 2 + 115);

  ctx.restore();
}

export function renderModeSelectionOverlay(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
): void {
  ctx.save();
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, width, height);

  const centerX = width / 2;
  const centerY = height / 2;

  // Title
  ctx.fillStyle = "#f5f5f7";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = "600 80px -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif";
  ctx.letterSpacing = "-1.2px";
  ctx.fillText("Car Physics", centerX, centerY - 180);

  ctx.font = "600 32px -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif";
  ctx.letterSpacing = "0.128px";
  ctx.fillStyle = "#86868b";
  ctx.fillText("Select your driving mode", centerX, centerY - 110);

  // Star Mode Card
  const cardWidth = 280;
  const cardHeight = 360;
  const cardGap = 60;
  const startX = centerX - cardWidth - cardGap / 2;
  const cardY = centerY - 20;

  // Star Mode Card Background
  ctx.fillStyle = "#000000";
  ctx.strokeStyle = "#333336";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(startX, cardY, cardWidth, cardHeight, 28);
  ctx.fill();
  ctx.stroke();

  // Star Icon
  ctx.save();
  ctx.translate(startX + cardWidth / 2, cardY + 80);
  ctx.fillStyle = "#ffd500";
  ctx.shadowColor = "#ffd500";
  ctx.shadowBlur = 20;
  const spikes = 5;
  const outerR = 40;
  const innerR = 18;
  ctx.beginPath();
  for (let i = 0; i < spikes * 2; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const angle = (i * Math.PI) / spikes - Math.PI / 2;
    const px = Math.cos(angle) * r;
    const py = Math.sin(angle) * r;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // Star Mode Label
  ctx.fillStyle = "#f5f5f7";
  ctx.font = "600 19px -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif";
  ctx.letterSpacing = "0.228px";
  ctx.fillText("Star Mode", startX + cardWidth / 2, cardY + 160);

  ctx.fillStyle = "#86868b";
  ctx.font = "400 17px -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif";
  ctx.letterSpacing = "-0.374px";
  ctx.fillText("Collect 7 stars", startX + cardWidth / 2, cardY + 195);
  ctx.fillText("as fast as possible", startX + cardWidth / 2, cardY + 220);

  // Star Mode Button
  ctx.fillStyle = "#0071e3";
  ctx.beginPath();
  ctx.roundRect(startX + 40, cardY + 260, cardWidth - 80, 48, 170);
  ctx.fill();

  ctx.fillStyle = "#ffffff";
  ctx.font = "400 17px -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif";
  ctx.letterSpacing = "-0.12px";
  ctx.fillText("Start Star Mode", startX + cardWidth / 2, cardY + 284);

  // Free Roam Card
  const freeRoamX = centerX + cardGap / 2;

  // Free Roam Card Background
  ctx.fillStyle = "#000000";
  ctx.strokeStyle = "#333336";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(freeRoamX, cardY, cardWidth, cardHeight, 28);
  ctx.fill();
  ctx.stroke();

  // Free Roam Icon (Infinity/Loop symbol)
  ctx.save();
  ctx.translate(freeRoamX + cardWidth / 2, cardY + 80);
  ctx.strokeStyle = "#0071e3";
  ctx.lineWidth = 4;
  ctx.lineCap = "round";
  ctx.shadowColor = "#0071e3";
  ctx.shadowBlur = 20;
  // Draw infinity symbol
  ctx.beginPath();
  ctx.moveTo(-30, 0);
  ctx.bezierCurveTo(-30, -25, 0, -25, 0, 0);
  ctx.bezierCurveTo(0, 25, 30, 25, 30, 0);
  ctx.bezierCurveTo(30, -25, 0, -25, 0, 0);
  ctx.bezierCurveTo(0, 25, -30, 25, -30, 0);
  ctx.stroke();
  ctx.restore();

  // Free Roam Label
  ctx.fillStyle = "#f5f5f7";
  ctx.font = "600 19px -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif";
  ctx.letterSpacing = "0.228px";
  ctx.fillText("Free Roam", freeRoamX + cardWidth / 2, cardY + 160);

  ctx.fillStyle = "#86868b";
  ctx.font = "400 17px -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif";
  ctx.letterSpacing = "-0.374px";
  ctx.fillText("Drive freely", freeRoamX + cardWidth / 2, cardY + 195);
  ctx.fillText("no objectives", freeRoamX + cardWidth / 2, cardY + 220);

  // Free Roam Button
  ctx.fillStyle = "#0071e3";
  ctx.beginPath();
  ctx.roundRect(freeRoamX + 40, cardY + 260, cardWidth - 80, 48, 170);
  ctx.fill();

  ctx.fillStyle = "#ffffff";
  ctx.font = "400 17px -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif";
  ctx.letterSpacing = "-0.12px";
  ctx.fillText("Start Free Roam", freeRoamX + cardWidth / 2, cardY + 284);

  ctx.restore();
}

export function renderMenuOverlay(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
): void {
  ctx.save();
  ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = "#f5f5f7";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = "bold 52px -apple-system, BlinkMacSystemFont, sans-serif";
  ctx.fillText("Car Physics Sandbox", width / 2, height / 2 - 80);

  ctx.font = "22px -apple-system, BlinkMacSystemFont, sans-serif";
  ctx.fillStyle = "#a1a1a6";
  ctx.fillText("Collect all 7 stars as fast as you can", width / 2, height / 2 - 30);

  ctx.fillStyle = "#0071e3";
  ctx.fillRect(width / 2 - 110, height / 2 + 30, 220, 56);

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 22px -apple-system, BlinkMacSystemFont, sans-serif";
  ctx.fillText("Start Star Mode", width / 2, height / 2 + 58);

  ctx.restore();
}