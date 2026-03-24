"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import {
  ArrowLeft,
  ExternalLink,
  Package,
  RefreshCw,
  ShieldCheck,
  Truck,
  ScanSearch,
  ReceiptText,
} from "lucide-react"

type ShipmentStatus =
  | "pending"
  | "processing"
  | "label_created"
  | "shipped"
  | "in_transit"
  | "out_for_delivery"
  | "delivered"
  | "exception"
  | "returned"

type ShipmentRow = {
  id: string
  order_id: number
  seller_user_id: string
  buyer_user_id: string
  carrier: string | null
  service: string | null
  tracking_number: string | null
  label_url: string | null
  shipment_status: ShipmentStatus
  provider: string | null
  provider_shipment_id: string | null
  provider_rate_id?: string | null
  provider_transaction_id?: string | null
  shipping_cost: number | string | null
  shipped_at: string | null
  delivered_at: string | null
  created_at: string
  updated_at: string
}

const statusOptions: ShipmentStatus[] = [
  "pending",
  "processing",
  "label_created",
  "shipped",
  "in_transit",
  "out_for_delivery",
  "delivered",
  "exception",
  "returned",
]

export default function SellerShippingPage() {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])

  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [savingId, setSavingId] = useState<string | null>(null)
  const [buyingLabelId, setBuyingLabelId] = useState<string | null>(null)
  const [registeringTrackId, setRegisteringTrackId] = useState<string | null>(null)

  const [shipments, setShipments] = useState<ShipmentRow[]>([])
  const [statusDrafts, setStatusDrafts] = useState<Record<string, ShipmentStatus>>({})
  const [trackingDrafts, setTrackingDrafts] = useState<Record<string, string>>({})
  const [carrierDrafts, setCarrierDrafts] = useState<Record<string, string>>({})
  const [labelDrafts, setLabelDrafts] = useState<Record<string, string>>({})

  useEffect(() => {
    void loadShipments()
  }, [])

  async function loadShipments() {
    try {
      setLoading(true)

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/marketplace")
        return
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle()

      if (!profile || (profile.role !== "seller" && profile.role !== "admin")) {
        router.push("/marketplace")
        return
      }

      let query = supabase
        .from("shipments")
        .select(`
          id,
          order_id,
          seller_user_id,
          buyer_user_id,
          carrier,
          service,
          tracking_number,
          label_url,
          shipment_status,
          provider,
          provider_shipment_id,
          provider_rate_id,
          provider_transaction_id,
          shipping_cost,
          shipped_at,
          delivered_at,
          created_at,
          updated_at
        `)
        .order("created_at", { ascending: false })

      if (profile.role === "seller") {
        query = query.eq("seller_user_id", user.id)
      }

      const { data, error } = await query

      if (error) {
        console.error(error)
        setShipments([])
        return
      }

      const rows = (data ?? []) as ShipmentRow[]
      setShipments(rows)

      const nextStatus: Record<string, ShipmentStatus> = {}
      const nextTracking: Record<string, string> = {}
      const nextCarrier: Record<string, string> = {}
      const nextLabel: Record<string, string> = {}

      for (const row of rows) {
        nextStatus[row.id] = row.shipment_status
        nextTracking[row.id] = row.tracking_number ?? ""
        nextCarrier[row.id] = row.carrier ?? ""
        nextLabel[row.id] = row.label_url ?? ""
      }

      setStatusDrafts(nextStatus)
      setTrackingDrafts(nextTracking)
      setCarrierDrafts(nextCarrier)
      setLabelDrafts(nextLabel)
    } catch (error) {
      console.error(error)
      setShipments([])
    } finally {
      setLoading(false)
    }
  }

  async function refreshShipments() {
    try {
      setRefreshing(true)
      await loadShipments()
    } finally {
      setRefreshing(false)
    }
  }

  async function saveShipment(row: ShipmentRow) {
    try {
      setSavingId(row.id)

      const nextStatus = statusDrafts[row.id] ?? row.shipment_status
      const trackingNumber = trackingDrafts[row.id]?.trim() || null
      const carrier = carrierDrafts[row.id]?.trim() || null
      const labelUrl = labelDrafts[row.id]?.trim() || null

      const payload: {
        shipment_status: ShipmentStatus
        tracking_number: string | null
        carrier: string | null
        label_url: string | null
        shipped_at?: string | null
        delivered_at?: string | null
      } = {
        shipment_status: nextStatus,
        tracking_number: trackingNumber,
        carrier,
        label_url: labelUrl,
      }

      if (nextStatus === "shipped" && !row.shipped_at) {
        payload.shipped_at = new Date().toISOString()
      }

      if (nextStatus === "delivered" && !row.delivered_at) {
        payload.delivered_at = new Date().toISOString()
      }

      const { error } = await supabase
        .from("shipments")
        .update(payload)
        .eq("id", row.id)

      if (error) {
        alert(error.message)
        return
      }

      await loadShipments()
      alert("Shipment updated.")
    } catch (error) {
      console.error(error)
      alert("Could not update shipment.")
    } finally {
      setSavingId(null)
    }
  }

  async function handleBuyLabel(row: ShipmentRow) {
    try {
      setBuyingLabelId(row.id)

      const response = await fetch("/api/shipping/shippo/buy-label", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId: row.order_id,
          sellerUserId: row.seller_user_id,
          buyerUserId: row.buyer_user_id,

          // TEMP demo addresses — pita n ap pran yo nan DB otomatikman
          fromAddress: {
            name: "CreatorGoat Seller",
            street1: "123 Seller St",
            city: "Cincinnati",
            state: "OH",
            zip: "45202",
            country: "US",
          },

          toAddress: {
            name: "Customer",
            street1: "456 Buyer Ave",
            city: "Louisville",
            state: "KY",
            zip: "40202",
            country: "US",
          },

          parcel: {
            length: "10",
            width: "8",
            height: "4",
            distance_unit: "in",
            weight: "2",
            mass_unit: "lb",
          },

          labelFileType: "PDF",
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data?.error || "Failed to buy label.")
      }

      await loadShipments()
      alert("Shipping label created successfully.")
    } catch (error) {
      console.error(error)
      alert(error instanceof Error ? error.message : "Could not create label.")
    } finally {
      setBuyingLabelId(null)
    }
  }

  async function handleRegisterTracking(row: ShipmentRow) {
    try {
      const carrier = (carrierDrafts[row.id] ?? row.carrier ?? "").trim()
      const trackingNumber = (trackingDrafts[row.id] ?? row.tracking_number ?? "").trim()

      if (!carrier) {
        alert("Carrier is required before registering tracking.")
        return
      }

      if (!trackingNumber) {
        alert("Tracking number is required before registering tracking.")
        return
      }

      setRegisteringTrackId(row.id)

      const response = await fetch("/api/shipping/shippo/register-track", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          carrier,
          trackingNumber,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data?.error || "Failed to register tracking.")
      }

      alert("Tracking registered successfully.")
    } catch (error) {
      console.error(error)
      alert(error instanceof Error ? error.message : "Could not register tracking.")
    } finally {
      setRegisteringTrackId(null)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white px-6">
        <div className="rounded-[2rem] border border-zinc-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 h-12 w-12 animate-pulse rounded-full bg-zinc-200" />
          <h2 className="text-lg font-semibold text-zinc-900">Loading shipping...</h2>
          <p className="mt-2 text-sm text-zinc-600">
            Preparing seller shipping dashboard.
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
            onClick={refreshShipments}
            disabled={refreshing}
            className="inline-flex items-center gap-2 rounded-full border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-900 transition hover:bg-zinc-50 disabled:opacity-60"
          >
            <RefreshCw className="h-4 w-4" />
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-5 py-10 md:px-8">
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-yellow-600/80">
            CreatorGoat Shipping
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-zinc-950 md:text-5xl">
            Manage Shipments
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-zinc-500 md:text-base">
            Update label, tracking number, carrier, and shipping status for customer orders.
          </p>
        </div>

        {shipments.length === 0 ? (
          <div className="rounded-[2rem] border border-zinc-200 bg-white p-10 text-center shadow-sm">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100">
              <Package className="h-7 w-7 text-zinc-700" />
            </div>
            <h2 className="text-2xl font-semibold text-zinc-950">No shipments yet</h2>
            <p className="mt-3 text-sm leading-7 text-zinc-500">
              Shipment records will appear here after orders are prepared for shipping.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {shipments.map((row) => (
              <div
                key={row.id}
                className="rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-sm"
              >
                <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
                  <div>
                    <div className="mb-4 flex flex-wrap items-center gap-3">
                      <StatusPill status={row.shipment_status} />
                      <MetaPill label="Order" value={`#${row.order_id}`} />
                      <MetaPill label="Tracking" value={row.tracking_number || "Not set"} />
                    </div>

                    <div className="grid gap-3 md:grid-cols-2">
                      <InfoRow label="Shipment ID" value={row.id} />
                      <InfoRow label="Buyer User ID" value={row.buyer_user_id} />
                      <InfoRow label="Carrier" value={row.carrier || "—"} />
                      <InfoRow label="Service" value={row.service || "—"} />
                      <InfoRow label="Provider" value={row.provider || "—"} />
                      <InfoRow
                        label="Shipping Cost"
                        value={
                          row.shipping_cost !== null && row.shipping_cost !== undefined
                            ? `$${Number(row.shipping_cost).toFixed(2)}`
                            : "—"
                        }
                      />
                      <InfoRow
                        label="Shipped At"
                        value={row.shipped_at ? formatDate(row.shipped_at) : "—"}
                      />
                      <InfoRow
                        label="Delivered At"
                        value={row.delivered_at ? formatDate(row.delivered_at) : "—"}
                      />
                    </div>

                    {row.label_url ? (
                      <div className="mt-4 rounded-[1.5rem] border border-zinc-200 bg-zinc-50 p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-zinc-500">
                          Label URL
                        </p>
                        <a
                          href={row.label_url}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-2 inline-flex items-center gap-2 break-all text-sm text-blue-600 underline"
                        >
                          <ExternalLink className="h-4 w-4" />
                          {row.label_url}
                        </a>
                      </div>
                    ) : null}

                    {(row.provider_shipment_id || row.provider_transaction_id || row.provider_rate_id) ? (
                      <div className="mt-4 rounded-[1.5rem] border border-zinc-200 bg-zinc-50 p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-zinc-500">
                          Provider References
                        </p>
                        <div className="mt-3 space-y-2 text-sm text-zinc-600">
                          <p>
                            <span className="font-medium text-zinc-900">Shipment ID:</span>{" "}
                            {row.provider_shipment_id || "—"}
                          </p>
                          <p>
                            <span className="font-medium text-zinc-900">Rate ID:</span>{" "}
                            {row.provider_rate_id || "—"}
                          </p>
                          <p>
                            <span className="font-medium text-zinc-900">Transaction ID:</span>{" "}
                            {row.provider_transaction_id || "—"}
                          </p>
                        </div>
                      </div>
                    ) : null}
                  </div>

                  <div className="rounded-[1.5rem] border border-zinc-200 bg-zinc-50 p-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.15em] text-zinc-500">
                      Update Shipment
                    </p>
                    <h3 className="mt-2 text-lg font-semibold text-zinc-950">
                      Label, Tracking, Status
                    </h3>

                    <div className="mt-5 space-y-4">
                      <div>
                        <label className="mb-2 block text-sm font-medium text-zinc-800">
                          Carrier
                        </label>
                        <input
                          value={carrierDrafts[row.id] ?? ""}
                          onChange={(e) =>
                            setCarrierDrafts((prev) => ({
                              ...prev,
                              [row.id]: e.target.value,
                            }))
                          }
                          placeholder="USPS"
                          className="h-12 w-full rounded-2xl border border-zinc-300 bg-white px-4 text-sm text-zinc-900 outline-none transition focus:border-yellow-500/40"
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-medium text-zinc-800">
                          Tracking Number
                        </label>
                        <input
                          value={trackingDrafts[row.id] ?? ""}
                          onChange={(e) =>
                            setTrackingDrafts((prev) => ({
                              ...prev,
                              [row.id]: e.target.value,
                            }))
                          }
                          placeholder="9400..."
                          className="h-12 w-full rounded-2xl border border-zinc-300 bg-white px-4 text-sm text-zinc-900 outline-none transition focus:border-yellow-500/40"
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-medium text-zinc-800">
                          Label URL
                        </label>
                        <input
                          value={labelDrafts[row.id] ?? ""}
                          onChange={(e) =>
                            setLabelDrafts((prev) => ({
                              ...prev,
                              [row.id]: e.target.value,
                            }))
                          }
                          placeholder="https://label-provider.com/label.pdf"
                          className="h-12 w-full rounded-2xl border border-zinc-300 bg-white px-4 text-sm text-zinc-900 outline-none transition focus:border-yellow-500/40"
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-medium text-zinc-800">
                          Shipment Status
                        </label>
                        <select
                          value={statusDrafts[row.id] ?? row.shipment_status}
                          onChange={(e) =>
                            setStatusDrafts((prev) => ({
                              ...prev,
                              [row.id]: e.target.value as ShipmentStatus,
                            }))
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

                      <div className="grid gap-3 sm:grid-cols-2">
                        <button
                          onClick={() => saveShipment(row)}
                          disabled={savingId === row.id}
                          className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-yellow-500 px-6 text-sm font-semibold text-black transition hover:scale-[1.01] disabled:opacity-50"
                        >
                          <Truck className="h-4 w-4" />
                          {savingId === row.id ? "Saving..." : "Save Shipment"}
                        </button>

                        <button
                          onClick={() => handleBuyLabel(row)}
                          disabled={buyingLabelId === row.id}
                          className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-zinc-300 bg-white px-6 text-sm font-semibold text-zinc-900 transition hover:bg-zinc-100 disabled:opacity-50"
                        >
                          <ReceiptText className="h-4 w-4" />
                          {buyingLabelId === row.id ? "Creating..." : "Buy Label"}
                        </button>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2">
                        <button
                          onClick={() => handleRegisterTracking(row)}
                          disabled={registeringTrackId === row.id}
                          className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-zinc-300 bg-white px-6 text-sm font-semibold text-zinc-900 transition hover:bg-zinc-100 disabled:opacity-50"
                        >
                          <ScanSearch className="h-4 w-4" />
                          {registeringTrackId === row.id ? "Registering..." : "Register Tracking"}
                        </button>

                        {row.label_url ? (
                          <a
                            href={row.label_url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-zinc-300 bg-white px-6 text-sm font-semibold text-zinc-900 transition hover:bg-zinc-100"
                          >
                            <ExternalLink className="h-4 w-4" />
                            Open Label
                          </a>
                        ) : (
                          <div className="inline-flex h-12 items-center justify-center rounded-2xl border border-dashed border-zinc-300 bg-white px-6 text-sm font-medium text-zinc-400">
                            No Label Yet
                          </div>
                        )}
                      </div>

                      <div className="rounded-2xl border border-zinc-200 bg-white p-4">
                        <div className="flex items-start gap-3">
                          <ShieldCheck className="mt-0.5 h-5 w-5 text-yellow-700" />
                          <div>
                            <p className="text-sm font-semibold text-zinc-950">
                              Shipping flow
                            </p>
                            <p className="mt-2 text-sm leading-6 text-zinc-500">
                              This page now supports label creation, tracking registration,
                              status updates, and label opening in one place.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function StatusPill({ status }: { status: ShipmentStatus }) {
  const styles: Record<ShipmentStatus, string> = {
    pending: "bg-zinc-100 text-zinc-700 border-zinc-200",
    processing: "bg-blue-50 text-blue-700 border-blue-200",
    label_created: "bg-yellow-50 text-yellow-700 border-yellow-200",
    shipped: "bg-purple-50 text-purple-700 border-purple-200",
    in_transit: "bg-indigo-50 text-indigo-700 border-indigo-200",
    out_for_delivery: "bg-orange-50 text-orange-700 border-orange-200",
    delivered: "bg-emerald-50 text-emerald-700 border-emerald-200",
    exception: "bg-red-50 text-red-700 border-red-200",
    returned: "bg-zinc-100 text-zinc-700 border-zinc-200",
  }

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1.5 text-xs font-semibold ${styles[status]}`}
    >
      {formatStatus(status)}
    </span>
  )
}

function MetaPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs font-medium text-zinc-700">
      {label}: {value}
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
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
  return value.replaceAll("_", " ").replace(/\b\w/g, (char) => char.toUpperCase())
}

function formatDate(value: string) {
  return new Date(value).toLocaleString()
}