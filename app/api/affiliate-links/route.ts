import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const affiliateUserId = searchParams.get("affiliateUserId")

    if (!affiliateUserId) {
      return NextResponse.json(
        { error: "affiliateUserId is required." },
        { status: 400 }
      )
    }

    const { data: links, error: linksError } = await supabase
      .from("affiliate_links")
      .select("*")
      .eq("affiliate_user_id", affiliateUserId)
      .order("created_at", { ascending: false })

    if (linksError) throw linksError

    const { data: clicks, error: clicksError } = await supabase
      .from("affiliate_link_clicks")
      .select("affiliate_link_id")

    if (clicksError) throw clicksError

    const clickCountMap = new Map<string, number>()

    for (const click of clicks ?? []) {
      const key = String(click.affiliate_link_id)
      clickCountMap.set(key, (clickCountMap.get(key) || 0) + 1)
    }

    const rows = (links ?? []).map((link) => ({
      ...link,
      clicks: clickCountMap.get(String(link.id)) || 0,
      referral_url: `${process.env.NEXT_PUBLIC_APP_URL || ""}/a/${link.code}`,
    }))

    return NextResponse.json({ links: rows })
  } catch (error) {
    console.error("affiliate links GET error:", error)
    return NextResponse.json(
      { error: "Failed to load affiliate links." },
      { status: 500 }
    )
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json()

    const id = typeof body?.id === "string" ? body.id.trim() : ""
    const isActive =
      typeof body?.is_active === "boolean" ? body.is_active : null

    if (!id || isActive === null) {
      return NextResponse.json(
        { error: "id and is_active are required." },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from("affiliate_links")
      .update({ is_active: isActive })
      .eq("id", id)
      .select("*")
      .single()

    if (error) throw error

    return NextResponse.json({ link: data })
  } catch (error) {
    console.error("affiliate links PATCH error:", error)
    return NextResponse.json(
      { error: "Failed to update affiliate link." },
      { status: 500 }
    )
  }
}