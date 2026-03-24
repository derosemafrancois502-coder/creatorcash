import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const name = String(body?.name || "This product")
    const whyHot = String(body?.whyHot || "Strong demand and strong content potential.")
    const angle = String(
      body?.contentAngle || "Create clean, premium short-form content around it."
    )

    const caption = `${name} is one of those products that can win when the positioning is right. ${whyHot} ${angle}`

    return NextResponse.json({ caption }, { status: 200 })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to generate caption"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}