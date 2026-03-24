import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"

type HistoryRow = {
  id: string
  user_id: string | null
  module: string | null
  title: string | null
  input: Record<string, unknown> | null
  output: string | null
  created_at: string | null
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)

    const moduleName = searchParams.get("module")?.trim() || ""
    const query = searchParams.get("q")?.trim() || ""

    let db = supabaseAdmin
      .from("ai_history")
      .select("*")
      .order("created_at", { ascending: false })

    if (moduleName) {
      db = db.eq("module", moduleName)
    }

    const { data, error } = await db

    if (error) {
      console.error("HISTORY LIST ERROR:", error)
      return NextResponse.json(
        { error: error.message || "Failed to load history." },
        { status: 500 }
      )
    }

    let items: HistoryRow[] = Array.isArray(data) ? (data as HistoryRow[]) : []

    if (query) {
      const q = query.toLowerCase()

      items = items.filter((item) => {
        const moduleMatch = String(item.module || "")
          .toLowerCase()
          .includes(q)

        const titleMatch = String(item.title || "")
          .toLowerCase()
          .includes(q)

        const outputMatch = String(item.output || "")
          .toLowerCase()
          .includes(q)

        const inputMatch = JSON.stringify(item.input || {})
          .toLowerCase()
          .includes(q)

        return moduleMatch || titleMatch || outputMatch || inputMatch
      })
    }

    return NextResponse.json({
      items,
    })
  } catch (error) {
    console.error("HISTORY LIST CATCH ERROR:", error)
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to load history.",
      },
      { status: 500 }
    )
  }
}