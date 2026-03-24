import React from "react"
import { Composition } from "remotion"
import { LuxuryPreview } from "./LuxuryPreview"

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="LuxuryPreview"
        component={LuxuryPreview}
        durationInFrames={300}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          caption: "",
          scenes: [],
          sceneVideos: [],
          audioUrl: "",
          mode: "luxury-video",
        }}
      />
    </>
  )
}