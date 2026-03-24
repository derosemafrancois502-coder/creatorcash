import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

type SaleRow = {
  id: string
  affiliate_user_id: string
  affiliate_link_id: string
  order_id: number | null
  stripe_session_id: string | null
  product_id: number | null
  gross_amount: number | string | null
  commission_amount: number | string | null
  created_at: string
}

type PayoutRow = {
  id: string
  affiliate_user_id: string
  amount: number | string | null
  note: string | null
  created_at: string
}

type UserRow = {
  id: string
  username: string | null
  name: string | null
  brand_name: string | null
}

export async function GET() {
  try {
    const [salesRes, payoutsRes, usersRes] = await Promise.all([
      supabase.from("affiliate_sales").select("*").order("created_at", { ascending: false }),
      supabase.from("affiliate_payouts").select("*").order("created_at", { ascending: false }),
      supabase.from("users").select("id, username, name, brand_name"),
    ])

    if (salesRes.error) throw salesRes.error
    if (payoutsRes.error) throw payoutsRes.error
    if (usersRes.error) throw usersRes.error

    const sales = (salesRes.data ?? []) as SaleRow[]
    const payouts = (payoutsRes.data ?? []) as PayoutRow[]
    const users = (usersRes.data ?? []) as UserRow[]

    const userMap = new Map(
      users.map((u) => [
        u.id,
        u.brand_name || u.name || u.username || "Unknown Creator",
      ])
    )

    const summaryMap = new Map<
      string,
      {
        affiliate_user_id: string
        name: string
        salesCount: number
        grossSales: number
        commissions: number
        paidOut: number
        pending: number
      }
    >()

    for (const sale of sales) {
      const id = String(sale.affiliate_user_id)
      const current = summaryMap.get(id) || {
        affiliate_user_id: id,
        name: userMap.get(id) || "Unknown Creator",
        salesCount: 0,
        grossSales: 0,
        commissions: 0,
        paidOut: 0,
        pending: 0,
      }

      current.salesCount += 1
      current.grossSales += Number(sale.gross_amount ?? 0)
      current.commissions += Number(sale.commission_amount ?? 0)

      summaryMap.set(id, current)
    }

    for (const payout of payouts) {
      const id = String(payout.affiliate_user_id)
      const current = summaryMap.get(id) || {
        affiliate_user_id: id,
        name: userMap.get(id) || "Unknown Creator",
        salesCount: 0,
        grossSales: 0,
        commissions: 0,
        paidOut: 0,
        pending: 0,
      }

      current.paidOut += Number(payout.amount ?? 0)
      summaryMap.set(id, current)
    }

    const summaries = Array.from(summaryMap.values())
      .map((row) => ({
        ...row,
        pending: Number((row.commissions - row.paidOut).toFixed(2)),
      }))
      .sort((a, b) => b.commissions - a.commissions)

    const totalCommissions = summaries.reduce((sum, row) => sum + row.commissions, 0)
    const totalPaidOut = summaries.reduce((sum, row) => sum + row.paidOut, 0)
    const totalPending = summaries.reduce((sum, row) => sum + row.pending, 0)

    return NextResponse.json({
      summaries,
      recentSales: sales.slice(0, 20),
      recentPayouts: payouts.slice(0, 20),
      totals: {
        totalCommissions: Number(totalCommissions.toFixed(2)),
        totalPaidOut: Number(totalPaidOut.toFixed(2)),
        totalPending: Number(totalPending.toFixed(2)),
      },
    })
  } catch (error) {
    console.error("affiliate commissions error:", error)
    return NextResponse.json(
      { error: "Failed to load commission engine data." },
      { status: 500 }
    )
  }
}