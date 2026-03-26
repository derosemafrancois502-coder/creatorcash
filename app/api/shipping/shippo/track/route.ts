import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      return NextResponse.json(
        { error: "Missing Supabase environment variables." },
        { status: 500 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

    const trackingNumber =
      request.nextUrl.searchParams.get("trackingNumber")

    if (!trackingNumber) {
      return NextResponse.json(
        { error: "trackingNumber is required." },
        { status: 400 }
      )
    }

    const { data: shipment, error } = await supabase
      .from("shipments")
      .select("*")
      .eq("tracking_number", trackingNumber)
      .maybeSingle()

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    if (!shipment) {
      return NextResponse.json(
        { error: "Shipment not found." },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      shipment,
    })
  } catch (error) {
    console.error("Tracking GET error:", error)
    return NextResponse.json(
      { error: "Could not fetch tracking." },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const shippoToken = process.env.SHIPPO_API_TOKEN

    if (!shippoToken) {
      return NextResponse.json(
        { error: "Missing SHIPPO_API_TOKEN." },
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
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        {
          error:
            data?.detail ||
            data?.error ||
            "Failed to fetch tracking from Shippo.",
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      track: data,
    })
  } catch (error) {
    console.error("Tracking POST error:", error)
    return NextResponse.json(
      { error: "Tracking failed." },
      { status: 500 }
    )
  }
}