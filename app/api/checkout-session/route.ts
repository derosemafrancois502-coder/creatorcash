import { NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const sessionId = searchParams.get("session_id")

    if (!sessionId) {
      return NextResponse.json({ error: "Missing session_id" }, { status: 400 })
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId)

    return NextResponse.json({
      customer_email: session.customer_details?.email || null,
      amount_total: session.amount_total || null,
      currency: session.currency || null,
      payment_status: session.payment_status || null,
    })
  } catch (error) {
    console.error("Session fetch error:", error)
    return NextResponse.json(
      { error: "Failed to fetch session." },
      { status: 500 }
    )
  }
}