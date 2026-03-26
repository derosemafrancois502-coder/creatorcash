"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import {
  ArrowRight,
  Box,
  CheckCircle2,
  Clock3,
  CreditCard,
  PackageCheck,
  ShoppingBag,
  Truck,
  AlertCircle,
  MessageCircle,
} from "lucide-react"

type Order = {
  id: string | number
  customer_email: string | null
  customer_name: string | null
  amount_total: number | null
  currency: string | null
  payment_status: string | null
  shipping_status: string | null
  tracking_number: string | null
  created_at: string
  user_id?: string | null
}

export default function OrdersPage() {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])

  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [errorText, setErrorText] = useState<string | null>(null)

  useEffect(() => {
    async function fetchOrders() {
      try {
        setLoading(true)
        setErrorText(null)

        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser()

        if (userError) {
          console.error("Get user error:", userError)
          setErrorText(userError.message || "Could not get current user.")
          setOrders([])
          return
        }

        if (!user) {
          setErrorText("Please sign in to view your orders.")
          setOrders([])
          return
        }

        const response = await supabase
          .from("orders")
          .select(
            "id, user_id, customer_email, customer_name, amount_total, currency, payment_status, shipping_status, tracking_number, created_at"
          )
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })

        if (response.error) {
          console.error("Orders fetch raw error:", response.error)
          console.error("Orders fetch message:", response.error.message)
          console.error("Orders fetch details:", response.error.details)
          console.error("Orders fetch hint:", response.error.hint)
          console.error("Orders fetch code:", (response.error as any)?.code)

          setErrorText(response.error.message || "Failed to load orders.")
          setOrders([])
          return
        }

        setOrders((response.data as Order[]) || [])
      } catch (error: any) {
        console.error("Unexpected orders fetch error:", error)
        setErrorText(error?.message || "Unexpected error loading orders.")
        setOrders([])
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [supabase])

  function formatAmount(amount: number | null, currency: string | null) {
    const safeAmount = Number(amount || 0)
    const safeCurrency = (currency || "USD").toUpperCase()

    try {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: safeCurrency,
      }).format(safeAmount / 100)
    } catch {
      return `$${(safeAmount / 100).toFixed(2)}`
    }
  }

  function normalizePaymentStatus(status: string | null) {
    return (status || "paid").toLowerCase()
  }

  function normalizeShippingStatus(status: string | null) {
    return (status || "processing").toLowerCase()
  }

  function getPaymentBadge(status: string | null) {
    const value = normalizePaymentStatus(status)

    if (value === "paid" || value === "succeeded") {
      return {
        label: "Paid",
        className:
          "border-emerald-500/20 bg-emerald-500/10 text-emerald-300",
        icon: <CheckCircle2 className="h-3.5 w-3.5" />,
      }
    }

    if (value === "pending" || value === "unpaid") {
      return {
        label: "Pending",
        className:
          "border-yellow-500/20 bg-yellow-500/10 text-yellow-300",
        icon: <Clock3 className="h-3.5 w-3.5" />,
      }
    }

    if (value === "failed" || value === "canceled") {
      return {
        label: "Issue",
        className: "border-red-500/20 bg-red-500/10 text-red-300",
        icon: <AlertCircle className="h-3.5 w-3.5" />,
      }
    }

    return {
      label: value,
      className: "border-zinc-500/20 bg-zinc-500/10 text-zinc-300",
      icon: <CreditCard className="h-3.5 w-3.5" />,
    }
  }

  function getShippingBadge(status: string | null) {
    const value = normalizeShippingStatus(status)

    if (value === "delivered") {
      return {
        label: "Delivered",
        className:
          "border-emerald-500/20 bg-emerald-500/10 text-emerald-300",
        icon: <PackageCheck className="h-3.5 w-3.5" />,
      }
    }

    if (value === "shipped") {
      return {
        label: "Shipped",
        className: "border-blue-500/20 bg-blue-500/10 text-blue-300",
        icon: <Truck className="h-3.5 w-3.5" />,
      }
    }

    if (value === "processing") {
      return {
        label: "Processing",
        className:
          "border-yellow-500/20 bg-yellow-500/10 text-yellow-300",
        icon: <Box className="h-3.5 w-3.5" />,
      }
    }

    return {
      label: value,
      className: "border-zinc-500/20 bg-zinc-500/10 text-zinc-300",
      icon: <Box className="h-3.5 w-3.5" />,
    }
  }

  function goToOrderMessages(orderId?: string | number) {
    if (!orderId) {
      if (orders.length > 0) {
        router.push(`/orders/${orders[0].id}`)
        return
      }

      alert("No orders yet. Messages open from an order.")
      return
    }

    router.push(`/orders/${orderId}`)
  }

  return (
    <div className="min-h-screen bg-black px-4 py-8 text-white md:px-8 md:py-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-yellow-400/70">
              Customer Side
            </p>
            <h1 className="mt-2 text-3xl font-bold text-yellow-400 md:text-4xl">
              My Orders
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-zinc-400">
              See what you bought, payment status, shipping progress, and order details.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => router.push("/marketplace/explore")}
              className="inline-flex items-center gap-2 rounded-2xl border border-yellow-500/20 bg-zinc-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-zinc-900"
            >
              Continue Shopping
              <ArrowRight className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={() => goToOrderMessages()}
              className="inline-flex items-center gap-2 rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-zinc-900"
            >
              <MessageCircle className="h-4 w-4" />
              Order Messages
            </button>
          </div>
        </div>

        {loading ? (
          <div className="rounded-3xl border border-yellow-500/20 bg-zinc-950 p-8 text-center">
            <p className="text-zinc-400">Loading orders...</p>
          </div>
        ) : errorText ? (
          <div className="rounded-3xl border border-red-500/20 bg-zinc-950 p-8 text-center">
            <h2 className="text-lg font-semibold text-red-300">Orders failed to load</h2>
            <p className="mt-2 text-sm text-zinc-400">{errorText}</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="rounded-3xl border border-yellow-500/20 bg-zinc-950 p-10 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-yellow-500/10">
              <ShoppingBag className="h-8 w-8 text-yellow-400" />
            </div>

            <h2 className="mt-5 text-xl font-semibold text-white">No orders yet</h2>
            <p className="mt-2 text-sm text-zinc-400">
              Your purchases will appear here after checkout.
            </p>

            <button
              type="button"
              onClick={() => router.push("/marketplace/explore")}
              className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-yellow-500 px-5 py-3 text-sm font-semibold text-black transition hover:scale-[1.01]"
            >
              Go to Explore
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const paymentBadge = getPaymentBadge(order.payment_status)
              const shippingBadge = getShippingBadge(order.shipping_status)

              return (
                <div
                  key={String(order.id)}
                  className="rounded-3xl border border-yellow-500/20 bg-zinc-950 p-5 transition hover:border-yellow-400/35 hover:bg-zinc-900/80"
                >
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full border border-yellow-500/20 bg-yellow-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-yellow-300">
                          Order
                        </span>
                        <p className="text-sm font-semibold text-white">
                          #{String(order.id)}
                        </p>
                      </div>

                      <p className="mt-3 text-sm text-zinc-300">
                        {order.customer_name || order.customer_email || "Customer"}
                      </p>

                      <p className="mt-1 text-sm text-zinc-500">
                        {new Date(order.created_at).toLocaleString()}
                      </p>

                      {order.tracking_number ? (
                        <p className="mt-2 text-xs text-zinc-400">
                          Tracking:{" "}
                          <span className="font-medium text-zinc-200">
                            {order.tracking_number}
                          </span>
                        </p>
                      ) : null}
                    </div>

                    <div className="flex flex-col gap-3 lg:items-end">
                      <p className="text-2xl font-bold text-yellow-400">
                        {formatAmount(order.amount_total, order.currency)}
                      </p>

                      <div className="flex flex-wrap gap-2 lg:justify-end">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold ${paymentBadge.className}`}
                        >
                          {paymentBadge.icon}
                          {paymentBadge.label}
                        </span>

                        <span
                          className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold ${shippingBadge.className}`}
                        >
                          {shippingBadge.icon}
                          {shippingBadge.label}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-2 lg:justify-end">
                        <Link
                          href={`/orders/${order.id}`}
                          className="inline-flex items-center gap-2 rounded-2xl border border-yellow-500/20 bg-yellow-500/10 px-4 py-2 text-sm font-semibold text-yellow-300 transition hover:bg-yellow-500/15"
                        >
                          View Order
                          <ArrowRight className="h-4 w-4" />
                        </Link>

                        <button
                          type="button"
                          onClick={() => goToOrderMessages(order.id)}
                          className="inline-flex items-center gap-2 rounded-2xl border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-800"
                        >
                          <MessageCircle className="h-4 w-4" />
                          Message Seller
                        </button>
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