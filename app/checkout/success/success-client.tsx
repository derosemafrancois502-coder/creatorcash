"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"

export default function CheckoutSuccessClient() {
  const searchParams = useSearchParams()

  const sessionId = searchParams.get("session_id")
  const orderId = searchParams.get("order_id")
  const amount = searchParams.get("amount")

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="mx-auto max-w-3xl pt-16">
        <div className="rounded-[32px] border border-yellow-500/20 bg-zinc-950 p-8 shadow-[0_0_60px_rgba(250,204,21,0.08)]">
          <div className="inline-flex rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-300">
            Payment Successful
          </div>

          <h1 className="mt-5 text-4xl font-bold text-yellow-400">
            Thank you for your order
          </h1>

          <p className="mt-4 text-zinc-300 leading-7">
            Your checkout was completed successfully. Your order information is
            shown below.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
              <p className="text-sm text-zinc-400">Session ID</p>
              <p className="mt-2 break-all text-sm text-white">
                {sessionId || "Not available"}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
              <p className="text-sm text-zinc-400">Order ID</p>
              <p className="mt-2 text-sm text-white">
                {orderId || "Not available"}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
              <p className="text-sm text-zinc-400">Amount</p>
              <p className="mt-2 text-sm text-white">
                {amount || "Not available"}
              </p>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/dashboard"
              className="rounded-2xl bg-yellow-400 px-5 py-3 font-semibold text-black transition hover:opacity-90"
            >
              Go to Dashboard
            </Link>

            <Link
              href="/marketplace"
              className="rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-3 font-semibold text-white transition hover:bg-white/[0.08]"
            >
              Back to Marketplace
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}