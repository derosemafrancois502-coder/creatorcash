import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(
  _req: Request,
  context: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await context.params

    const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || "").replace(/\/+$/, "")

    if (!code) {
      return NextResponse.redirect(`${baseUrl}/marketplace`)
    }

    const { data: link, error } = await supabase
      .from("affiliate_links")
      .select("*")
      .eq("code", code)
      .eq("is_active", true)
      .maybeSingle()

    if (error || !link) {
      return NextResponse.redirect(`${baseUrl}/marketplace`)
    }

    await supabase.from("affiliate_link_clicks").insert({
      affiliate_link_id: link.id,
      code: link.code,
      product_id: link.product_id,
      affiliate_user_id: link.affiliate_user_id,
    })

    return NextResponse.redirect(
      `${baseUrl}/products/${link.product_id}?ref=${link.code}`
    )
  } catch (error) {
    console.error("affiliate redirect error:", error)
    const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || "").replace(/\/+$/, "")
    return NextResponse.redirect(`${baseUrl}/marketplace`)
  }
}