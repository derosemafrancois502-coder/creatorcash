import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"

export async function DELETE(req: Request) {
  try {
    const body = await req.json()

    const id = typeof body?.id === "string" ? body.id.trim() : ""

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
      console.error("HISTORY DELETE ERROR:", error)
      return NextResponse.json(
        { error: error.message || "Failed to delete history item." },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
    })
  } catch (error) {
    console.error("HISTORY DELETE CATCH ERROR:", error)
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to delete history.",
      },
      { status: 500 }
    )
  }
}