import React from "react";
import {
  AbsoluteFill,
  Video,
  Audio,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
  Easing,
  staticFile,
  Sequence,
} from "remotion";

interface BikeVsTrafficProps {
  isVertical?: boolean;
}

interface BikeVideoWithFadeProps {
  src: string;
  from: number;
  durationInFrames: number;
  fadeInDuration: number;
  fadeOutDuration: number;
}

const BikeVideoWithFade: React.FC<BikeVideoWithFadeProps> = ({
  src,
  from,
  durationInFrames,
  fadeInDuration,
  fadeOutDuration,
}) => {
  return (
    <Sequence from={from} durationInFrames={durationInFrames}>
      <BikeVideoContent
        src={src}
        fadeInDuration={fadeInDuration}
        fadeOutDuration={fadeOutDuration}
        totalDuration={durationInFrames}
      />
    </Sequence>
  );
};

const BensonBooneAudio: React.FC = () => {
  const frame = useCurrentFrame();

  // Fade in music over 30 frames (1 second)
  const volume = interpolate(frame, [0, 30], [0, 0.6], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <Audio
      src={staticFile("bike-videos/beautiful-things.mp3")}
      startFrom={420} // Start at 14 seconds into the song (upbeat part)
      volume={volume}
    />
  );
};

const BikeVideoContent: React.FC<{
  src: string;
  fadeInDuration: number;
  fadeOutDuration: number;
  totalDuration: number;
}> = ({ src, fadeInDuration, fadeOutDuration, totalDuration }) => {
  const frame = useCurrentFrame();

  let opacity = 1;

  // Fade in
  if (frame < fadeInDuration) {
    opacity = interpolate(frame, [0, fadeInDuration], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
  }
  // Fade out (if applicable)
  else if (fadeOutDuration > 0 && frame > totalDuration - fadeOutDuration) {
    opacity = interpolate(
      frame,
      [totalDuration - fadeOutDuration, totalDuration],
      [1, 0],
      {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      }
    );
  }

  return (
    <AbsoluteFill style={{ opacity }}>
      <Video
        src={staticFile(src)}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
        volume={0}
      />
    </AbsoluteFill>
  );
};

export const BikeVsTraffic: React.FC<BikeVsTrafficProps> = ({
  isVertical = false,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // New structure: Traffic (0-150), Transition (150-180), Bike videos (180-750)
  const trafficDuration = 150; // 5 seconds of traffic
  const transitionStart = 150;
  const transitionEnd = 180;
  const bikesStart = 180;

  // Opening text on traffic
  const openingTextOpacity = interpolate(frame, [10, 30, 120, 140], [0, 1, 1, 0], {
    extrapolateRight: "clamp",
  });

  // "STUCK" text animation
  const stuckOpacity = interpolate(frame, [60, 75], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Transition "break away" effect
  const breakScale = interpolate(
    frame,
    [transitionStart, transitionStart + 10, transitionStart + 20],
    [1, 1.5, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.in(Easing.ease),
    }
  );

  // Bike videos comic elements
  const zoomOpacity = interpolate(frame, [200, 220], [0, 1], {
    extrapolateRight: "clamp",
  });
  const freshAirOpacity = interpolate(frame, [450, 470], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Final punchline
  const punchlineOpacity = interpolate(frame, [680, 700], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {/* PHASE 1: Traffic scene (0-150 frames = 5 seconds) */}
      {frame < transitionEnd && (
        <AbsoluteFill>
          {/* Car animation with low volume */}
          <Video
            src={staticFile("bike-videos/car animation.mp4")}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              transform: frame >= transitionStart ? `scale(${breakScale})` : "scale(1)",
              opacity: frame >= transitionStart ? breakScale : 1,
            }}
            volume={0.15}
            loop
          />

          {/* Opening text "Your commute:" */}
          {frame < trafficDuration && (
            <div
              style={{
                position: "absolute",
                top: "20%",
                left: "50%",
                transform: "translate(-50%, 0)",
                opacity: openingTextOpacity,
                zIndex: 10,
              }}
            >
              <div
                style={{
                  background: "rgba(255, 255, 255, 0.95)",
                  padding: isVertical ? "15px 30px" : "20px 40px",
                  borderRadius: 10,
                  border: "4px solid #000",
                  boxShadow: "6px 6px 0px #000",
                }}
              >
                <div
                  style={{
                    fontSize: isVertical ? 36 : 44,
                    fontWeight: 900,
                    color: "#000",
                    fontFamily: "Impact, sans-serif",
                    textAlign: "center",
                  }}
                >
                  YOUR COMMUTE:
                </div>
              </div>
            </div>
          )}

          {/* "STUCK!" text */}
          {frame > 60 && frame < trafficDuration && (
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                opacity: stuckOpacity,
                zIndex: 10,
              }}
            >
              <div
                style={{
                  fontSize: isVertical ? 70 : 90,
                  fontWeight: 900,
                  color: "#FF0000",
                  fontFamily: "Impact, sans-serif",
                  textShadow:
                    "4px 4px 0 #000, -4px -4px 0 #000, 4px -4px 0 #000, -4px 4px 0 #000",
                  textAlign: "center",
                }}
              >
                STUCK! 😤
              </div>
            </div>
          )}

          {/* Transition text "But wait..." */}
          {frame >= transitionStart && frame < transitionEnd && (
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                zIndex: 20,
              }}
            >
              <div
                style={{
                  fontSize: isVertical ? 50 : 64,
                  fontWeight: 900,
                  color: "#FFD700",
                  fontFamily: "Impact, sans-serif",
                  textShadow:
                    "4px 4px 0 #000, -4px -4px 0 #000, 4px -4px 0 #000, -4px 4px 0 #000",
                  textAlign: "center",
                }}
              >
                BUT WAIT...
              </div>
            </div>
          )}
        </AbsoluteFill>
      )}

      {/* Music: Benson Boone - Beautiful Things (starts at transition) */}
      <Sequence from={transitionStart} durationInFrames={600}>
        <BensonBooneAudio />
      </Sequence>

      {/* PHASE 2: Bike videos (180-750 frames) - Use Sequence at top level */}

      {/* Bike video 1: starts at frame 180, duration 150 frames */}
      <Sequence from={bikesStart} durationInFrames={150}>
        <BikeVideoContent
          src="bike-videos/WhatsApp Video 2026-01-26 at 09.29.35.mp4"
          fadeInDuration={10}
          fadeOutDuration={15}
          totalDuration={150}
        />
      </Sequence>

      {/* Bike video 2: starts at frame 315 (180+135), duration 150 frames */}
      <Sequence from={bikesStart + 135} durationInFrames={150}>
        <BikeVideoContent
          src="bike-videos/WhatsApp Video 2026-01-26 at 09.29.40.mp4"
          fadeInDuration={15}
          fadeOutDuration={15}
          totalDuration={150}
        />
      </Sequence>

      {/* Bike video 3: starts at frame 450 (180+270), duration 150 frames */}
      <Sequence from={bikesStart + 270} durationInFrames={150}>
        <BikeVideoContent
          src="bike-videos/WhatsApp Video 2026-01-26 at 09.29.49.mp4"
          fadeInDuration={15}
          fadeOutDuration={15}
          totalDuration={150}
        />
      </Sequence>

      {/* Bike video 4: starts at frame 585 (180+405), duration 165 frames */}
      <Sequence from={bikesStart + 405} durationInFrames={165}>
        <BikeVideoContent
          src="bike-videos/WhatsApp Video 2026-01-26 at 09.29.49 (1).mp4"
          fadeInDuration={15}
          fadeOutDuration={0}
          totalDuration={165}
        />
      </Sequence>

      {/* Visual effects overlays - only show during bike videos */}
      {frame >= bikesStart && (
        <AbsoluteFill style={{ pointerEvents: "none" }}>

          {/* Unified visual effects overlay - Color grading & vignette */}
          <div
            style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.3) 100%)",
              mixBlendMode: "multiply",
              pointerEvents: "none",
            }}
          />

          {/* Color overlay for warmth/consistency */}
          <div
            style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              background: "linear-gradient(180deg, rgba(255,200,100,0.08) 0%, rgba(100,200,255,0.05) 100%)",
              mixBlendMode: "overlay",
              pointerEvents: "none",
            }}
          />

          {/* Subtle motion lines for speed effect */}
          <div
            style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              background: `repeating-linear-gradient(
                90deg,
                transparent,
                transparent 100px,
                rgba(255,255,255,0.02) 100px,
                rgba(255,255,255,0.02) 101px
              )`,
              pointerEvents: "none",
            }}
          />

          {/* "ZOOM!" text on first bike video */}
          {frame > 200 && frame < bikesStart + 180 && (
            <div
              style={{
                position: "absolute",
                top: "30%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                opacity: zoomOpacity,
                zIndex: 10,
              }}
            >
              <div
                style={{
                  fontSize: isVertical ? 70 : 90,
                  fontWeight: 900,
                  color: "#00FF00",
                  fontFamily: "Impact, sans-serif",
                  textShadow:
                    "4px 4px 0 #000, -4px -4px 0 #000, 4px -4px 0 #000, -4px 4px 0 #000",
                }}
              >
                ZOOM! ⚡
              </div>
            </div>
          )}

          {/* "FRESH AIR!" text */}
          {frame > 450 && frame < 650 && (
            <div
              style={{
                position: "absolute",
                bottom: "25%",
                left: "50%",
                transform: "translate(-50%, 0)",
                opacity: freshAirOpacity,
                zIndex: 10,
              }}
            >
              <div
                style={{
                  fontSize: isVertical ? 55 : 70,
                  fontWeight: 900,
                  color: "#00FFFF",
                  fontFamily: "Impact, sans-serif",
                  textShadow:
                    "4px 4px 0 #000, -4px -4px 0 #000, 4px -4px 0 #000, -4px 4px 0 #000",
                }}
              >
                FRESH AIR! 🌬️
              </div>
            </div>
          )}
        </AbsoluteFill>
      )}

      {/* Final punchline */}
      {frame > 680 && (
        <div
          style={{
            position: "absolute",
            bottom: "15%",
            left: "50%",
            transform: "translate(-50%, 0)",
            opacity: punchlineOpacity,
            zIndex: 20,
          }}
        >
          <div
            style={{
              background: "rgba(255, 215, 0, 0.95)",
              padding: isVertical ? "18px 36px" : "24px 48px",
              borderRadius: 12,
              border: "5px solid #000",
              boxShadow: "8px 8px 0px #000",
            }}
          >
            <div
              style={{
                fontSize: isVertical ? 38 : 48,
                fontWeight: 900,
                color: "#000",
                fontFamily: "Impact, sans-serif",
                textAlign: "center",
              }}
            >
              CHOOSE WISELY 😎🚴
            </div>
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};
