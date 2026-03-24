"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import {
  Store,
  Package,
  Users,
  DollarSign,
  TrendingUp,
  Crown,
  ArrowRight,
  Activity,
  ShoppingBag,
  Wallet,
} from "lucide-react"
import { saveToHistory } from "@/lib/history"

type MarketplaceData = {
  stats: {
    creators: number
    products: number
    revenue: number
    growth: number
  }
  recentSignals: string[]
}

const marketplaceCards = [
  {
    title: "Creator Shops",
    description:
      "Launch and control creator storefronts with cleaner selling flow.",
    status: "Ready",
    href: "/creator/demo",
    icon: Store,
  },
  {
    title: "Products Engine",
    description:
      "Manage digital and physical products, pricing, and publishing.",
    status: "Ready",
    href: "/dashboard/products",
    icon: Package,
  },
  {
    title: "Revenue System",
    description:
      "Track earnings, payouts, order value, and full marketplace money flow.",
    status: "Ready",
    href: "/dashboard/cos/revenue-system",
    icon: Wallet,
  },
]

export default function MarketplaceOSPage() {
  const [data, setData] = useState<MarketplaceData | null>(null)
  const [loading, setLoading] = useState(true)
  const [errorText, setErrorText] = useState("")
  const historySavedRef = useRef(false)

  useEffect(() => {
    async function loadMarketplaceOS() {
      try {
        setLoading(true)
        setErrorText("")

        const res = await fetch("/api/dashboard/marketplace-real")
        const json = await res.json()

        if (!res.ok) {
          setErrorText(json.error || "Failed to load marketplace data.")
          return
        }

        setData(json)
      } catch (error) {
        console.error("Failed to load marketplace OS:", error)
        setErrorText("Failed to load marketplace data.")
      } finally {
        setLoading(false)
      }
    }

    loadMarketplaceOS()
  }, [])

  useEffect(() => {
    async function saveMarketplaceHistory() {
      if (loading) return
      if (errorText) return
      if (!data) return
      if (historySavedRef.current) return

      historySavedRef.current = true

      try {
        await saveToHistory({
          module: "Marketplace OS",
          title: "Marketplace OS Snapshot",
          input: {
            source: "/api/dashboard/marketplace-real",
          },
          output: [
            "Marketplace OS Snapshot",
            `Creators: ${data.stats.creators}`,
            `Products: ${data.stats.products}`,
            `Revenue: $${Number(data.stats.revenue ?? 0).toFixed(2)}`,
            `Growth: ${Number(data.stats.growth ?? 0).toFixed(2)}%`,
            "",
            "Recent Signals:",
            ...(data.recentSignals?.length
              ? data.recentSignals.map((item, index) => `${index + 1}. ${item}`)
              : ["No recent signals available."]),
          ].join("\n"),
        })
      } catch (error) {
        console.error("save marketplace history error:", error)
      }
    }

    saveMarketplaceHistory()
  }, [loading, errorText, data])

  const stats = [
    {
      label: "Creators",
      value: data?.stats.creators ?? 0,
      icon: Users,
    },
    {
      label: "Products",
      value: data?.stats.products ?? 0,
      icon: ShoppingBag,
    },
    {
      label: "Revenue",
      value: `$${Number(data?.stats.revenue ?? 0).toFixed(2)}`,
      icon: DollarSign,
    },
    {
      label: "Growth",
      value: `${Number(data?.stats.growth ?? 0).toFixed(2)}%`,
      icon: TrendingUp,
    },
  ]

  return (
    <div className="min-h-screen bg-black p-6 text-white">
      <div className="rounded-3xl border border-yellow-500/20 bg-zinc-950 p-8">
        <p className="text-xs uppercase tracking-[0.3em] text-yellow-500/60">
          COS MODULE
        </p>

        <h1 className="mt-3 text-4xl font-bold text-yellow-400">
          Marketplace OS
        </h1>

        <p className="mt-3 max-w-3xl text-zinc-400">
          The money engine behind CreatorGoat. Create powerful creator shops,
          sell products, track orders, and scale a full marketplace ecosystem
          while controlling every dollar that flows through your platform.
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
            <p className="text-sm text-zinc-400">{item.label}</p>
            <p className="text-2xl font-bold text-white">
              {loading ? "..." : item.value}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-3">
        {marketplaceCards.map((card, i) => {
          const Icon = card.icon

          return (
            <div
              key={i}
              className="rounded-3xl border border-yellow-500/20 bg-zinc-950 p-6 transition hover:scale-[1.02]"
            >
              <Icon className="mb-4 text-yellow-400" />
              <h3 className="text-lg font-bold">{card.title}</h3>
              <p className="mt-2 text-sm text-zinc-400">{card.description}</p>

              <div className="mt-4 flex items-center justify-between gap-3">
                <span className="rounded-full border border-yellow-500/20 bg-yellow-500/10 px-3 py-1 text-xs text-yellow-300">
                  {card.status}
                </span>

                <Link
                  href={card.href}
                  className="inline-flex items-center gap-2 rounded-xl bg-yellow-400 px-4 py-2 font-bold text-black transition hover:brightness-105"
                >
                  Open
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          )
        })}
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
              Live marketplace system updates
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
          Marketplace Engine Live
        </h2>
        <p className="mt-2 text-zinc-400">
          Creator shops, products, orders, and revenue are connected to the database.
        </p>
      </div>
    </div>
  )
}