import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import crypto from "crypto"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function generateCode() {
  return crypto.randomBytes(4).toString("hex")
}

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const affiliateUserId = body?.affiliateUserId
    const productId = body?.productId
    const shopUserId = body?.shopUserId

    if (!affiliateUserId || !productId || !shopUserId) {
      return NextResponse.json(
        { error: "Missing required fields." },
        { status: 400 }
      )
    }

    const code = generateCode()

    const { data, error } = await supabase
      .from("affiliate_links")
      .insert({
        affiliate_user_id: affiliateUserId,
        product_id: productId,
        shop_user_id: shopUserId,
        code,
        is_active: true,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ link: data })
  } catch (error) {
    console.error("create link error:", error)
    return NextResponse.json(
      { error: "Failed to create link." },
      { status: 500 }
    )
  }
}