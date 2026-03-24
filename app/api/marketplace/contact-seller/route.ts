import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(req: Request) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const productId = Number(body?.productId)

    if (!productId || Number.isNaN(productId)) {
      return NextResponse.json({ error: "Invalid productId" }, { status: 400 })
    }

    const { data: product, error: productError } = await supabase
      .from("products")
      .select("id, user_id, name")
      .eq("id", productId)
      .maybeSingle()

    if (productError || !product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    const sellerUserId = String(product.user_id)
    const buyerUserId = user.id

    if (sellerUserId === buyerUserId) {
      return NextResponse.json(
        { error: "You cannot contact yourself for your own product." },
        { status: 400 }
      )
    }

    const { data: existingConversation, error: existingError } = await supabase
      .from("marketplace_conversations")
      .select("id")
      .eq("product_id", productId)
      .eq("buyer_user_id", buyerUserId)
      .eq("seller_user_id", sellerUserId)
      .maybeSingle()

    if (existingError) {
      return NextResponse.json({ error: existingError.message }, { status: 400 })
    }

    if (existingConversation?.id) {
      return NextResponse.json({
        ok: true,
        conversationId: existingConversation.id,
      })
    }

    const { data: createdConversation, error: createError } = await supabase
      .from("marketplace_conversations")
      .insert({
        product_id: productId,
        buyer_user_id: buyerUserId,
        seller_user_id: sellerUserId,
      })
      .select("id")
      .single()

    if (createError || !createdConversation) {
      return NextResponse.json(
        { error: createError?.message || "Could not create conversation" },
        { status: 400 }
      )
    }

    return NextResponse.json({
      ok: true,
      conversationId: createdConversation.id,
    })
  } catch (error) {
    console.error("contact-seller route error:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}