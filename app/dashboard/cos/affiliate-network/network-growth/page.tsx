"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import {
  ArrowLeft,
  Network,
  TrendingUp,
  Link2,
  DollarSign,
  BarChart3,
  Crown,
  Activity,
  Users,
  Package,
} from "lucide-react"

type TopAffiliate = {
  affiliate_user_id: string
  name: string
  links: number
  conversions: number
  commissions: number
  grossSales: number
}

type TopProduct = {
  product_id: number
  name: string
  conversions: number
  commissions: number
  grossSales: number
}

type GrowthData = {
  stats: {
    totalLinks: number
    activeLinks: number
    totalConversions: number
    totalCommissions: number
    totalGrossSales: number
    conversionGrowth: number
  }
  topAffiliates: TopAffiliate[]
  topProducts: TopProduct[]
  recentSignals: string[]
}

export default function NetworkGrowthPage() {
  const [data, setData] = useState<GrowthData | null>(null)
  const [loading, setLoading] = useState(true)
  const [errorText, setErrorText] = useState("")

  useEffect(() => {
    async function loadGrowthData() {
      try {
        setLoading(true)
        setErrorText("")

        const res = await fetch("/api/affiliate-network/growth")
        const json = await res.json()

        if (!res.ok) {
          setErrorText(json.error || "Failed to load network growth.")
          return
        }

        setData(json)
      } catch (error) {
        console.error("Failed to load network growth:", error)
        setErrorText("Failed to load network growth.")
      } finally {
        setLoading(false)
      }
    }

    loadGrowthData()
  }, [])

  const stats = [
    {
      title: "Total Links",
      value: data?.stats.totalLinks ?? 0,
      icon: Link2,
      description: "All affiliate links created in the system.",
    },
    {
      title: "Active Links",
      value: data?.stats.activeLinks ?? 0,
      icon: Network,
      description: "Links currently active and available for referrals.",
    },
    {
      title: "Conversions",
      value: data?.stats.totalConversions ?? 0,
      icon: TrendingUp,
      description: "Affiliate sales tracked across the network.",
    },
    {
      title: "Gross Sales",
      value: `$${Number(data?.stats.totalGrossSales ?? 0).toFixed(2)}`,
      icon: DollarSign,
      description: "Total sales value attributed to affiliate conversions.",
    },
  ]

  return (
    <div className="min-h-screen bg-black p-6 text-white">
      <Link
        href="/dashboard/cos/affiliate-network"
        className="mb-6 inline-flex items-center gap-2 rounded-xl border border-yellow-500/20 bg-zinc-950 px-4 py-2 text-sm text-yellow-300 transition hover:bg-yellow-500/5"
      >
        <ArrowLeft size={16} />
        Back to Affiliate Network
      </Link>

      <div className="rounded-3xl border border-yellow-500/20 bg-zinc-950 p-8">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-yellow-500/20 bg-yellow-500/10 px-3 py-1 text-xs uppercase tracking-[0.25em] text-yellow-300">
          <Network size={14} />
          Growth Layer
        </div>

        <h1 className="text-4xl font-bold text-yellow-400">Network Growth</h1>
        <p className="mt-3 max-w-3xl text-zinc-400">
          Track affiliate network expansion, active links, top affiliates, top
          products, and conversion performance with real database-driven numbers.
        </p>
      </div>

      {errorText ? (
        <div className="mt-6 rounded-2xl border border-red-500/20 bg-zinc-950 p-5 text-red-300">
          {errorText}
        </div>
      ) : null}

      <div className="mt-6 grid gap-4 md:grid-cols-4">
        {stats.map((item, i) => (
          <div
            key={i}
            className="rounded-2xl border border-yellow-500/20 bg-zinc-950 p-5"
          >
            <item.icon className="mb-3 text-yellow-400" />
            <p className="text-sm text-zinc-400">{item.title}</p>
            <p className="text-2xl font-bold text-white">
              {loading ? "..." : item.value}
            </p>
            <p className="mt-2 text-sm text-zinc-500">{item.description}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-3">
        <div className="rounded-3xl border border-yellow-500/20 bg-zinc-950 p-6">
          <BarChart3 className="mb-4 text-yellow-400" />
          <h3 className="text-lg font-bold">Commission Value</h3>
          <p className="mt-2 text-2xl font-bold text-white">
            {loading ? "..." : `$${Number(data?.stats.totalCommissions ?? 0).toFixed(2)}`}
          </p>
          <p className="mt-2 text-sm text-zinc-500">
            Real commission earnings tracked across affiliate sales.
          </p>
        </div>

        <div className="rounded-3xl border border-yellow-500/20 bg-zinc-950 p-6">
          <TrendingUp className="mb-4 text-yellow-400" />
          <h3 className="text-lg font-bold">30-Day Growth</h3>
          <p className="mt-2 text-2xl font-bold text-white">
            {loading ? "..." : `${Number(data?.stats.conversionGrowth ?? 0).toFixed(2)}%`}
          </p>
          <p className="mt-2 text-sm text-zinc-500">
            Growth based on affiliate conversions in the current window.
          </p>
        </div>

        <div className="rounded-3xl border border-yellow-500/20 bg-zinc-950 p-6">
          <Activity className="mb-4 text-yellow-400" />
          <h3 className="text-lg font-bold">Network Status</h3>
          <p className="mt-2 text-2xl font-bold text-white">
            {loading
              ? "..."
              : (data?.stats.activeLinks ?? 0) > 0
              ? "Active"
              : "Idle"}
          </p>
          <p className="mt-2 text-sm text-zinc-500">
            Based on live active affiliate link count.
          </p>
        </div>
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
                Best performers by commission value
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {!loading && (data?.topAffiliates?.length ?? 0) === 0 ? (
              <div className="rounded-2xl border border-dashed border-zinc-800 bg-black/20 p-5 text-zinc-500">
                No affiliate performance data yet.
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
                        Links: {item.links} · Conversions: {item.conversions}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-sm text-zinc-500">Commission</p>
                      <p className="text-lg font-bold text-yellow-400">
                        ${Number(item.commissions ?? 0).toFixed(2)}
                      </p>
                      <p className="mt-1 text-xs text-zinc-500">
                        Gross ${Number(item.grossSales ?? 0).toFixed(2)}
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
                Products converting best through affiliates
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {!loading && (data?.topProducts?.length ?? 0) === 0 ? (
              <div className="rounded-2xl border border-dashed border-zinc-800 bg-black/20 p-5 text-zinc-500">
                No affiliate product performance data yet.
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
                      <p className="text-sm text-zinc-500">Commission</p>
                      <p className="text-lg font-bold text-yellow-400">
                        ${Number(item.commissions ?? 0).toFixed(2)}
                      </p>
                      <p className="mt-1 text-xs text-zinc-500">
                        Gross ${Number(item.grossSales ?? 0).toFixed(2)}
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
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Recent Signals</h2>
            <p className="text-sm text-zinc-500">
              Live affiliate network growth updates
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
          Network Growth Live
        </h2>
        <p className="mt-2 text-zinc-400">
          Affiliate expansion, top performers, and product conversions are now real.
        </p>
      </div>
    </div>
  )
}