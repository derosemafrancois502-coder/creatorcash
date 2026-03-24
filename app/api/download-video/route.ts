import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const videoUrl =
      typeof body?.videoUrl === "string" ? body.videoUrl.trim() : ""

    const filename =
      typeof body?.filename === "string" && body.filename.trim()
        ? body.filename.trim()
        : "creatorgoat-video.mp4"

    if (!videoUrl) {
      return NextResponse.json(
        { error: "videoUrl required" },
        { status: 400 }
      )
    }

    const response = await fetch(videoUrl, {
      method: "GET",
      cache: "no-store",
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch video. Status: ${response.status}` },
        { status: response.status }
      )
    }

    const buffer = await response.arrayBuffer()
    const contentType = response.headers.get("content-type") || "video/mp4"

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: "Download failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}