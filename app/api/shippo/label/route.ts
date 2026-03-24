import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

function getServerSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceRole) {
    throw new Error("Missing Supabase server environment variables.")
  }

  return createClient(url, serviceRole)
}

function pick(obj: Record<string, any> | null | undefined, keys: string[], fallback = "") {
  if (!obj) return fallback
  for (const key of keys) {
    const value = obj[key]
    if (value !== undefined && value !== null && value !== "") {
      return String(value)
    }
  }
  return fallback
}

async function shippoFetch(path: string, init: RequestInit) {
  const token =
    process.env.SHIPPO_API_KEY ||
    process.env.SHIPPO_TOKEN ||
    process.env.SHIPPO_SECRET_KEY

  if (!token) {
    throw new Error("Missing Shippo API key in env.")
  }

  const res = await fetch(`https://api.goshippo.com${path}`, {
    ...init,
    headers: {
      Authorization: `ShippoToken ${token}`,
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
  })

  const data = await res.json()
  if (!res.ok) {
    throw new Error(data?.detail || data?.error || "Shippo request failed.")
  }

  return data
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const orderId = String(body?.orderId || "")
    const parcel = body?.parcel

    if (!orderId) {
      return NextResponse.json({ error: "Missing orderId." }, { status: 400 })
    }

    const supabase = getServerSupabase()

    const [{ data: order }, { data: address }, { data: shipment }, { data: items }] =
      await Promise.all([
        supabase.from("orders").select("*").eq("id", orderId).maybeSingle(),
        supabase
          .from("order_shipping_addresses")
          .select("*")
          .eq("order_id", orderId)
          .maybeSingle(),
        supabase.from("shipments").select("*").eq("order_id", orderId).maybeSingle(),
        supabase.from("order_items").select("*").eq("order_id", orderId),
      ])

    if (!order) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 })
    }

    if (!address) {
      return NextResponse.json(
        { error: "Order shipping address not found." },
        { status: 400 }
      )
    }

    const sellerProductId =
      items?.[0]?.product_id ??
      items?.[0]?.productId ??
      null

    if (!sellerProductId) {
      return NextResponse.json(
        { error: "No product found on this order." },
        { status: 400 }
      )
    }

    const { data: product } = await supabase
      .from("products")
      .select("user_id")
      .eq("id", sellerProductId)
      .maybeSingle()

    if (!product?.user_id) {
      return NextResponse.json(
        { error: "Could not resolve seller for this order." },
        { status: 400 }
      )
    }

    const { data: shippingProfile } = await supabase
      .from("seller_shipping_profiles")
      .select("*")
      .eq("user_id", product.user_id)
      .maybeSingle()

    if (!shippingProfile) {
      return NextResponse.json(
        { error: "Seller shipping profile not found." },
        { status: 400 }
      )
    }

    const addressFrom = {
      name: pick(shippingProfile, ["name", "full_name", "contact_name", "store_name"], "Seller"),
      company: pick(shippingProfile, ["company", "business_name", "store_name"], ""),
      street1: pick(shippingProfile, ["street1", "address1", "line1"]),
      street2: pick(shippingProfile, ["street2", "address2", "line2"]),
      city: pick(shippingProfile, ["city"]),
      state: pick(shippingProfile, ["state", "province"]),
      zip: pick(shippingProfile, ["zip", "postal_code"]),
      country: pick(shippingProfile, ["country"], "US"),
      phone: pick(shippingProfile, ["phone"]),
      email: pick(shippingProfile, ["email"]),
    }

    const addressTo = {
      name: pick(address, ["name"], `${pick(address, ["first_name"])} ${pick(address, ["last_name"])}`.trim() || "Customer"),
      company: pick(address, ["company"]),
      street1: pick(address, ["street1", "address1", "line1"]),
      street2: pick(address, ["street2", "address2", "line2"]),
      city: pick(address, ["city"]),
      state: pick(address, ["state", "province"]),
      zip: pick(address, ["zip", "postal_code"]),
      country: pick(address, ["country"], "US"),
      phone: pick(address, ["phone"]),
      email: pick(address, ["email"]),
    }

    if (!addressFrom.street1 || !addressFrom.city || !addressFrom.state || !addressFrom.zip) {
      return NextResponse.json(
        { error: "Seller shipping profile is missing origin address fields." },
        { status: 400 }
      )
    }

    if (!addressTo.street1 || !addressTo.city || !addressTo.state || !addressTo.zip) {
      return NextResponse.json(
        { error: "Customer shipping address is missing required fields." },
        { status: 400 }
      )
    }

    const shipmentPayload = {
      address_from: addressFrom,
      address_to: addressTo,
      parcels: [
        {
          length: String(parcel?.length ?? 10),
          width: String(parcel?.width ?? 8),
          height: String(parcel?.height ?? 4),
          distance_unit: String(parcel?.distance_unit ?? "in"),
          weight: String(parcel?.weight ?? 1),
          mass_unit: String(parcel?.weight_unit ?? "lb"),
        },
      ],
      async: false,
    }

    const shippoShipment = await shippoFetch("/shipments/", {
      method: "POST",
      body: JSON.stringify(shipmentPayload),
    })

    const rates = Array.isArray(shippoShipment?.rates) ? shippoShipment.rates : []
    if (rates.length === 0) {
      return NextResponse.json(
        { error: "No shipping rates returned by Shippo." },
        { status: 400 }
      )
    }

    const cheapestRate = [...rates].sort(
      (a, b) => Number(a.amount_local ?? a.amount ?? 0) - Number(b.amount_local ?? b.amount ?? 0)
    )[0]

    const transaction = await shippoFetch("/transactions/", {
      method: "POST",
      body: JSON.stringify({
        rate: cheapestRate.object_id,
        label_file_type: "PDF",
        async: false,
      }),
    })

    const labelUrl =
      transaction?.label_url ||
      transaction?.label_file ||
      transaction?.label_pdf_url ||
      null

    const trackingNumber =
      transaction?.tracking_number ||
      transaction?.tracking_num ||
      null

    if (shipment?.id) {
      await supabase
        .from("shipments")
        .update({
          status: "label_created",
          carrier: cheapestRate?.provider ?? cheapestRate?.carrier ?? null,
          service: cheapestRate?.servicelevel?.name ?? cheapestRate?.servicelevel ?? null,
          tracking_number: trackingNumber,
          label_url: labelUrl,
          shippo_shipment_id: shippoShipment?.object_id ?? null,
          shippo_transaction_id: transaction?.object_id ?? null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", shipment.id)
    } else {
      await supabase.from("shipments").insert({
        order_id: orderId,
        status: "label_created",
        carrier: cheapestRate?.provider ?? cheapestRate?.carrier ?? null,
        service: cheapestRate?.servicelevel?.name ?? cheapestRate?.servicelevel ?? null,
        tracking_number: trackingNumber,
        label_url: labelUrl,
        shippo_shipment_id: shippoShipment?.object_id ?? null,
        shippo_transaction_id: transaction?.object_id ?? null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
    }

    return NextResponse.json({
      ok: true,
      label_url: labelUrl,
      tracking_number: trackingNumber,
    })
  } catch (error) {
    console.error("SHIPPO LABEL ERROR:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Could not generate label.",
      },
      { status: 500 }
    )
  }
}