"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"

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
  items: any
  created_at: string
}

export default function DashboardOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    async function fetchOrders() {
      try {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser()

        if (authError) {
          console.error(
            "Auth fetch error:",
            authError.message,
            authError
          )
          setOrders([])
          return
        }

        if (!user) {
          setOrders([])
          return
        }

        const { data, error } = await supabase
          .from("orders")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })

        if (error) {
          console.error(
            "Orders fetch error:",
            error.message,
            error.details,
            error.hint,
            error.code,
            error
          )
          setOrders([])
          return
        }

        setOrders((data as Order[]) || [])
      } catch (err) {
        console.error("Unexpected fetchOrders error:", err)
        setOrders([])
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [])

  return (
    <div className="min-h-screen bg-black px-8 py-10 text-white">
      <div className="mx-auto max-w-6xl">
        <h1 className="mb-8 text-4xl font-bold text-yellow-400">
          Seller Orders
        </h1>

        {loading ? (
          <p className="text-zinc-400">Loading orders...</p>
        ) : orders.length === 0 ? (
          <p className="text-zinc-400">No orders yet.</p>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="rounded-3xl border border-yellow-500/20 bg-zinc-950 p-6"
              >
                <div className="flex flex-wrap items-center justify-between gap-4">
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

                <div className="mt-4 grid gap-4 md:grid-cols-3">
                  <div className="rounded-2xl border border-zinc-800 p-4">
                    <p className="text-sm text-zinc-500">Order Status</p>
                    <p className="mt-1 text-white">{order.status || "paid"}</p>
                  </div>

                  <div className="rounded-2xl border border-zinc-800 p-4">
                    <p className="text-sm text-zinc-500">Shipping Status</p>
                    <p className="mt-1 text-white">
                      {order.shipping_status || "Not shipped"}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-zinc-800 p-4">
                    <p className="text-sm text-zinc-500">Tracking</p>
                    <p className="mt-1 text-white">
                      {order.tracking_number || "No tracking yet"}
                    </p>
                  </div>
                </div>

                <div className="mt-4 rounded-2xl border border-zinc-800 p-4">
                  <p className="mb-2 text-sm font-medium text-zinc-300">
                    Products Purchased
                  </p>
                  <pre className="overflow-x-auto text-xs text-zinc-500">
                    {JSON.stringify(order.items, null, 2)}
                  </pre>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}