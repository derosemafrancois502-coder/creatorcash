import { NextResponse } from "next/server"
import Stripe from "stripe"
import { stripe } from "@/lib/stripe"
import { supabaseAdmin } from "@/lib/supabase/admin"

type CompactCartItem = {
  id: string
  q: number
  p: number
  n: string
}

function normalizePaidPlan(plan?: string | null) {
  const value = (plan || "").toLowerCase().trim()

  if (value === "founder" || value === "founder_elite" || value === "founder elite") {
    return "founder_elite"
  }

  if (value === "pro") {
    return "pro"
  }

  if (value === "starter") {
    return "starter"
  }

  return ""
}

async function getProfileByUserId(userId: string) {
  const byId = await supabaseAdmin
    .from("profiles")
    .select("id, user_id, extra_video_credits")
    .eq("id", userId)
    .maybeSingle()

  if (byId.data) {
    return byId.data
  }

  const byUserId = await supabaseAdmin
    .from("profiles")
    .select("id, user_id, extra_video_credits")
    .eq("user_id", userId)
    .maybeSingle()

  if (byUserId.data) {
    return byUserId.data
  }

  return null
}

async function updateProfileByUserId(
  userId: string,
  updates: Record<string, any>
) {
  const updateById = await supabaseAdmin
    .from("profiles")
    .update(updates)
    .eq("id", userId)

  if (!updateById.error) {
    return { success: true }
  }

  const updateByUserId = await supabaseAdmin
    .from("profiles")
    .update(updates)
    .eq("user_id", userId)

  if (!updateByUserId.error) {
    return { success: true }
  }

  return {
    success: false,
    error: {
      byId: updateById.error,
      byUserId: updateByUserId.error,
    },
  }
}

