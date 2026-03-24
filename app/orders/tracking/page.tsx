"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  Package,
  Truck,
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
  shipped_at: string | null
  delivered_at: string | null
  created_at: string
}

const progressOrder: ShipmentStatus[] = [
  "pending",
  "processing",
  "label_created",
  "shipped",
  "in_transit",
  "out_for_delivery",
  "delivered",
]

export default function OrderTrackingPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = useMemo(() => createClient(), [])

  const [loading, setLoading] = useState(true)
  const [shipment, setShipment] = useState<ShipmentRow | null>(null)

  const orderId = searchParams.get("order_id")

  useEffect(() => {
    void loadTracking()
  }, [orderId])

  async function loadTracking() {
    try {
      setLoading(true)

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/marketplace")
        return
      }

      if (!orderId) {
        setShipment(null)
        return
      }

      const numericOrderId = Number(orderId)
      if (Number.isNaN(numericOrderId)) {
        setShipment(null)
        return
      }

      const { data, error } = await supabase
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
          shipped_at,
          delivered_at,
          created_at
        `)
        .eq("order_id", numericOrderId)
        .eq("buyer_user_id", user.id)
        .maybeSingle()

      if (error) {
        console.error(error)
        setShipment(null)
        return
      }

      setShipment((data as ShipmentRow | null) ?? null)
    } catch (error) {
      console.error(error)
      setShipment(null)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white px-6">
        <div className="rounded-[2rem] border border-zinc-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 h-12 w-12 animate-pulse rounded-full bg-zinc-200" />
          <h2 className="text-lg font-semibold text-zinc-900">Loading tracking...</h2>
          <p className="mt-2 text-sm text-zinc-600">Preparing shipment status.</p>
        </div>
      </div>
    )
  }

  if (!shipment) {
    return (
      <div className="min-h-screen bg-white px-6 py-16 text-zinc-900">
        <div className="mx-auto max-w-3xl rounded-[2rem] border border-zinc-200 bg-white p-10 text-center shadow-sm">
          <h1 className="text-3xl font-semibold">Tracking not found</h1>
          <p className="mt-3 text-sm text-zinc-600">
            Shipment details are not available for this order yet.
          </p>
          <Link
            href="/orders"
            className="mt-6 inline-flex rounded-2xl bg-yellow-500 px-5 py-3 text-sm font-semibold text-black"
          >
            Back to Orders
          </Link>
        </div>
      </div>
    )
  }

  const currentIndex = progressOrder.indexOf(shipment.shipment_status)

  return (
    <div className="min-h-screen bg-white text-zinc-900">
      <div className="border-b border-zinc-200 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4 md:px-8">
          <Link
            href="/orders"
            className="inline-flex items-center gap-2 text-sm font-medium text-zinc-600 transition hover:text-zinc-950"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Orders
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-5 py-10 md:px-8">
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-yellow-600/80">
            CreatorGoat Tracking
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-zinc-950 md:text-5xl">
            Track Your Order
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-zinc-500 md:text-base">
            Follow the latest shipping progress from seller preparation to delivery.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
          <div className="rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-sm md:p-8">
            <div className="mb-6 flex flex-wrap items-center gap-3">
              <div className="rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs font-medium text-zinc-700">
                Order #{shipment.order_id}
              </div>
              <div className="rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs font-medium text-zinc-700">
                {formatStatus(shipment.shipment_status)}
              </div>
            </div>

            <div className="space-y-5">
              {progressOrder.map((step, index) => {
                const done = currentIndex >= index
                const active = shipment.shipment_status === step

                return (
                  <div key={step} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-full border ${
                          done
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                            : "border-zinc-200 bg-white text-zinc-400"
                        }`}
                      >
                        {done ? <CheckCircle2 className="h-5 w-5" /> : <Circle className="h-4 w-4" />}
                      </div>
                      {index !== progressOrder.length - 1 ? (
                        <div className={`mt-2 h-10 w-px ${done ? "bg-emerald-200" : "bg-zinc-200"}`} />
                      ) : null}
                    </div>

                    <div className="pb-6">
                      <p className={`text-sm font-semibold ${active ? "text-zinc-950" : "text-zinc-700"}`}>
                        {formatStatus(step)}
                      </p>
                      <p className="mt-1 text-sm text-zinc-500">
                        {getStepDescription(step)}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="space-y-5">
            <div className="rounded-[2rem] border border-zinc-200 bg-zinc-50 p-6">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-white shadow-sm">
                <Truck className="h-5 w-5 text-yellow-700" />
              </div>
              <h3 className="text-lg font-semibold text-zinc-950">Shipment Info</h3>

              <div className="mt-4 space-y-3 text-sm">
                <InfoRow label="Carrier" value={shipment.carrier || "Not set"} />
                <InfoRow label="Service" value={shipment.service || "Not set"} />
                <InfoRow
                  label="Tracking Number"
                  value={shipment.tracking_number || "Not set"}
                />
                <InfoRow
                  label="Shipped At"
                  value={shipment.shipped_at ? formatDate(shipment.shipped_at) : "—"}
                />
                <InfoRow
                  label="Delivered At"
                  value={shipment.delivered_at ? formatDate(shipment.delivered_at) : "—"}
                />
              </div>
            </div>

            <div className="rounded-[2rem] border border-zinc-200 bg-zinc-50 p-6">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-white shadow-sm">
                <Package className="h-5 w-5 text-zinc-700" />
              </div>
              <h3 className="text-lg font-semibold text-zinc-950">Status Notes</h3>
              <p className="mt-3 text-sm leading-6 text-zinc-500">
                Once live shipping APIs are connected, USPS scans and tracking updates can
                sync automatically into this page.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-zinc-200 pb-3 text-sm last:border-b-0 last:pb-0">
      <span className="text-zinc-500">{label}</span>
      <span className="text-right font-medium text-zinc-900">{value}</span>
    </div>
  )
}

function formatStatus(value: string) {
  return value.replaceAll("_", " ").replace(/\b\w/g, (char) => char.toUpperCase())
}

function formatDate(value: string) {
  return new Date(value).toLocaleString()
}

function getStepDescription(step: ShipmentStatus) {
  const descriptions: Record<ShipmentStatus, string> = {
    pending: "Order received and waiting for seller action.",
    processing: "Seller is preparing the order for shipment.",
    label_created: "Shipping label has been created.",
    shipped: "Package has been handed off for shipment.",
    in_transit: "Package is moving through the carrier network.",
    out_for_delivery: "Package is out for delivery today.",
    delivered: "Package has been delivered successfully.",
    exception: "There is a shipping issue or exception.",
    returned: "Package has been returned.",
  }

  return descriptions[step]
}