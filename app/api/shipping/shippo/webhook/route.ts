import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

function mapShippoStatus(value?: string | null) {
  const status = (value || "").toLowerCase()

  if (
    status.includes("pre_transit") ||
    status.includes("unknown") ||
    status.includes("pending")
  ) {
    return "label_created"
  }

  if (
    status.includes("transit") &&
    !status.includes("out_for_delivery")
  ) {
    return "in_transit"
  }

  if (status.includes("out_for_delivery")) {
    return "out_for_delivery"
  }

  if (status.includes("delivered")) {
    return "delivered"
  }

  if (
    status.includes("failure") ||
    status.includes("exception") ||
    status.includes("error")
  ) {
    return "exception"
  }

  if (status.includes("return")) {
    return "returned"
  }

  return "shipped"
}

export async function POST(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get("token")
    const expectedToken = process.env.SHIPPO_WEBHOOK_TOKEN

    if (!expectedToken || token !== expectedToken) {
      return NextResponse.json({ error: "Unauthorized webhook." }, { status: 401 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      return NextResponse.json(
        { error: "Missing Supabase environment variables." },
        { status: 500 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

    const payload = await request.json()

    const eventType = payload?.event_type || payload?.event || ""
    if (eventType !== "track_updated") {
      return NextResponse.json({ received: true })
    }

    const trackingNumber =
      payload?.data?.tracking_number ||
      payload?.tracking_number ||
      null

    const rawStatus =
      payload?.data?.tracking_status?.status ||
      payload?.tracking_status?.status ||
      payload?.data?.tracking_status?.status_details ||
      null

    if (!trackingNumber) {
      return NextResponse.json({ received: true })
    }

    const nextStatus = mapShippoStatus(rawStatus)

    const updatePayload: {
      shipment_status: string
      delivered_at?: string
    } = {
      shipment_status: nextStatus,
    }

    if (nextStatus === "delivered") {
      updatePayload.delivered_at = new Date().toISOString()
    }

    const { error } = await supabase
      .from("shipments")
      .update(updatePayload)
      .eq("tracking_number", trackingNumber)

    if (error) {
      console.error("Shippo webhook DB update error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Shippo webhook error:", error)
    return NextResponse.json({ error: "Webhook failed." }, { status: 500 })
  }
}