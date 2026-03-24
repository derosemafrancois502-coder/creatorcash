"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import {
  ArrowLeft,
  DollarSign,
  TrendingUp,
  Wallet,
  CreditCard,
  BarChart3,
  Receipt,
  Crown,
  Activity,
} from "lucide-react"

type RevenueData = {
  stats: {
    totalRevenue: number
    totalOrders: number
    totalPayouts: number
    totalAffiliateCommissions: number
    revenueLast30: number
    netRevenue: number
  }
  recentSignals: string[]
}

export default function RevenueSystemPage() {
  const [data, setData] = useState<RevenueData | null>(null)
  const [loading, setLoading] = useState(true)
  const [errorText, setErrorText] = useState("")

  useEffect(() => {
    async function loadRevenue() {
      try {
        setLoading(true)
        setErrorText("")
        const res = await fetch("/api/dashboard/revenue-real")
        const json = await res.json()

        if (!res.ok) {
          setErrorText(json.error || "Failed to load revenue dashboard.")
          return
        }

        setData(json)
      } catch (error) {
        console.error("Failed to load revenue dashboard:", error)
        setErrorText("Failed to load revenue dashboard.")
      } finally {
        setLoading(false)
      }
    }

    loadRevenue()
  }, [])

  const revenueCards = [
    {
      title: "Total Revenue",
      value: `$${Number(data?.stats.totalRevenue ?? 0).toFixed(2)}`,
      description: "All marketplace sales processed through the system.",
      icon: DollarSign,
    },
    {
      title: "Payouts",
      value: `$${Number(data?.stats.totalPayouts ?? 0).toFixed(2)}`,
      description: "Creator payouts sent from marketplace earnings.",
      icon: Wallet,
    },
    {
      title: "Orders",
      value: `${data?.stats.totalOrders ?? 0}`,
      description: "Completed paid orders in the system.",
      icon: Receipt,
    },
    {
      title: "Net Revenue",
      value: `$${Number(data?.stats.netRevenue ?? 0).toFixed(2)}`,
      description: "Revenue after payouts and affiliate commissions.",
      icon: TrendingUp,
    },
  ]

  return (
    <div className="min-h-screen bg-black p-6 text-white">
      <div className="mb-6">
        <Link
          href="/dashboard/cos/marketplace-os"
          className="inline-flex items-center gap-2 rounded-xl border border-yellow-500/20 bg-zinc-950 px-4 py-2 text-sm text-yellow-300 transition hover:bg-yellow-500/5"
        >
          <ArrowLeft size={16} />
          Back to Marketplace OS
        </Link>
      </div>

      <div className="rounded-3xl border border-yellow-500/20 bg-zinc-950 p-8">
        <p className="text-xs uppercase tracking-[0.3em] text-yellow-500/60">
          COS MODULE
        </p>

        <h1 className="mt-3 text-4xl font-bold text-yellow-400">
          Revenue System
        </h1>

        <p className="mt-3 max-w-3xl text-zinc-400">
          Control the money flow of CreatorGoat. Track revenue, payouts, orders,
          affiliate commissions, and net performance from one clean financial layer.
        </p>
      </div>

      {errorText ? (
        <div className="mt-6 rounded-2xl border border-red-500/20 bg-zinc-950 p-5 text-red-300">
          {errorText}
        </div>
      ) : null}

      <div className="mt-6 grid gap-4 md:grid-cols-4">
        {revenueCards.map((card, i) => (
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

      <div className="mt-8 grid gap-6 md:grid-cols-3">
        <div className="rounded-3xl border border-yellow-500/20 bg-zinc-950 p-6">
          <CreditCard className="mb-4 text-yellow-400" />
          <h3 className="text-lg font-bold">Payments Layer</h3>
          <p className="mt-2 text-sm text-zinc-400">
            Real Stripe checkout totals flowing into the revenue system.
          </p>
        </div>

        <div className="rounded-3xl border border-yellow-500/20 bg-zinc-950 p-6">
          <Wallet className="mb-4 text-yellow-400" />
          <h3 className="text-lg font-bold">Affiliate Commissions</h3>
          <p className="mt-2 text-sm text-zinc-400">
            ${loading ? "..." : Number(data?.stats.totalAffiliateCommissions ?? 0).toFixed(2)}
          </p>
        </div>

        <div className="rounded-3xl border border-yellow-500/20 bg-zinc-950 p-6">
          <BarChart3 className="mb-4 text-yellow-400" />
          <h3 className="text-lg font-bold">Last 30 Days</h3>
          <p className="mt-2 text-sm text-zinc-400">
            ${loading ? "..." : Number(data?.stats.revenueLast30 ?? 0).toFixed(2)}
          </p>
        </div>
      </div>

      <div className="mt-8 rounded-3xl border border-yellow-500/20 bg-zinc-950 p-6">
        <div className="mb-4 flex items-center gap-3">
          <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/10 p-3 text-yellow-400">
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">
              Recent Signals
            </h2>
            <p className="text-sm text-zinc-500">
              Live revenue system updates
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
          Revenue Layer Live
        </h2>
        <p className="mt-2 text-zinc-400">
          Revenue, payouts, orders, and commissions are now database-driven.
        </p>
      </div>
    </div>
  )
}