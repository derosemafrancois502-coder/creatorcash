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

type ShippingAddress = {
  fullName: string
  email: string
  phone: string
  address1: string
  address2?: string
  city: string
  state: string
  postalCode: string
  country: string
}

function normalizePaidPlan(plan?: string | null) {
  const value = (plan || "").toLowerCase().trim()

  if (
    value === "founder" ||
    value === "founder_elite" ||
    value === "founder elite"
  ) {
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

function toText(value: unknown) {
  if (typeof value === "string") {
    const trimmed = value.trim()
    return trimmed.length > 0 ? trimmed : null
  }

  if (value == null) return null

  const text = String(value).trim()
  return text.length > 0 ? text : null
}

function toSafeJson<T>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback

  try {
    return JSON.parse(value) as T
  } catch {
    return fallback
  }
}

function normalizeMoneyToMinorUnits(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.round(value)
  }

  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value)
    if (Number.isFinite(parsed)) return Math.round(parsed)
  }

  return 0
}

function normalizeShippingAddress(input: unknown): ShippingAddress | null {
  if (!input || typeof input !== "object") return null

  const raw = input as Partial<ShippingAddress>

  const fullName = toText(raw.fullName) || ""
  const email = toText(raw.email) || ""
  const phone = toText(raw.phone) || ""
  const address1 = toText(raw.address1) || ""
  const address2 = toText(raw.address2) || ""
  const city = toText(raw.city) || ""
  const state = (toText(raw.state) || "").toUpperCase()
  const postalCode = toText(raw.postalCode) || ""
  const country = (toText(raw.country) || "US").toUpperCase()

  const hasAnyAddressData =
    fullName ||
    email ||
    phone ||
    address1 ||
    address2 ||
    city ||
    state ||
    postalCode ||
    country

  if (!hasAnyAddressData) return null

  return {
    fullName,
    email,
    phone,
    address1,
    address2,
    city,
    state,
    postalCode,
    country,
  }
}

function resolveShippingAddressFromStripe(
  session: Stripe.Checkout.Session
): ShippingAddress | null {
  const metadataAddress = toSafeJson<ShippingAddress | null>(
    session.metadata?.shipping_address_json,
    null
  )

  const normalizedMetadataAddress = normalizeShippingAddress(metadataAddress)
  if (normalizedMetadataAddress) {
    return normalizedMetadataAddress
  }

  const details = session.customer_details
  const stripeAddress = details?.address

  if (!details && !stripeAddress) {
    return null
  }

  const fallbackAddress: ShippingAddress = {
    fullName: toText(details?.name) || "",
    email: toText(details?.email) || toText(session.customer_email) || "",
    phone: toText(details?.phone) || "",
    address1: toText(stripeAddress?.line1) || "",
    address2: toText(stripeAddress?.line2) || "",
    city: toText(stripeAddress?.city) || "",
    state: (toText(stripeAddress?.state) || "").toUpperCase(),
    postalCode: toText(stripeAddress?.postal_code) || "",
    country: (toText(stripeAddress?.country) || "US").toUpperCase(),
  }

  return normalizeShippingAddress(fallbackAddress)
}

async function getProfileByUserId(userId: string) {
  const byId = await supabaseAdmin
    .from("profiles")
    .select("id, user_id, extra_video_credits")
    .eq("id", userId)
    .maybeSingle()

  if (byId.data) return byId.data

  const byUserId = await supabaseAdmin
    .from("profiles")
    .select("id, user_id, extra_video_credits")
    .eq("user_id", userId)
    .maybeSingle()

  if (byUserId.data) return byUserId.data

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
    return { success: true as const }
  }

  const updateByUserId = await supabaseAdmin
    .from("profiles")
    .update(updates)
    .eq("user_id", userId)

  if (!updateByUserId.error) {
    return { success: true as const }
  }

  return {
    success: false as const,
    error: {
      byId: updateById.error,
      byUserId: updateByUserId.error,
    },
  }
}

async function resolveCustomerEmail(session: Stripe.Checkout.Session) {
  const metadataAddress = toSafeJson<ShippingAddress | null>(
    session.metadata?.shipping_address_json,
    null
  )

  const directEmail =
    toText(metadataAddress?.email) ||
    toText(session.customer_details?.email) ||
    toText(session.customer_email) ||
    toText(session.metadata?.customer_email)

  if (directEmail) {
    return directEmail
  }

  if (typeof session.customer === "string") {
    try {
      const customer = await stripe.customers.retrieve(session.customer)

      if (!("deleted" in customer)) {
        return toText(customer.email)
      }
    } catch (error) {
      console.error("CUSTOMER EMAIL RETRIEVE ERROR:", error)
    }
  }

  return null
}

