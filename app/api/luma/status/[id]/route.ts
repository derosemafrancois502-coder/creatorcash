import { NextResponse } from "next/server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params

    if (!id?.trim()) {
      return NextResponse.json(
        { error: "Generation id is required." },
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
            "Failed to retrieve Luma generation.",
          details: data,
        },
        { status: response.status }
      )
    }

    const state =
      data?.state ||
      data?.status ||
      data?.generation_state ||
      data?.generation?.state ||
      data?.generation?.status ||
      "processing"

    const videoUrl =
      data?.assets?.video ||
      data?.assets?.video_url ||
      data?.video?.url ||
      data?.video_url ||
      data?.url ||
      data?.generation?.assets?.video ||
      data?.generation?.assets?.video_url ||
      data?.generation?.video?.url ||
      data?.generation?.video_url ||
      data?.generation?.url ||
      ""

    const failureReason =
      data?.failure_reason ||
      data?.failureReason ||
      data?.error ||
      data?.generation?.failure_reason ||
      data?.generation?.failureReason ||
      ""

    return NextResponse.json({
      success: true,
      id,
      state,
      status: state,
      completed:
        state === "completed" ||
        state === "succeeded" ||
        state === "ready",
      failed:
        state === "failed" ||
        state === "error" ||
        state === "canceled",
      videoUrl,
      failureReason,
      generation: data,
    })
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Luma status route failed.",
      },
      { status: 500 }
    )
  }
}