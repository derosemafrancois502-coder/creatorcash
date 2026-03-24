import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"

export async function POST(req: Request) {
  try {
    const { id } = await req.json()

    if (!id) {
      return NextResponse.json(
        { error: "id is required." },
        { status: 400 }
      )
    }

    const { error } = await supabaseAdmin
      .from("ai_history")
      .delete()
      .eq("id", id)

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json(
      { error: "Delete failed" },
      { status: 500 }
    )
  }
}