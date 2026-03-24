"use client"

import { useEffect, useMemo, useState } from "react"
import { createClient } from "@/lib/supabase/client"

type OrderItem = {
  id: string
  q: number
  p: number
  n: string
}

type Order = {
  id: string
  user_id: string | null
  customer_email: string | null
  customer_name: string | null
  amount_total: number | null
  currency: string | null
  status: string | null
  payment_status: string | null
  shipping_status: string | null
  tracking_number: string | null
  items: OrderItem[] | null
  created_at: string
}

const SHIPPING_OPTIONS = ["processing", "shipped", "delivered", "cancelled"]

export default function DashboardOrdersPage() {
  const supabase = createClient()

  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [savingId, setSavingId] = useState<string | null>(null)
  const [draftShipping, setDraftShipping] = useState<Record<string, string>>({})
  const [draftTracking, setDraftTracking] = useState<Record<string, string>>({})

  useEffect(() => {
    async function fetchOrders() {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Orders fetch error:", error)
      } else {
        const safeOrders = (data || []) as Order[]
        setOrders(safeOrders)

        const shippingMap: Record<string, string> = {}
        const trackingMap: Record<string, string> = {}

        safeOrders.forEach((order) => {
          shippingMap[order.id] = order.shipping_status || "processing"
          trackingMap[order.id] = order.tracking_number || ""
        })

        setDraftShipping(shippingMap)
        setDraftTracking(trackingMap)
      }

      setLoading(false)
    }

    fetchOrders()
  }, [supabase])

  async function saveShipping(orderId: string) {
    setSavingId(orderId)

    const { error } = await supabase
      .from("orders")
      .update({
        shipping_status: draftShipping[orderId] || "processing",
        tracking_number: draftTracking[orderId] || null,
      })
      .eq("id", orderId)

    if (error) {
      console.error("Shipping update error:", error)
      alert("Failed to update shipping info.")
    } else {
      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId
            ? {
                ...order,
                shipping_status: draftShipping[orderId] || "processing",
                tracking_number: draftTracking[orderId] || null,
              }
            : order
        )
      )
      alert("Shipping info updated.")
    }

    setSavingId(null)
  }

  const totalRevenue = useMemo(() => {
    return orders.reduce((sum, order) => sum + Number(order.amount_total || 0), 0)
  }, [orders])

  return (
    <div className="min-h-screen bg-black px-8 py-10 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-4xl font-bold text-yellow-400">Seller Orders</h1>
            <p className="mt-2 text-zinc-400">
              Manage customer orders, shipping, and tracking.
            </p>
          </div>

          <div className="rounded-2xl border border-yellow-500/20 bg-zinc-950 px-5 py-4">
            <p className="text-sm text-zinc-500">Total Revenue</p>
            <p className="mt-1 text-2xl font-semibold text-yellow-400">
              ${totalRevenue.toFixed(2)}
            </p>
          </div>
        </div>

        {loading ? (
          <p className="text-zinc-400">Loading orders...</p>
        ) : orders.length === 0 ? (
          <p className="text-zinc-400">No orders yet.</p>
        ) : (
          <div className="space-y-5">
            {orders.map((order) => (
              <div
                key={order.id}
                className="rounded-3xl border border-yellow-500/20 bg-zinc-950 p-6"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-sm text-zinc-500">
                      {new Date(order.created_at).toLocaleString()}
                    </p>
                    <h2 className="mt-1 text-xl font-semibold text-white">
                      {order.customer_name || order.customer_email || "Customer"}
                    </h2>
                    <p className="text-sm text-zinc-400">
                      {order.customer_email || "No email"}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-lg font-semibold text-yellow-400">
                      {order.amount_total != null
                        ? `$${Number(order.amount_total).toFixed(2)}`
                        : "N/A"}
                    </p>
                    <p className="text-sm text-zinc-400">
                      {order.payment_status || "paid"} ·{" "}
                      {order.currency?.toUpperCase() || "USD"}
                    </p>
                  </div>
                </div>

                <div className="mt-5 grid gap-4 lg:grid-cols-[1.3fr_1fr]">
                  <div className="rounded-2xl border border-zinc-800 p-4">
                    <p className="mb-3 text-sm font-medium text-zinc-300">
                      Products Purchased
                    </p>

                    {!order.items || order.items.length === 0 ? (
                      <p className="text-sm text-zinc-500">No items found.</p>
                    ) : (
                      <div className="space-y-3">
                        {order.items.map((item) => (
                          <div
                            key={`${order.id}-${item.id}`}
                            className="rounded-xl border border-zinc-800 bg-black/20 p-4"
                          >
                            <div className="flex items-center justify-between gap-4">
                              <div>
                                <p className="font-medium text-white">{item.n}</p>
                                <p className="text-sm text-zinc-500">
                                  Product ID: {item.id}
                                </p>
                              </div>

                              <div className="text-right">
                                <p className="text-sm text-zinc-400">
                                  Qty: {item.q}
                                </p>
                                <p className="font-medium text-yellow-400">
                                  ${Number(item.p).toFixed(2)}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="rounded-2xl border border-zinc-800 p-4">
                    <p className="mb-3 text-sm font-medium text-zinc-300">
                      Shipping Management
                    </p>

                    <div className="space-y-4">
                      <div>
                        <label className="mb-2 block text-sm text-zinc-400">
                          Shipping Status
                        </label>
                        <select
                          value={draftShipping[order.id] || "processing"}
                          onChange={(e) =>
                            setDraftShipping((prev) => ({
                              ...prev,
                              [order.id]: e.target.value,
                            }))
                          }
                          className="w-full rounded-xl border border-zinc-700 bg-zinc-900 p-3 text-white outline-none"
                        >
                          {SHIPPING_OPTIONS.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="mb-2 block text-sm text-zinc-400">
                          Tracking Number
                        </label>
                        <input
                          type="text"
                          placeholder="Enter tracking number"
                          value={draftTracking[order.id] || ""}
                          onChange={(e) =>
                            setDraftTracking((prev) => ({
                              ...prev,
                              [order.id]: e.target.value,
                            }))
                          }
                          className="w-full rounded-xl border border-zinc-700 bg-zinc-900 p-3 text-white outline-none"
                        />
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="rounded-xl border border-zinc-800 p-3">
                          <p className="text-xs text-zinc-500">Current Status</p>
                          <p className="mt-1 text-white">
                            {order.shipping_status || "processing"}
                          </p>
                        </div>

                        <div className="rounded-xl border border-zinc-800 p-3">
                          <p className="text-xs text-zinc-500">Current Tracking</p>
                          <p className="mt-1 text-white">
                            {order.tracking_number || "Not added"}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => saveShipping(order.id)}
                        disabled={savingId === order.id}
                        className="w-full rounded-xl bg-yellow-500 px-5 py-3 font-semibold text-black disabled:opacity-50"
                      >
                        {savingId === order.id
                          ? "Saving..."
                          : "Save Shipping Update"}
                      </button>
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