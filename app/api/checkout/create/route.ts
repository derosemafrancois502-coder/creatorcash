import { NextResponse } from "next/server"
import Stripe from "stripe"
import { createClient } from "@supabase/supabase-js"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

type CartItem = {
  id: number | string
  name: string
  price: number
  quantity: number
  image_url?: string | null
}

function getBaseUrl(req: Request) {
  const envUrl = process.env.NEXT_PUBLIC_APP_URL?.trim()
  if (envUrl) return envUrl.replace(/\/+$/, "")

  const url = new URL(req.url)
  return `${url.protocol}//${url.host}`
}

function isValidCartItem(item: unknown): item is CartItem {
  if (!item || typeof item !== "object") return false

  const x = item as Record<string, unknown>

  const validId = typeof x.id === "string" || typeof x.id === "number"

  const validName =
    typeof x.name === "string" && x.name.trim().length > 0

  const validPrice =
    typeof x.price === "number" &&
    Number.isFinite(x.price) &&
    x.price > 0

  const validQuantity =
    typeof x.quantity === "number" &&
    Number.isInteger(x.quantity) &&
    x.quantity > 0

  const validImage =
    x.image_url === undefined ||
    x.image_url === null ||
    typeof x.image_url === "string"

  return validId && validName && validPrice && validQuantity && validImage
}

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const rawCartItems: unknown[] = Array.isArray(body?.cartItems)
      ? body.cartItems
      : []

    const affiliateCode =
      typeof body?.affiliateCode === "string"
        ? body.affiliateCode.trim()
        : ""

    if (!rawCartItems.length) {
      return NextResponse.json(
        { error: "Cart is empty." },
        { status: 400 }
      )
    }

    const invalidItemExists = rawCartItems.some((item) => !isValidCartItem(item))

    if (invalidItemExists) {
      return NextResponse.json(
        { error: "Invalid cart item data." },
        { status: 400 }
      )
    }

    const validatedCartItems = rawCartItems.filter(isValidCartItem)

    const cartItems: CartItem[] = validatedCartItems.map((item) => ({
      id: item.id,
      name: item.name.trim(),
      price: Number(item.price),
      quantity: Number(item.quantity),
      image_url: item.image_url ?? null,
    }))

    const baseUrl = getBaseUrl(req)

    const successUrl =
      typeof body?.successUrl === "string" && body.successUrl.trim()
        ? body.successUrl.trim()
        : `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`

    const cancelUrl =
      typeof body?.cancelUrl === "string" && body.cancelUrl.trim()
        ? body.cancelUrl.trim()
        : `${baseUrl}/cart`

    let affiliateLinkId = ""
    let affiliateUserId = ""
    let affiliateProductId = ""
    let affiliateShopUserId = ""

    if (affiliateCode) {
      const { data: affiliateLink, error: affiliateError } = await supabaseAdmin
        .from("affiliate_links")
        .select("*")
        .eq("code", affiliateCode)
        .eq("is_active", true)
        .maybeSingle()

      if (affiliateError) {
        console.error("Affiliate lookup error:", affiliateError)
      }

      if (affiliateLink) {
        const cartHasAffiliateProduct = cartItems.some(
          (item) => String(item.id) === String(affiliateLink.product_id)
        )

        if (cartHasAffiliateProduct) {
          affiliateLinkId = String(affiliateLink.id ?? "")
          affiliateUserId = String(affiliateLink.affiliate_user_id ?? "")
          affiliateProductId = String(affiliateLink.product_id ?? "")
          affiliateShopUserId = String(affiliateLink.shop_user_id ?? "")
        }
      }
    }

    const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] =
      cartItems.map((item) => {
        const imageList =
          item.image_url &&
          typeof item.image_url === "string" &&
          item.image_url.startsWith("http")
            ? [item.image_url]
            : []

        return {
          quantity: item.quantity,
          price_data: {
            currency: "usd",
            unit_amount: Math.round(item.price * 100),
            product_data: {
              name: item.name,
              images: imageList,
            },
          },
        }
      })

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items,
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        cart_count: String(cartItems.length),

        cart_items: JSON.stringify(
          cartItems.map((item) => ({
            id: String(item.id),
            n: item.name,
            p: item.price,
            q: item.quantity,
          }))
        ),

        affiliate_code: affiliateCode || "",
        affiliate_link_id: affiliateLinkId,
        affiliate_user_id: affiliateUserId,
        affiliate_product_id: affiliateProductId,
        affiliate_shop_user_id: affiliateShopUserId,
      },
    })

    if (!session.url) {
      return NextResponse.json(
        { error: "Stripe did not return a checkout URL." },
        { status: 500 }
      )
    }

    return NextResponse.json({
      url: session.url,
      sessionId: session.id,
    })
  } catch (error) {
    console.error("checkout create error:", error)
    return NextResponse.json(
      { error: "Failed to create checkout session." },
      { status: 500 }
    )
  }
}