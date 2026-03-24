"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"

type Order = {
  id: string
  customer_email: string | null
  customer_name: string | null
  amount_total: number | null
  currency: string | null
  payment_status: string | null
  shipping_status: string | null
  tracking_number: string | null
  created_at: string
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

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
        setOrders(data || [])
      }

      setLoading(false)
    }

    fetchOrders()
  }, [])

  return (
    <div className="min-h-screen bg-black px-8 py-10 text-white">
      <div className="mx-auto max-w-6xl">
        <h1 className="mb-8 text-4xl font-bold text-yellow-400">
          Order History
        </h1>

        {loading ? (
          <p className="text-zinc-400">Loading orders...</p>
        ) : orders.length === 0 ? (
          <p className="text-zinc-400">No orders yet.</p>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Link
                key={order.id}
                href={`/orders/${order.id}`}
                className="block rounded-3xl border border-yellow-500/20 bg-zinc-950 p-6"
              >
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-zinc-300">
                      {order.customer_name || order.customer_email || "Customer"}
                    </p>
                    <p className="text-sm text-zinc-500">
                      {new Date(order.created_at).toLocaleString()}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-yellow-400">
                      {order.amount_total != null
                        ? `$${Number(order.amount_total).toFixed(2)}`
                        : "N/A"}
                    </p>
                    <p className="text-sm text-zinc-400">
                      {order.payment_status || "paid"} ·{" "}
                      {order.currency?.toUpperCase() || "USD"}
                    </p>
                    <p className="mt-1 text-xs text-zinc-500">
                      Shipping: {order.shipping_status || "processing"}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}