import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { createClient } from "@supabase/supabase-js"

type RefundBody = {
  returnId: string
  paymentIntentId: string
  refundAmount?: number | null
  reason?: string | null
}

export async function POST(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY

    if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceRoleKey || !stripeSecretKey) {
      return NextResponse.json(
        { error: "Missing required environment variables." },
        { status: 500 }
      )
    }

    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Missing or invalid Authorization header." },
        { status: 401 }
      )
    }

    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: authHeader,
        },
      },
    })

    const serviceClient = createClient(supabaseUrl, supabaseServiceRoleKey)
    const stripe = new Stripe(stripeSecretKey)

    const {
      data: { user },
      error: userError,
    } = await userClient.auth.getUser()

    if (userError || !user) {
      return NextResponse.json(
        { error: "Unauthorized." },
        { status: 401 }
      )
    }

    const body = (await request.json()) as RefundBody
    const returnId = body?.returnId?.trim()
    const paymentIntentId = body?.paymentIntentId?.trim()
    const refundAmount = body?.refundAmount ?? null
    const reason = body?.reason?.trim() || null

    if (!returnId) {
      return NextResponse.json(
        { error: "returnId is required." },
        { status: 400 }
      )
    }

    if (!paymentIntentId) {
      return NextResponse.json(
        { error: "paymentIntentId is required." },
        { status: 400 }
      )
    }

    if (refundAmount !== null && (Number.isNaN(Number(refundAmount)) || Number(refundAmount) < 0)) {
      return NextResponse.json(
        { error: "refundAmount must be a valid positive number." },
        { status: 400 }
      )
    }

    const { data: profile, error: profileError } = await serviceClient
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle()

    if (profileError) {
      return NextResponse.json(
        { error: profileError.message },
        { status: 500 }
      )
    }

    if (!profile || (profile.role !== "seller" && profile.role !== "admin")) {
      return NextResponse.json(
        { error: "Only seller or admin can process refunds." },
        { status: 403 }
      )
    }

    const { data: returnRow, error: returnError } = await serviceClient
      .from("returns")
      .select(`
        id,
        buyer_user_id,
        seller_user_id,
        order_id,
        product_id,
        status,
        refund_amount,
        stripe_refund_id
      `)
      .eq("id", returnId)
      .maybeSingle()

    if (returnError) {
      return NextResponse.json(
        { error: returnError.message },
        { status: 500 }
      )
    }

    if (!returnRow) {
      return NextResponse.json(
        { error: "Return request not found." },
        { status: 404 }
      )
    }

    if (profile.role === "seller" && returnRow.seller_user_id !== user.id) {
      return NextResponse.json(
        { error: "You can only refund returns for your own products." },
        { status: 403 }
      )
    }

    if (returnRow.stripe_refund_id) {
      return NextResponse.json(
        { error: "This return has already been refunded." },
        { status: 400 }
      )
    }

    const normalizedAmount =
      refundAmount !== null ? Number(refundAmount) : null

    const stripeRefund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount: normalizedAmount !== null ? Math.round(normalizedAmount * 100) : undefined,
      reason: "requested_by_customer",
      metadata: {
        return_id: returnRow.id,
        order_id: String(returnRow.order_id),
        product_id: String(returnRow.product_id),
        refunded_by_user_id: user.id,
        marketplace_reason: reason || "",
      },
    })

    const nextStatus =
      normalizedAmount !== null ? "partial_refund" : "refunded"

    const finalRefundAmount =
      normalizedAmount !== null
        ? normalizedAmount
        : Number(stripeRefund.amount || 0) / 100

    const { error: updateError } = await serviceClient
      .from("returns")
      .update({
        status: nextStatus,
        refund_amount: finalRefundAmount,
        stripe_refund_id: stripeRefund.id,
        refunded_at: new Date().toISOString(),
        approved_at: new Date().toISOString(),
      })
      .eq("id", returnRow.id)

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      refundId: stripeRefund.id,
      status: nextStatus,
      refundAmount: finalRefundAmount,
      stripeStatus: stripeRefund.status,
    })
  } catch (error) {
    console.error("Refund API error:", error)

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Something went wrong while processing refund.",
      },
      { status: 500 }
    )
  }
}