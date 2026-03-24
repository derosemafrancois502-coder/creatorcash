import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { createClient } from "@supabase/supabase-js"

type CheckoutItem = {
  id: number
  name: string
  price: number
  image_url?: string | null
  quantity: number
}

export async function POST(request: NextRequest) {
  try {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!stripeSecretKey || !supabaseUrl || !supabaseServiceRoleKey) {
      return NextResponse.json(
        { error: "Missing required environment variables." },
        { status: 500 }
      )
    }

    const stripe = new Stripe(stripeSecretKey)
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

    const body = await request.json()
    const sessionId = body?.sessionId?.trim()

    if (!sessionId) {
      return NextResponse.json(
        { error: "sessionId is required." },
        { status: 400 }
      )
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["payment_intent", "customer_details"],
    })

    if (!session) {
      return NextResponse.json(
        { error: "Stripe session not found." },
        { status: 404 }
      )
    }

    const metadata = session.metadata || {}

    // Prevent duplicate orders for same Stripe session
    const { data: existingOrder } = await supabase
      .from("orders")
      .select("*")
      .eq("stripe_session_id", session.id)
      .maybeSingle()

    if (existingOrder) {
      return NextResponse.json({
        success: true,
        order: existingOrder,
      })
    }

    const buyerUserId = metadata.buyer_user_id || null
    const sellerUserId = metadata.seller_user_id || null
    const itemsRaw = metadata.items || "[]"
    const shippingMethod = metadata.shipping_method || "standard"
    const stateCode = metadata.state_code || "KY"

    const subtotal = Number(metadata.subtotal || 0)
    const shipping = Number(metadata.shipping || 0)
    const tax = Number(metadata.tax || 0)
    const total = Number(metadata.total || 0)

    let items: CheckoutItem[] = []
    try {
      items = JSON.parse(itemsRaw)
    } catch {
      items = []
    }

    if (!buyerUserId || !sellerUserId || items.length === 0) {
      return NextResponse.json(
        { error: "Missing checkout metadata for order creation." },
        { status: 400 }
      )
    }

    const customerDetails = session.customer_details
    const paymentIntentId =
      typeof session.payment_intent === "string"
        ? session.payment_intent
        : session.payment_intent?.id || null

    // 1) Create order
    const { data: newOrder, error: orderError } = await supabase
      .from("orders")
      .insert({
        buyer_user_id: buyerUserId,
        seller_user_id: sellerUserId,
        stripe_session_id: session.id,
        stripe_payment_intent_id: paymentIntentId,
        payment_status: "paid",
        order_status: "paid",
        shipping_method: shippingMethod,
        state_code: stateCode,
        subtotal: subtotal.toFixed(2),
        shipping: shipping.toFixed(2),
        tax: tax.toFixed(2),
        total: total.toFixed(2),
      })
      .select("*")
      .single()

    if (orderError) {
      return NextResponse.json(
        { error: orderError.message },
        { status: 500 }
      )
    }

    // 2) Load products for real seller + shipping info
    const productIds = items.map((item) => Number(item.id))

    const { data: products, error: productsError } = await supabase
      .from("products")
      .select(`
        id,
        user_id,
        name,
        price,
        weight,
        weight_unit,
        length,
        width,
        height,
        distance_unit
      `)
      .in("id", productIds)

    if (productsError) {
      return NextResponse.json(
        { error: productsError.message },
        { status: 500 }
      )
    }

    const productMap = new Map<number, any>()
    for (const product of products ?? []) {
      productMap.set(Number(product.id), product)
    }

    // 3) Insert order items
    const orderItemsPayload = items
      .map((item) => {
        const product = productMap.get(Number(item.id))
        if (!product) return null

        const quantity = Number(item.quantity || 1)
        const price = Number(product.price ?? item.price ?? 0)

        return {
          order_id: newOrder.id,
          product_id: Number(product.id),
          seller_user_id: product.user_id,
          product_name: product.name || item.name || "Product",
          product_price: price,
          quantity,
          line_total: Number((price * quantity).toFixed(2)),
          weight: product.weight ?? null,
          weight_unit: product.weight_unit ?? "lb",
          length: product.length ?? null,
          width: product.width ?? null,
          height: product.height ?? null,
          distance_unit: product.distance_unit ?? "in",
        }
      })
      .filter(Boolean)

    if (orderItemsPayload.length === 0) {
      return NextResponse.json(
        { error: "No valid order items could be created." },
        { status: 400 }
      )
    }

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItemsPayload)

    if (itemsError) {
      return NextResponse.json(
        { error: itemsError.message },
        { status: 500 }
      )
    }

    // 4) Insert buyer shipping address
    const address = customerDetails?.address

    const { error: addressError } = await supabase
      .from("order_shipping_addresses")
      .insert({
        order_id: newOrder.id,
        full_name: customerDetails?.name || "Customer",
        email: customerDetails?.email || null,
        phone: customerDetails?.phone || null,
        address_line_1: address?.line1 || "Unknown address",
        address_line_2: address?.line2 || null,
        city: address?.city || "Unknown city",
        state: address?.state || stateCode,
        postal_code: address?.postal_code || "00000",
        country: address?.country || "US",
      })

    if (addressError) {
      return NextResponse.json(
        { error: addressError.message },
        { status: 500 }
      )
    }

    // 5) Create shipment seed row
    const { error: shipmentError } = await supabase
      .from("shipments")
      .insert({
        order_id: newOrder.id,
        seller_user_id: sellerUserId,
        buyer_user_id: buyerUserId,
        shipment_status: "processing",
        provider: null,
        shipping_cost: 0,
      })

    if (shipmentError) {
      return NextResponse.json(
        { error: shipmentError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      order: newOrder,
    })
  } catch (error) {
    console.error("Order confirm error:", error)

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Could not confirm order.",
      },
      { status: 500 }
    )
  }
}