"use client";

import { useEffect, useRef, useCallback } from "react";
import Matter from "matter-js";
import { Physics } from "@/game/Physics";
import { clear, renderVehicle, renderHUD } from "@/game/Render";
import { VEHICLE_CONFIG } from "@/game/config/vehicle";
import type { InputState } from "@/game/Input";

type Direction = {
  label: string;
  action: "up" | "down" | "left" | "right";
  icon: string;
};

const DIRECTIONS: Direction[] = [
  { label: "Up", action: "up", icon: "▲" },
  { label: "Left", action: "left", icon: "◀" },
  { label: "Down", action: "down", icon: "▼" },
  { label: "Right", action: "right", icon: "▶" },
];

export default function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const physicsRef = useRef<Physics | null>(null);
  const inputRef = useRef<{ setKey: (action: keyof InputState, value: boolean) => void; pollGamepad: () => void; vibrate: (ms: number) => void } | null>(null);
  const fpsRef = useRef(0);
  const rafRef = useRef(0);

  const bindButton = useCallback((id: string, action: keyof InputState) => {
    const input = inputRef.current;
    if (!input) return;
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
  }, []);

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
    inputRef.current = input;

    DIRECTIONS.forEach((d) => {
      bindButton(`dpad-${d.action}`, d.action);
    });

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

      input.pollGamepad();

      const state = physics.getVehicleState();
      const camera = physics.getCamera();
      const world = physics.getWorld();
      const obstacles = world.obstacles;
      const boundaries = world.boundaries;
      const hitWalls = physics.getHitWalls();

      if (hitWalls.size > 0) {
        input.vibrate(100);
      }

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

      rafRef.current = requestAnimationFrame(render);
    };

    rafRef.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(rafRef.current);
      physics.destroy();
      physicsRef.current = null;
    };
  }, [bindButton]);

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
          {DIRECTIONS.filter((d) => d.action === "up").map((d) => (
            <button
              key={d.action}
              id={`dpad-${d.action}`}
              className="pointer-events-auto w-16 h-16 rounded-full bg-[#0071e3] text-white text-xs font-semibold border-none active:opacity-90 select-none"
            >
              {d.icon}
            </button>
          ))}
        </div>
        <div className="flex gap-2 pointer-events-auto">
          {DIRECTIONS.filter((d) => d.action !== "up").map((d) => (
            <button
              key={d.action}
              id={`dpad-${d.action}`}
              className="pointer-events-auto w-16 h-16 rounded-full bg-[#0071e3] text-white text-xs font-semibold border-none active:opacity-90 select-none"
            >
              {d.icon}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
