import { bundle } from "@remotion/bundler"
import { renderMedia, selectComposition } from "@remotion/renderer"
import path from "path"
import fs from "fs"
import os from "os"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { caption, scenes, sceneVideos, mode } = body

    const entry = path.join(process.cwd(), "remotion", "index.ts")

    const bundleLocation = await bundle({
      entryPoint: entry,
      webpackOverride: (config) => config,
    })

    const inputProps = {
      caption: caption || "",
      scenes: Array.isArray(scenes) ? scenes : [],
      sceneVideos: Array.isArray(sceneVideos) ? sceneVideos : [],
      audioUrl: "",
      mode: mode || "luxury-video",
    }

    const composition = await selectComposition({
      serveUrl: bundleLocation,
      id: "LuxuryPreview",
      inputProps,
    })

    const outputLocation = path.join(
      os.tmpdir(),
      `creatorgoat-video-${Date.now()}.mp4`
    )

    await renderMedia({
      composition,
      serveUrl: bundleLocation,
      codec: "h264",
      outputLocation,
      inputProps,
    })

    const file = fs.readFileSync(outputLocation)

    try {
      fs.unlinkSync(outputLocation)
    } catch {
      // ignore cleanup error
    }

    return new Response(file, {
      headers: {
        "Content-Type": "video/mp4",
        "Content-Disposition": 'attachment; filename="creatorgoat-video.mp4"',
      },
    })
  } catch (error: any) {
    console.error("Render video error:", error)

    return Response.json(
      { error: error?.message || "Render failed" },
      { status: 500 }
    )
  }
}