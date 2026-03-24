"use client"

import Link from "next/link"
import { useEffect } from "react"
import {
  XCircle,
  ShoppingCart,
  ArrowLeft,
  RefreshCcw,
} from "lucide-react"

export default function CancelPage() {
  useEffect(() => {
    console.log("Checkout canceled by user")
  }, [])

  return (
    <div className="min-h-screen bg-white px-5 py-10 text-zinc-900 md:px-8">
      <div className="mx-auto max-w-3xl">
        <div className="rounded-[2rem] border border-zinc-200 bg-white p-8 shadow-sm md:p-10">
          
          {/* STATUS */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-red-50 px-4 py-2 text-sm font-medium text-red-600">
            <XCircle className="h-4 w-4" />
            Payment Canceled
          </div>

          {/* TITLE */}
          <h1 className="text-3xl font-semibold text-zinc-950 md:text-5xl">
            Checkout Not Completed
          </h1>

          <p className="mt-4 max-w-xl text-sm leading-7 text-zinc-500 md:text-base">
            Your payment was not completed. You can return to your cart and
            continue checkout whenever you're ready.
          </p>

          {/* INFO CARDS */}
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <InfoCard
              title="No Payment Taken"
              description="You were not charged. Your items are still in your cart."
            />
            <InfoCard
              title="Continue Anytime"
              description="You can return and complete your purchase at any time."
            />
          </div>

          {/* ACTION BUTTONS */}
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            
            <Link
              href="/cart"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-yellow-500 px-5 py-3 text-sm font-semibold text-black transition hover:scale-[1.01]"
            >
              <ShoppingCart className="h-4 w-4" />
              Back to Cart
            </Link>

            <Link
              href="/checkout"
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-zinc-300 bg-white px-5 py-3 text-sm font-semibold text-zinc-900 transition hover:bg-zinc-50"
            >
              <RefreshCcw className="h-4 w-4" />
              Try Again
            </Link>

            <Link
              href="/marketplace/explore"
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-zinc-300 bg-white px-5 py-3 text-sm font-semibold text-zinc-900 transition hover:bg-zinc-50"
            >
              <ArrowLeft className="h-4 w-4" />
              Continue Shopping
            </Link>

          </div>
        </div>
      </div>
    </div>
  )
}

function InfoCard({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <div className="rounded-[1.5rem] border border-zinc-200 bg-zinc-50 p-5">
      <h3 className="text-sm font-semibold text-zinc-950">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-zinc-500">{description}</p>
    </div>
  )
}