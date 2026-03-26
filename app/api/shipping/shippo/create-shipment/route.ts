import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

type SellerShippingProfile = {
  full_name: string | null
  company: string | null
  email: string | null
  phone: string | null
  address_line_1: string | null
  address_line_2: string | null
  city: string | null
  state: string | null
  postal_code: string | null
  country: string | null
}

type ProductItem = {
  id: string
  q: number
  p: number
  n: string
}

function toSafeString(value: unknown) {
  return typeof value === "string" ? value.trim() : ""
}

function normalizeCountry(value: unknown) {
  const country = toSafeString(value).toUpperCase()
  return country || "US"
}

function normalizeShippingAddress(address: any) {
  return {
    full_name:
      toSafeString(address?.fullName) ||
      toSafeString(address?.name) ||
      toSafeString(address?.customer_name),
    email: toSafeString(address?.email),
    phone: toSafeString(address?.phone),
    address_line_1:
      toSafeString(address?.address1) ||
      toSafeString(address?.address_line_1) ||
      toSafeString(address?.street1),
    address_line_2:
      toSafeString(address?.address2) ||
      toSafeString(address?.address_line_2) ||
      toSafeString(address?.street2),
    city: toSafeString(address?.city),
    state: toSafeString(address?.state),
    postal_code:
      toSafeString(address?.postalCode) ||
      toSafeString(address?.postal_code) ||
      toSafeString(address?.zip),
    country: normalizeCountry(address?.country),
  }
}

function validateSellerProfile(profile: SellerShippingProfile) {
  if (!toSafeString(profile.full_name)) return "Seller full name is missing."
  if (!toSafeString(profile.address_line_1)) return "Seller address line 1 is missing."
  if (!toSafeString(profile.city)) return "Seller city is missing."
  if (!toSafeString(profile.state)) return "Seller state is missing."
  if (!toSafeString(profile.postal_code)) return "Seller postal code is missing."
  if (!toSafeString(profile.country)) return "Seller country is missing."
  return null
}

function validateCustomerAddress(address: ReturnType<typeof normalizeShippingAddress>) {
  if (!address.full_name) return "Customer full name is missing."
  if (!address.address_line_1) return "Customer address line 1 is missing."
  if (!address.city) return "Customer city is missing."
  if (!address.state) return "Customer state is missing."
  if (!address.postal_code) return "Customer postal code is missing."
  if (!address.country) return "Customer country is missing."
  return null
}

function getPrimaryProductId(items: ProductItem[] | null | undefined) {
  if (!Array.isArray(items) || items.length === 0) return null
  return items[0]?.id || null
}

