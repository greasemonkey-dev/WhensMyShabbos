import React from "react";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
  Easing,
} from "remotion";
import { WorldMap } from "../components/WorldMap";
import { CityPin } from "../components/CityPin";

interface ShabbatWorldwideProps {
  isVertical?: boolean;
}

// City data with actual Shabbat times for January 24, 2025
// Times reflect winter in Northern Hemisphere, summer in Southern
const cities = [
  { name: "Sydney", time: "7:52 PM", x: 85, y: 58, horizontalX: 85, horizontalY: 58 },      // Summer - late sunset
  { name: "Jerusalem", time: "4:38 PM", x: 55, y: 32, horizontalX: 55, horizontalY: 28 },  // Winter - early sunset
  { name: "London", time: "4:12 PM", x: 47, y: 22, horizontalX: 47, horizontalY: 18 },     // Winter - very early
  { name: "New York", time: "4:42 PM", x: 24, y: 30, horizontalX: 24, horizontalY: 26 },   // Winter - early
  { name: "Los Angeles", time: "4:58 PM", x: 12, y: 34, horizontalX: 12, horizontalY: 30 }, // Winter - slightly later
];

export const ShabbatWorldwide: React.FC<ShabbatWorldwideProps> = ({
  isVertical = false,
}) => {
  const frame = useCurrentFrame();

  // Timeline (15 seconds = 450 frames at 30fps)
  // 0-60: Opening text
  // 60-300: Cities appear (48 frames apart = 1.6s each)
  // 300-360: "One Shabbat" text
  // 360-450: CTA + Logo

  // Opening text animation
  const openingOpacity = interpolate(frame, [0, 20, 50, 70], [0, 1, 1, 0], {
    extrapolateRight: "clamp",
  });

  const openingScale = interpolate(frame, [0, 20], [0.9, 1], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.ease),
  });

  // "One Shabbat" text animation
  const oneShabbatOpacity = interpolate(
    frame,
    [280, 300, 340, 360],
    [0, 1, 1, 0],
    { extrapolateRight: "clamp" }
  );

  const oneShabbatScale = interpolate(frame, [280, 310], [0.9, 1], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.back(1.2)),
  });

  // CTA animation
  const ctaOpacity = interpolate(frame, [350, 380], [0, 1], {
    extrapolateRight: "clamp",
  });

  const ctaY = interpolate(frame, [350, 380], [40, 0], {
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

  const titleSize = isVertical ? 44 : 34;
  const subtitleSize = isVertical ? 58 : 44;
  const ctaSize = isVertical ? 34 : 26;

  return (
    <AbsoluteFill>
      <WorldMap isVertical={isVertical} />

      {/* Opening text: "This Friday night..." - Paper banner style */}
      <div
        style={{
          position: "absolute",
          top: isVertical ? "12%" : "10%",
          left: 0,
          right: 0,
          textAlign: "center",
          opacity: openingOpacity,
          transform: `scale(${openingScale})`,
          zIndex: 20,
        }}
      >
        {/* Paper banner */}
        <div
          style={{
            display: "inline-block",
            background: "linear-gradient(180deg, #F5E6D3 0%, #EBD9C4 100%)",
            padding: isVertical ? "20px 50px" : "16px 40px",
            borderRadius: 6,
            boxShadow: "3px 4px 12px rgba(10, 20, 40, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.6)",
            border: "1px solid rgba(180, 160, 140, 0.3)",
          }}
        >
          <div
            style={{
              fontSize: titleSize,
              color: "#3D3D3D",
              fontFamily: "'Georgia', serif",
              fontWeight: 500,
              fontStyle: "italic",
              letterSpacing: "1px",
            }}
          >
            This Friday night...
          </div>
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

      {/* "One Shabbat. Everywhere." text - Paper ribbon style */}
      <div
        style={{
          position: "absolute",
          top: isVertical ? "6%" : "6%",
          left: 0,
          right: 0,
          textAlign: "center",
          opacity: oneShabbatOpacity,
          transform: `scale(${oneShabbatScale})`,
          zIndex: 20,
        }}
      >
        {/* Ribbon with folded ends */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            position: "relative",
          }}
        >
          {/* Left ribbon fold */}
          <div
            style={{
              width: 30,
              height: isVertical ? 70 : 56,
              background: "#C4956A",
              borderRadius: "4px 0 0 4px",
              transform: "skewY(-5deg)",
              marginRight: -2,
            }}
          />

          {/* Main banner */}
          <div
            style={{
              background: "linear-gradient(180deg, #E8923A 0%, #D4782A 100%)",
              padding: isVertical ? "18px 40px" : "14px 32px",
              boxShadow: "3px 5px 15px rgba(10, 20, 40, 0.4), inset 0 2px 0 rgba(255, 255, 255, 0.3)",
            }}
          >
            <div
              style={{
                fontSize: subtitleSize,
                fontWeight: 700,
                color: "#FFF8E7",
                fontFamily: "'Georgia', serif",
                letterSpacing: "1px",
                textShadow: "1px 2px 4px rgba(80, 40, 0, 0.4)",
              }}
            >
              One Shabbat. Everywhere.
            </div>
          </div>

          {/* Right ribbon fold */}
          <div
            style={{
              width: 30,
              height: isVertical ? 70 : 56,
              background: "#C4956A",
              borderRadius: "0 4px 4px 0",
              transform: "skewY(5deg)",
              marginLeft: -2,
            }}
          />
        </div>
      </div>

      {/* CTA Section */}
      <div
        style={{
          position: "absolute",
          bottom: isVertical ? "10%" : "8%",
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
        {/* Logo - Paper card style */}
        <div
          style={{
            opacity: logoOpacity,
            transform: `scale(${logoScale})`,
            marginBottom: isVertical ? 24 : 18,
          }}
        >
          <div
            style={{
              background: "linear-gradient(180deg, #F5E6D3 0%, #EBD9C4 100%)",
              padding: isVertical ? "16px 32px" : "12px 24px",
              borderRadius: 8,
              boxShadow: "3px 4px 12px rgba(10, 20, 40, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.6)",
              border: "1px solid rgba(180, 160, 140, 0.3)",
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <span
              style={{
                fontSize: isVertical ? 42 : 32,
                fontWeight: 700,
                color: "#3D3D3D",
                fontFamily: "'Georgia', serif",
              }}
            >
              When's My Shabbos?
            </span>
            <span style={{ fontSize: isVertical ? 38 : 28 }}>🕯️</span>
          </div>
        </div>

        {/* CTA Button - Paper style */}
        <div
          style={{
            background: "linear-gradient(180deg, #E8923A 0%, #D4782A 100%)",
            padding: isVertical ? "16px 44px" : "12px 32px",
            borderRadius: 8,
            boxShadow: "3px 4px 12px rgba(10, 20, 40, 0.35), inset 0 2px 0 rgba(255, 255, 255, 0.3)",
            border: "1px solid rgba(180, 100, 50, 0.3)",
          }}
        >
          <span
            style={{
              fontSize: ctaSize,
              fontWeight: 700,
              color: "#FFF8E7",
              fontFamily: "'Georgia', serif",
              letterSpacing: "0.5px",
              textShadow: "1px 1px 2px rgba(80, 40, 0, 0.3)",
            }}
          >
            Find your times
          </span>
        </div>

        {/* URL */}
        <div
          style={{
            marginTop: isVertical ? 16 : 12,
            fontSize: isVertical ? 22 : 16,
            color: "#F5E6D3",
            fontFamily: "'Georgia', serif",
            letterSpacing: "1px",
            textShadow: "0 2px 8px rgba(0,0,0,0.5)",
          }}
        >
          whensmyshabbos.com
        </div>

        {/* QR Code - Paper card style */}
        <div
          style={{
            position: "absolute",
            right: isVertical ? 40 : 60,
            bottom: isVertical ? 10 : 0,
            padding: 8,
            background: "linear-gradient(180deg, #F5E6D3 0%, #EBD9C4 100%)",
            borderRadius: 8,
            boxShadow: "3px 4px 12px rgba(10, 20, 40, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.6)",
            border: "1px solid rgba(180, 160, 140, 0.3)",
          }}
        >
          <div
            style={{
              width: isVertical ? 90 : 70,
              height: isVertical ? 90 : 70,
              background: "#ffffff",
              borderRadius: 4,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {/* Simple QR pattern placeholder */}
            <svg
              width="80%"
              height="80%"
              viewBox="0 0 21 21"
              fill="#3D3D3D"
            >
              {/* Corner squares */}
              <rect x="0" y="0" width="7" height="7" />
              <rect x="1" y="1" width="5" height="5" fill="#fff" />
              <rect x="2" y="2" width="3" height="3" />

              <rect x="14" y="0" width="7" height="7" />
              <rect x="15" y="1" width="5" height="5" fill="#fff" />
              <rect x="16" y="2" width="3" height="3" />

              <rect x="0" y="14" width="7" height="7" />
              <rect x="1" y="15" width="5" height="5" fill="#fff" />
              <rect x="2" y="16" width="3" height="3" />

              {/* Data pattern */}
              <rect x="8" y="2" width="1" height="1" />
              <rect x="10" y="2" width="1" height="1" />
              <rect x="8" y="4" width="1" height="1" />
              <rect x="9" y="5" width="1" height="1" />
              <rect x="11" y="4" width="1" height="1" />

              <rect x="2" y="8" width="1" height="1" />
              <rect x="4" y="9" width="1" height="1" />
              <rect x="3" y="10" width="1" height="1" />
              <rect x="5" y="8" width="1" height="1" />

              <rect x="8" y="8" width="5" height="5" />
              <rect x="9" y="9" width="3" height="3" fill="#fff" />
              <rect x="10" y="10" width="1" height="1" />

              <rect x="14" y="8" width="1" height="1" />
              <rect x="16" y="9" width="1" height="1" />
              <rect x="18" y="8" width="1" height="1" />
              <rect x="15" y="11" width="1" height="1" />

              <rect x="8" y="14" width="1" height="1" />
              <rect x="10" y="15" width="1" height="1" />
              <rect x="9" y="17" width="1" height="1" />
              <rect x="11" y="16" width="1" height="1" />

              <rect x="14" y="14" width="1" height="1" />
              <rect x="16" y="15" width="1" height="1" />
              <rect x="18" y="16" width="1" height="1" />
              <rect x="15" y="18" width="1" height="1" />
              <rect x="17" y="17" width="1" height="1" />
            </svg>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
