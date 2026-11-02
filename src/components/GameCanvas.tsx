"use client";

import { useEffect, useRef } from "react";
import Matter from "matter-js";
import { Physics } from "@/game/Physics";
import { clear, renderVehicle, renderHUD } from "@/game/Render";
import { VEHICLE_CONFIG } from "@/game/config/vehicle";
import type { InputState } from "@/game/Input";

type Control = {
  label: string;
  action: "throttle" | "brake" | "steerLeft" | "steerRight" | "handbrake";
  icon: string;
};

const CONTROLS: Control[] = [
  { label: "Accelerate", action: "throttle", icon: "▲" },
  { label: "Brake", action: "brake", icon: "▼" },
  { label: "Steer Left", action: "steerLeft", icon: "◀" },
  { label: "Steer Right", action: "steerRight", icon: "▶" },
  { label: "Handbrake", action: "handbrake", icon: "␣" },
];

export default function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const physicsRef = useRef<Physics | null>(null);
  const fpsRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const physics = new Physics(0, 0, 5000, 5000);
    physicsRef.current = physics;
    physics.start();

    const input = physics.getInput();

    const bindButton = (id: string, action: keyof InputState) => {
      const el = document.getElementById(id);
      if (!el) return;
      const press = () => {
        input.setKey(action, true);
      };
      const release = () => {
        input.setKey(action, false);
      };
      el.addEventListener("pointerdown", press);
      el.addEventListener("pointerup", release);
      el.addEventListener("pointerleave", release);
      el.addEventListener("pointercancel", release);
    };

    bindButton("btn-throttle", "throttle");
    bindButton("btn-brake", "brake");
    bindButton("btn-steerLeft", "steerLeft");
    bindButton("btn-steerRight", "steerRight");
    bindButton("btn-handbrake", "handbrake");

    let lastTime = performance.now();
    let frames = 0;

    const render = (time: number) => {
      const dt = time - lastTime;
      frames++;
      if (dt >= 1000) {
        fpsRef.current = frames;
        frames = 0;
        lastTime = time;
      }

      const state = physics.getVehicleState();
      const camera = physics.getCamera();
      const world = physics.getWorld();
      const obstacles = world.obstacles;
      const boundaries = world.boundaries;
      const hitWalls = physics.getHitWalls();

      clear(ctx, canvas.width, canvas.height);

      ctx.save();
      ctx.translate(
        -camera.position.x + canvas.width / 2,
        -camera.position.y + canvas.height / 2
      );

      // Dull green motion-tracking grid
      const gridSize = 200;
      const halfArena = VEHICLE_CONFIG.arenaSize / 2;
      ctx.strokeStyle = "#a8c0a8";
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let x = -halfArena; x <= halfArena; x += gridSize) {
        ctx.moveTo(x, -halfArena);
        ctx.lineTo(x, halfArena);
      }
      for (let y = -halfArena; y <= halfArena; y += gridSize) {
        ctx.moveTo(-halfArena, y);
        ctx.lineTo(halfArena, y);
      }
      ctx.stroke();

      for (const b of boundaries) {
        const body = b as Matter.Body & { width: number; height: number };
        const pos = body.position;
        const isHit = hitWalls.has(body.id);

        if (isHit) {
          ctx.fillStyle = "#ff0000";
          ctx.shadowColor = "#ff0000";
          ctx.shadowBlur = 24;
        } else {
          ctx.fillStyle = "#000000";
          ctx.shadowColor = "transparent";
          ctx.shadowBlur = 0;
        }
        ctx.strokeStyle = "#111111";
        ctx.lineWidth = 4;
        ctx.fillRect(
          pos.x - body.width / 2,
          pos.y - body.height / 2,
          body.width,
          body.height
        );
        ctx.strokeRect(
          pos.x - body.width / 2,
          pos.y - body.height / 2,
          body.width,
          body.height
        );
      }

      // Closed boundary frame around the arena perimeter
      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 6;
      ctx.strokeRect(
        -halfArena,
        -halfArena,
        VEHICLE_CONFIG.arenaSize,
        VEHICLE_CONFIG.arenaSize
      );

      ctx.fillStyle = "#999999";
      for (const obs of obstacles) {
        ctx.fillRect(obs.x - obs.w / 2, obs.y - obs.h / 2, obs.w, obs.h);
      }

      renderVehicle(ctx, state);

      ctx.restore();

      renderHUD(ctx, state, fpsRef.current);

      requestAnimationFrame(render);
    };

    requestAnimationFrame(render);

    return () => {
      window.removeEventListener("resize", resize);
      physics.destroy();
      physicsRef.current = null;
    };
  }, []);

  return (
    <div className="relative w-full h-screen bg-[#f0f7f0] overflow-hidden">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full block"
      />
      <div
        className="absolute bottom-8 right-8 flex flex-col gap-2 pointer-events-none"
      >
        <div
          className="flex gap-2 pointer-events-auto"
          style={{ touchAction: "none" }}
        >
          {[CONTROLS[0], CONTROLS[1]].map((c) => (
            <button
              key={c.action}
              id={`btn-${c.action}`}
              className="pointer-events-auto px-4 py-2 rounded bg-black text-white text-sm font-mono border border-zinc-300 active:bg-zinc-200"
              onPointerDown={() => {}}
              onPointerUp={() => {}}
            >
              {c.icon}
            </button>
          ))}
        </div>
      </div>
      <div
        className="absolute bottom-8 left-8 flex flex-col gap-2 pointer-events-none"
      >
        <div
          className="flex gap-2 pointer-events-auto"
          style={{ touchAction: "none" }}
        >
          {[CONTROLS[2], CONTROLS[3]].map((c) => (
            <button
              key={c.action}
              id={`btn-${c.action}`}
              className="pointer-events-auto px-4 py-2 rounded bg-black text-white text-sm font-mono border border-zinc-300 active:bg-zinc-200"
              onPointerDown={() => {}}
              onPointerUp={() => {}}
            >
              {c.icon}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
