import { NextResponse } from "next/server"
import Stripe from "stripe"

export const dynamic = "force-dynamic"
export const revalidate = 0

export async function POST(req: Request) {
  try {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY

    if (!stripeSecretKey) {
      return NextResponse.json(
        { error: "STRIPE_SECRET_KEY is missing." },
        { status: 500 }
      )
    }

    const stripe = new Stripe(stripeSecretKey)

    const body = await req.json()

    const amount = Number(body?.amount ?? 0)
    const successUrl = body?.successUrl
    const cancelUrl = body?.cancelUrl
    const customerEmail = body?.customerEmail
    const metadata = body?.metadata ?? {}

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: "Invalid amount." },
        { status: 400 }
      )
    }

    if (!successUrl || !cancelUrl) {
      return NextResponse.json(
        { error: "Missing success or cancel URL." },
        { status: 400 }
      )
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: body?.name || "CreatorGoat Purchase",
            },
            unit_amount: Math.round(amount * 100),
          },
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: customerEmail || undefined,
      metadata,
    })

    return NextResponse.json({
      id: session.id,
      url: session.url,
    })
  } catch (error) {
    console.error("checkout/create error:", error)
    return NextResponse.json(
      { error: "Failed to create checkout session." },
      { status: 500 }
    )
  }
}