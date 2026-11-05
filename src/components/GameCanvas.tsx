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

const DPAD: Control[] = [
  { label: "Throttle", action: "throttle", icon: "▲" },
  { label: "Steer Left", action: "steerLeft", icon: "◀" },
  { label: "Brake", action: "brake", icon: "▼" },
  { label: "Steer Right", action: "steerRight", icon: "▶" },
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

    bindButton("dpad-throttle", "throttle");
    bindButton("dpad-steerLeft", "steerLeft");
    bindButton("dpad-brake", "brake");
    bindButton("dpad-steerRight", "steerRight");

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

      for (const b of boundaries) {
        const body = b as Matter.Body & { width: number; height: number };
        const pos = body.position;
        const isHit = hitWalls.has(body.id);

        if (isHit) {
          ctx.fillStyle = "#2997ff";
          ctx.shadowColor = "#2997ff";
          ctx.shadowBlur = 24;
        } else {
          ctx.fillStyle = "#333336";
          ctx.shadowColor = "transparent";
          ctx.shadowBlur = 0;
        }
        ctx.strokeStyle = "#6e6e73";
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
      const halfArena = VEHICLE_CONFIG.arenaSize / 2;
      ctx.strokeStyle = "#6e6e73";
      ctx.lineWidth = 6;
      ctx.strokeRect(
        -halfArena,
        -halfArena,
        VEHICLE_CONFIG.arenaSize,
        VEHICLE_CONFIG.arenaSize
      );

      ctx.fillStyle = "#6e6e73";
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
    <div className="relative w-full h-screen bg-[#000000] overflow-hidden">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full block"
        style={{ touchAction: "none" }}
      />
      {/* D-pad: bottom left */}
      <div
        className="absolute bottom-8 left-8 flex flex-col gap-2 pointer-events-none"
        style={{ touchAction: "none" }}
      >
        <div className="flex gap-2 justify-center pointer-events-auto">
          {DPAD.filter((b) => b.action === "throttle").map((c) => (
            <button
              key={c.action}
              id={`dpad-${c.action}`}
              className="pointer-events-auto w-16 h-16 rounded-full bg-[#0071e3] text-white text-xs font-semibold border-none active:opacity-90 select-none"
            >
              {c.icon}
            </button>
          ))}
        </div>
        <div className="flex gap-2 pointer-events-auto">
          {DPAD.filter((b) => b.action !== "throttle").map((c) => (
            <button
              key={c.action}
              id={`dpad-${c.action}`}
              className="pointer-events-auto w-16 h-16 rounded-full bg-[#0071e3] text-white text-xs font-semibold border-none active:opacity-90 select-none"
            >
              {c.icon}
            </button>
          ))}
        </div>
      </div>
      {/* Action buttons: bottom right */}
      <div
        className="absolute bottom-8 right-8 flex flex-col gap-2 pointer-events-none"
        style={{ touchAction: "none" }}
      >
        <div className="flex flex-col gap-2 pointer-events-auto">
          {[CONTROLS[0], CONTROLS[1], CONTROLS[4]].map((c) => (
            <button
              key={c.action}
              id={`btn-${c.action}`}
              className="pointer-events-auto px-6 py-3 rounded-full bg-[#0071e3] text-white text-sm font-semibold border-none active:opacity-90 select-none"
            >
              {c.icon}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
