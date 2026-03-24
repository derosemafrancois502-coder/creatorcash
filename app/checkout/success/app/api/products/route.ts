import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("products")
      .select("id, name, user_id")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("PRODUCTS API ERROR:", error)
      return NextResponse.json(
        { error: error.message || "Failed to load products." },
        { status: 500 }
      )
    }

    return NextResponse.json({
      products: data || [],
    })
  } catch (error) {
    console.error("PRODUCTS API CATCH ERROR:", error)
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to load products.",
      },
      { status: 500 }
    )
  }
}