import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

type AffiliateLinkRow = {
  id: string
  affiliate_user_id: string
  product_id: number | null
  shop_user_id: string
  is_active: boolean
  created_at: string
}

type AffiliateSaleRow = {
  id: string
  affiliate_link_id: string
  affiliate_user_id: string
  product_id: number | null
  gross_amount: number | string | null
  commission_amount: number | string | null
  created_at: string
}

type UserRow = {
  id: string
  username: string | null
  name: string | null
  brand_name: string | null
}

type ProductRow = {
  id: number
  name: string
}

type ClickRow = {
  id: string
  affiliate_link_id: string
  affiliate_user_id: string | null
  product_id: number | null
  clicked_at: string
}

export async function GET() {
  try {
    const [linksRes, salesRes, usersRes, productsRes, clicksRes] = await Promise.all([
      supabase.from("affiliate_links").select("*"),
      supabase.from("affiliate_sales").select("*"),
      supabase.from("users").select("id, username, name, brand_name"),
      supabase.from("products").select("id, name"),
      supabase.from("affiliate_link_clicks").select("*"),
    ])

    if (linksRes.error) throw linksRes.error
    if (salesRes.error) throw salesRes.error
    if (usersRes.error) throw usersRes.error
    if (productsRes.error) throw productsRes.error
    if (clicksRes.error) throw clicksRes.error

    const links = (linksRes.data ?? []) as AffiliateLinkRow[]
    const sales = (salesRes.data ?? []) as AffiliateSaleRow[]
    const users = (usersRes.data ?? []) as UserRow[]
    const products = (productsRes.data ?? []) as ProductRow[]
    const clicks = (clicksRes.data ?? []) as ClickRow[]

    const userMap = new Map(
      users.map((u) => [
        u.id,
        u.brand_name || u.name || u.username || "Unknown Creator",
      ])
    )

    const productMap = new Map(products.map((p) => [p.id, p.name]))

    const activeLinks = links.filter((x) => x.is_active).length
    const totalLinks = links.length
    const totalConversions = sales.length
    const totalClicks = clicks.length

    const totalCommissions = sales.reduce((sum, row) => {
      return sum + Number(row.commission_amount ?? 0)
    }, 0)

    const totalGrossSales = sales.reduce((sum, row) => {
      return sum + Number(row.gross_amount ?? 0)
    }, 0)

    const topAffiliateMap = new Map<
      string,
      {
        affiliate_user_id: string
        name: string
        links: number
        clicks: number
        conversions: number
        commissions: number
        grossSales: number
      }
    >()

    for (const link of links) {
      const current = topAffiliateMap.get(link.affiliate_user_id) || {
        affiliate_user_id: link.affiliate_user_id,
        name: userMap.get(link.affiliate_user_id) || "Unknown Creator",
        links: 0,
        clicks: 0,
        conversions: 0,
        commissions: 0,
        grossSales: 0,
      }

      current.links += 1
      topAffiliateMap.set(link.affiliate_user_id, current)
    }

    for (const click of clicks) {
      if (!click.affiliate_user_id) continue

      const current = topAffiliateMap.get(click.affiliate_user_id) || {
        affiliate_user_id: click.affiliate_user_id,
        name: userMap.get(click.affiliate_user_id) || "Unknown Creator",
        links: 0,
        clicks: 0,
        conversions: 0,
        commissions: 0,
        grossSales: 0,
      }

      current.clicks += 1
      topAffiliateMap.set(click.affiliate_user_id, current)
    }

    for (const sale of sales) {
      const current = topAffiliateMap.get(sale.affiliate_user_id) || {
        affiliate_user_id: sale.affiliate_user_id,
        name: userMap.get(sale.affiliate_user_id) || "Unknown Creator",
        links: 0,
        clicks: 0,
        conversions: 0,
        commissions: 0,
        grossSales: 0,
      }

      current.conversions += 1
      current.commissions += Number(sale.commission_amount ?? 0)
      current.grossSales += Number(sale.gross_amount ?? 0)

      topAffiliateMap.set(sale.affiliate_user_id, current)
    }

    const topAffiliates = Array.from(topAffiliateMap.values())
      .sort((a, b) => b.commissions - a.commissions)
      .slice(0, 8)

    const topProductMap = new Map<
      number,
      {
        product_id: number
        name: string
        clicks: number
        conversions: number
        commissions: number
        grossSales: number
      }
    >()

    for (const click of clicks) {
      const productId = Number(click.product_id ?? 0)
      if (!productId) continue

      const current = topProductMap.get(productId) || {
        product_id: productId,
        name: productMap.get(productId) || `Product #${productId}`,
        clicks: 0,
        conversions: 0,
        commissions: 0,
        grossSales: 0,
      }

      current.clicks += 1
      topProductMap.set(productId, current)
    }

    for (const sale of sales) {
      const productId = Number(sale.product_id ?? 0)
      if (!productId) continue

      const current = topProductMap.get(productId) || {
        product_id: productId,
        name: productMap.get(productId) || `Product #${productId}`,
        clicks: 0,
        conversions: 0,
        commissions: 0,
        grossSales: 0,
      }

      current.conversions += 1
      current.commissions += Number(sale.commission_amount ?? 0)
      current.grossSales += Number(sale.gross_amount ?? 0)

      topProductMap.set(productId, current)
    }

    const topProducts = Array.from(topProductMap.values())
      .sort((a, b) => b.conversions - a.conversions)
      .slice(0, 8)

    const now = new Date()
    const last30 = new Date()
    last30.setDate(now.getDate() - 30)

    const prev30 = new Date()
    prev30.setDate(now.getDate() - 60)

    const currentConversions = sales.filter(
      (row) => new Date(row.created_at) >= last30
    ).length

    const previousConversions = sales.filter((row) => {
      const d = new Date(row.created_at)
      return d >= prev30 && d < last30
    }).length

    let conversionGrowth = 0
    if (previousConversions > 0) {
      conversionGrowth = Number(
        (
          ((currentConversions - previousConversions) / previousConversions) *
          100
        ).toFixed(2)
      )
    }

    return NextResponse.json({
      stats: {
        totalLinks,
        activeLinks,
        totalClicks,
        totalConversions,
        totalCommissions: Number(totalCommissions.toFixed(2)),
        totalGrossSales: Number(totalGrossSales.toFixed(2)),
        conversionGrowth,
      },
      topAffiliates,
      topProducts,
      recentSignals: [
        `Total affiliate links: ${totalLinks}`,
        `Active links: ${activeLinks}`,
        `Affiliate clicks: ${totalClicks}`,
        `Affiliate conversions: ${totalConversions}`,
        `Tracked commissions: $${totalCommissions.toFixed(2)}`,
        `Affiliate gross sales: $${totalGrossSales.toFixed(2)}`,
      ],
    })
  } catch (error) {
    console.error("affiliate network growth error:", error)
    return NextResponse.json(
      { error: "Failed to load network growth data." },
      { status: 500 }
    )
  }
}