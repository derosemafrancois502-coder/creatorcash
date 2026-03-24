import { NextResponse } from "next/server"
import Stripe from "stripe"

export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET(req: Request) {
  try {
    const stripeKey = process.env.STRIPE_SECRET_KEY

    if (!stripeKey) {
      return NextResponse.json(
        { error: "STRIPE_SECRET_KEY is missing." },
        { status: 500 }
      )
    }

    const stripe = new Stripe(stripeKey)

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