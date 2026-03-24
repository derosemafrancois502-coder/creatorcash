import { NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { supabaseAdmin } from "@/lib/supabase/admin"

type PlanKey = "starter" | "pro" | "founder" | "founder_elite"

const PLAN_CONFIG: Record<
  PlanKey,
  {
    name: string
    amount: number
    interval: "month"
    planLabel: string
  }
> = {
  starter: {
    name: "CreatorGoat Starter Plan",
    amount: 900,
    interval: "month",
    planLabel: "starter",
  },
  pro: {
    name: "CreatorGoat Pro Plan",
    amount: 1900,
    interval: "month",
    planLabel: "pro",
  },
  founder: {
    name: "CreatorGoat Founder Elite Plan",
    amount: 2900,
    interval: "month",
    planLabel: "founder_elite",
  },
  founder_elite: {
    name: "CreatorGoat Founder Elite Plan",
    amount: 2900,
    interval: "month",
    planLabel: "founder_elite",
  },
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const requestedPlan = String(body?.plan || "starter").toLowerCase() as PlanKey
    const selectedPlan = PLAN_CONFIG[requestedPlan] || PLAN_CONFIG.starter

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
      mode: "subscription",
      payment_method_types: ["card"],
      success_url: `${origin}/dashboard/billing?subscription=success`,
      cancel_url: `${origin}/dashboard/billing?subscription=cancel`,
      customer_email: user.email || undefined,
      client_reference_id: user.id,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: selectedPlan.amount,
            recurring: {
              interval: selectedPlan.interval,
            },
            product_data: {
              name: selectedPlan.name,
            },
          },
        },
      ],
      metadata: {
        purchase_type: "subscription_plan",
        user_id: user.id,
        plan: selectedPlan.planLabel,
      },
      subscription_data: {
        metadata: {
          purchase_type: "subscription_plan",
          user_id: user.id,
          plan: selectedPlan.planLabel,
        },
      },
    })

    return NextResponse.json({
      success: true,
      url: session.url,
      sessionId: session.id,
    })
  } catch (error) {
    console.error("STRIPE SUBSCRIPTION CHECKOUT ERROR:", error)

    return NextResponse.json(
      {
        error: "Failed to create Stripe subscription checkout session.",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}