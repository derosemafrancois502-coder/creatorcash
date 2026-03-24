import Stripe from "stripe"
import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("Missing STRIPE_SECRET_KEY in environment variables")
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2026-02-25.clover",
})

export async function POST(req: Request) {
  try {
    if (!process.env.NEXT_PUBLIC_APP_URL) {
      return NextResponse.json(
        { error: "Missing NEXT_PUBLIC_APP_URL in .env.local" },
        { status: 500 }
      )
    }

    const authHeader = req.headers.get("authorization")
    const bearerToken = authHeader?.startsWith("Bearer ")
      ? authHeader.replace("Bearer ", "").trim()
      : ""

    const body = await req.json().catch(() => ({}))

    const existingStripeAccountId =
      typeof body?.stripeAccountId === "string" && body.stripeAccountId.trim()
        ? body.stripeAccountId.trim()
        : null

    let userId: string | null = null

    if (bearerToken) {
      const {
        data: { user },
        error: userError,
      } = await supabaseAdmin.auth.getUser(bearerToken)

      if (!userError && user) {
        userId = user.id
      }
    }

    let accountId = existingStripeAccountId

    if (!accountId) {
      const account = await stripe.accounts.create({
        type: "express",
      })

      accountId = account.id
    }

    if (userId && accountId) {
      const { error: profileUpdateError } = await supabaseAdmin
        .from("profiles")
        .update({
          stripe_account_id: accountId,
        })
        .eq("id", userId)

      if (profileUpdateError) {
        console.error("Failed to save stripe_account_id:", profileUpdateError)
      }
    }

    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?stripe=refresh`,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?stripe=return`,
      type: "account_onboarding",
    })

    return NextResponse.json({
      url: accountLink.url,
      accountId,
    })
  } catch (error: unknown) {
    console.error("Stripe connect error:", error)

    if (
      error &&
      typeof error === "object" &&
      "type" in error &&
      error.type === "StripeInvalidRequestError"
    ) {
      const stripeError = error as Stripe.errors.StripeInvalidRequestError

      if (
        typeof stripeError.message === "string" &&
        stripeError.message.includes("signed up for Connect")
      ) {
        return NextResponse.json(
          {
            error:
              "Your Stripe platform account is not enabled for Connect yet. Open your Stripe Dashboard and finish Connect onboarding first.",
          },
          { status: 400 }
        )
      }

      return NextResponse.json(
        { error: stripeError.message || "Stripe request failed." },
        { status: stripeError.statusCode || 400 }
      )
    }

    const message =
      error instanceof Error
        ? error.message
        : "Failed to create Stripe Connect account."

    return NextResponse.json({ error: message }, { status: 500 })
  }
}