import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const user_id =
      typeof body?.user_id === "string" ? body.user_id.trim() : null

    const module =
      typeof body?.module === "string" ? body.module.trim() : ""

    const title =
      typeof body?.title === "string" && body.title.trim()
        ? body.title.trim()
        : "Untitled"

    const input =
      body?.input && typeof body.input === "object" ? body.input : null

    const output =
      typeof body?.output === "string" ? body.output.trim() : ""

    if (!module || !output) {
      return NextResponse.json(
        { error: "Missing required fields." },
        { status: 400 }
      )
    }

    const { data, error } = await supabaseAdmin
      .from("ai_history")
      .insert([
        {
          user_id,
          module,
          title,
          input,
          output,
        },
      ])
      .select()
      .single()

    if (error) {
      console.error("HISTORY SAVE ERROR:", error)
      return NextResponse.json(
        { error: error.message || "Failed to save history." },
        { status: 500 }
      )
    }

    return NextResponse.json({ item: data })
  } catch (err) {
    console.error("HISTORY SAVE CATCH ERROR:", err)
    return NextResponse.json(
      { error: "Failed to save history." },
      { status: 500 }
    )
  }
}