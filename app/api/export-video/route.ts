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
        { error: "videoUrl is required." },
        { status: 400 }
      )
    }

    const upstream = await fetch(videoUrl, {
      method: "GET",
      cache: "no-store",
    })

    if (!upstream.ok) {
      return NextResponse.json(
        { error: `Failed to fetch remote video. Status: ${upstream.status}` },
        { status: upstream.status }
      )
    }

    const contentType = upstream.headers.get("content-type") || "video/mp4"
    const arrayBuffer = await upstream.arrayBuffer()

    return new NextResponse(arrayBuffer, {
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
        error: "Failed to export video.",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}