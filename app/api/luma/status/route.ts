import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  try {
    const apiKey = process.env.LUMA_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: "Missing LUMA_API_KEY in .env.local" },
        { status: 500 }
      )
    }

    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")?.trim()

    if (!id) {
      return NextResponse.json(
        { error: "Missing generation id." },
        { status: 400 }
      )
    }

    const res = await fetch(
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

    const data = await res.json()

    if (!res.ok) {
      return NextResponse.json(
        { error: data?.error || "Failed to fetch generation status." },
        { status: res.status }
      )
    }

    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}