import { NextResponse } from "next/server"

type PollItem = {
  index?: number
  id: string
  title?: string
}

type LumaGeneration = {
  id?: string
  state?: string
  status?: string
  failure_reason?: string
  assets?: {
    video?: string
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
    generation?.video?.url ||
    generation?.video_url ||
    generation?.url ||
    ""
  )
}

function getState(generation: LumaGeneration) {
  return generation?.state || generation?.status || "unknown"
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const clips = Array.isArray(body?.clips) ? body.clips : []

    if (!clips.length) {
      return NextResponse.json(
        { error: "clips array is required." },
        { status: 400 }
      )
    }

    const apiKey = process.env.LUMA_API_KEY

    if (!apiKey) {
      return NextResponse.json(
        { error: "Missing LUMA_API_KEY in .env.local" },
        { status: 500 }
      )
    }

    const checked = await Promise.all(
      clips.map(async (clip: PollItem) => {
        const id = typeof clip?.id === "string" ? clip.id.trim() : ""

        if (!id) {
          return {
            index: clip?.index ?? null,
            title: clip?.title ?? "",
            id: "",
            state: "invalid",
            videoUrl: "",
            error: "Missing generation id.",
          }
        }

        try {
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
            return {
              index: clip?.index ?? null,
              title: clip?.title ?? "",
              id,
              state: "error",
              videoUrl: "",
              error:
                data?.message ||
                data?.error ||
                `Failed to fetch generation ${id}.`,
            }
          }

          const generation: LumaGeneration = data || {}
          const state = getState(generation)
          const videoUrl = getVideoUrl(generation)

          return {
            index: clip?.index ?? null,
            title: clip?.title ?? "",
            id,
            state,
            videoUrl,
            failureReason: generation?.failure_reason || "",
            completed:
              state === "completed" ||
              state === "ready" ||
              state === "succeeded",
            failed: state === "failed" || state === "error",
          }
        } catch (error) {
          return {
            index: clip?.index ?? null,
            title: clip?.title ?? "",
            id,
            state: "error",
            videoUrl: "",
            error: error instanceof Error ? error.message : "Unknown error",
          }
        }
      })
    )

    const total = checked.length
    const completed = checked.filter(
      (item) =>
        item.state === "completed" ||
        item.state === "ready" ||
        item.state === "succeeded"
    ).length
    const failed = checked.filter(
      (item) => item.state === "failed" || item.state === "error"
    ).length
    const processing = total - completed - failed
    const allCompleted = total > 0 && completed === total
    const videoUrls = checked
      .map((item) => item.videoUrl)
      .filter((url) => typeof url === "string" && url.trim().length > 0)

    return NextResponse.json({
      success: true,
      summary: {
        total,
        completed,
        failed,
        processing,
        allCompleted,
      },
      clips: checked,
      videoUrls,
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to poll Luma generations.",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}