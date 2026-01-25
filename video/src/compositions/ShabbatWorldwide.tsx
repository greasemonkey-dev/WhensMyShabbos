import React from "react";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
  Easing,
  Img,
} from "remotion";
import { WorldMap } from "../components/WorldMap";
import { CityPin } from "../components/CityPin";

interface ShabbatWorldwideProps {
  isVertical?: boolean;
}

// City data with coordinates (percentages)
const cities = [
  { name: "Sydney", time: "4:47 PM", x: 85, y: 58, horizontalX: 85, horizontalY: 58 },
  { name: "Jerusalem", time: "7:12 PM", x: 55, y: 32, horizontalX: 55, horizontalY: 28 },
  { name: "London", time: "4:34 PM", x: 47, y: 22, horizontalX: 47, horizontalY: 18 },
  { name: "New York", time: "4:58 PM", x: 24, y: 30, horizontalX: 24, horizontalY: 26 },
  { name: "Los Angeles", time: "5:01 PM", x: 12, y: 34, horizontalX: 12, horizontalY: 30 },
];

export const ShabbatWorldwide: React.FC<ShabbatWorldwideProps> = ({
  isVertical = false,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Timeline (15 seconds = 450 frames at 30fps)
  // 0-60: Opening text
  // 60-300: Cities appear (48 frames apart = 1.6s each)
  // 300-360: "One Shabbat" text
  // 360-450: CTA + Logo

  // Opening text animation
  const openingOpacity = interpolate(frame, [0, 20, 50, 70], [0, 1, 1, 0], {
    extrapolateRight: "clamp",
  });

  // "One Shabbat" text animation
  const oneShabbatOpacity = interpolate(
    frame,
    [280, 300, 340, 360],
    [0, 1, 1, 0],
    { extrapolateRight: "clamp" }
  );

  const oneShabbatScale = interpolate(frame, [280, 310], [0.8, 1], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.ease),
  });

  // CTA animation
  const ctaOpacity = interpolate(frame, [350, 380], [0, 1], {
    extrapolateRight: "clamp",
  });

  const ctaY = interpolate(frame, [350, 380], [30, 0], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.ease),
  });

  // Logo animation
  const logoOpacity = interpolate(frame, [360, 390], [0, 1], {
    extrapolateRight: "clamp",
  });

  const logoScale = interpolate(frame, [360, 390], [0.9, 1], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.back(1.2)),
  });

  // City appear frames (staggered)
  const cityAppearFrames = [60, 108, 156, 204, 252];

  const titleSize = isVertical ? 42 : 32;
  const subtitleSize = isVertical ? 64 : 48;
  const ctaSize = isVertical ? 36 : 28;

  return (
    <AbsoluteFill>
      <WorldMap isVertical={isVertical} />

      {/* Opening text: "This Friday night..." */}
      <div
        style={{
          position: "absolute",
          top: isVertical ? "15%" : "12%",
          left: 0,
          right: 0,
          textAlign: "center",
          opacity: openingOpacity,
          zIndex: 20,
        }}
      >
        <div
          style={{
            fontSize: titleSize,
            color: "rgba(255,255,255,0.9)",
            fontFamily: "system-ui, -apple-system, sans-serif",
            fontWeight: 400,
            letterSpacing: "2px",
            textTransform: "uppercase",
            textShadow: "0 2px 20px rgba(0,0,0,0.8)",
          }}
        >
          This Friday night...
        </div>
      </div>

      {/* City pins */}
      {cities.map((city, index) => (
        <CityPin
          key={city.name}
          cityName={city.name}
          time={city.time}
          x={isVertical ? city.x : city.horizontalX}
          y={isVertical ? city.y : city.horizontalY}
          appearFrame={cityAppearFrames[index]}
          isVertical={isVertical}
        />
      ))}

      {/* "One Shabbat. Everywhere." text */}
      <div
        style={{
          position: "absolute",
          top: isVertical ? "8%" : "8%",
          left: 0,
          right: 0,
          textAlign: "center",
          opacity: oneShabbatOpacity,
          transform: `scale(${oneShabbatScale})`,
          zIndex: 20,
        }}
      >
        <div
          style={{
            fontSize: subtitleSize,
            fontWeight: 700,
            background: "linear-gradient(90deg, #5B6FDE, #7056D0, #E57FE9)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            fontFamily: "system-ui, -apple-system, sans-serif",
            letterSpacing: "1px",
            textShadow: "none",
            filter: "drop-shadow(0 4px 20px rgba(112, 86, 208, 0.5))",
          }}
        >
          One Shabbat. Everywhere.
        </div>
      </div>

      {/* CTA Section */}
      <div
        style={{
          position: "absolute",
          bottom: isVertical ? "12%" : "10%",
          left: 0,
          right: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          opacity: ctaOpacity,
          transform: `translateY(${ctaY}px)`,
          zIndex: 30,
        }}
      >
        {/* Logo */}
        <div
          style={{
            opacity: logoOpacity,
            transform: `scale(${logoScale})`,
            marginBottom: isVertical ? 30 : 20,
          }}
        >
          <div
            style={{
              fontSize: isVertical ? 48 : 36,
              fontWeight: 700,
              color: "#ffffff",
              fontFamily: "system-ui, -apple-system, sans-serif",
              textShadow: "0 2px 20px rgba(0,0,0,0.8)",
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            When's My Shabbos?
            <span style={{ fontSize: isVertical ? 44 : 32 }}>🕯️</span>
          </div>
        </div>

        {/* CTA Button */}
        <div
          style={{
            background: "linear-gradient(135deg, #f8b400 0%, #e6a000 100%)",
            padding: isVertical ? "18px 48px" : "14px 36px",
            borderRadius: 50,
            boxShadow: "0 4px 30px rgba(248, 180, 0, 0.4)",
          }}
        >
          <span
            style={{
              fontSize: ctaSize,
              fontWeight: 700,
              color: "#1a1a2e",
              fontFamily: "system-ui, -apple-system, sans-serif",
              letterSpacing: "0.5px",
            }}
          >
            Find your times
          </span>
        </div>

        {/* URL */}
        <div
          style={{
            marginTop: isVertical ? 20 : 14,
            fontSize: isVertical ? 24 : 18,
            color: "rgba(255,255,255,0.7)",
            fontFamily: "system-ui, -apple-system, sans-serif",
            letterSpacing: "1px",
          }}
        >
          whensmyshabbos.com
        </div>

        {/* QR Code placeholder */}
        <div
          style={{
            position: "absolute",
            right: isVertical ? 40 : 60,
            bottom: isVertical ? 20 : 10,
            width: isVertical ? 100 : 80,
            height: isVertical ? 100 : 80,
            background: "#ffffff",
            borderRadius: 8,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
          }}
        >
          <div
            style={{
              width: "80%",
              height: "80%",
              background: `
                repeating-linear-gradient(
                  0deg,
                  #1a1a2e 0px,
                  #1a1a2e 8px,
                  #ffffff 8px,
                  #ffffff 16px
                )
              `,
              opacity: 0.8,
            }}
          />
        </div>
      </div>
    </AbsoluteFill>
  );
};
