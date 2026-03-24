import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  try {
    const [linksRes, salesRes, payoutsRes] = await Promise.all([
      supabase.from("affiliate_links").select("*"),
      supabase.from("affiliate_sales").select("*"),
      supabase.from("affiliate_payouts").select("*"),
    ])

    if (linksRes.error) throw linksRes.error
    if (salesRes.error) throw salesRes.error
    if (payoutsRes.error) throw payoutsRes.error

    const links = linksRes.data ?? []
    const sales = salesRes.data ?? []
    const payouts = payoutsRes.data ?? []

    const affiliates = new Set(
      links.map((x) => x.affiliate_user_id).filter(Boolean)
    ).size

    const activeLinks = links.filter((x) => x.is_active).length

    const commissions = sales.reduce(
      (sum, row) => sum + Number(row.commission_amount ?? 0),
      0
    )

    const conversions = sales.length

    const paidOut = payouts.reduce(
      (sum, row) => sum + Number(row.amount ?? 0),
      0
    )

    const pendingCommissions = Math.max(commissions - paidOut, 0)

    return NextResponse.json({
      stats: {
        affiliates,
        activeLinks,
        commissions,
        conversions,
        paidOut,
        pendingCommissions,
      },
      modules: [
        {
          title: "Referral Links",
          description:
            "Create and track creator-to-creator referral links for products and shops.",
          status: "Ready",
          href: "/dashboard/cos/affiliate-network/referral-links",
        },
        {
          title: "Commission Engine",
          description:
            "Track commission amounts, payout values, and affiliate earnings.",
          status: "Ready",
          href: "/dashboard/cos/affiliate-network/commission-engine",
        },
        {
          title: "Network Growth",
          description:
            "Monitor affiliate expansion, active links, and conversion momentum.",
          status: "Ready",
          href: "/dashboard/cos/affiliate-network/network-growth",
        },
      ],
      recentSignals: [
        `Active affiliate links: ${activeLinks}`,
        `Affiliate conversions: ${conversions}`,
        `Tracked commissions: $${commissions.toFixed(2)}`,
        `Pending payouts: $${pendingCommissions.toFixed(2)}`,
      ],
    })
  } catch (error) {
    console.error("affiliate-network GET error:", error)
    return NextResponse.json(
      { error: "Failed to load affiliate network data." },
      { status: 500 }
    )
  }
}