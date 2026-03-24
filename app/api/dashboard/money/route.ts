import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"

type CommissionRow = {
  id: string
  affiliate_user_id: string
  product_id: number | null
  amount: number | string | null
  code: string | null
  created_at?: string
}

type PayoutRow = {
  id: string
  affiliate_user_id: string
  amount: number | string | null
  note: string | null
  created_at?: string
}

type UserRow = {
  id: string
  username: string | null
  name: string | null
  brand_name: string | null
}

type ProductRow = {
  id: number
  name: string | null
}

export async function GET() {
  try {
    const [commissionsRes, payoutsRes, usersRes, productsRes] =
      await Promise.all([
        supabaseAdmin
          .from("affiliate_commissions")
          .select("*")
          .order("created_at", { ascending: false }),
        supabaseAdmin
          .from("affiliate_payouts")
          .select("*")
          .order("created_at", { ascending: false }),
        supabaseAdmin
          .from("users")
          .select("id, username, name, brand_name"),
        supabaseAdmin
          .from("products")
          .select("id, name"),
      ])

    if (commissionsRes.error) throw commissionsRes.error
    if (payoutsRes.error) throw payoutsRes.error
    if (usersRes.error) throw usersRes.error
    if (productsRes.error) throw productsRes.error

    const commissions = (commissionsRes.data ?? []) as CommissionRow[]
    const payouts = (payoutsRes.data ?? []) as PayoutRow[]
    const users = (usersRes.data ?? []) as UserRow[]
    const products = (productsRes.data ?? []) as ProductRow[]

    const userMap = new Map(
      users.map((u) => [
        u.id,
        u.brand_name || u.name || u.username || "Unknown Creator",
      ])
    )

    const productMap = new Map(
      products.map((p) => [p.id, p.name || `Product #${p.id}`])
    )

    const totalCommissions = commissions.reduce(
      (sum, row) => sum + Number(row.amount ?? 0),
      0
    )

    const totalPaidOut = payouts.reduce(
      (sum, row) => sum + Number(row.amount ?? 0),
      0
    )

    const totalPending = Math.max(totalCommissions - totalPaidOut, 0)

    const affiliateMap = new Map<
      string,
      {
        affiliate_user_id: string
        name: string
        commissions: number
        payouts: number
        pending: number
        conversions: number
      }
    >()

    for (const row of commissions) {
      const id = String(row.affiliate_user_id)
      const current = affiliateMap.get(id) || {
        affiliate_user_id: id,
        name: userMap.get(id) || "Unknown Creator",
        commissions: 0,
        payouts: 0,
        pending: 0,
        conversions: 0,
      }

      current.commissions += Number(row.amount ?? 0)
      current.conversions += 1

      affiliateMap.set(id, current)
    }

    for (const row of payouts) {
      const id = String(row.affiliate_user_id)
      const current = affiliateMap.get(id) || {
        affiliate_user_id: id,
        name: userMap.get(id) || "Unknown Creator",
        commissions: 0,
        payouts: 0,
        pending: 0,
        conversions: 0,
      }

      current.payouts += Number(row.amount ?? 0)

      affiliateMap.set(id, current)
    }

    const topAffiliates = Array.from(affiliateMap.values())
      .map((row) => ({
        ...row,
        pending: Number((row.commissions - row.payouts).toFixed(2)),
      }))
      .sort((a, b) => b.commissions - a.commissions)
      .slice(0, 10)

    const productMapAgg = new Map<
      number,
      {
        product_id: number
        name: string
        commissions: number
        conversions: number
      }
    >()

    for (const row of commissions) {
      const productId = Number(row.product_id ?? 0)
      if (!productId) continue

      const current = productMapAgg.get(productId) || {
        product_id: productId,
        name: String(productMap.get(productId) || `Product #${productId}`),
        commissions: 0,
        conversions: 0,
      }

      current.commissions += Number(row.amount ?? 0)
      current.conversions += 1

      productMapAgg.set(productId, current)
    }

    const topProducts = Array.from(productMapAgg.values())
      .sort((a, b) => b.commissions - a.commissions)
      .slice(0, 10)

    const recentCommissions = commissions.slice(0, 20).map((row) => ({
      ...row,
      affiliate_name:
        userMap.get(String(row.affiliate_user_id)) || "Unknown Creator",
      product_name: row.product_id
        ? productMap.get(Number(row.product_id)) || `Product #${row.product_id}`
        : "Unknown Product",
    }))

    return NextResponse.json({
      totals: {
        totalCommissions: Number(totalCommissions.toFixed(2)),
        totalPaidOut: Number(totalPaidOut.toFixed(2)),
        totalPending: Number(totalPending.toFixed(2)),
        totalConversions: commissions.length,
      },
      topAffiliates,
      topProducts,
      recentCommissions,
      recentSignals: [
        `Total commissions tracked: $${totalCommissions.toFixed(2)}`,
        `Total paid out: $${totalPaidOut.toFixed(2)}`,
        `Pending commissions: $${totalPending.toFixed(2)}`,
        `Commission conversions: ${commissions.length}`,
      ],
    })
  } catch (error) {
    console.error("dashboard money error:", error)
    return NextResponse.json(
      { error: "Failed to load money dashboard." },
      { status: 500 }
    )
  }
}