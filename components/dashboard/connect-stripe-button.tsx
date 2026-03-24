"use client"

import { useState } from "react"

type ConnectStripeButtonProps = {
  stripeAccountId?: string | null
  chargesEnabled?: boolean | null
}

export default function ConnectStripeButton({
  stripeAccountId,
  chargesEnabled,
}: ConnectStripeButtonProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleConnectStripe() {
    try {
      setLoading(true)
      setError("")

      const response = await fetch("/api/stripe/connect", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          stripeAccountId: stripeAccountId ?? null,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data?.error || "Failed to connect Stripe.")
      }

      if (!data?.url) {
        throw new Error("Missing Stripe onboarding URL.")
      }

      // NEW: save Stripe accountId locally
      if (data?.accountId) {
        try {
          const existing = localStorage.getItem("creatorgoat-settings")
          const parsed = existing ? JSON.parse(existing) : {}

          const updated = {
            ...parsed,
            stripeAccountId: data.accountId,
          }

          localStorage.setItem(
            "creatorgoat-settings",
            JSON.stringify(updated)
          )
        } catch (e) {
          console.warn("Failed saving Stripe accountId locally")
        }
      }

      // Redirect to Stripe onboarding
      window.location.href = data.url
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Something went wrong."
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  if (chargesEnabled) {
    return (
      <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4">
        <p className="text-sm font-medium text-emerald-400">
          Stripe connected successfully
        </p>
        <p className="mt-1 text-xs text-zinc-300">
          Your account is ready to receive payouts.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={handleConnectStripe}
        disabled={loading}
        className="rounded-2xl bg-yellow-500 px-5 py-3 text-sm font-semibold text-black transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading
          ? "Connecting Stripe..."
          : stripeAccountId
          ? "Continue Stripe Onboarding"
          : "Connect Stripe"}
      </button>

      {error ? <p className="text-sm text-red-400">{error}</p> : null}
    </div>
  )
}