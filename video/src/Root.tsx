import { Composition } from "remotion";
import { MyComposition } from "./Composition";
import { ShabbatWorldwide } from "./compositions/ShabbatWorldwide";
import { BikeVsTraffic } from "./compositions/BikeVsTraffic";
import { BikeVideoTest } from "./compositions/BikeVideoTest";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* Original composition */}
      <Composition
        id="MyComposition"
        component={MyComposition}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
      />

      {/* Shabbat Worldwide - Horizontal (16:9) for YouTube/Web */}
      <Composition
        id="ShabbatWorldwide-Horizontal"
        component={ShabbatWorldwide}
        durationInFrames={450} // 15 seconds at 30fps
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          isVertical: false,
        }}
      />

      {/* Shabbat Worldwide - Vertical (9:16) for TikTok/Reels/Shorts */}
      <Composition
        id="ShabbatWorldwide-Vertical"
        component={ShabbatWorldwide}
        durationInFrames={450} // 15 seconds at 30fps
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          isVertical: true,
        }}
      />

      {/* Bike vs Traffic - Horizontal (16:9) for YouTube/Web */}
      <Composition
        id="BikeVsTraffic-Horizontal"
        component={BikeVsTraffic}
        durationInFrames={750} // 25 seconds at 30fps
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          isVertical: false,
        }}
      />

      {/* Bike vs Traffic - Vertical (9:16) for TikTok/Reels/Shorts */}
      <Composition
        id="BikeVsTraffic-Vertical"
        component={BikeVsTraffic}
        durationInFrames={750} // 25 seconds at 30fps
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          isVertical: true,
        }}
      />

      {/* TEST: Simple bike video */}
      <Composition
        id="BikeVideoTest"
        component={BikeVideoTest}
        durationInFrames={300}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
