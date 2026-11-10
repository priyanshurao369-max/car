"use client";

import Snowfall from "react-snowfall";

export default function SnowfallOverlay() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: 50,
      }}
    >
      <Snowfall
        color="#ffffff"
        snowflakeCount={80}
        speed={[0.5, 2]}
        wind={[-0.5, 1]}
        radius={[0.5, 2.5]}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
        }}
      />
    </div>
  );
}
