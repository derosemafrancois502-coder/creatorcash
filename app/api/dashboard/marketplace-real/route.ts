import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  try {
    const [usersRes, productsRes, ordersRes] = await Promise.all([
      supabase.from("users").select("id", { count: "exact" }),
      supabase.from("products").select("id", { count: "exact" }),
      supabase.from("orders").select("id,total,created_at", { count: "exact" }),
    ])

    if (usersRes.error) throw usersRes.error
    if (productsRes.error) throw productsRes.error
    if (ordersRes.error) throw ordersRes.error

    const creators = usersRes.count ?? 0
    const products = productsRes.count ?? 0
    const orders = ordersRes.data ?? []

    const revenue = orders.reduce((sum, row) => {
      return sum + Number(row.total ?? 0)
    }, 0)

    const now = new Date()
    const last30 = new Date()
    last30.setDate(now.getDate() - 30)

    const prev30 = new Date()
    prev30.setDate(now.getDate() - 60)

    const currentWindowRevenue = orders
      .filter((row) => {
        const d = new Date(row.created_at)
        return d >= last30
      })
      .reduce((sum, row) => sum + Number(row.total ?? 0), 0)

    const previousWindowRevenue = orders
      .filter((row) => {
        const d = new Date(row.created_at)
        return d >= prev30 && d < last30
      })
      .reduce((sum, row) => sum + Number(row.total ?? 0), 0)

    let growth = 0
    if (previousWindowRevenue > 0) {
      growth = Number(
        (((currentWindowRevenue - previousWindowRevenue) / previousWindowRevenue) * 100).toFixed(2)
      )
    }

    return NextResponse.json({
      stats: {
        creators,
        products,
        revenue: Number(revenue.toFixed(2)),
        growth,
      },
      recentSignals: [
        `Creators in system: ${creators}`,
        `Products in marketplace: ${products}`,
        `Total revenue tracked: $${revenue.toFixed(2)}`,
        `30-day revenue growth: ${growth}%`,
      ],
    })
  } catch (error) {
    console.error("marketplace-real dashboard error:", error)
    return NextResponse.json(
      { error: "Failed to load marketplace dashboard." },
      { status: 500 }
    )
  }
}