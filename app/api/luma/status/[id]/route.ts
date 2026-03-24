import { NextResponse } from "next/server"

type LumaGeneration = {
  id?: string
  state?: string
  status?: string
  failure_reason?: string
  assets?: {
    video?: string
    video_url?: string
    image?: string
  }
  video?: {
    url?: string
  }
  video_url?: string
  url?: string
}

function getVideoUrl(generation: LumaGeneration) {
  return (
    generation?.assets?.video ||
    generation?.assets?.video_url ||
    generation?.video?.url ||
    generation?.video_url ||
    generation?.url ||
    ""
  )
}

function getState(generation: LumaGeneration) {
  return generation?.state || generation?.status || "unknown"
}

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params

    if (!id?.trim()) {
      return NextResponse.json(
        { error: "Missing generation id." },
        { status: 400 }
      )
    }

    const apiKey = process.env.LUMA_API_KEY || process.env.LUMAAI_API_KEY

    if (!apiKey) {
      return NextResponse.json(
        { error: "Missing LUMA_API_KEY or LUMAAI_API_KEY in .env.local" },
        { status: 500 }
      )
    }

    const response = await fetch(
      `https://api.lumalabs.ai/dream-machine/v1/generations/${id}`,
      {
        method: "GET",
        headers: {
          accept: "application/json",
          authorization: `Bearer ${apiKey}`,
        },
        cache: "no-store",
      }
    )

    const data = await response.json().catch(() => null)

    if (!response.ok) {
      return NextResponse.json(
        {
          error:
            data?.message ||
            data?.error ||
            "Failed to fetch Luma generation status.",
          details: data,
        },
        { status: response.status }
      )
    }

    const generation: LumaGeneration = data || {}
    const state = getState(generation)
    const videoUrl = getVideoUrl(generation)

    return NextResponse.json({
      success: true,
      generation,
      generationId: generation?.id || id,
      state,
      videoUrl,
      completed:
        state === "completed" ||
        state === "ready" ||
        state === "succeeded",
      failed: state === "failed" || state === "error",
      failureReason: generation?.failure_reason || "",
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: "Something went wrong while checking Luma status.",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}