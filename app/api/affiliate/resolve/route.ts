import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const code = searchParams.get("code")

    if (!code) {
      return NextResponse.json({ error: "code is required." }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("affiliate_links")
      .select("*")
      .eq("code", code)
      .eq("is_active", true)
      .maybeSingle()

    if (error) throw error

    if (!data) {
      return NextResponse.json(
        { error: "Affiliate code not found." },
        { status: 404 }
      )
    }

    return NextResponse.json({ link: data })
  } catch (error) {
    console.error("affiliate resolve error:", error)
    return NextResponse.json(
      { error: "Failed to resolve affiliate code." },
      { status: 500 }
    )
  }
}