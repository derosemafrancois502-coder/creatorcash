import { NextResponse } from "next/server"
import Stripe from "stripe"
import { stripe } from "@/lib/stripe"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const accountId =
      typeof body?.accountId === "string" ? body.accountId.trim() : ""

    const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim()
    const secretKey = process.env.STRIPE_SECRET_KEY?.trim()

    if (!secretKey) {
      return NextResponse.json(
        { error: "Missing STRIPE_SECRET_KEY in environment." },
        { status: 500 }
      )
    }

    if (!appUrl) {
      return NextResponse.json(
        { error: "Missing NEXT_PUBLIC_APP_URL in environment." },
        { status: 500 }
      )
    }

    if (!accountId) {
      return NextResponse.json(
        { error: "Missing accountId." },
        { status: 400 }
      )
    }

    if (!accountId.startsWith("acct_")) {
      return NextResponse.json(
        { error: "Invalid Stripe connected account id." },
        { status: 400 }
      )
    }

    // Optional sanity check so bad/mismatched account ids fail early
    try {
      await stripe.accounts.retrieve(accountId)
    } catch (error) {
      const stripeError = error as Stripe.StripeRawError | undefined

      return NextResponse.json(
        {
          error:
            stripeError?.message ||
            "Could not verify this Stripe connected account.",
        },
        { status: 400 }
      )
    }

    const link = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${appUrl}/dashboard/seller`,
      return_url: `${appUrl}/dashboard/seller`,
      type: "account_onboarding",
    })

    return NextResponse.json({
      url: link.url,
    })
  } catch (error: unknown) {
    const stripeError = error as Stripe.StripeRawError | undefined

    console.error("Account link error:", stripeError || error)

    if (stripeError?.code === "platform_account_required") {
      return NextResponse.json(
        {
          error:
            "Your Stripe live account is not configured as a Connect platform yet. Open Stripe Dashboard → Connect settings and finish platform setup in live mode.",
        },
        { status: 400 }
      )
    }

    if (stripeError?.code === "resource_missing") {
      return NextResponse.json(
        {
          error:
            "This connected account was not found in the current Stripe mode. Check that your accountId matches your current test/live secret key.",
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        error:
          stripeError?.message || "Failed to create onboarding link.",
      },
      { status: 500 }
    )
  }
}