import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, Easing } from "remotion";

interface WorldMapProps {
  isVertical?: boolean;
}

// Paper cut-out style continents with more organic shapes
const continents = [
  // North America - organic paper cut shape
  {
    path: "M 10,20 Q 12,16 18,15 Q 24,14 28,18 Q 30,22 28,28 Q 26,34 22,38 Q 18,40 14,38 Q 10,34 8,28 Q 7,24 10,20 Z",
    color: "#7BA38C", // Sage green
    shadow: 3,
  },
  // South America
  {
    path: "M 24,44 Q 30,42 32,48 Q 33,54 30,62 Q 26,70 22,72 Q 19,70 20,62 Q 21,54 22,48 Q 23,44 24,44 Z",
    color: "#8FBC8F", // Dark sea green
    shadow: 2,
  },
  // Europe
  {
    path: "M 44,18 Q 48,15 54,17 Q 56,20 54,24 Q 50,26 46,25 Q 42,24 42,20 Q 43,18 44,18 Z",
    color: "#9DB4A0", // Muted green
    shadow: 2,
  },
  // Africa
  {
    path: "M 44,30 Q 52,28 58,34 Q 60,42 56,52 Q 52,58 46,56 Q 40,52 40,44 Q 41,36 44,30 Z",
    color: "#C4A574", // Sandy tan
    shadow: 3,
  },
  // Asia
  {
    path: "M 56,14 Q 66,11 78,15 Q 88,18 90,26 Q 88,34 80,38 Q 70,40 62,36 Q 56,32 55,24 Q 55,18 56,14 Z",
    color: "#A8B89A", // Soft olive
    shadow: 4,
  },
  // Australia
  {
    path: "M 80,52 Q 88,50 92,56 Q 92,62 86,66 Q 80,66 76,60 Q 76,54 80,52 Z",
    color: "#D4A76A", // Warm ochre
    shadow: 2,
  },
];

// Small paper stars
const paperStars = [
  { x: 5, y: 12, size: 12, rotation: 15 },
  { x: 15, y: 8, size: 8, rotation: -10 },
  { x: 35, y: 6, size: 10, rotation: 20 },
  { x: 65, y: 5, size: 14, rotation: -5 },
  { x: 85, y: 10, size: 9, rotation: 25 },
  { x: 95, y: 25, size: 11, rotation: -15 },
  { x: 3, y: 45, size: 8, rotation: 10 },
  { x: 70, y: 70, size: 12, rotation: -20 },
  { x: 38, y: 65, size: 10, rotation: 5 },
  { x: 92, y: 45, size: 8, rotation: 30 },
];

// Paper star SVG path
const starPath = "M 0,-10 L 2.5,-3 L 10,-3 L 4,2 L 6.5,10 L 0,5 L -6.5,10 L -4,2 L -10,-3 L -2.5,-3 Z";

export const WorldMap: React.FC<WorldMapProps> = ({ isVertical = false }) => {
  const frame = useCurrentFrame();

  // Layered fade in for paper depth effect
  const bgOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateRight: "clamp",
  });

  const continentOpacity = interpolate(frame, [10, 40], [0, 1], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.ease),
  });

  const starsOpacity = interpolate(frame, [20, 50], [0, 0.7], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill>
      {/* Base layer - deep blue paper background */}
      <div
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          background: "linear-gradient(180deg, #1e3a5f 0%, #2d4a6f 30%, #1a3050 100%)",
          opacity: bgOpacity,
        }}
      />

      {/* Paper texture overlay */}
      <div
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          opacity: 0.15,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          mixBlendMode: "overlay",
        }}
      />

      {/* Warm backlight glow (like lightbox behind paper) */}
      <div
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          background: "radial-gradient(ellipse 80% 60% at 50% 50%, rgba(255, 200, 100, 0.12) 0%, transparent 70%)",
          opacity: bgOpacity,
        }}
      />

      {/* Paper cut continents */}
      <svg
        viewBox="0 0 100 80"
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          opacity: continentOpacity,
        }}
        preserveAspectRatio={isVertical ? "xMidYMid slice" : "xMidYMid meet"}
      >
        <defs>
          {/* Paper texture filter */}
          <filter id="paperTexture" x="-10%" y="-10%" width="120%" height="120%">
            <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="3" result="noise" />
            <feDiffuseLighting in="noise" lightingColor="#ffffff" surfaceScale="1.5" result="light">
              <feDistantLight azimuth="45" elevation="60" />
            </feDiffuseLighting>
            <feComposite in="SourceGraphic" in2="light" operator="arithmetic" k1="1" k2="0" k3="0" k4="0" />
          </filter>

          {/* Drop shadow for paper depth */}
          <filter id="paperShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0.5" dy="0.8" stdDeviation="0.4" floodColor="#0a1525" floodOpacity="0.5" />
          </filter>
        </defs>

        {/* Render continents with paper effect */}
        {continents.map((continent, index) => (
          <g key={index}>
            {/* Shadow layer */}
            <path
              d={continent.path}
              fill="rgba(10, 20, 40, 0.4)"
              transform={`translate(${continent.shadow * 0.3}, ${continent.shadow * 0.5})`}
              style={{ filter: "blur(2px)" }}
            />
            {/* Main paper layer */}
            <path
              d={continent.path}
              fill={continent.color}
              filter="url(#paperShadow)"
              style={{
                opacity: 0.9,
              }}
            />
            {/* Highlight edge (paper fold effect) */}
            <path
              d={continent.path}
              fill="none"
              stroke="rgba(255, 255, 255, 0.3)"
              strokeWidth="0.3"
            />
          </g>
        ))}
      </svg>

      {/* Paper cut stars */}
      <svg
        viewBox="0 0 100 80"
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          opacity: starsOpacity,
        }}
        preserveAspectRatio={isVertical ? "xMidYMid slice" : "xMidYMid meet"}
      >
        {paperStars.map((star, index) => {
          const twinkle = interpolate(
            (frame + index * 15) % 90,
            [0, 45, 90],
            [0.5, 1, 0.5]
          );
          return (
            <g
              key={index}
              transform={`translate(${star.x}, ${star.y}) rotate(${star.rotation}) scale(${star.size / 100})`}
            >
              {/* Star shadow */}
              <path
                d={starPath}
                fill="rgba(10, 20, 40, 0.3)"
                transform="translate(0.5, 0.8)"
              />
              {/* Paper star */}
              <path
                d={starPath}
                fill="#F5E6C8"
                opacity={twinkle}
              />
            </g>
          );
        })}
      </svg>

      {/* Vignette - softer for paper feel */}
      <div
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          background: "radial-gradient(ellipse at center, transparent 50%, rgba(15, 30, 50, 0.5) 100%)",
          pointerEvents: "none",
        }}
      />
    </AbsoluteFill>
  );
};
