import Stripe from "stripe"
import { NextResponse } from "next/server"

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("Missing STRIPE_SECRET_KEY in environment variables")
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2026-02-25.clover",
})

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))

    const stripeAccountId =
      typeof body?.stripeAccountId === "string" && body.stripeAccountId.trim()
        ? body.stripeAccountId.trim()
        : null

    if (!stripeAccountId) {
      return NextResponse.json(
        { error: "Missing stripeAccountId." },
        { status: 400 }
      )
    }

    const account = await stripe.accounts.retrieve(stripeAccountId)

    return NextResponse.json({
      accountId: account.id,
      chargesEnabled: account.charges_enabled ?? false,
      payoutsEnabled: account.payouts_enabled ?? false,
      detailsSubmitted: account.details_submitted ?? false,
    })
  } catch (error: unknown) {
    console.error("Stripe status error:", error)

    const message =
      error instanceof Error
        ? error.message
        : "Failed to retrieve Stripe account status."

    return NextResponse.json({ error: message }, { status: 500 })
  }
}