import { NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { supabaseAdmin } from "@/lib/supabase/admin"

type CreditPackKey = "5" | "10" | "25"

const CREDIT_PACKS: Record<
  CreditPackKey,
  {
    credits: number
    unitAmount: number
    name: string
    description: string
  }
> = {
  "5": {
    credits: 5,
    unitAmount: 900,
    name: "5 Video Credits",
    description: "Add 5 extra video credits to your CreatorGoat account.",
  },
  "10": {
    credits: 10,
    unitAmount: 1500,
    name: "10 Video Credits",
    description: "Add 10 extra video credits to your CreatorGoat account.",
  },
  "25": {
    credits: 25,
    unitAmount: 2900,
    name: "25 Video Credits",
    description: "Add 25 extra video credits to your CreatorGoat account.",
  },
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const requestedPack = String(body?.creditPack || "5") as CreditPackKey

    const selectedPack = CREDIT_PACKS[requestedPack] || CREDIT_PACKS["5"]

    const origin =
      req.headers.get("origin") ||
      process.env.NEXT_PUBLIC_APP_URL ||
      "http://localhost:3000"

    const authHeader = req.headers.get("authorization")
    const bearerToken = authHeader?.startsWith("Bearer ")
      ? authHeader.replace("Bearer ", "").trim()
      : ""

    if (!bearerToken) {
      return NextResponse.json(
        { error: "Missing authorization token." },
        { status: 401 }
      )
    }

    const {
      data: { user },
      error: userError,
    } = await supabaseAdmin.auth.getUser(bearerToken)

    if (userError || !user) {
      return NextResponse.json(
        { error: "Unauthorized user." },
        { status: 401 }
      )
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      success_url: `${origin}/dashboard/video-studio?credits=success`,
      cancel_url: `${origin}/dashboard/video-studio?credits=cancel`,
      customer_email: user.email || undefined,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: selectedPack.unitAmount,
            product_data: {
              name: selectedPack.name,
              description: selectedPack.description,
            },
          },
        },
      ],
      metadata: {
        purchase_type: "video_credits",
        user_id: user.id,
        credit_amount: String(selectedPack.credits),
        subtotal: (selectedPack.unitAmount / 100).toFixed(2),
        tax: "0.00",
        total: (selectedPack.unitAmount / 100).toFixed(2),
      },
    })

    return NextResponse.json({
      success: true,
      url: session.url,
      sessionId: session.id,
    })
  } catch (error) {
    console.error("STRIPE CREDIT CHECKOUT ERROR:", error)

    return NextResponse.json(
      {
        error: "Failed to create Stripe checkout session for video credits.",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}