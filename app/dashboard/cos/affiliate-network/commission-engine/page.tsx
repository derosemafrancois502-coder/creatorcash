"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { ArrowLeft, BadgePercent, DollarSign, Wallet, Receipt } from "lucide-react"

type SummaryRow = {
  affiliate_user_id: string
  name: string
  salesCount: number
  grossSales: number
  commissions: number
  paidOut: number
  pending: number
}

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

type CommissionData = {
  summaries: SummaryRow[]
  recentSales: SaleRow[]
  recentPayouts: PayoutRow[]
  totals: {
    totalCommissions: number
    totalPaidOut: number
    totalPending: number
  }
}

export default function CommissionEnginePage() {
  const [data, setData] = useState<CommissionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [errorText, setErrorText] = useState("")

  useEffect(() => {
    async function loadCommissions() {
      try {
        setLoading(true)
        setErrorText("")

        const res = await fetch("/api/affiliate-network/commissions")
        const json = await res.json()

        if (!res.ok) {
          setErrorText(json.error || "Failed to load commission engine.")
          return
        }

        setData(json)
      } catch (error) {
        console.error("load commissions error:", error)
        setErrorText("Failed to load commission engine.")
      } finally {
        setLoading(false)
      }
    }

    loadCommissions()
  }, [])

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
        <BadgePercent className="mb-4 text-yellow-400" />
        <h1 className="text-4xl font-bold text-yellow-400">Commission Engine</h1>
        <p className="mt-3 max-w-3xl text-zinc-400">
          Track affiliate commissions, payouts, pending balances, and recent
          commission activity with real database numbers.
        </p>
      </div>

      {errorText ? (
        <div className="mt-6 rounded-2xl border border-red-500/20 bg-zinc-950 p-5 text-red-300">
          {errorText}
        </div>
      ) : null}

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-yellow-500/20 bg-zinc-950 p-5">
          <DollarSign className="mb-3 text-yellow-400" />
          <p className="text-sm text-zinc-400">Total Commissions</p>
          <p className="text-2xl font-bold text-white">
            {loading ? "..." : `$${Number(data?.totals.totalCommissions ?? 0).toFixed(2)}`}
          </p>
        </div>

        <div className="rounded-2xl border border-yellow-500/20 bg-zinc-950 p-5">
          <Wallet className="mb-3 text-yellow-400" />
          <p className="text-sm text-zinc-400">Paid Out</p>
          <p className="text-2xl font-bold text-white">
            {loading ? "..." : `$${Number(data?.totals.totalPaidOut ?? 0).toFixed(2)}`}
          </p>
        </div>

        <div className="rounded-2xl border border-yellow-500/20 bg-zinc-950 p-5">
          <Receipt className="mb-3 text-yellow-400" />
          <p className="text-sm text-zinc-400">Pending</p>
          <p className="text-2xl font-bold text-white">
            {loading ? "..." : `$${Number(data?.totals.totalPending ?? 0).toFixed(2)}`}
          </p>
        </div>
      </div>

      <div className="mt-8 rounded-3xl border border-yellow-500/20 bg-zinc-950 p-6">
        <h2 className="text-xl font-bold text-white">Affiliate Summaries</h2>

        {loading ? (
          <div className="mt-5 rounded-2xl border border-zinc-800 bg-black p-5 text-zinc-400">
            Loading summaries...
          </div>
        ) : (data?.summaries.length ?? 0) === 0 ? (
          <div className="mt-5 rounded-2xl border border-dashed border-zinc-800 bg-black p-5 text-zinc-500">
            No commission data yet.
          </div>
        ) : (
          <div className="mt-5 space-y-4">
            {data?.summaries.map((row) => (
              <div
                key={row.affiliate_user_id}
                className="rounded-2xl border border-zinc-800 bg-black p-5"
              >
                <div className="grid gap-4 md:grid-cols-5">
                  <div>
                    <p className="text-sm text-zinc-500">Affiliate</p>
                    <p className="font-semibold text-white">{row.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-zinc-500">Sales</p>
                    <p className="font-semibold text-white">{row.salesCount}</p>
                  </div>
                  <div>
                    <p className="text-sm text-zinc-500">Gross Sales</p>
                    <p className="font-semibold text-white">
                      ${Number(row.grossSales).toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-zinc-500">Commission</p>
                    <p className="font-semibold text-yellow-400">
                      ${Number(row.commissions).toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-zinc-500">Pending</p>
                    <p className="font-semibold text-white">
                      ${Number(row.pending).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-2">
        <div className="rounded-3xl border border-yellow-500/20 bg-zinc-950 p-6">
          <h2 className="text-xl font-bold text-white">Recent Sales</h2>
          <div className="mt-5 space-y-3">
            {(data?.recentSales ?? []).length === 0 ? (
              <div className="rounded-2xl border border-dashed border-zinc-800 bg-black p-5 text-zinc-500">
                No recent affiliate sales yet.
              </div>
            ) : (
              data?.recentSales.map((sale) => (
                <div
                  key={sale.id}
                  className="rounded-2xl border border-zinc-800 bg-black p-4 text-sm"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400">Session</span>
                    <span className="text-white">{sale.stripe_session_id || "N/A"}</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-zinc-400">Commission</span>
                    <span className="text-yellow-400">
                      ${Number(sale.commission_amount ?? 0).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-3xl border border-yellow-500/20 bg-zinc-950 p-6">
          <h2 className="text-xl font-bold text-white">Recent Payouts</h2>
          <div className="mt-5 space-y-3">
            {(data?.recentPayouts ?? []).length === 0 ? (
              <div className="rounded-2xl border border-dashed border-zinc-800 bg-black p-5 text-zinc-500">
                No payouts recorded yet.
              </div>
            ) : (
              data?.recentPayouts.map((payout) => (
                <div
                  key={payout.id}
                  className="rounded-2xl border border-zinc-800 bg-black p-4 text-sm"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400">Amount</span>
                    <span className="text-yellow-400">
                      ${Number(payout.amount ?? 0).toFixed(2)}
                    </span>
                  </div>
                  <div className="mt-2 text-zinc-500">
                    {payout.note || "No note"}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}