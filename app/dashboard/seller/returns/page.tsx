"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  PackageSearch,
  RefreshCw,
  RotateCcw,
  ShieldCheck,
} from "lucide-react"

type ReturnStatus =
  | "requested"
  | "approved"
  | "rejected"
  | "item_sent_back"
  | "received"
  | "refunded"
  | "partial_refund"

type ReturnRow = {
  id: string
  order_id: number
  buyer_user_id: string
  seller_user_id: string
  product_id: number
  reason: string
  details: string | null
  status: ReturnStatus
  requested_at: string
  approved_at: string | null
  refunded_at: string | null
  refund_amount: number | string | null
  stripe_refund_id: string | null
  created_at: string
  updated_at: string
}

const statusOptions: ReturnStatus[] = [
  "requested",
  "approved",
  "rejected",
  "item_sent_back",
  "received",
  "refunded",
  "partial_refund",
]

export default function ManageReturnsPage() {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])

  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [savingId, setSavingId] = useState<string | null>(null)

  const [role, setRole] = useState<"seller" | "admin" | null>(null)
  const [returns, setReturns] = useState<ReturnRow[]>([])

  const [statusDrafts, setStatusDrafts] = useState<Record<string, ReturnStatus>>({})
  const [refundDrafts, setRefundDrafts] = useState<Record<string, string>>({})

  useEffect(() => {
    void loadReturns(true)
  }, [router, supabase])

  async function loadReturns(showLoader = false) {
    try {
      if (showLoader) setLoading(true)

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/marketplace")
        return
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle()

      if (profileError) {
        console.error(
          "Load returns profile error:",
          profileError.message,
          profileError.details,
          profileError.hint
        )
        router.push("/marketplace")
        return
      }

      const currentRole = profile?.role
      if (currentRole !== "seller" && currentRole !== "admin") {
        router.push("/marketplace")
        return
      }

      setRole(currentRole)

      let query = supabase
        .from("returns")
        .select("*")
        .order("requested_at", { ascending: false })

      if (currentRole === "seller") {
        query = query.eq("seller_user_id", user.id)
      }

      const { data, error } = await query

      if (error) {
        console.error(
          "Load returns error:",
          error.message,
          error.details,
          error.hint,
          error
        )
        setReturns([])
        return
      }

      const rows = (data ?? []) as ReturnRow[]
      setReturns(rows)

      const nextStatusDrafts: Record<string, ReturnStatus> = {}
      const nextRefundDrafts: Record<string, string> = {}

      for (const row of rows) {
        nextStatusDrafts[row.id] = row.status
        nextRefundDrafts[row.id] = String(row.refund_amount ?? 0)
      }

      setStatusDrafts(nextStatusDrafts)
      setRefundDrafts(nextRefundDrafts)
    } catch (error) {
      console.error("Unexpected load returns error:", error)
      setReturns([])
    } finally {
      if (showLoader) setLoading(false)
    }
  }

  async function refreshReturns() {
    try {
      setRefreshing(true)
      await loadReturns(false)
    } finally {
      setRefreshing(false)
    }
  }

  function setStatusDraft(id: string, value: ReturnStatus) {
    setStatusDrafts((prev) => ({
      ...prev,
      [id]: value,
    }))
  }

  function setRefundDraft(id: string, value: string) {
    setRefundDrafts((prev) => ({
      ...prev,
      [id]: value,
    }))
  }

  async function handleSave(row: ReturnRow) {
    try {
      setSavingId(row.id)

      const nextStatus = statusDrafts[row.id] ?? row.status
      const rawRefundAmount = refundDrafts[row.id] ?? String(row.refund_amount ?? 0)
      const numericRefundAmount = Number(rawRefundAmount)

      if (Number.isNaN(numericRefundAmount) || numericRefundAmount < 0) {
        alert("Refund amount must be a valid positive number.")
        return
      }

      const payload: {
        status: ReturnStatus
        refund_amount: number
        approved_at?: string | null
        refunded_at?: string | null
      } = {
        status: nextStatus,
        refund_amount: numericRefundAmount,
      }

      if (nextStatus === "approved" && !row.approved_at) {
        payload.approved_at = new Date().toISOString()
      }

      if (
        (nextStatus === "refunded" || nextStatus === "partial_refund") &&
        !row.refunded_at
      ) {
        payload.refunded_at = new Date().toISOString()
      }

      const { error } = await supabase
        .from("returns")
        .update(payload)
        .eq("id", row.id)

      if (error) {
        alert(error.message)
        return
      }

      await loadReturns(false)
      alert("Return updated.")
    } catch (error) {
      console.error(error)
      alert("Could not update return.")
    } finally {
      setSavingId(null)
    }
  }

  const totalReturns = returns.length
  const requestedCount = returns.filter((r) => r.status === "requested").length
  const refundedCount = returns.filter(
    (r) => r.status === "refunded" || r.status === "partial_refund"
  ).length

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white px-6">
        <div className="rounded-[2rem] border border-zinc-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 h-12 w-12 animate-pulse rounded-full bg-zinc-200" />
          <h2 className="text-lg font-semibold text-zinc-900">
            Loading returns...
          </h2>
          <p className="mt-2 text-sm text-zinc-600">
            Preparing return management workspace.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white text-zinc-900">
      <div className="border-b border-zinc-200 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-8">
          <Link
            href="/dashboard/seller"
            className="inline-flex items-center gap-2 text-sm font-medium text-zinc-600 transition hover:text-zinc-950"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Seller Dashboard
          </Link>

          <button
            onClick={refreshReturns}
            disabled={refreshing}
            className="inline-flex items-center gap-2 rounded-full border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-900 transition hover:bg-zinc-50 disabled:opacity-60"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-5 py-10 md:px-8">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-yellow-600/80">
              CreatorGoat Returns
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-zinc-950 md:text-5xl">
              Manage Returns
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-zinc-500 md:text-base">
              {role === "admin"
                ? "View and manage all marketplace return requests."
                : "Review and manage return requests for your own products."}
            </p>
          </div>
        </div>

        <div className="mb-8 grid gap-5 md:grid-cols-3">
          <StatCard
            title="Total Returns"
            value={String(totalReturns)}
            icon={<RotateCcw className="h-5 w-5 text-yellow-700" />}
          />
          <StatCard
            title="Requested"
            value={String(requestedCount)}
            icon={<Clock3 className="h-5 w-5 text-blue-700" />}
          />
          <StatCard
            title="Refunded"
            value={String(refundedCount)}
            icon={<CheckCircle2 className="h-5 w-5 text-emerald-700" />}
          />
        </div>

        {returns.length === 0 ? (
          <div className="rounded-[2rem] border border-zinc-200 bg-white p-10 text-center shadow-sm">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100">
              <PackageSearch className="h-7 w-7 text-zinc-700" />
            </div>

            <h2 className="text-2xl font-semibold text-zinc-950">
              No returns found
            </h2>
            <p className="mt-3 text-sm leading-7 text-zinc-500">
              Return requests will appear here once buyers submit them.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {returns.map((row) => {
              const currentStatus = statusDrafts[row.id] ?? row.status
              const refundAmount = refundDrafts[row.id] ?? String(row.refund_amount ?? 0)

              return (
                <div
                  key={row.id}
                  className="rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-sm"
                >
                  <div className="grid gap-6 xl:grid-cols-[1fr_300px]">
                    <div>
                      <div className="mb-4 flex flex-wrap items-center gap-3">
                        <StatusBadge status={row.status} />
                        <MetaPill label="Order" value={`#${row.order_id}`} />
                        <MetaPill label="Product" value={`#${row.product_id}`} />
                      </div>

                      <h2 className="text-xl font-semibold text-zinc-950">
                        {row.reason}
                      </h2>

                      <div className="mt-4 grid gap-3 md:grid-cols-2">
                        <InfoRow label="Return ID" value={row.id} />
                        <InfoRow label="Buyer User ID" value={row.buyer_user_id} />
                        <InfoRow label="Seller User ID" value={row.seller_user_id} />
                        <InfoRow
                          label="Requested At"
                          value={formatDate(row.requested_at)}
                        />
                        <InfoRow
                          label="Approved At"
                          value={row.approved_at ? formatDate(row.approved_at) : "—"}
                        />
                        <InfoRow
                          label="Refunded At"
                          value={row.refunded_at ? formatDate(row.refunded_at) : "—"}
                        />
                      </div>

                      <div className="mt-5 rounded-[1.5rem] border border-zinc-200 bg-zinc-50 p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-zinc-500">
                          Details
                        </p>
                        <p className="mt-3 text-sm leading-7 text-zinc-700">
                          {row.details || "No additional details provided."}
                        </p>
                      </div>

                      {row.stripe_refund_id ? (
                        <div className="mt-4 rounded-[1.5rem] border border-emerald-200 bg-emerald-50 p-4">
                          <div className="flex items-start gap-3">
                            <ShieldCheck className="mt-0.5 h-5 w-5 text-emerald-700" />
                            <div>
                              <p className="text-sm font-semibold text-emerald-900">
                                Stripe Refund ID
                              </p>
                              <p className="mt-1 break-all text-sm text-emerald-800">
                                {row.stripe_refund_id}
                              </p>
                            </div>
                          </div>
                        </div>
                      ) : null}
                    </div>

                    <div className="rounded-[1.5rem] border border-zinc-200 bg-zinc-50 p-5">
                      <p className="text-xs font-semibold uppercase tracking-[0.15em] text-zinc-500">
                        Update Return
                      </p>
                      <h3 className="mt-2 text-lg font-semibold text-zinc-950">
                        Status & Refund
                      </h3>

                      <div className="mt-5 space-y-4">
                        <div>
                          <label className="mb-2 block text-sm font-medium text-zinc-800">
                            Status
                          </label>
                          <select
                            value={currentStatus}
                            onChange={(e) =>
                              setStatusDraft(row.id, e.target.value as ReturnStatus)
                            }
                            className="h-12 w-full rounded-2xl border border-zinc-300 bg-white px-4 text-sm text-zinc-900 outline-none transition focus:border-yellow-500/40"
                          >
                            {statusOptions.map((status) => (
                              <option key={status} value={status}>
                                {formatStatus(status)}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="mb-2 block text-sm font-medium text-zinc-800">
                            Refund Amount
                          </label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={refundAmount}
                            onChange={(e) => setRefundDraft(row.id, e.target.value)}
                            className="h-12 w-full rounded-2xl border border-zinc-300 bg-white px-4 text-sm text-zinc-900 outline-none transition focus:border-yellow-500/40"
                          />
                        </div>

                        <button
                          type="button"
                          onClick={() => handleSave(row)}
                          disabled={savingId === row.id}
                          className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-yellow-500 px-6 text-sm font-semibold text-black transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {savingId === row.id ? "Saving..." : "Save Update"}
                        </button>

                        <div className="rounded-2xl border border-zinc-200 bg-white p-4">
                          <p className="text-sm font-semibold text-zinc-950">
                            Refund workflow
                          </p>
                          <p className="mt-2 text-sm leading-6 text-zinc-500">
                            This page updates database return status. Stripe refund
                            execution should happen in your secure backend after
                            approval.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({
  title,
  value,
  icon,
}: {
  title: string
  value: string
  icon: React.ReactNode
}) {
  return (
    <div className="rounded-[1.5rem] border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-zinc-50">
        {icon}
      </div>
      <p className="text-sm text-zinc-500">{title}</p>
      <p className="mt-2 text-2xl font-semibold text-zinc-950">{value}</p>
    </div>
  )
}

function StatusBadge({
  status,
}: {
  status: ReturnStatus
}) {
  const map: Record<ReturnStatus, string> = {
    requested: "bg-blue-50 text-blue-700 border-blue-200",
    approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
    rejected: "bg-red-50 text-red-700 border-red-200",
    item_sent_back: "bg-yellow-50 text-yellow-700 border-yellow-200",
    received: "bg-purple-50 text-purple-700 border-purple-200",
    refunded: "bg-emerald-50 text-emerald-700 border-emerald-200",
    partial_refund: "bg-orange-50 text-orange-700 border-orange-200",
  }

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1.5 text-xs font-semibold ${map[status]}`}
    >
      {formatStatus(status)}
    </span>
  )
}

function MetaPill({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs font-medium text-zinc-700">
      {label}: {value}
    </div>
  )
}

function InfoRow({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-zinc-500">
        {label}
      </p>
      <p className="mt-2 break-all text-sm text-zinc-900">{value}</p>
    </div>
  )
}

function formatStatus(value: string) {
  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

function formatDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value || "—"
  return date.toLocaleString()
}