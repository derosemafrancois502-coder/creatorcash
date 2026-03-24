"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { clearCart } from "@/lib/cart"
import { clearAffiliateRef } from "@/lib/affiliate"
import {
  CheckCircle2,
  Receipt,
  ShieldCheck,
  ShoppingBag,
} from "lucide-react"

type OrderSummary = {
  shipping_method: string
  subtotal: string
  shipping: string
  tax: string
  total: string
}

export default function SuccessPage() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get("session_id")

  const [loading, setLoading] = useState(true)
  const [summary, setSummary] = useState<OrderSummary | null>(null)
  const [orderFound, setOrderFound] = useState(false)

  useEffect(() => {
    async function confirmOrder() {
      if (!sessionId) {
        clearCart()
        clearAffiliateRef()
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
        clearAffiliateRef()
        setLoading(false)
      }
    }

    void confirmOrder()
  }, [sessionId])

  return (
    <div className="min-h-screen bg-white px-5 py-10 text-zinc-900 md:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="rounded-[2rem] border border-zinc-200 bg-white p-8 shadow-sm md:p-10">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700">
            <CheckCircle2 className="h-4 w-4" />
            Payment Successful
          </div>

          <h1 className="text-3xl font-semibold text-zinc-950 md:text-5xl">
            Order Confirmed
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-7 text-zinc-500 md:text-base">
            Your payment was completed successfully. Your order has been received
            and your checkout flow is complete.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <InfoCard
              icon={<CheckCircle2 className="h-5 w-5 text-emerald-700" />}
              title="Payment Received"
              description="Stripe payment completed successfully."
            />
            <InfoCard
              icon={<Receipt className="h-5 w-5 text-yellow-700" />}
              title="Order Processed"
              description="Your order confirmation has been recorded."
            />
            <InfoCard
              icon={<ShieldCheck className="h-5 w-5 text-blue-700" />}
              title="Secure Checkout"
              description="Your checkout flow remained protected."
            />
          </div>

          {loading ? (
            <div className="mt-8 rounded-[1.5rem] border border-zinc-200 bg-zinc-50 p-6 text-zinc-500">
              Loading order summary...
            </div>
          ) : orderFound && summary ? (
            <div className="mt-8 rounded-[1.5rem] border border-zinc-200 bg-zinc-50 p-6">
              <div className="mb-5">
                <h2 className="text-2xl font-semibold text-zinc-950">
                  Order Summary
                </h2>
                <p className="mt-2 text-sm text-zinc-500">
                  Review your completed purchase details below.
                </p>
              </div>

              <div className="space-y-4 text-sm">
                <SummaryRow
                  label="Shipping Method"
                  value={formatShippingMethod(summary.shipping_method)}
                />
                <SummaryRow
                  label="Subtotal"
                  value={`$${Number(summary.subtotal || 0).toFixed(2)}`}
                />
                <SummaryRow
                  label="Shipping"
                  value={`$${Number(summary.shipping || 0).toFixed(2)}`}
                />
                <SummaryRow
                  label="Tax"
                  value={`$${Number(summary.tax || 0).toFixed(2)}`}
                />

                <div className="border-t border-zinc-200 pt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-base font-semibold text-zinc-950">
                      Total
                    </span>
                    <span className="text-2xl font-semibold text-yellow-600">
                      ${Number(summary.total || 0).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-8 rounded-[1.5rem] border border-yellow-200 bg-yellow-50 p-6">
              <h2 className="text-2xl font-semibold text-zinc-950">
                Payment Received
              </h2>
              <p className="mt-3 text-sm leading-7 text-zinc-600">
                Your Stripe payment was successful, but the order summary could
                not be loaded right now.
              </p>
            </div>
          )}

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <Link
              href="/marketplace"
              className="inline-flex items-center justify-center rounded-2xl bg-yellow-500 px-5 py-3 text-center text-sm font-semibold text-black transition hover:scale-[1.01]"
            >
              Back to Marketplace
            </Link>

            <Link
              href="/orders"
              className="inline-flex items-center justify-center rounded-2xl border border-zinc-300 bg-white px-5 py-3 text-center text-sm font-semibold text-zinc-900 transition hover:bg-zinc-50"
            >
              View Orders
            </Link>

            <Link
              href="/marketplace/explore"
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-zinc-300 bg-white px-5 py-3 text-center text-sm font-semibold text-zinc-900 transition hover:bg-zinc-50"
            >
              <ShoppingBag className="h-4 w-4" />
              Keep Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

function SummaryRow({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-zinc-500">{label}</span>
      <span className="font-medium text-zinc-950">{value}</span>
    </div>
  )
}

function InfoCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="rounded-[1.5rem] border border-zinc-200 bg-zinc-50 p-5">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-white shadow-sm">
        {icon}
      </div>
      <h3 className="text-sm font-semibold text-zinc-950">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-zinc-500">{description}</p>
    </div>
  )
}

function formatShippingMethod(value: string) {
  if (!value) return "Standard"
  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase())
}