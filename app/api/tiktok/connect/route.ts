import { NextResponse } from "next/server"
import { getTikTokAuthUrl } from "@/lib/tiktok-shop"

export async function GET() {
  try {
    const authUrl = getTikTokAuthUrl()
    return NextResponse.redirect(new URL(authUrl))
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to connect TikTok Shop"

    return NextResponse.json({ error: message }, { status: 500 })
  }
}