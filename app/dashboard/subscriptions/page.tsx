"use client"

import { useEffect, useMemo, useState } from "react"
import { createClient } from "@/lib/supabase/client"

export default function Subscriptions() {
  const supabase = useMemo(() => createClient(), [])
  const [user, setUser] = useState<any>(null)
  const [loadingPlan, setLoadingPlan] = useState<string>("")

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser()
      setUser(data.user)
    }

    getUser()
  }, [supabase])

  const handleCheckout = async (priceId: string | undefined, planName: string) => {
    if (!user) {
      alert("Login first")
      return
    }

    if (!priceId) {
      alert(`${planName} price ID is missing.`)
      return
    }

    try {
      setLoadingPlan(planName)

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          priceId,
          userId: user.id,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data?.error || "Checkout failed.")
      }

      if (!data?.url) {
        throw new Error("Stripe checkout URL not returned.")
      }

      window.location.href = data.url
    } catch (error) {
      alert(error instanceof Error ? error.message : "Something went wrong.")
    } finally {
      setLoadingPlan("")
    }
  }

  return (
    <div className="min-h-screen bg-black px-6 py-10 text-white">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-4xl font-bold text-yellow-400">Choose Your Plan</h1>
        <p className="mt-2 text-zinc-400">
          Select your CreatorGoat subscription plan.
        </p>

        <div className="mt-8 grid gap-6">
          <div className="rounded-2xl border border-yellow-500/20 bg-zinc-900 p-6">
            <h2 className="text-2xl font-bold text-yellow-400">$9 Starter</h2>
            <p className="mt-2 text-zinc-400">3 videos / month</p>
            <button
              onClick={() =>
                handleCheckout(process.env.NEXT_PUBLIC_BASIC_PRICE_ID, "starter")
              }
              disabled={loadingPlan !== ""}
              className="mt-5 rounded-xl bg-yellow-500 px-5 py-3 font-semibold text-black disabled:opacity-50"
            >
              {loadingPlan === "starter" ? "Loading..." : "Choose Starter"}
            </button>
          </div>

          <div className="rounded-2xl border border-yellow-500/20 bg-zinc-900 p-6">
            <h2 className="text-2xl font-bold text-yellow-400">$19 Pro</h2>
            <p className="mt-2 text-zinc-400">5 videos / month</p>
            <button
              onClick={() =>
                handleCheckout(process.env.NEXT_PUBLIC_PRO_PRICE_ID, "pro")
              }
              disabled={loadingPlan !== ""}
              className="mt-5 rounded-xl bg-yellow-500 px-5 py-3 font-semibold text-black disabled:opacity-50"
            >
              {loadingPlan === "pro" ? "Loading..." : "Choose Pro"}
            </button>
          </div>

          <div className="rounded-2xl border border-yellow-400 bg-zinc-950 p-6">
            <h2 className="text-2xl font-bold text-yellow-400">
              $29 Founder Elite
            </h2>
            <p className="mt-2 text-zinc-400">10 videos / month</p>
            <button
              onClick={() =>
                handleCheckout(process.env.NEXT_PUBLIC_ELITE_PRICE_ID, "founder_elite")
              }
              disabled={loadingPlan !== ""}
              className="mt-5 rounded-xl bg-yellow-400 px-5 py-3 font-semibold text-black disabled:opacity-50"
            >
              {loadingPlan === "founder_elite" ? "Loading..." : "Go Founder Elite"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}