export async function POST(req: Request) {
  try {
    const SHIPPO_API_TOKEN = process.env.SHIPPO_API_TOKEN

    if (!SHIPPO_API_TOKEN) {
      return NextResponse.json(
        { error: "Missing SHIPPO_API_TOKEN in environment variables." },
        { status: 500 }
      )
    }

    const body = await req.json().catch(() => ({}))
    const orderId =
      typeof body?.orderId === "string" || typeof body?.orderId === "number"
        ? body.orderId
        : null

    if (!orderId) {
      return NextResponse.json({ error: "Missing orderId." }, { status: 400 })
    }

    const authHeader = req.headers.get("authorization")
    const bearerToken =
      authHeader && authHeader.startsWith("Bearer ")
        ? authHeader.slice("Bearer ".length).trim()
        : ""

    if (!bearerToken) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 })
    }

    const {
      data: { user },
      error: userError,
    } = await supabaseAdmin.auth.getUser(bearerToken)

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 })
    }

    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .maybeSingle()

    if (orderError) {
      return NextResponse.json(
        { error: orderError.message || "Failed to load order." },
        { status: 400 }
      )
    }

    if (!order) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 })
    }

    const sellerUserId =
      order.seller_id || order.seller_user_id || order.shop_owner_id || null

    if (!sellerUserId) {
      return NextResponse.json(
        { error: "This order is missing seller ownership data." },
        { status: 400 }
      )
    }

    if (sellerUserId !== user.id) {
      return NextResponse.json(
        { error: "You do not have permission to create a label for this order." },
        { status: 403 }
      )
    }

    const { data: sellerProfile, error: sellerProfileError } = await supabaseAdmin
      .from("seller_shipping_profiles")
      .select(
        "full_name, company, email, phone, address_line_1, address_line_2, city, state, postal_code, country"
      )
      .eq("user_id", user.id)
      .maybeSingle()

    if (sellerProfileError) {
      return NextResponse.json(
        {
          error:
            sellerProfileError.message || "Failed to load seller shipping profile.",
        },
        { status: 400 }
      )
    }

    if (!sellerProfile) {
      return NextResponse.json(
        { error: "Seller shipping profile not found." },
        { status: 400 }
      )
    }

    const sellerValidationError = validateSellerProfile(
      sellerProfile as SellerShippingProfile
    )

    if (sellerValidationError) {
      return NextResponse.json({ error: sellerValidationError }, { status: 400 })
    }

    const shippingAddress = normalizeShippingAddress(order.shipping_address)
    const customerValidationError = validateCustomerAddress(shippingAddress)

    if (customerValidationError) {
      return NextResponse.json(
        { error: customerValidationError },
        { status: 400 }
      )
    }

    const primaryProductId = getPrimaryProductId(order.items)

    if (!primaryProductId) {
      return NextResponse.json(
        { error: "No product found on this order to build parcel details." },
        { status: 400 }
      )
    }

    const { data: product, error: productError } = await supabaseAdmin
      .from("products")
      .select("weight, weight_unit, length, width, height, distance_unit")
      .eq("id", primaryProductId)
      .maybeSingle()

    if (productError) {
      return NextResponse.json(
        { error: productError.message || "Failed to load product shipping data." },
        { status: 400 }
      )
    }

    if (!product) {
      return NextResponse.json(
        { error: "Product shipping data not found." },
        { status: 404 }
      )
    }

    if (
      !product.weight ||
      !product.length ||
      !product.width ||
      !product.height
    ) {
      return NextResponse.json(
        {
          error:
            "Product is missing shipping dimensions or weight. Add weight, length, width, and height first.",
        },
        { status: 400 }
      )
    }

    const shipmentRes = await fetch("https://api.goshippo.com/shipments/", {
      method: "POST",
      headers: {
        Authorization: `ShippoToken ${SHIPPO_API_TOKEN}`,
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
          email: sellerProfile.email || "",
          phone: sellerProfile.phone || "",
        },
        address_to: {
          name: shippingAddress.full_name,
          street1: shippingAddress.address_line_1,
          street2: shippingAddress.address_line_2 || "",
          city: shippingAddress.city,
          state: shippingAddress.state,
          zip: shippingAddress.postal_code,
          country: shippingAddress.country,
          email: shippingAddress.email || order.customer_email || "",
          phone: shippingAddress.phone || "",
        },
        parcels: [
          {
            length: String(product.length),
            width: String(product.width),
            height: String(product.height),
            distance_unit: product.distance_unit || "in",
            weight: String(product.weight),
            mass_unit: product.weight_unit || "lb",
          },
        ],
        async: false,
      }),
    })

    const shipment = await shipmentRes.json()

    if (!shipmentRes.ok) {
      return NextResponse.json(
        { error: shipment?.detail || shipment?.error || "Failed to create shipment." },
        { status: 400 }
      )
    }

    if (!Array.isArray(shipment?.rates) || shipment.rates.length === 0) {
      return NextResponse.json(
        { error: "No shipping rates were returned by Shippo." },
        { status: 400 }
      )
    }

    const rate = shipment.rates[0]

    if (!rate?.object_id) {
      return NextResponse.json(
        { error: "Shippo rate object_id is missing." },
        { status: 400 }
      )
    }

    const transactionRes = await fetch("https://api.goshippo.com/transactions/", {
      method: "POST",
      headers: {
        Authorization: `ShippoToken ${SHIPPO_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        rate: rate.object_id,
        label_file_type: "PDF",
        async: false,
      }),
    })

    const transaction = await transactionRes.json()

    if (!transactionRes.ok || transaction?.status !== "SUCCESS") {
      return NextResponse.json(
        {
          error: transaction?.messages?.[0]?.text || "Failed to create label.",
          transaction,
        },
        { status: 400 }
      )
    }

    const trackingNumber =
      transaction?.tracking_number || transaction?.tracking_number_provider || null

    const labelUrl = transaction?.label_url || null

    const { error: updateOrderError } = await supabaseAdmin
      .from("orders")
      .update({
        tracking_number: trackingNumber,
        shipping_status: "shipped",
        shippo_label_url: labelUrl,
        shippo_carrier: transaction?.rate?.provider || null,
        shippo_rate_amount: transaction?.rate?.amount || null,
      })
      .eq("id", orderId)

    if (updateOrderError) {
      return NextResponse.json(
        {
          error:
            updateOrderError.message ||
            "Label created, but order could not be updated.",
          label_url: labelUrl,
          tracking_number: trackingNumber,
        },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      label_url: labelUrl,
      tracking_number: trackingNumber,
      carrier: transaction?.rate?.provider || null,
      rate_amount: transaction?.rate?.amount || null,
    })
  } catch (error: any) {
    console.error("Shippo create shipment error:", error)

    return NextResponse.json(
      { error: error?.message || "Shippo create shipment failed." },
      { status: 500 }
    )
  }
}