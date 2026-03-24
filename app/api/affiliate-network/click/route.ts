import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"

export async function POST(req: Request) {
  try {
    const { code } = await req.json()

    if (!code) {
      return NextResponse.json({ error: "Missing code." }, { status: 400 })
    }

    // jwenn referral link
    const { data: link, error } = await supabaseAdmin
      .from("affiliate_links")
      .select("*")
      .eq("code", code)
      .single()

    if (error || !link) {
      return NextResponse.json({ error: "Invalid code." }, { status: 404 })
    }

    // ajoute click
    await supabaseAdmin
      .from("affiliate_links")
      .update({ clicks: (link.clicks || 0) + 1 })
      .eq("id", link.id)

    return NextResponse.json({ success: true, link })
  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}