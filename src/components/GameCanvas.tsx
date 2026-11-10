"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { Physics } from "@/game/Physics";
import {
  clear,
  renderVehicle,
  renderStars,
  renderHUD,
  renderStarHUD,
  renderMenuOverlay,
  renderScoreOverlay,
  renderModeSelectionOverlay,
} from "@/game/Render";
import { VEHICLE_CONFIG } from "@/game/config/vehicle";
import type { InputState } from "@/game/Input";

type Mode = "modeSelection" | "menu" | "playing" | "score";

type GameMode = "star" | "freeRoam";

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

const BEST_KEY = "carStarBestTime";

function getBestTime(): number | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(BEST_KEY);
  if (raw === null) return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

function setBestTime(t: number) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(BEST_KEY, String(t));
}

export default function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const physicsRef = useRef<Physics | null>(null);
  const inputRef = useRef<{ setKey: (action: keyof InputState, value: boolean) => void; pollGamepad: () => void; vibrate: (ms: number) => void } | null>(null);
  const fpsRef = useRef(0);
  const rafRef = useRef(0);

const [mode, setMode] = useState<Mode>("modeSelection");

  const modeRef = useRef<Mode>("modeSelection");
  const gameModeRef = useRef<GameMode>("star");
  const elapsedRef = useRef<number>(0);
  const remainingRef = useRef<number>(VEHICLE_CONFIG.starCount);
  const bestRef = useRef<number | null>(getBestTime());
  const startTimeRef = useRef(0);
  const lastTickRef = useRef(0);
  const starsRef = useRef(0);

  const beginStarMode = () => {
    const p = physicsRef.current;
    if (!p) return;
    p.resetStars();
    p.spawnStars();
    p.setOnStarCollected(() => {
      starsRef.current = Math.max(0, starsRef.current - 1);
      remainingRef.current = starsRef.current;
      if (starsRef.current === 0) {
        const finalElapsed = performance.now() - startTimeRef.current;
        const seconds = finalElapsed / 1000;
        elapsedRef.current = seconds;
        const cur = bestRef.current;
        if (cur === null || seconds < cur) {
          setBestTime(seconds);
          bestRef.current = seconds;
        }
        modeRef.current = "score";
        setMode("score");
      }
    });
    starsRef.current = VEHICLE_CONFIG.starCount;
    remainingRef.current = VEHICLE_CONFIG.starCount;
    startTimeRef.current = performance.now();
    lastTickRef.current = startTimeRef.current;
    elapsedRef.current = 0;
    modeRef.current = "playing";
    setMode("playing");
    gameModeRef.current = "star";
  };

  const beginFreeRoamMode = () => {
    const p = physicsRef.current;
    if (!p) return;
    p.resetStars();
    p.setOnStarCollected(null);
    starsRef.current = 0;
    remainingRef.current = 0;
    startTimeRef.current = performance.now();
    lastTickRef.current = startTimeRef.current;
    elapsedRef.current = 0;
    modeRef.current = "playing";
    setMode("playing");
    gameModeRef.current = "freeRoam";
  };

  const restartCurrentMode = () => {
    if (gameModeRef.current === "star") {
      beginStarMode();
    } else {
      beginFreeRoamMode();
    }
  };

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

  // Handle mode selection clicks
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleClick = (e: MouseEvent) => {
      if (modeRef.current !== "modeSelection") return;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const cardWidth = 280;
      const cardHeight = 360;
      const cardGap = 60;
      const startX = centerX - cardWidth - cardGap / 2;
      const cardY = centerY - 20;
      const freeRoamX = centerX + cardGap / 2;

      // Check Star Mode card click
      if (
        x >= startX &&
        x <= startX + cardWidth &&
        y >= cardY &&
        y <= cardY + cardHeight
      ) {
        beginStarMode();
        return;
      }

      // Check Free Roam card click
      if (
        x >= freeRoamX &&
        x <= freeRoamX + cardWidth &&
        y >= cardY &&
        y <= cardY + cardHeight
      ) {
        beginFreeRoamMode();
        return;
      }
    };

    canvas.addEventListener("click", handleClick);
    return () => canvas.removeEventListener("click", handleClick);
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

      if (modeRef.current === "playing") {
        elapsedRef.current = (time - startTimeRef.current) / 1000;
      }

      input.pollGamepad();

      const state = physics.getVehicleState();
      const camera = physics.getCamera();
      const world = physics.getWorld();
      const obstacles = world.obstacles;
      const boundaries = world.boundaries;
      const stars = world.stars;
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

      renderStars(ctx, stars);
      renderVehicle(ctx, state);

      ctx.restore();

      const currentMode = modeRef.current;
      if (currentMode === "playing") {
        if (gameModeRef.current === "star") {
          renderStarHUD(ctx, elapsedRef.current, remainingRef.current);
        } else {
          renderHUD(ctx, state, fpsRef.current);
        }
      } else {
        renderHUD(ctx, state, fpsRef.current);
      }

      if (currentMode === "modeSelection") {
        renderModeSelectionOverlay(ctx, canvas.width, canvas.height);
      } else if (currentMode === "menu") {
        renderMenuOverlay(ctx, canvas.width, canvas.height);
      } else if (currentMode === "score") {
        renderScoreOverlay(ctx, canvas.width, canvas.height, elapsedRef.current, bestRef.current);
      }

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
      {mode === "menu" && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-auto">
          <button
            id="start-star-mode"
            onClick={beginStarMode}
            className="px-10 py-4 rounded-2xl bg-[#0071e3] text-white text-lg font-semibold border-none active:opacity-90 select-none"
          >
            Start Star Mode
          </button>
        </div>
      )}
      {mode === "score" && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-auto">
          <button
            id="restart-mode"
            onClick={restartCurrentMode}
            className="px-10 py-4 rounded-2xl bg-[#0071e3] text-white text-lg font-semibold border-none active:opacity-90 select-none"
          >
            Restart
          </button>
        </div>
      )}
    </div>
  );
}
