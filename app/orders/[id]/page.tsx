"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

type OrderItem = {
  id: string
  q: number
  p: number
  n: string
}

type Order = {
  id: string
  customer_email: string | null
  customer_name: string | null
  amount_total: number | null
  currency: string | null
  status: string | null
  payment_status: string | null
  shipping_status: string | null
  tracking_number: string | null
  shipping_address: any
  items: OrderItem[] | null
  created_at: string
}

export default function OrderDetailPage() {
  const params = useParams()
  const orderId = params.id as string

  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    async function fetchOrder() {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("id", orderId)
        .single()

      if (error) {
        console.error("Order detail error:", error)
      } else {
        setOrder(data)
      }

      setLoading(false)
    }

    if (orderId) fetchOrder()
  }, [orderId])

  if (loading) {
    return <div className="p-8 text-zinc-400">Loading order...</div>
  }

  if (!order) {
    return <div className="p-8 text-zinc-400">Order not found.</div>
  }

  return (
    <div className="min-h-screen bg-black px-8 py-10 text-white">
      <div className="mx-auto max-w-5xl rounded-3xl border border-yellow-500/20 bg-zinc-950 p-8">
        <h1 className="text-3xl font-bold text-yellow-400">Order Detail</h1>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-zinc-800 p-4">
            <p className="text-sm text-zinc-500">Customer</p>
            <p className="mt-1 text-white">
              {order.customer_name || order.customer_email || "N/A"}
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-800 p-4">
            <p className="text-sm text-zinc-500">Amount</p>
            <p className="mt-1 text-white">
              {order.amount_total != null
                ? `$${Number(order.amount_total).toFixed(2)}`
                : "N/A"}
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-800 p-4">
            <p className="text-sm text-zinc-500">Payment Status</p>
            <p className="mt-1 text-white">{order.payment_status || "paid"}</p>
          </div>

          <div className="rounded-2xl border border-zinc-800 p-4">
            <p className="text-sm text-zinc-500">Shipping Status</p>
            <p className="mt-1 text-white">
              {order.shipping_status || "processing"}
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-zinc-800 p-4">
          <p className="mb-3 text-sm font-medium text-zinc-300">Products</p>

          {!order.items || order.items.length === 0 ? (
            <p className="text-sm text-zinc-500">No items found.</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {order.items.map((item) => (
                <div
                  key={`${order.id}-${item.id}`}
                  className="rounded-2xl border border-zinc-800 bg-black/20 p-4"
                >
                  <p className="font-medium text-white">{item.n}</p>
                  <p className="mt-1 text-sm text-zinc-500">
                    Product ID: {item.id}
                  </p>
                  <div className="mt-3 flex items-center justify-between">
                    <p className="text-sm text-zinc-400">Qty: {item.q}</p>
                    <p className="font-semibold text-yellow-400">
                      ${Number(item.p).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-zinc-800 p-4">
            <p className="text-sm text-zinc-500">Tracking Number</p>
            <p className="mt-1 text-white">
              {order.tracking_number || "Not added yet"}
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-800 p-4">
            <p className="text-sm text-zinc-500">Order Date</p>
            <p className="mt-1 text-white">
              {new Date(order.created_at).toLocaleString()}
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-zinc-800 p-4">
          <p className="mb-2 text-sm font-medium text-zinc-300">
            Shipping Address
          </p>
          <pre className="overflow-x-auto text-xs text-zinc-500">
            {JSON.stringify(order.shipping_address, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  )
}