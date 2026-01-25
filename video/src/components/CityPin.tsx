import React from "react";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  Easing,
} from "remotion";

interface CityPinProps {
  cityName: string;
  time: string;
  x: number; // percentage from left
  y: number; // percentage from top
  appearFrame: number;
  isVertical?: boolean;
}

export const CityPin: React.FC<CityPinProps> = ({
  cityName,
  time,
  x,
  y,
  appearFrame,
  isVertical = false,
}) => {
  const frame = useCurrentFrame();
  const relativeFrame = frame - appearFrame;

  // Don't render before appear frame
  if (relativeFrame < 0) return null;

  // Pin drop animation (0-10 frames)
  const pinScale = interpolate(relativeFrame, [0, 10], [0, 1], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.back(1.5)),
  });

  const pinOpacity = interpolate(relativeFrame, [0, 5], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Glow pulse animation (continuous after appear)
  const glowScale = interpolate(
    relativeFrame % 30,
    [0, 15, 30],
    [1, 1.5, 1],
    { extrapolateRight: "clamp" }
  );

  const glowOpacity = interpolate(
    relativeFrame % 30,
    [0, 15, 30],
    [0.8, 0.3, 0.8],
    { extrapolateRight: "clamp" }
  );

  // Text fade in (slightly delayed)
  const textOpacity = interpolate(relativeFrame, [5, 15], [0, 1], {
    extrapolateRight: "clamp",
  });

  const textY = interpolate(relativeFrame, [5, 15], [10, 0], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.ease),
  });

  const fontSize = isVertical ? 24 : 18;
  const pinSize = isVertical ? 20 : 16;

  return (
    <div
      style={{
        position: "absolute",
        left: `${x}%`,
        top: `${y}%`,
        transform: "translate(-50%, -50%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        zIndex: 10,
      }}
    >
      {/* Outer glow pulse */}
      <div
        style={{
          position: "absolute",
          width: pinSize * 4,
          height: pinSize * 4,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(248,180,0,0.6) 0%, rgba(248,180,0,0) 70%)",
          transform: `scale(${glowScale})`,
          opacity: glowOpacity * pinOpacity,
        }}
      />

      {/* Inner glow */}
      <div
        style={{
          position: "absolute",
          width: pinSize * 2,
          height: pinSize * 2,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255,200,50,0.9) 0%, rgba(248,180,0,0.4) 60%, rgba(248,180,0,0) 100%)",
          opacity: pinOpacity,
          transform: `scale(${pinScale})`,
        }}
      />

      {/* Pin center */}
      <div
        style={{
          width: pinSize,
          height: pinSize,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #ffd700 0%, #f8b400 50%, #e6a000 100%)",
          boxShadow: "0 0 20px rgba(248,180,0,0.8), 0 0 40px rgba(248,180,0,0.4)",
          opacity: pinOpacity,
          transform: `scale(${pinScale})`,
          zIndex: 2,
        }}
      />

      {/* City name and time */}
      <div
        style={{
          marginTop: pinSize + 8,
          textAlign: "center",
          opacity: textOpacity,
          transform: `translateY(${textY}px)`,
        }}
      >
        <div
          style={{
            fontSize: fontSize,
            fontWeight: 700,
            color: "#ffffff",
            textShadow: "0 2px 10px rgba(0,0,0,0.8)",
            fontFamily: "system-ui, -apple-system, sans-serif",
            letterSpacing: "0.5px",
          }}
        >
          {cityName}
        </div>
        <div
          style={{
            fontSize: fontSize + 4,
            fontWeight: 800,
            background: "linear-gradient(90deg, #f8b400, #ffd700)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            textShadow: "none",
            fontFamily: "system-ui, -apple-system, sans-serif",
            marginTop: 2,
          }}
        >
          {time}
        </div>
      </div>
    </div>
  );
};
