import React from "react";
import { AbsoluteFill, Img, staticFile, interpolate, useCurrentFrame } from "remotion";

interface WorldMapProps {
  isVertical?: boolean;
}

export const WorldMap: React.FC<WorldMapProps> = ({ isVertical = false }) => {
  const frame = useCurrentFrame();

  // Fade in animation
  const opacity = interpolate(frame, [0, 30], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#e0e0e0",
        opacity,
      }}
    >
      {/* Paper cut-out world map image */}
      <Img
        src={staticFile("world-map.png")}
        style={{
          width: "100%",
          height: "100%",
          objectFit: isVertical ? "cover" : "contain",
          objectPosition: "center",
        }}
      />

      {/* Subtle vignette overlay */}
      <div
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          background: "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.08) 100%)",
          pointerEvents: "none",
        }}
      />
    </AbsoluteFill>
  );
};
