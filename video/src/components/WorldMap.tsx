import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";

interface WorldMapProps {
  isVertical?: boolean;
}

// Simplified world map coordinates (major landmasses as polygon approximations)
// Using percentages for responsive positioning
const continents = [
  // North America
  "M 8,18 L 12,15 L 18,14 L 24,16 L 28,20 L 26,28 L 22,35 L 18,38 L 12,35 L 8,28 Z",
  // South America
  "M 22,42 L 28,40 L 32,45 L 30,55 L 26,65 L 22,70 L 20,62 L 22,50 Z",
  // Europe
  "M 42,16 L 48,14 L 54,16 L 52,22 L 46,24 L 42,20 Z",
  // Africa
  "M 42,28 L 52,26 L 58,32 L 56,45 L 50,55 L 44,52 L 40,42 L 42,32 Z",
  // Asia
  "M 54,12 L 65,10 L 78,14 L 88,18 L 90,28 L 85,35 L 75,38 L 65,35 L 58,30 L 54,22 Z",
  // Australia
  "M 78,50 L 88,48 L 92,55 L 88,62 L 80,60 L 76,55 Z",
];

export const WorldMap: React.FC<WorldMapProps> = ({ isVertical = false }) => {
  const frame = useCurrentFrame();

  // Subtle fade in
  const mapOpacity = interpolate(frame, [0, 30], [0, 0.3], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(180deg, #0a0a1a 0%, #1a1a2e 50%, #0f0f20 100%)",
      }}
    >
      {/* Stars background */}
      <div
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          opacity: 0.5,
        }}
      >
        {Array.from({ length: 50 }).map((_, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${(i * 17) % 100}%`,
              top: `${(i * 23) % 100}%`,
              width: 2,
              height: 2,
              borderRadius: "50%",
              background: "#ffffff",
              opacity: interpolate(
                (frame + i * 10) % 60,
                [0, 30, 60],
                [0.2, 0.8, 0.2]
              ),
            }}
          />
        ))}
      </div>

      {/* World map SVG */}
      <svg
        viewBox="0 0 100 80"
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          opacity: mapOpacity,
        }}
        preserveAspectRatio={isVertical ? "xMidYMid slice" : "xMidYMid meet"}
      >
        {continents.map((path, index) => (
          <path
            key={index}
            d={path}
            fill="none"
            stroke="rgba(100, 120, 180, 0.4)"
            strokeWidth="0.3"
            style={{
              filter: "drop-shadow(0 0 2px rgba(100, 120, 180, 0.3))",
            }}
          />
        ))}

        {/* Grid lines for globe effect */}
        {Array.from({ length: 7 }).map((_, i) => (
          <line
            key={`h-${i}`}
            x1="0"
            y1={10 + i * 10}
            x2="100"
            y2={10 + i * 10}
            stroke="rgba(60, 80, 120, 0.15)"
            strokeWidth="0.2"
            strokeDasharray="2,2"
          />
        ))}
        {Array.from({ length: 9 }).map((_, i) => (
          <line
            key={`v-${i}`}
            x1={10 + i * 10}
            y1="0"
            x2={10 + i * 10}
            y2="80"
            stroke="rgba(60, 80, 120, 0.15)"
            strokeWidth="0.2"
            strokeDasharray="2,2"
          />
        ))}
      </svg>

      {/* Vignette overlay */}
      <div
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.6) 100%)",
          pointerEvents: "none",
        }}
      />
    </AbsoluteFill>
  );
};
