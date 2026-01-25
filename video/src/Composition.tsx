import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

export const MyComposition: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const opacity = interpolate(
    frame,
    [0, 30, durationInFrames - 30, durationInFrames],
    [0, 1, 1, 0]
  );

  const scale = interpolate(frame, [0, 30], [0.8, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#1a1a2e",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          opacity,
          transform: `scale(${scale})`,
          textAlign: "center",
        }}
      >
        <h1
          style={{
            fontSize: 80,
            fontWeight: "bold",
            color: "#f8b400",
            marginBottom: 20,
            fontFamily: "system-ui, sans-serif",
          }}
        >
          When's My Shabbos
        </h1>
        <p
          style={{
            fontSize: 36,
            color: "#ffffff",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          Find your Shabbat candle lighting times
        </p>
      </div>
    </AbsoluteFill>
  );
};
