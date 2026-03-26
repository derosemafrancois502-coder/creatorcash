"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import {
  ArrowLeft,
  ArrowRight,
  Box,
  CheckCircle2,
  Clock3,
  CreditCard,
  PackageCheck,
  Truck,
  AlertCircle,
  MessageCircle,
} from "lucide-react"

type OrderItem = {
  id: string
  q: number
  p: number
  n: string
}

type Order = {
  id: string | number
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
  user_id?: string | null
}

export default function OrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])

  const orderId = params.id as string

  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [errorText, setErrorText] = useState<string | null>(null)

  useEffect(() => {
    async function fetchOrder() {
      try {
        setLoading(true)
        setErrorText(null)

        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser()

        if (userError) {
          console.error("Get user error:", userError)
          setErrorText(userError.message || "Could not verify user.")
          return
        }

        if (!user) {
          setErrorText("Please sign in to view this order.")
          return
        }

        const { data, error } = await supabase
          .from("orders")
          .select("*")
          .eq("id", orderId)
          .eq("user_id", user.id)
          .single()

        if (error) {
          console.error("Order detail error:", error)
          setErrorText(error.message || "Could not load order.")
          setOrder(null)
          return
        }

        setOrder(data as Order)
      } catch (error: any) {
        console.error("Unexpected order detail error:", error)
        setErrorText(error?.message || "Unexpected error loading order.")
        setOrder(null)
      } finally {
        setLoading(false)
      }
    }

    if (orderId) {
      fetchOrder()
    }
  }, [orderId, supabase])

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
        icon: <CheckCircle2 className="h-4 w-4" />,
      }
    }

    if (value === "pending" || value === "unpaid") {
      return {
        label: "Pending",
        className:
          "border-yellow-500/20 bg-yellow-500/10 text-yellow-300",
        icon: <Clock3 className="h-4 w-4" />,
      }
    }

    if (value === "failed" || value === "canceled") {
      return {
        label: "Issue",
        className: "border-red-500/20 bg-red-500/10 text-red-300",
        icon: <AlertCircle className="h-4 w-4" />,
      }
    }

    return {
      label: value,
      className: "border-zinc-500/20 bg-zinc-500/10 text-zinc-300",
      icon: <CreditCard className="h-4 w-4" />,
    }
  }

  function getShippingBadge(status: string | null) {
    const value = normalizeShippingStatus(status)

    if (value === "delivered") {
      return {
        label: "Delivered",
        className:
          "border-emerald-500/20 bg-emerald-500/10 text-emerald-300",
        icon: <PackageCheck className="h-4 w-4" />,
      }
    }

    if (value === "shipped") {
      return {
        label: "Shipped",
        className: "border-blue-500/20 bg-blue-500/10 text-blue-300",
        icon: <Truck className="h-4 w-4" />,
      }
    }

    if (value === "processing") {
      return {
        label: "Processing",
        className:
          "border-yellow-500/20 bg-yellow-500/10 text-yellow-300",
        icon: <Box className="h-4 w-4" />,
      }
    }

    return {
      label: value,
      className: "border-zinc-500/20 bg-zinc-500/10 text-zinc-300",
      icon: <Box className="h-4 w-4" />,
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black px-4 py-8 text-white md:px-8 md:py-10">
        <div className="mx-auto max-w-5xl rounded-3xl border border-yellow-500/20 bg-zinc-950 p-8">
          <p className="text-zinc-400">Loading order...</p>
        </div>
      </div>
    )
  }

  if (errorText) {
    return (
      <div className="min-h-screen bg-black px-4 py-8 text-white md:px-8 md:py-10">
        <div className="mx-auto max-w-5xl rounded-3xl border border-red-500/20 bg-zinc-950 p-8">
          <h1 className="text-2xl font-bold text-red-300">Order failed to load</h1>
          <p className="mt-3 text-zinc-400">{errorText}</p>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => router.push("/orders")}
              className="inline-flex items-center gap-2 rounded-2xl bg-yellow-500 px-4 py-3 text-sm font-semibold text-black transition hover:scale-[1.01]"
            >
              Back to Orders
              <ArrowRight className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={() => router.push("/marketplace/explore")}
              className="inline-flex items-center gap-2 rounded-2xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800"
            >
              Go to Explore
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-black px-4 py-8 text-white md:px-8 md:py-10">
        <div className="mx-auto max-w-5xl rounded-3xl border border-yellow-500/20 bg-zinc-950 p-8">
          <p className="text-zinc-400">Order not found.</p>
        </div>
      </div>
    )
  }

  const paymentBadge = getPaymentBadge(order.payment_status)
  const shippingBadge = getShippingBadge(order.shipping_status)

  return (
    <div className="min-h-screen bg-black px-4 py-8 text-white md:px-8 md:py-10">
      <div className="mx-auto max-w-5xl rounded-3xl border border-yellow-500/20 bg-zinc-950 p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <button
              type="button"
              onClick={() => router.push("/orders")}
              className="inline-flex items-center gap-2 text-sm font-medium text-zinc-400 transition hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Orders
            </button>

            <h1 className="mt-4 text-3xl font-bold text-yellow-400">
              Order Detail
            </h1>

            <p className="mt-2 text-sm text-zinc-400">
              Order #{String(order.id)}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <span
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-semibold ${paymentBadge.className}`}
            >
              {paymentBadge.icon}
              {paymentBadge.label}
            </span>

            <span
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-semibold ${shippingBadge.className}`}
            >
              {shippingBadge.icon}
              {shippingBadge.label}
            </span>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-zinc-800 p-4">
            <p className="text-sm text-zinc-500">Customer</p>
            <p className="mt-1 text-white">
              {order.customer_name || order.customer_email || "N/A"}
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-800 p-4">
            <p className="text-sm text-zinc-500">Amount</p>
            <p className="mt-1 font-semibold text-yellow-400">
              {formatAmount(order.amount_total, order.currency)}
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-800 p-4">
            <p className="text-sm text-zinc-500">Payment Status</p>
            <p className="mt-1 text-white">{paymentBadge.label}</p>
          </div>

          <div className="rounded-2xl border border-zinc-800 p-4">
            <p className="text-sm text-zinc-500">Shipping Status</p>
            <p className="mt-1 text-white">{shippingBadge.label}</p>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-zinc-800 p-4">
          <div className="mb-4 flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-zinc-300">Products</p>

            <Link
              href={`/orders/${order.id}/messages`}
              className="inline-flex items-center gap-2 rounded-xl border border-zinc-800 bg-black/20 px-3 py-2 text-xs font-semibold text-white transition hover:bg-black/30"
            >
              <MessageCircle className="h-4 w-4" />
              Order Messages
            </Link>
          </div>

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
                      ${Number(item.p || 0).toFixed(2)}
                    </p>
                  </div>

                  <div className="mt-4">
                    <Link
                      href={`/orders/${order.id}/messages`}
                      className="inline-flex items-center gap-2 rounded-xl border border-yellow-500/20 bg-yellow-500/10 px-3 py-2 text-xs font-semibold text-yellow-300 transition hover:bg-yellow-500/15"
                    >
                      <MessageCircle className="h-4 w-4" />
                      Message Seller
                    </Link>
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
          <pre className="overflow-x-auto whitespace-pre-wrap break-words text-xs text-zinc-500">
            {order.shipping_address
              ? JSON.stringify(order.shipping_address, null, 2)
              : "No shipping address found."}
          </pre>
        </div>
      </div>
    </div>
  )
}