async function resolveCustomerName(session: Stripe.Checkout.Session) {
  const metadataAddress = toSafeJson<ShippingAddress | null>(
    session.metadata?.shipping_address_json,
    null
  )

  const directName =
    toText(metadataAddress?.fullName) ||
    toText(session.customer_details?.name) ||
    toText(session.metadata?.customer_name)

  if (directName) {
    return directName
  }

  if (typeof session.customer === "string") {
    try {
      const customer = await stripe.customers.retrieve(session.customer)

      if (!("deleted" in customer)) {
        return toText(customer.name)
      }
    } catch (error) {
      console.error("CUSTOMER NAME RETRIEVE ERROR:", error)
    }
  }

  return null
}

function resolveUserId(session: Stripe.Checkout.Session) {
  return (
    toText(session.metadata?.user_id) ||
    toText(session.metadata?.userId) ||
    toText(session.client_reference_id) ||
    null
  )
}

function resolvePaymentStatus(session: Stripe.Checkout.Session) {
  return toText(session.payment_status) || "paid"
}

function resolveShippingStatus(session: Stripe.Checkout.Session) {
  const shippingMethod = toText(session.metadata?.shipping_method)

  if (shippingMethod === "pickup") {
    return "pickup"
  }

  return "processing"
}

function resolveAmountTotal(session: Stripe.Checkout.Session) {
  return normalizeMoneyToMinorUnits(session.amount_total)
}

function resolveCompactCartItems(session: Stripe.Checkout.Session) {
  const rawItems = session.metadata?.cart_items || "[]"
  const parsed = toSafeJson<CompactCartItem[]>(rawItems, [])

  return Array.isArray(parsed)
    ? parsed.map((item) => ({
        id: toText(item?.id) || "",
        q: Number(item?.q || 0),
        p: Number(item?.p || 0),
        n: toText(item?.n) || "Product",
      }))
    : []
}

