import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, Easing } from "remotion";

interface WorldMapProps {
  isVertical?: boolean;
}

// More detailed continent paths for realistic paper cut-out look
const continents = [
  // North America (more detailed shape)
  {
    path: `M 5,22 Q 6,18 10,16 L 14,14 Q 18,13 22,14 L 26,15 Q 28,16 29,18
           L 30,22 Q 30,26 28,30 L 26,34 Q 24,37 20,38 L 16,38 Q 12,37 10,34
           L 8,30 Q 6,26 5,22 Z
           M 18,38 L 20,42 Q 22,45 20,48 L 18,46 Q 16,43 18,38 Z`,
    shadowOffset: { x: 1.2, y: 1.8 },
  },
  // South America
  {
    path: `M 22,46 Q 26,44 28,48 L 30,54 Q 31,60 28,66 L 24,72 Q 22,74 20,72
           L 19,66 Q 18,60 20,54 L 22,46 Z`,
    shadowOffset: { x: 1, y: 1.5 },
  },
  // Europe (with more detail)
  {
    path: `M 44,14 Q 46,12 50,12 L 54,13 Q 56,14 56,17 L 55,20 Q 54,23 51,24
           L 47,24 Q 44,23 43,20 L 43,16 Q 43,14 44,14 Z
           M 40,18 L 42,16 Q 43,17 42,19 L 40,18 Z`,
    shadowOffset: { x: 1, y: 1.5 },
  },
  // Africa
  {
    path: `M 46,26 Q 50,24 54,26 L 58,30 Q 60,36 58,44 L 54,52 Q 50,58 46,56
           L 42,50 Q 40,44 42,36 L 46,26 Z`,
    shadowOffset: { x: 1.2, y: 1.8 },
  },
  // Asia (larger, more detailed)
  {
    path: `M 56,10 Q 62,8 70,10 L 78,12 Q 85,14 90,18 L 92,24 Q 92,30 88,34
           L 82,38 Q 76,40 68,38 L 60,34 Q 56,30 56,24 L 56,16 Q 56,12 56,10 Z
           M 70,38 L 72,44 Q 74,48 70,50 L 68,46 Q 66,42 70,38 Z
           M 86,28 L 90,30 Q 92,34 88,38 L 86,34 Q 84,30 86,28 Z`,
    shadowOffset: { x: 1.5, y: 2 },
  },
  // Australia
  {
    path: `M 80,50 Q 86,48 90,52 L 92,58 Q 92,64 86,66 L 80,66 Q 76,64 76,58
           L 78,52 Q 79,50 80,50 Z`,
    shadowOffset: { x: 1, y: 1.5 },
  },
  // Greenland
  {
    path: `M 30,8 Q 34,6 38,8 L 40,12 Q 40,16 36,18 L 32,16 Q 28,14 30,8 Z`,
    shadowOffset: { x: 0.8, y: 1.2 },
  },
];

export const WorldMap: React.FC<WorldMapProps> = ({ isVertical = false }) => {
  const frame = useCurrentFrame();

  // Fade in animation
  const bgOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateRight: "clamp",
  });

  const continentOpacity = interpolate(frame, [10, 40], [0, 1], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.ease),
  });

  // Subtle floating animation for depth
  const floatY = interpolate(
    frame % 120,
    [0, 60, 120],
    [0, -2, 0]
  );

  return (
    <AbsoluteFill>
      {/* Light gray textured background */}
      <div
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          background: "linear-gradient(135deg, #e8e8e8 0%, #d0d0d0 50%, #c8c8c8 100%)",
          opacity: bgOpacity,
        }}
      />

      {/* Diagonal line texture overlay */}
      <div
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          opacity: 0.08,
          backgroundImage: `repeating-linear-gradient(
            45deg,
            transparent,
            transparent 2px,
            rgba(0, 0, 0, 0.1) 2px,
            rgba(0, 0, 0, 0.1) 4px
          )`,
        }}
      />

      {/* Paper texture noise */}
      <div
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          opacity: 0.04,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Paper cut continents with 3D shadow effect */}
      <svg
        viewBox="0 0 100 80"
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          opacity: continentOpacity,
          transform: `translateY(${floatY}px)`,
        }}
        preserveAspectRatio={isVertical ? "xMidYMid slice" : "xMidYMid meet"}
      >
        <defs>
          {/* Soft shadow filter for paper depth */}
          <filter id="paperShadow3D" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="0.8" result="blur" />
            <feOffset in="blur" dx="1.5" dy="2" result="offsetBlur" />
            <feFlood floodColor="#4a4a4a" floodOpacity="0.5" result="color" />
            <feComposite in="color" in2="offsetBlur" operator="in" result="shadow" />
            <feMerge>
              <feMergeNode in="shadow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Gradient for paper surface */}
          <linearGradient id="paperGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="50%" stopColor="#f8f8f8" />
            <stop offset="100%" stopColor="#f0f0f0" />
          </linearGradient>

          {/* Inner shadow for lifted paper effect */}
          <filter id="innerGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="0.3" result="blur" />
            <feOffset in="blur" dx="-0.3" dy="-0.3" result="offsetBlur" />
            <feFlood floodColor="#ffffff" floodOpacity="0.8" result="color" />
            <feComposite in="color" in2="offsetBlur" operator="in" result="glow" />
            <feMerge>
              <feMergeNode in="SourceGraphic" />
              <feMergeNode in="glow" />
            </feMerge>
          </filter>
        </defs>

        {/* Render continents with layered shadow effect */}
        {continents.map((continent, index) => (
          <g key={index}>
            {/* Deep shadow layer (furthest) */}
            <path
              d={continent.path}
              fill="rgba(60, 60, 60, 0.3)"
              transform={`translate(${continent.shadowOffset.x * 2}, ${continent.shadowOffset.y * 2})`}
              style={{ filter: "blur(3px)" }}
            />
            {/* Mid shadow layer */}
            <path
              d={continent.path}
              fill="rgba(80, 80, 80, 0.4)"
              transform={`translate(${continent.shadowOffset.x}, ${continent.shadowOffset.y})`}
              style={{ filter: "blur(1.5px)" }}
            />
            {/* Close shadow layer */}
            <path
              d={continent.path}
              fill="rgba(100, 100, 100, 0.3)"
              transform={`translate(${continent.shadowOffset.x * 0.5}, ${continent.shadowOffset.y * 0.5})`}
              style={{ filter: "blur(0.5px)" }}
            />
            {/* Main white paper layer */}
            <path
              d={continent.path}
              fill="url(#paperGradient)"
              filter="url(#innerGlow)"
            />
            {/* Top highlight edge */}
            <path
              d={continent.path}
              fill="none"
              stroke="rgba(255, 255, 255, 0.9)"
              strokeWidth="0.3"
              style={{
                strokeDasharray: "none",
                transform: "translate(-0.1px, -0.1px)"
              }}
            />
          </g>
        ))}
      </svg>

      {/* Subtle vignette */}
      <div
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          background: "radial-gradient(ellipse at center, transparent 60%, rgba(0,0,0,0.1) 100%)",
          pointerEvents: "none",
        }}
      />
    </AbsoluteFill>
  );
};
