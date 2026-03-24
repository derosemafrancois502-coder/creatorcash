"use client"

import { AbsoluteFill, Audio, Sequence, Video, staticFile, useCurrentFrame, interpolate } from "remotion"

type LuxuryPreviewProps = {
  caption?: string
  audioUrl?: string
  backgroundMusicUrl?: string
  scenes?: string[]
  sceneVideos?: string[]
  lumaVideoUrl?: string
  mode?: "luxury-video" | "product-video" | "cinematic-video"
}

export const LuxuryPreview = ({
  caption = "Luxury preview",
  audioUrl = "",
  backgroundMusicUrl = "",
  scenes = [],
  sceneVideos = [],
  lumaVideoUrl = "",
  mode = "luxury-video",
}: LuxuryPreviewProps) => {
  const frame = useCurrentFrame()

  const opacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateRight: "clamp",
  })

  const scale = interpolate(frame, [0, 60], [1.08, 1], {
    extrapolateRight: "clamp",
  })

  const defaultLuxuryClips = [
    staticFile("hero-rolls.mp4"),
    staticFile("hero-lambo.mp4"),
    staticFile("hero-mercedes.mp4"),
    staticFile("hero-yacht.mp4"),
  ]

  const videosToUse =
    lumaVideoUrl && lumaVideoUrl.trim()
      ? [lumaVideoUrl]
      : sceneVideos.length > 0
        ? sceneVideos
        : defaultLuxuryClips

  return (
    <AbsoluteFill style={{ backgroundColor: "black", fontFamily: "sans-serif" }}>
      {videosToUse.map((src, index) => (
        <Sequence
          key={`${src}-${index}`}
          from={index * 180}
          durationInFrames={180}
        >
          <AbsoluteFill>
            <Video
              src={src}
              muted
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                transform: `scale(${scale})`,
              }}
            />
            <AbsoluteFill
              style={{
                background:
                  mode === "product-video"
                    ? "linear-gradient(to top, rgba(0,0,0,0.72), rgba(0,0,0,0.18), rgba(0,0,0,0.08))"
                    : "linear-gradient(to top, rgba(0,0,0,0.78), rgba(0,0,0,0.22), rgba(0,0,0,0.12))",
              }}
            />
          </AbsoluteFill>
        </Sequence>
      ))}

      {backgroundMusicUrl ? <Audio src={backgroundMusicUrl} volume={0.2} /> : null}
      {audioUrl ? <Audio src={audioUrl} volume={1} /> : null}

      <AbsoluteFill
        style={{
          justifyContent: "flex-end",
          padding: "0 70px 180px 70px",
        }}
      >
        <div
          style={{
            alignSelf: "center",
            maxWidth: "86%",
            background: "rgba(0,0,0,0.42)",
            border: "1px solid rgba(255,215,0,0.22)",
            borderRadius: 28,
            padding: "24px 28px",
            backdropFilter: "blur(10px)",
            opacity,
            boxShadow: "0 20px 60px rgba(0,0,0,0.35)",
          }}
        >
          <div
            style={{
              fontSize: 20,
              lineHeight: 1.35,
              fontWeight: 800,
              textAlign: "center",
              color: "#facc15",
              textShadow: "0 4px 20px rgba(0,0,0,0.45)",
            }}
          >
            {caption}
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  )
}