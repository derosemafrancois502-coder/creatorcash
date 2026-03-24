import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  try {
    const [ordersRes, payoutsRes, affiliateSalesRes] = await Promise.all([
      supabase.from("orders").select("id,total,created_at,payment_status,status"),
      supabase.from("affiliate_payouts").select("id,amount,created_at"),
      supabase.from("affiliate_sales").select("id,commission_amount,created_at"),
    ])

    if (ordersRes.error) throw ordersRes.error
    if (payoutsRes.error) throw payoutsRes.error
    if (affiliateSalesRes.error) throw affiliateSalesRes.error

    const orders = ordersRes.data ?? []
    const payouts = payoutsRes.data ?? []
    const affiliateSales = affiliateSalesRes.data ?? []

    const totalRevenue = orders.reduce((sum, row) => sum + Number(row.total ?? 0), 0)
    const totalOrders = orders.length
    const totalPayouts = payouts.reduce((sum, row) => sum + Number(row.amount ?? 0), 0)
    const totalAffiliateCommissions = affiliateSales.reduce(
      (sum, row) => sum + Number(row.commission_amount ?? 0),
      0
    )

    const now = new Date()
    const last30 = new Date()
    last30.setDate(now.getDate() - 30)

    const revenueLast30 = orders
      .filter((row) => new Date(row.created_at) >= last30)
      .reduce((sum, row) => sum + Number(row.total ?? 0), 0)

    const netRevenue = totalRevenue - totalPayouts - totalAffiliateCommissions

    return NextResponse.json({
      stats: {
        totalRevenue: Number(totalRevenue.toFixed(2)),
        totalOrders,
        totalPayouts: Number(totalPayouts.toFixed(2)),
        totalAffiliateCommissions: Number(totalAffiliateCommissions.toFixed(2)),
        revenueLast30: Number(revenueLast30.toFixed(2)),
        netRevenue: Number(netRevenue.toFixed(2)),
      },
      recentSignals: [
        `Total revenue: $${totalRevenue.toFixed(2)}`,
        `Orders tracked: ${totalOrders}`,
        `Affiliate commissions: $${totalAffiliateCommissions.toFixed(2)}`,
        `Payouts sent: $${totalPayouts.toFixed(2)}`,
        `Net revenue: $${netRevenue.toFixed(2)}`,
      ],
    })
  } catch (error) {
    console.error("revenue-real dashboard error:", error)
    return NextResponse.json(
      { error: "Failed to load revenue dashboard." },
      { status: 500 }
    )
  }
}