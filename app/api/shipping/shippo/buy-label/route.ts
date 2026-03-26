import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

function normalizeProvider(value: unknown): string | null {
  if (typeof value === "string" && value.trim()) return value.trim()
  return null
}

function normalizeNumber(value: unknown, fallback = 0): number {
  const n = Number(value)
  return Number.isFinite(n) ? n : fallback
}

function normalizeCountry(value: unknown, fallback = "US"): string {
  if (typeof value === "string" && value.trim()) {
    return value.trim().toUpperCase()
  }
  return fallback
}

function toShippoWeightUnit(value?: string | null): "lb" | "oz" | "g" | "kg" {
  const v = (value || "lb").toLowerCase()
  if (v === "oz" || v === "g" || v === "kg" || v === "lb") return v
  return "lb"
}

function toShippoDistanceUnit(value?: string | null): "in" | "cm" {
  const v = (value || "in").toLowerCase()
  if (v === "cm" || v === "in") return v
  return "in"
}

type ProductRow = {
  id: string | number
  name?: string | null
  weight?: number | string | null
  weight_unit?: string | null
  length?: number | string | null
  width?: number | string | null
  height?: number | string | null
  distance_unit?: string | null
}

export async function POST(request: NextRequest) {
  try {
    const shippoToken = process.env.SHIPPO_API_TOKEN
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!shippoToken || !supabaseUrl || !supabaseServiceRoleKey) {
      return NextResponse.json(
        { error: "Missing required environment variables." },
        { status: 500 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)
    const body = await request.json()

    const orderId = Number(body?.orderId)
    if (Number.isNaN(orderId)) {
      return NextResponse.json(
        { error: "Valid orderId is required." },
        { status: 400 }
      )
    }

    const { data: shipmentRow, error: shipmentError } = await supabase
      .from("shipments")
      .select("id, seller_user_id, buyer_user_id")
      .eq("order_id", orderId)
      .maybeSingle()

    if (shipmentError) {
      return NextResponse.json({ error: shipmentError.message }, { status: 500 })
    }

    if (!shipmentRow) {
      return NextResponse.json(
        { error: "Shipment row not found for this order. Create shipment record first." },
        { status: 404 }
      )
    }

    const { data: sellerProfile, error: sellerProfileError } = await supabase
      .from("seller_shipping_profiles")
      .select("*")
      .eq("user_id", shipmentRow.seller_user_id)
      .maybeSingle()

    if (sellerProfileError) {
      return NextResponse.json({ error: sellerProfileError.message }, { status: 500 })
    }

    if (!sellerProfile) {
      return NextResponse.json(
        { error: "Seller shipping profile not found." },
        { status: 404 }
      )
    }

    const { data: orderAddress, error: orderAddressError } = await supabase
      .from("order_shipping_addresses")
      .select("*")
      .eq("order_id", orderId)
      .maybeSingle()

    if (orderAddressError) {
      return NextResponse.json({ error: orderAddressError.message }, { status: 500 })
    }

    if (!orderAddress) {
      return NextResponse.json(
        { error: "Order shipping address not found." },
        { status: 404 }
      )
    }

    const { data: orderItems, error: itemsError } = await supabase
      .from("order_items")
      .select("product_id, quantity")
      .eq("order_id", orderId)

    if (itemsError) {
      return NextResponse.json({ error: itemsError.message }, { status: 500 })
    }

    if (!orderItems || orderItems.length === 0) {
      return NextResponse.json(
        { error: "No order items found for this order." },
        { status: 404 }
      )
    }

    const productIds = orderItems.map((item) => item.product_id)

    const { data: products, error: productsError } = await supabase
      .from("products")
      .select(`
        id,
        name,
        weight,
        weight_unit,
        length,
        width,
        height,
        distance_unit
      `)
      .in("id", productIds)

    if (productsError) {
      return NextResponse.json({ error: productsError.message }, { status: 500 })
    }

    if (!products || products.length === 0) {
      return NextResponse.json(
        { error: "No products found for order items." },
        { status: 404 }
      )
    }

    const productMap = new Map<string, ProductRow>()
    for (const product of products as ProductRow[]) {
      productMap.set(String(product.id), product)
    }

    let totalWeight = 0
    let maxLength = 0
    let maxWidth = 0
    let totalHeight = 0

    let weightUnit: "lb" | "oz" | "g" | "kg" = "lb"
    let distanceUnit: "in" | "cm" = "in"

    for (const item of orderItems) {
      const product = productMap.get(String(item.product_id))
      if (!product) continue

      const quantity = normalizeNumber(item.quantity, 1)

      const productWeight = normalizeNumber(product.weight, 1)
      const productLength = normalizeNumber(product.length, 10)
      const productWidth = normalizeNumber(product.width, 8)
      const productHeight = normalizeNumber(product.height, 2)

      weightUnit = toShippoWeightUnit(product.weight_unit)
      distanceUnit = toShippoDistanceUnit(product.distance_unit)

      totalWeight += productWeight * quantity
      maxLength = Math.max(maxLength, productLength)
      maxWidth = Math.max(maxWidth, productWidth)
      totalHeight += productHeight * quantity
    }

    if (totalWeight <= 0) totalWeight = 1
    if (maxLength <= 0) maxLength = 10
    if (maxWidth <= 0) maxWidth = 8
    if (totalHeight <= 0) totalHeight = 4

    const parcel = {
      length: String(Number(maxLength.toFixed(2))),
      width: String(Number(maxWidth.toFixed(2))),
      height: String(Number(totalHeight.toFixed(2))),
      distance_unit: distanceUnit,
      weight: String(Number(totalWeight.toFixed(2))),
      mass_unit: weightUnit,
    }

    const shipmentResponse = await fetch("https://api.goshippo.com/shipments/", {
      method: "POST",
      headers: {
        Authorization: `ShippoToken ${shippoToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        address_from: {
          name: sellerProfile.full_name,
          company: sellerProfile.company || "",
          street1: sellerProfile.address_line_1,
          street2: sellerProfile.address_line_2 || "",
          city: sellerProfile.city,
          state: sellerProfile.state,
          zip: sellerProfile.postal_code,
          country: normalizeCountry(sellerProfile.country),
          phone: sellerProfile.phone || "",
          email: sellerProfile.email || "",
        },
        address_to: {
          name: orderAddress.full_name,
          company: "",
          street1: orderAddress.address_line_1,
          street2: orderAddress.address_line_2 || "",
          city: orderAddress.city,
          state: orderAddress.state,
          zip: orderAddress.postal_code,
          country: normalizeCountry(orderAddress.country),
          phone: orderAddress.phone || "",
          email: orderAddress.email || "",
        },
        parcels: [parcel],
        async: false,
      }),
    })

    const shipmentData = await shipmentResponse.json()

    if (!shipmentResponse.ok) {
      return NextResponse.json(
        {
          error:
            shipmentData?.detail ||
            shipmentData?.error ||
            shipmentData?.messages?.[0]?.text ||
            "Failed to create shipment.",
        },
        { status: 500 }
      )
    }

    const shipmentObjectId: string | undefined = shipmentData?.object_id
    const rates: any[] = Array.isArray(shipmentData?.rates) ? shipmentData.rates : []

    if (!shipmentObjectId) {
      return NextResponse.json(
        { error: "Shippo shipment object_id not returned." },
        { status: 500 }
      )
    }

    if (rates.length === 0) {
      return NextResponse.json(
        { error: "No shipping rates returned for this shipment." },
        { status: 400 }
      )
    }

    const selectedRate = [...rates].sort(
      (a, b) => normalizeNumber(a?.amount) - normalizeNumber(b?.amount)
    )[0]

    if (!selectedRate?.object_id) {
      return NextResponse.json(
        { error: "No valid Shippo rate object_id found." },
        { status: 400 }
      )
    }

    const transactionResponse = await fetch("https://api.goshippo.com/transactions/", {
      method: "POST",
      headers: {
        Authorization: `ShippoToken ${shippoToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        rate: selectedRate.object_id,
        label_file_type: "PDF",
        async: false,
      }),
    })

    const transactionData = await transactionResponse.json()

    if (!transactionResponse.ok) {
      return NextResponse.json(
        {
          error:
            transactionData?.messages?.[0]?.text ||
            transactionData?.detail ||
            transactionData?.error ||
            "Failed to purchase label.",
        },
        { status: 500 }
      )
    }

    const trackingNumber =
      transactionData?.tracking_number ||
      transactionData?.tracking_num ||
      null

    const labelUrl =
      transactionData?.label_url ||
      transactionData?.label_file ||
      null

    const providerTransactionId =
      normalizeProvider(transactionData?.object_id) ||
      normalizeProvider(transactionData?.transaction_id)

    const carrier =
      normalizeProvider(transactionData?.rate?.provider) ||
      normalizeProvider(selectedRate?.provider)

    const service =
      normalizeProvider(transactionData?.rate?.servicelevel?.name) ||
      normalizeProvider(selectedRate?.servicelevel?.name)

    const shippingCost =
      normalizeNumber(transactionData?.rate?.amount) ||
      normalizeNumber(selectedRate?.amount)

    const { error: updateError } = await supabase
      .from("shipments")
      .update({
        carrier,
        service,
        tracking_number: trackingNumber,
        label_url: labelUrl,
        shipment_status: "label_created",
        provider: "shippo",
        provider_shipment_id: shipmentObjectId,
        provider_rate_id: selectedRate.object_id,
        provider_transaction_id: providerTransactionId,
        shipping_cost: shippingCost,
        updated_at: new Date().toISOString(),
      })
      .eq("id", shipmentRow.id)

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      shipmentId: shipmentObjectId,
      transactionId: providerTransactionId,
      rateId: selectedRate.object_id,
      carrier,
      service,
      trackingNumber,
      labelUrl,
      shippingCost,
      shipmentStatus: "label_created",
      parcel,
    })
  } catch (error) {
    console.error("Shippo buy-label error:", error)
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Something went wrong while buying the label.",
      },
      { status: 500 }
    )
  }
}