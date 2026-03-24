import { NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import Stripe from "stripe"

type CartItem = {
  id: string
  name: string
  price: number
  image_url: string | null
  quantity: number
}

type ShippingMethod = "pickup" | "standard" | "express"

const STATE_TAX_RATES: Record<string, number> = {
  AL: 0.04,
  AK: 0.0,
  AZ: 0.056,
  AR: 0.065,
  CA: 0.0725,
  CO: 0.029,
  CT: 0.0635,
  DE: 0.0,
  FL: 0.06,
  GA: 0.04,
  HI: 0.04,
  ID: 0.06,
  IL: 0.0625,
  IN: 0.07,
  IA: 0.06,
  KS: 0.065,
  KY: 0.06,
  LA: 0.0445,
  ME: 0.055,
  MD: 0.06,
  MA: 0.0625,
  MI: 0.06,
  MN: 0.06875,
  MS: 0.07,
  MO: 0.04225,
  MT: 0.0,
  NE: 0.055,
  NV: 0.0685,
  NH: 0.0,
  NJ: 0.06625,
  NM: 0.05125,
  NY: 0.04,
  NC: 0.0475,
  ND: 0.05,
  OH: 0.0575,
  OK: 0.045,
  OR: 0.0,
  PA: 0.06,
  RI: 0.07,
  SC: 0.06,
  SD: 0.045,
  TN: 0.07,
  TX: 0.0625,
  UT: 0.061,
  VT: 0.06,
  VA: 0.053,
  WA: 0.065,
  WV: 0.06,
  WI: 0.05,
  WY: 0.04,
}

function getShippingFee(method: ShippingMethod, subtotal: number) {
  if (method === "pickup") return 0
  if (method === "standard") return subtotal > 50 ? 0 : 6.99
  if (method === "express") return 14.99
  return 0
}

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const items: CartItem[] = Array.isArray(body.items) ? body.items : []
    const shippingMethod: ShippingMethod = body.shippingMethod || "standard"
    const stateCode: string = body.stateCode || "KY"
    const sellerStripeAccountId =
      typeof body.sellerStripeAccountId === "string"
        ? body.sellerStripeAccountId.trim()
        : ""

    console.log("CHECKOUT BODY:", {
      itemsCount: items.length,
      shippingMethod,
      stateCode,
      sellerStripeAccountId,
    })

    if (!items.length) {
      return NextResponse.json({ error: "Cart is empty." }, { status: 400 })
    }

    if (!sellerStripeAccountId) {
      return NextResponse.json(
        { error: "Missing sellerStripeAccountId." },
        { status: 400 }
      )
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: "Missing STRIPE_SECRET_KEY in .env.local" },
        { status: 500 }
      )
    }

    if (!process.env.NEXT_PUBLIC_APP_URL) {
      return NextResponse.json(
        { error: "Missing NEXT_PUBLIC_APP_URL in .env.local" },
        { status: 500 }
      )
    }

    // ✅ Guard seller Stripe account before creating checkout
    let sellerAccount: Stripe.Account
    try {
      sellerAccount = await stripe.accounts.retrieve(sellerStripeAccountId)
    } catch (accountError: unknown) {
      console.error("Stripe account retrieve error:", accountError)

      const message =
        accountError instanceof Error
          ? accountError.message
          : "Could not verify seller payout account."

      return NextResponse.json(
        { error: message || "Could not verify seller payout account." },
        { status: 400 }
      )
    }

    if (!sellerAccount) {
      return NextResponse.json(
        { error: "Seller Stripe account not found." },
        { status: 400 }
      )
    }

    if (!sellerAccount.charges_enabled || !sellerAccount.payouts_enabled) {
      return NextResponse.json(
        {
          error:
            "This seller account is not ready to receive payments yet. Please complete Stripe onboarding and enable payouts.",
        },
        { status: 400 }
      )
    }

    const subtotal = items.reduce((sum, item) => {
      return sum + Number(item.price) * Number(item.quantity)
    }, 0)

    const shipping = getShippingFee(shippingMethod, subtotal)
    const taxRate = STATE_TAX_RATES[stateCode] ?? 0.06
    const tax = subtotal * taxRate
    const total = subtotal + shipping + tax

    // CreatorGoat takes 2% on product subtotal only
    const platformFee = subtotal * 0.02

    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = items.map(
      (item) => {
        const productData: Stripe.Checkout.SessionCreateParams.LineItem.PriceData.ProductData =
          {
            name: item.name,
          }

        if (item.image_url) {
          productData.images = [item.image_url]
        }

        return {
          quantity: item.quantity,
          price_data: {
            currency: "usd",
            product_data: productData,
            unit_amount: Math.round(Number(item.price) * 100),
          },
        }
      }
    )

    if (shipping > 0) {
      lineItems.push({
        quantity: 1,
        price_data: {
          currency: "usd",
          product_data: {
            name:
              shippingMethod === "express"
                ? "Express Shipping"
                : "Standard Shipping",
          },
          unit_amount: Math.round(shipping * 100),
        },
      })
    }

    if (tax > 0) {
      lineItems.push({
        quantity: 1,
        price_data: {
          currency: "usd",
          product_data: {
            name: `Sales Tax (${stateCode})`,
          },
          unit_amount: Math.round(tax * 100),
        },
      })
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: lineItems,
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/cart`,
      shipping_address_collection:
        shippingMethod === "pickup"
          ? undefined
          : {
              allowed_countries: ["US"],
            },
      phone_number_collection: {
        enabled: true,
      },
      payment_intent_data: {
        application_fee_amount: Math.round(platformFee * 100),
        transfer_data: {
          destination: sellerStripeAccountId,
        },
      },
      metadata: {
        seller_stripe_account_id: sellerStripeAccountId,
        shipping_method: shippingMethod,
        state_code: stateCode,
        subtotal: subtotal.toFixed(2),
        shipping: shipping.toFixed(2),
        tax: tax.toFixed(2),
        total: total.toFixed(2),
        platform_fee: platformFee.toFixed(2),
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (error: unknown) {
    console.error("Checkout error full:", error)

    const message =
      error instanceof Error
        ? error.message
        : "Failed to create checkout session."

    return NextResponse.json({ error: message }, { status: 500 })
  }
}