export async function POST(req: Request) {
  let event: Stripe.Event

  try {
    const bodyText = await req.text()
    const signature = req.headers.get("stripe-signature")

    const isLocalDev =
      process.env.NEXT_PUBLIC_APP_URL?.includes("localhost") ||
      process.env.NODE_ENV === "development"

    if (isLocalDev) {
      event = JSON.parse(bodyText) as Stripe.Event
    } else {
      if (!signature) {
        return NextResponse.json({ error: "Missing signature" }, { status: 400 })
      }

      event = stripe.webhooks.constructEvent(
        bodyText,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!
      )
    }
  } catch (err: any) {
    console.error("Webhook parse/verify failed:", err?.message || err)
    return NextResponse.json({ error: "Invalid webhook" }, { status: 400 })
  }

  console.log("WEBHOOK EVENT TYPE:", event.type)

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session
    const purchaseType = session.metadata?.purchase_type || "marketplace_order"
    const userId =
      session.metadata?.user_id ||
      session.client_reference_id ||
      null

    if (purchaseType === "video_credits") {
      const creditAmount = Number(session.metadata?.credit_amount || 0)

      if (!userId || creditAmount <= 0) {
        return NextResponse.json({ received: true })
      }

      const { data: existingCreditOrder } = await supabaseAdmin
        .from("orders")
        .select("id")
        .eq("stripe_session_id", session.id)
        .maybeSingle()

      if (!existingCreditOrder) {
        const profile = await getProfileByUserId(userId)

        if (!profile) {
          console.error("PROFILE FETCH ERROR: Profile not found for credits", {
            userId,
          })
          return NextResponse.json({ received: true })
        }

        const currentCredits = Number(profile?.extra_video_credits ?? 0)
        const nextCredits = currentCredits + creditAmount

        const updateCreditsResult = await updateProfileByUserId(userId, {
          extra_video_credits: nextCredits,
        })

        if (!updateCreditsResult.success) {
          console.error("VIDEO CREDIT UPDATE ERROR:", updateCreditsResult.error)
          return NextResponse.json({ received: true })
        }

        await supabaseAdmin.from("orders").insert([
          {
            user_id: userId,
            stripe_session_id: session.id,
            stripe_payment_intent_id:
              typeof session.payment_intent === "string"
                ? session.payment_intent
                : null,
            customer_email: session.customer_details?.email || null,
            customer_name: session.customer_details?.name || null,
            amount_total: session.amount_total ? session.amount_total / 100 : null,
            currency: session.currency || "usd",
            status: "paid",
            payment_status: session.payment_status || "paid",
            shipping_status: "credits",
            tracking_number: null,
            shipping_address: null,
            items: [
              {
                id: "video-credits",
                q: creditAmount,
                p: session.amount_total ? session.amount_total / 100 : 0,
                n: `Video Credits x${creditAmount}`,
              },
            ],
            shipping_method: "digital",
            state_code: null,
            subtotal: session.metadata?.subtotal || "0.00",
            shipping: "0.00",
            tax: session.metadata?.tax || "0.00",
            total: session.metadata?.total || "0.00",
            seller_stripe_account_id: null,
            platform_fee: "0.00",
          },
        ])
      }

      return NextResponse.json({ received: true })
    }

    if (purchaseType === "subscription_plan") {
      if (!userId) {
        console.error("SUBSCRIPTION PLAN UPDATE ERROR: Missing user id")
        return NextResponse.json({ received: true })
      }

      let resolvedPlan = normalizePaidPlan(session.metadata?.plan)

      if (!resolvedPlan && typeof session.subscription === "string") {
        try {
          const subscription = await stripe.subscriptions.retrieve(session.subscription)

          resolvedPlan = normalizePaidPlan(
            subscription.metadata?.plan ||
              session.metadata?.plan
          )
        } catch (error) {
          console.error("SUBSCRIPTION RETRIEVE ERROR:", error)
        }
      }

      if (!resolvedPlan) {
        console.error("SUBSCRIPTION PLAN UPDATE ERROR: Missing valid plan metadata", {
          sessionId: session.id,
          sessionMetadata: session.metadata,
          subscriptionId: session.subscription,
        })
        return NextResponse.json({ received: true })
      }

      const subscriptionExpiresAt = new Date(
        Date.now() + 30 * 24 * 60 * 60 * 1000
      ).toISOString()

      const planUpdateResult = await updateProfileByUserId(userId, {
        plan: resolvedPlan,
        videos_used: 0,
        subscription_expires_at: subscriptionExpiresAt,
      })

      if (!planUpdateResult.success) {
        console.error("SUBSCRIPTION PLAN UPDATE ERROR:", planUpdateResult.error)
      }

      return NextResponse.json({ received: true })
    }

    const rawItems = session.metadata?.cart_items || "[]"
    let parsedItems: CompactCartItem[] = []

    try {
      parsedItems = JSON.parse(rawItems)
    } catch {
      parsedItems = []
    }

    const { data: existingOrder, error: existingOrderError } = await supabaseAdmin
      .from("orders")
      .select("id")
      .eq("stripe_session_id", session.id)
      .maybeSingle()

    console.log("EXISTING ORDER CHECK:", {
      existingOrder,
      existingOrderError,
    })

    if (!existingOrder) {
      const payload = {
        user_id: session.metadata?.user_id || null,
        stripe_session_id: session.id,
        stripe_payment_intent_id:
          typeof session.payment_intent === "string"
            ? session.payment_intent
            : null,
        customer_email: session.customer_details?.email || null,
        customer_name: session.customer_details?.name || null,
        amount_total: session.amount_total ? session.amount_total / 100 : null,
        currency: session.currency || "usd",
        status: "paid",
        payment_status: session.payment_status || "paid",
        shipping_status:
          session.metadata?.shipping_method === "pickup"
            ? "pickup"
            : "processing",
        tracking_number: null,
        shipping_address: session.customer_details?.address || null,
        items: parsedItems,
        shipping_method: session.metadata?.shipping_method || "standard",
        state_code: session.metadata?.state_code || "KY",
        subtotal: session.metadata?.subtotal || "0.00",
        shipping: session.metadata?.shipping || "0.00",
        tax: session.metadata?.tax || "0.00",
        total: session.metadata?.total || "0.00",
        seller_stripe_account_id:
          session.metadata?.seller_stripe_account_id || null,
        platform_fee: session.metadata?.platform_fee || "0.00",
      }

      const { error: insertError } = await supabaseAdmin
        .from("orders")
        .insert([payload])

      if (insertError) {
        console.error("ORDER INSERT ERROR:", insertError)
      }

      for (const item of parsedItems) {
        const { data: product, error: productError } = await supabaseAdmin
          .from("products")
          .select("stock")
          .eq("id", item.id)
          .single()

        if (productError) {
          console.error("PRODUCT FETCH ERROR:", productError)
          continue
        }

        const currentStock = Number(product?.stock ?? 0)
        const nextStock = Math.max(0, currentStock - Number(item.q))

        const { error: updateError } = await supabaseAdmin
          .from("products")
          .update({ stock: nextStock })
          .eq("id", item.id)

        if (updateError) {
          console.error("STOCK UPDATE ERROR:", updateError)
        }
      }
    }
  }

  return NextResponse.json({ received: true })
}