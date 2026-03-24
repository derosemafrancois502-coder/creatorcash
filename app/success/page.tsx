"use client"

import { Suspense, useEffect, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { clearCart } from "@/lib/cart"

type OrderSummary = {
  shipping_method: string
  subtotal: string
  shipping: string
  tax: string
  total: string
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<SuccessFallback />}>
      <SuccessContent />
    </Suspense>
  )
}

function SuccessContent() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get("session_id")

  const [loading, setLoading] = useState(true)
  const [summary, setSummary] = useState<OrderSummary | null>(null)
  const [orderFound, setOrderFound] = useState(false)

  useEffect(() => {
    async function confirmOrder() {
      if (!sessionId) {
        clearCart()
        setLoading(false)
        return
      }

      try {
        const response = await fetch("/api/orders/confirm", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ sessionId }),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data?.error || "Failed to confirm order.")
        }

        const order = data?.order

        if (order) {
          setSummary({
            shipping_method: order.shipping_method || "standard",
            subtotal: order.subtotal || "0.00",
            shipping: order.shipping || "0.00",
            tax: order.tax || "0.00",
            total: order.total || "0.00",
          })
          setOrderFound(true)
        } else {
          setOrderFound(false)
        }
      } catch (error) {
        console.error("Success page confirm error:", error)
        setOrderFound(false)
      } finally {
        clearCart()
        setLoading(false)
      }
    }

    confirmOrder()
  }, [sessionId])

  return (
    <div className="min-h-screen bg-black px-8 py-10 text-white">
      <div className="mx-auto max-w-3xl">
        <div className="rounded-3xl border border-yellow-500/20 bg-zinc-950 p-8">
          <div className="mb-6">
            <span className="rounded-full bg-green-500/10 px-4 py-2 text-sm font-medium text-green-400">
              Payment Successful
            </span>
          </div>

          <h1 className="text-4xl font-bold text-yellow-400">
            Order Confirmed
          </h1>

          <p className="mt-4 text-zinc-400">
            Your payment was completed successfully. Your order has been received.
          </p>

          {loading ? (
            <div className="mt-8 rounded-2xl border border-zinc-800 bg-black/20 p-6 text-zinc-400">
              Loading order summary...
            </div>
          ) : orderFound && summary ? (
            <div className="mt-8 rounded-2xl border border-zinc-800 bg-black/20 p-6">
              <h2 className="text-2xl font-semibold text-white">
                Order Summary
              </h2>

              <div className="mt-6 space-y-4 text-sm">
                <div className="flex items-center justify-between text-zinc-300">
                  <span>Shipping Method</span>
                  <span className="capitalize">{summary.shipping_method}</span>
                </div>

                <div className="flex items-center justify-between text-zinc-300">
                  <span>Subtotal</span>
                  <span>${Number(summary.subtotal || 0).toFixed(2)}</span>
                </div>

                <div className="flex items-center justify-between text-zinc-300">
                  <span>Shipping</span>
                  <span>${Number(summary.shipping || 0).toFixed(2)}</span>
                </div>

                <div className="flex items-center justify-between text-zinc-300">
                  <span>Tax</span>
                  <span>${Number(summary.tax || 0).toFixed(2)}</span>
                </div>

                <div className="border-t border-zinc-800 pt-4">
                  <div className="flex items-center justify-between text-base font-semibold text-white">
                    <span>Total</span>
                    <span className="text-yellow-400">
                      ${Number(summary.total || 0).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-8 rounded-2xl border border-yellow-500/20 bg-black/20 p-6">
              <h2 className="text-2xl font-semibold text-white">
                Payment Received
              </h2>
              <p className="mt-3 text-sm text-zinc-400">
                Your Stripe payment was successful, but the order summary could
                not be loaded.
              </p>
            </div>
          )}

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <Link
              href="/marketplace"
              className="rounded-xl bg-yellow-500 px-5 py-3 text-center font-semibold text-black"
            >
              Back to Marketplace
            </Link>

            <Link
              href="/orders"
              className="rounded-xl border border-zinc-700 px-5 py-3 text-center text-white"
            >
              View Orders
            </Link>

            <Link
              href="/discover"
              className="rounded-xl border border-zinc-700 px-5 py-3 text-center text-white"
            >
              Keep Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

function SuccessFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-black text-white">
      Loading success page...
    </div>
  )
}