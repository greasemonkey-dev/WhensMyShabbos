import React from "react";
import {
  interpolate,
  useCurrentFrame,
  Easing,
} from "remotion";

interface CityPinProps {
  cityName: string;
  time: string;
  x: number;
  y: number;
  appearFrame: number;
  isVertical?: boolean;
}

// Paper candle flame SVG path
const flamePath = "M 0,-18 Q 6,-12 6,-6 Q 6,2 3,8 Q 1,12 0,14 Q -1,12 -3,8 Q -6,2 -6,-6 Q -6,-12 0,-18 Z";
const innerFlamePath = "M 0,-12 Q 3,-8 3,-4 Q 3,1 1.5,5 Q 0.5,8 0,9 Q -0.5,8 -1.5,5 Q -3,1 -3,-4 Q -3,-8 0,-12 Z";

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

  if (relativeFrame < 0) return null;

  // Paper unfold animation
  const unfoldScale = interpolate(relativeFrame, [0, 15], [0, 1], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.back(1.3)),
  });

  const unfoldRotation = interpolate(relativeFrame, [0, 15], [-15, 0], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.ease),
  });

  const opacity = interpolate(relativeFrame, [0, 8], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Gentle flame flicker (paper-like subtle movement)
  const flickerX = interpolate(
    (relativeFrame * 2) % 40,
    [0, 10, 20, 30, 40],
    [0, 1, -0.5, 0.8, 0]
  );

  const flickerScale = interpolate(
    (relativeFrame * 2) % 60,
    [0, 15, 30, 45, 60],
    [1, 1.05, 0.98, 1.03, 1]
  );

  // Text slide in
  const textOpacity = interpolate(relativeFrame, [8, 20], [0, 1], {
    extrapolateRight: "clamp",
  });

  const textY = interpolate(relativeFrame, [8, 20], [15, 0], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.ease),
  });

  const fontSize = isVertical ? 26 : 20;
  const flameSize = isVertical ? 1.4 : 1;

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
        opacity,
      }}
    >
      {/* Paper candle with flame */}
      <svg
        width={60 * flameSize}
        height={80 * flameSize}
        viewBox="-20 -25 40 55"
        style={{
          transform: `scale(${unfoldScale}) rotate(${unfoldRotation}deg)`,
          filter: "drop-shadow(3px 4px 6px rgba(0, 0, 0, 0.35))",
        }}
      >
        {/* Candle base - paper rectangle */}
        <rect
          x="-6"
          y="8"
          width="12"
          height="20"
          rx="1"
          fill="#F5E6D3"
          stroke="rgba(180, 160, 140, 0.5)"
          strokeWidth="0.5"
        />
        {/* Candle highlight */}
        <rect
          x="-4"
          y="10"
          width="3"
          height="16"
          rx="0.5"
          fill="rgba(255, 255, 255, 0.4)"
        />

        {/* Wick */}
        <line
          x1="0"
          y1="8"
          x2="0"
          y2="2"
          stroke="#4A4A4A"
          strokeWidth="1.5"
          strokeLinecap="round"
        />

        {/* Flame - outer (orange paper) */}
        <g transform={`translate(${flickerX}, 0) scale(${flickerScale})`}>
          {/* Flame shadow */}
          <path
            d={flamePath}
            fill="rgba(10, 20, 40, 0.2)"
            transform="translate(1, 2) scale(0.9)"
          />
          {/* Outer flame - warm orange paper */}
          <path
            d={flamePath}
            fill="#E8923A"
            transform="translate(0, -2)"
          />
          {/* Middle flame - yellow paper */}
          <path
            d={innerFlamePath}
            fill="#F5C846"
            transform="translate(0, -2)"
          />
          {/* Inner flame - light cream paper */}
          <path
            d="M 0,-8 Q 1.5,-5 1.5,-2 Q 1.5,1 0,4 Q -1.5,1 -1.5,-2 Q -1.5,-5 0,-8 Z"
            fill="#FFF8E7"
            transform="translate(0, -2)"
          />
        </g>

        {/* Paper fold line on candle */}
        <line
          x1="0"
          y1="10"
          x2="0"
          y2="26"
          stroke="rgba(180, 160, 140, 0.3)"
          strokeWidth="0.5"
          strokeDasharray="2,2"
        />
      </svg>

      {/* City label - paper tag style */}
      <div
        style={{
          marginTop: 8,
          opacity: textOpacity,
          transform: `translateY(${textY}px)`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {/* Paper tag background */}
        <div
          style={{
            background: "linear-gradient(180deg, #F5E6D3 0%, #EBD9C4 100%)",
            padding: isVertical ? "10px 18px" : "8px 14px",
            borderRadius: 4,
            boxShadow: "3px 4px 8px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.6)",
            border: "1px solid rgba(180, 160, 140, 0.3)",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: fontSize,
              fontWeight: 600,
              color: "#3D3D3D",
              fontFamily: "'Georgia', serif",
              letterSpacing: "0.5px",
              marginBottom: 2,
            }}
          >
            {cityName}
          </div>
          <div
            style={{
              fontSize: fontSize + 6,
              fontWeight: 700,
              color: "#B8602A",
              fontFamily: "'Georgia', serif",
            }}
          >
            {time}
          </div>
        </div>

        {/* Paper tag string/hole detail */}
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: "#d0d0d0",
            marginTop: -4,
            border: "2px solid #EBD9C4",
            boxShadow: "inset 0 1px 2px rgba(0,0,0,0.4)",
          }}
        />
      </div>
    </div>
  );
};
