import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const shippoToken = process.env.SHIPPO_API_TOKEN
    const appUrl = process.env.NEXT_PUBLIC_APP_URL
    const webhookToken = process.env.SHIPPO_WEBHOOK_TOKEN

    if (!shippoToken || !appUrl || !webhookToken) {
      return NextResponse.json(
        { error: "Missing Shippo environment variables." },
        { status: 500 }
      )
    }

    const body = await request.json()
    const carrier = body?.carrier?.trim()
    const trackingNumber = body?.trackingNumber?.trim()

    if (!carrier || !trackingNumber) {
      return NextResponse.json(
        { error: "carrier and trackingNumber are required." },
        { status: 400 }
      )
    }

    const response = await fetch("https://api.goshippo.com/tracks/", {
      method: "POST",
      headers: {
        Authorization: `ShippoToken ${shippoToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        carrier,
        tracking_number: trackingNumber,
        metadata: "CreatorGoat shipment tracking",
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        { error: data?.detail || data?.error || "Failed to register tracking." },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      track: data,
      webhookUrl: `${appUrl}/api/shipping/shippo/webhook?token=${webhookToken}`,
    })
  } catch (error) {
    console.error("Register tracking error:", error)
    return NextResponse.json(
      { error: "Could not register Shippo tracking." },
      { status: 500 }
    )
  }
}