async function resolveSellerUserIdFromItems(items: CompactCartItem[]) {
  const firstProductId = items.find((item) => item.id)?.id
  if (!firstProductId) return null

  try {
    const { data, error } = await supabaseAdmin
      .from("products")
      .select("user_id")
      .eq("id", firstProductId)
      .maybeSingle()

    if (error) {
      console.error("SELLER USER FETCH ERROR:", error)
      return null
    }

    return toText(data?.user_id)
  } catch (error) {
    console.error("SELLER USER FETCH UNEXPECTED ERROR:", error)
    return null
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
        return NextResponse.json(
          { error: "Missing signature" },
          { status: 400 }
        )
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

  if (event.type !== "checkout.session.completed") {
    return NextResponse.json({ received: true }, { status: 200 })
  }

  const session = event.data.object as Stripe.Checkout.Session
  const purchaseType = session.metadata?.purchase_type || "marketplace_order"
  const userId = resolveUserId(session)

  if (purchaseType === "video_credits") {
    const creditAmount = Number(session.metadata?.credit_amount || 0)

    if (!userId || creditAmount <= 0) {
      return NextResponse.json({ received: true }, { status: 200 })
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
        return NextResponse.json({ received: true }, { status: 200 })
      }

      const currentCredits = Number(profile?.extra_video_credits ?? 0)
      const nextCredits = currentCredits + creditAmount

      const updateCreditsResult = await updateProfileByUserId(userId, {
        extra_video_credits: nextCredits,
      })

      if (!updateCreditsResult.success) {
        console.error("VIDEO CREDIT UPDATE ERROR:", updateCreditsResult.error)
        return NextResponse.json({ received: true }, { status: 200 })
      }

      const customerEmail = await resolveCustomerEmail(session)
      const customerName = await resolveCustomerName(session)
      const amountTotal = resolveAmountTotal(session)

      const { error: insertCreditsOrderError } = await supabaseAdmin
        .from("orders")
        .insert([
          {
            user_id: userId,
            stripe_session_id: session.id,
            stripe_payment_intent_id:
              typeof session.payment_intent === "string"
                ? session.payment_intent
                : null,
            customer_email: customerEmail,
            customer_name: customerName,
            amount_total: amountTotal,
            currency: toText(session.currency) || "usd",
            status: "paid",
            payment_status: resolvePaymentStatus(session),
            shipping_status: "credits",
            tracking_number: null,
            shipping_address: null,
            items: [
              {
                id: "video-credits",
                q: creditAmount,
                p: amountTotal,
                n: `Video Credits x${creditAmount}`,
              },
            ],
            shipping_method: "digital",
            state_code: null,
            subtotal: toText(session.metadata?.subtotal) || "0",
            shipping: "0",
            tax: toText(session.metadata?.tax) || "0",
            total: toText(session.metadata?.total) || String(amountTotal),
            seller_stripe_account_id: null,
            platform_fee: "0",
          },
        ])

      if (insertCreditsOrderError) {
        console.error(
          "VIDEO CREDITS ORDER INSERT ERROR:",
          insertCreditsOrderError
        )
      }
    }

    return NextResponse.json({ received: true }, { status: 200 })
  }

  if (
    purchaseType === "subscription_plan" ||
    session.mode === "subscription" ||
    !!session.subscription
  ) {
    if (!userId) {
      console.error("SUBSCRIPTION PLAN UPDATE ERROR: Missing user id")
      return NextResponse.json({ received: true }, { status: 200 })
    }

    let resolvedPlan = normalizePaidPlan(session.metadata?.plan)

    if (!resolvedPlan && typeof session.subscription === "string") {
      try {
        const subscription = await stripe.subscriptions.retrieve(
          session.subscription
        )

        resolvedPlan = normalizePaidPlan(
          subscription.metadata?.plan || session.metadata?.plan
        )
      } catch (error) {
        console.error("SUBSCRIPTION RETRIEVE ERROR:", error)
      }
    }

    if (!resolvedPlan) {
      console.error(
        "SUBSCRIPTION PLAN UPDATE ERROR: Missing valid plan metadata",
        {
          sessionId: session.id,
          sessionMetadata: session.metadata,
          subscriptionId: session.subscription,
        }
      )
      return NextResponse.json({ received: true }, { status: 200 })
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

    return NextResponse.json({ received: true }, { status: 200 })
  }

  const parsedItems = resolveCompactCartItems(session)

  const { data: existingOrder, error: existingOrderError } = await supabaseAdmin
    .from("orders")
    .select("id")
    .eq("stripe_session_id", session.id)
    .maybeSingle()

  if (existingOrderError) {
    console.error("EXISTING ORDER CHECK ERROR:", existingOrderError)
  }

  console.log("EXISTING ORDER CHECK:", {
    existingOrder,
    existingOrderError,
  })

  if (existingOrder?.id) {
    return NextResponse.json({ received: true }, { status: 200 })
  }

  const customerEmail = await resolveCustomerEmail(session)
  const customerName = await resolveCustomerName(session)
  const amountTotal = resolveAmountTotal(session)
  const sellerUserId =
    toText(session.metadata?.seller_user_id) ||
    (await resolveSellerUserIdFromItems(parsedItems))

  const resolvedShippingAddress = resolveShippingAddressFromStripe(session)

  const payload = {
    user_id: userId,
    seller_user_id: sellerUserId,
    stripe_session_id: session.id,
    stripe_payment_intent_id:
      typeof session.payment_intent === "string"
        ? session.payment_intent
        : null,
    customer_email: customerEmail,
    customer_name: customerName,
    amount_total: amountTotal,
    currency: toText(session.currency) || "usd",
    status: "paid",
    payment_status: resolvePaymentStatus(session),
    shipping_status: resolveShippingStatus(session),
    tracking_number: null,
    shipping_address: resolvedShippingAddress,
    items: parsedItems,
    shipping_method: toText(session.metadata?.shipping_method) || "standard",
    state_code: toText(session.metadata?.state_code) || "KY",
    subtotal: toText(session.metadata?.subtotal) || String(amountTotal),
    shipping: toText(session.metadata?.shipping) || "0",
    tax: toText(session.metadata?.tax) || "0",
    total: toText(session.metadata?.total) || String(amountTotal),
    seller_stripe_account_id:
      toText(session.metadata?.seller_stripe_account_id) || null,
    platform_fee: toText(session.metadata?.platform_fee) || "0",
  }

  const { data: insertedOrder, error: insertError } = await supabaseAdmin
    .from("orders")
    .insert([payload])
    .select("id")
    .single()

  if (insertError) {
    console.error("ORDER INSERT ERROR:", insertError)
    return NextResponse.json({ received: true }, { status: 200 })
  }

  if (insertedOrder?.id && parsedItems.length > 0) {
    const orderItemsPayload = parsedItems
      .filter((item) => item.id)
      .map((item) => ({
        order_id: insertedOrder.id,
        product_id: item.id,
        seller_user_id: sellerUserId,
        product_name: item.n || "Product",
        image_url: null,
        quantity: Number(item.q || 0),
        unit_price: normalizeMoneyToMinorUnits(item.p),
      }))

    if (orderItemsPayload.length > 0) {
      const { error: orderItemsError } = await supabaseAdmin
        .from("order_items")
        .insert(orderItemsPayload)

      if (orderItemsError) {
        console.error("ORDER ITEMS INSERT ERROR:", orderItemsError)
      }
    }
  }

  for (const item of parsedItems) {
    const productId = toText(item.id)
    if (!productId) continue

    const { data: product, error: productError } = await supabaseAdmin
      .from("products")
      .select("stock")
      .eq("id", productId)
      .single()

    if (productError) {
      console.error("PRODUCT FETCH ERROR:", productError)
      continue
    }

    const currentStock = Number((product as any)?.stock ?? 0)
    const nextStock = Math.max(0, currentStock - Number(item.q || 0))

    const { error: updateError } = await supabaseAdmin
      .from("products")
      .update({ stock: nextStock })
      .eq("id", productId)

    if (updateError) {
      console.error("STOCK UPDATE ERROR:", updateError)
    }
  }

  return NextResponse.json({ received: true }, { status: 200 })
}