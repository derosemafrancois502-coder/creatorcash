import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"

export async function POST(req: Request) {
  try {
    const { user_id, module, input, result } = await req.json()

    if (!module || !result) {
      return NextResponse.json(
        { error: "module and result are required." },
        { status: 400 }
      )
    }

    const { data, error } = await supabaseAdmin
      .from("ai_history")
      .insert({
        user_id: user_id ?? null,
        module,
        input: input ?? null,
        result,
      })
      .select()

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data,
    })
  } catch {
    return NextResponse.json(
      { error: "Save failed" },
      { status: 500 }
    )
  }
}