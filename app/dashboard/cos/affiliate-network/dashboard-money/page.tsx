"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import {
  ArrowLeft,
  DollarSign,
  Wallet,
  Receipt,
  Crown,
  TrendingUp,
  Users,
  Package,
  Activity,
} from "lucide-react"

type TopAffiliate = {
  affiliate_user_id: string
  name: string
  commissions: number
  payouts: number
  pending: number
  conversions: number
}

type TopProduct = {
  product_id: number
  name: string
  commissions: number
  conversions: number
}

type RecentCommission = {
  id: string
  affiliate_user_id: string
  product_id: number | null
  amount: number | string | null
  code: string | null
  affiliate_name: string
  product_name: string
  created_at?: string
}

type MoneyData = {
  totals: {
    totalCommissions: number
    totalPaidOut: number
    totalPending: number
    totalConversions: number
  }
  topAffiliates: TopAffiliate[]
  topProducts: TopProduct[]
  recentCommissions: RecentCommission[]
  recentSignals: string[]
}

export default function DashboardMoneyPage() {
  const [data, setData] = useState<MoneyData | null>(null)
  const [loading, setLoading] = useState(true)
  const [errorText, setErrorText] = useState("")

  useEffect(() => {
    async function loadMoney() {
      try {
        setLoading(true)
        setErrorText("")

        const res = await fetch("/api/dashboard/money")
        const json = await res.json()

        if (!res.ok) {
          setErrorText(json.error || "Failed to load dashboard money.")
          return
        }

        setData(json)
      } catch (error) {
        console.error("dashboard money load error:", error)
        setErrorText("Failed to load dashboard money.")
      } finally {
        setLoading(false)
      }
    }

    loadMoney()
  }, [])

  const cards = [
    {
      title: "Total Commissions",
      value: `$${Number(data?.totals.totalCommissions ?? 0).toFixed(2)}`,
      icon: DollarSign,
      description: "All affiliate earnings tracked in the system.",
    },
    {
      title: "Paid Out",
      value: `$${Number(data?.totals.totalPaidOut ?? 0).toFixed(2)}`,
      icon: Wallet,
      description: "Money already sent out to affiliates.",
    },
    {
      title: "Pending",
      value: `$${Number(data?.totals.totalPending ?? 0).toFixed(2)}`,
      icon: TrendingUp,
      description: "Commissions still waiting to be paid.",
    },
    {
      title: "Conversions",
      value: `${data?.totals.totalConversions ?? 0}`,
      icon: Receipt,
      description: "Tracked affiliate commission events.",
    },
  ]

  return (
    <div className="min-h-screen bg-black p-6 text-white">
      <Link
        href="/dashboard/cos/affiliate-network"
        className="mb-6 inline-flex items-center gap-2 rounded-xl border border-yellow-500/20 bg-zinc-950 px-4 py-2 text-sm text-yellow-300"
      >
        <ArrowLeft size={16} />
        Back to Affiliate Network
      </Link>

      <div className="rounded-3xl border border-yellow-500/20 bg-zinc-950 p-8">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-yellow-500/20 bg-yellow-500/10 px-3 py-1 text-xs uppercase tracking-[0.25em] text-yellow-300">
          <DollarSign size={14} />
          Money Dashboard
        </div>

        <h1 className="text-4xl font-bold text-yellow-400">Dashboard Money</h1>
        <p className="mt-3 max-w-3xl text-zinc-400">
          Real affiliate money dashboard showing commissions, payouts, pending balances,
          top performers, and top converting products.
        </p>
      </div>

      {errorText ? (
        <div className="mt-6 rounded-2xl border border-red-500/20 bg-zinc-950 p-5 text-red-300">
          {errorText}
        </div>
      ) : null}

      <div className="mt-6 grid gap-4 md:grid-cols-4">
        {cards.map((card, i) => (
          <div
            key={i}
            className="rounded-2xl border border-yellow-500/20 bg-zinc-950 p-5"
          >
            <card.icon className="mb-3 text-yellow-400" />
            <p className="text-sm text-zinc-400">{card.title}</p>
            <p className="text-2xl font-bold text-white">
              {loading ? "..." : card.value}
            </p>
            <p className="mt-2 text-sm text-zinc-500">{card.description}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-2">
        <div className="rounded-3xl border border-yellow-500/20 bg-zinc-950 p-6">
          <div className="mb-5 flex items-center gap-3">
            <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/10 p-3 text-yellow-400">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Top Affiliates</h2>
              <p className="text-sm text-zinc-500">
                Ranked by commission earnings
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {!loading && (data?.topAffiliates.length ?? 0) === 0 ? (
              <div className="rounded-2xl border border-dashed border-zinc-800 bg-black/20 p-5 text-zinc-500">
                No affiliate earnings yet.
              </div>
            ) : (
              (data?.topAffiliates ?? []).map((item, i) => (
                <div
                  key={item.affiliate_user_id}
                  className="rounded-2xl border border-yellow-500/10 bg-black p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm text-zinc-500">#{i + 1}</p>
                      <h3 className="text-lg font-semibold text-white">
                        {item.name}
                      </h3>
                      <p className="mt-1 text-sm text-zinc-400">
                        Conversions: {item.conversions}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-sm text-zinc-500">Commission</p>
                      <p className="text-lg font-bold text-yellow-400">
                        ${Number(item.commissions).toFixed(2)}
                      </p>
                      <p className="mt-1 text-xs text-zinc-500">
                        Pending ${Number(item.pending).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-3xl border border-yellow-500/20 bg-zinc-950 p-6">
          <div className="mb-5 flex items-center gap-3">
            <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/10 p-3 text-yellow-400">
              <Package className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Top Products</h2>
              <p className="text-sm text-zinc-500">
                Ranked by affiliate commissions
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {!loading && (data?.topProducts.length ?? 0) === 0 ? (
              <div className="rounded-2xl border border-dashed border-zinc-800 bg-black/20 p-5 text-zinc-500">
                No product commission data yet.
              </div>
            ) : (
              (data?.topProducts ?? []).map((item, i) => (
                <div
                  key={item.product_id}
                  className="rounded-2xl border border-yellow-500/10 bg-black p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm text-zinc-500">#{i + 1}</p>
                      <h3 className="text-lg font-semibold text-white">
                        {item.name}
                      </h3>
                      <p className="mt-1 text-sm text-zinc-400">
                        Conversions: {item.conversions}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-sm text-zinc-500">Commissions</p>
                      <p className="text-lg font-bold text-yellow-400">
                        ${Number(item.commissions).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="mt-8 rounded-3xl border border-yellow-500/20 bg-zinc-950 p-6">
        <div className="mb-4 flex items-center gap-3">
          <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/10 p-3 text-yellow-400">
            <Receipt className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Recent Commissions</h2>
            <p className="text-sm text-zinc-500">
              Latest affiliate commission activity
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {!loading && (data?.recentCommissions.length ?? 0) === 0 ? (
            <div className="rounded-2xl border border-dashed border-zinc-800 bg-black/20 p-5 text-zinc-500">
              No recent commission activity yet.
            </div>
          ) : (
            (data?.recentCommissions ?? []).map((item) => (
              <div
                key={item.id}
                className="rounded-2xl border border-yellow-500/10 bg-black p-4"
              >
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="font-semibold text-white">{item.affiliate_name}</p>
                    <p className="text-sm text-zinc-400">{item.product_name}</p>
                  </div>

                  <div className="text-left md:text-right">
                    <p className="text-sm text-zinc-500">
                      Code: {item.code || "N/A"}
                    </p>
                    <p className="text-lg font-bold text-yellow-400">
                      ${Number(item.amount ?? 0).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="mt-8 rounded-3xl border border-yellow-500/20 bg-zinc-950 p-6">
        <div className="mb-4 flex items-center gap-3">
          <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/10 p-3 text-yellow-400">
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Recent Signals</h2>
            <p className="text-sm text-zinc-500">
              Live money dashboard updates
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {(data?.recentSignals ?? []).map((item, i) => (
            <div
              key={i}
              className="rounded-2xl border border-yellow-500/10 bg-black px-4 py-3 text-sm text-zinc-300"
            >
              {loading ? "Loading..." : item}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-10 rounded-3xl border border-yellow-500/20 bg-gradient-to-r from-yellow-400/10 to-yellow-600/10 p-8 text-center">
        <Crown className="mx-auto mb-4 text-yellow-400" size={32} />
        <h2 className="text-2xl font-bold text-yellow-400">
          Money Layer Live
        </h2>
        <p className="mt-2 text-zinc-400">
          Commissions, payouts, pending balances, and top performers are now real.
        </p>
      </div>
    </div>
  )
}