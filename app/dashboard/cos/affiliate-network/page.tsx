"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import {
  Users,
  Link2,
  DollarSign,
  TrendingUp,
  Crown,
  ArrowLeft,
  ArrowRight,
  BadgePercent,
  Network,
  Gift,
  BarChart3,
  Wallet,
} from "lucide-react"
import { saveToHistory } from "@/lib/history"

type AffiliateData = {
  stats: {
    affiliates: number
    activeLinks: number
    commissions: number
    conversions: number
    paidOut: number
    pendingCommissions: number
  }
  modules: Array<{
    title: string
    description: string
    status: string
    href: string
  }>
  recentSignals: string[]
}

const moduleIcons = [Link2, BadgePercent, Network]

export default function AffiliateNetworkPage() {
  const [data, setData] = useState<AffiliateData | null>(null)
  const [loading, setLoading] = useState(true)
  const [errorText, setErrorText] = useState("")
  const historySavedRef = useRef(false)

  useEffect(() => {
    async function loadAffiliateNetwork() {
      try {
        setLoading(true)
        setErrorText("")

        const res = await fetch("/api/affiliate-network")
        const json = await res.json()

        if (!res.ok) {
          setErrorText(json.error || "Failed to load affiliate network.")
          return
        }

        setData(json)
      } catch (error) {
        console.error("Failed to load affiliate network:", error)
        setErrorText("Failed to load affiliate network.")
      } finally {
        setLoading(false)
      }
    }

    loadAffiliateNetwork()
  }, [])

  useEffect(() => {
    async function saveAffiliateHistory() {
      if (loading) return
      if (errorText) return
      if (!data) return
      if (historySavedRef.current) return

      historySavedRef.current = true

      try {
        const modulesText =
          data.modules?.length > 0
            ? data.modules
                .map(
                  (item, index) =>
                    `${index + 1}. ${item.title} | ${item.status} | ${item.description} | ${item.href}`
                )
                .join("\n")
            : "No affiliate modules available."

        const signalsText =
          data.recentSignals?.length > 0
            ? data.recentSignals
                .map((item, index) => `${index + 1}. ${item}`)
                .join("\n")
            : "No recent affiliate signals available."

        await saveToHistory({
          module: "Affiliate Network",
          title: "Affiliate Network Snapshot",
          input: {
            source: "/api/affiliate-network",
          },
          output: [
            "Affiliate Network Snapshot",
            `Affiliates: ${data.stats.affiliates}`,
            `Active Links: ${data.stats.activeLinks}`,
            `Commissions: $${Number(data.stats.commissions ?? 0).toFixed(2)}`,
            `Conversions: ${data.stats.conversions}`,
            `Pending Commissions: $${Number(data.stats.pendingCommissions ?? 0).toFixed(2)}`,
            `Paid Out: $${Number(data.stats.paidOut ?? 0).toFixed(2)}`,
            "",
            "Modules:",
            modulesText,
            "",
            "Recent Signals:",
            signalsText,
          ].join("\n"),
        })
      } catch (error) {
        console.error("save affiliate history error:", error)
      }
    }

    saveAffiliateHistory()
  }, [loading, errorText, data])

  const affiliateStats = [
    {
      title: "Affiliates",
      value: data?.stats.affiliates ?? 0,
      description: "Creators currently connected to the affiliate system.",
      icon: Users,
    },
    {
      title: "Active Links",
      value: data?.stats.activeLinks ?? 0,
      description: "Referral links currently active across the network.",
      icon: Link2,
    },
    {
      title: "Commissions",
      value: `$${Number(data?.stats.commissions ?? 0).toFixed(2)}`,
      description: "Total commission value tracked through affiliate sales.",
      icon: DollarSign,
    },
    {
      title: "Conversions",
      value: data?.stats.conversions ?? 0,
      description: "Completed referral conversions recorded by the system.",
      icon: TrendingUp,
    },
  ]

  return (
    <div className="min-h-screen bg-black p-6 text-white">
      <div className="mb-6">
        <Link
          href="/dashboard/cos"
          className="inline-flex items-center gap-2 rounded-xl border border-yellow-500/20 bg-zinc-950 px-4 py-2 text-sm text-yellow-300 transition hover:bg-yellow-500/5"
        >
          <ArrowLeft size={16} />
          Back to COS
        </Link>
      </div>

      <div className="rounded-3xl border border-yellow-500/20 bg-zinc-950 p-8">
        <p className="text-xs uppercase tracking-[0.3em] text-yellow-500/60">
          COS MODULE
        </p>

        <h1 className="mt-3 text-4xl font-bold text-yellow-400">
          Affiliate Network
        </h1>

        <p className="mt-3 max-w-3xl text-zinc-400">
          Build creator-to-creator promotion loops with referral links,
          commission tracking, and marketplace-driven network growth from one
          clean system.
        </p>
      </div>

      {errorText ? (
        <div className="mt-6 rounded-2xl border border-red-500/20 bg-zinc-950 p-5 text-red-300">
          {errorText}
        </div>
      ) : null}

      <div className="mt-6 grid gap-4 md:grid-cols-4">
        {affiliateStats.map((item, i) => (
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

      <div className="mt-8 grid gap-6 md:grid-cols-3">
        {(data?.modules ?? []).map((card, i) => {
          const Icon = moduleIcons[i] || Link2

          return (
            <div
              key={i}
              className="rounded-3xl border border-yellow-500/20 bg-zinc-950 p-6 transition hover:scale-[1.02]"
            >
              <Icon className="mb-4 text-yellow-400" />
              <h3 className="text-lg font-bold">{card.title}</h3>
              <p className="mt-2 text-sm text-zinc-400">{card.description}</p>

              <div className="mt-4 flex items-center justify-between">
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

      <div className="mt-8 grid gap-6 md:grid-cols-3">
        <div className="rounded-3xl border border-yellow-500/20 bg-zinc-950 p-6">
          <Gift className="mb-4 text-yellow-400" />
          <h3 className="text-lg font-bold">Referral Rewards</h3>
          <p className="mt-2 text-sm text-zinc-400">
            Reward creators for driving marketplace sales and customer flow.
          </p>
        </div>

        <div className="rounded-3xl border border-yellow-500/20 bg-zinc-950 p-6">
          <Wallet className="mb-4 text-yellow-400" />
          <h3 className="text-lg font-bold">Pending Payouts</h3>
          <p className="mt-2 text-sm text-zinc-400">
            ${Number(data?.stats.pendingCommissions ?? 0).toFixed(2)}
          </p>
        </div>

        <div className="rounded-3xl border border-yellow-500/20 bg-zinc-950 p-6">
          <BarChart3 className="mb-4 text-yellow-400" />
          <h3 className="text-lg font-bold">Paid Out</h3>
          <p className="mt-2 text-sm text-zinc-400">
            ${Number(data?.stats.paidOut ?? 0).toFixed(2)}
          </p>
        </div>
      </div>

      <div className="mt-8 rounded-3xl border border-yellow-500/20 bg-zinc-950 p-6">
        <div className="mb-4 flex items-center gap-3">
          <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/10 p-3 text-yellow-400">
            <Network className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">
              Recent Signals
            </h2>
            <p className="text-sm text-zinc-500">
              Live affiliate system updates
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
          Affiliate Engine Live
        </h2>
        <p className="mt-2 text-zinc-400">
          Referral links, commission flow, and creator network growth are now connected.
        </p>
      </div>
    </div>
  )
}