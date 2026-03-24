"use client"

import { useState } from "react"
import { getAffiliateRef } from "@/lib/affiliate"

type CartItem = {
  id: string | number
  name: string
  price: number
  quantity: number
  image_url?: string | null
}

type Props = {
  cartItems: CartItem[]
  className?: string
  label?: string
}

export default function CartCheckoutButton({
  cartItems,
  className,
  label = "Checkout",
}: Props) {
  const [loading, setLoading] = useState(false)
  const [errorText, setErrorText] = useState("")

  async function handleCheckout() {
    try {
      setLoading(true)
      setErrorText("")

      if (!cartItems.length) {
        setErrorText("Cart is empty.")
        return
      }

      const affiliateCode = getAffiliateRef()

      const res = await fetch("/api/checkout/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cartItems,
          affiliateCode,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setErrorText(data?.error || "Failed to start checkout.")
        return
      }

      if (!data?.url) {
        setErrorText("Stripe checkout URL not returned.")
        return
      }

      window.location.href = data.url
    } catch (error) {
      console.error("checkout button error:", error)
      setErrorText("Failed to start checkout.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-3">
      <button
        onClick={handleCheckout}
        disabled={loading || !cartItems.length}
        className={
          className ||
          "w-full rounded-xl bg-yellow-500 px-6 py-3 font-semibold text-black disabled:opacity-50"
        }
      >
        {loading ? "Redirecting..." : label}
      </button>

      {errorText ? (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {errorText}
        </div>
      ) : null}
    </div>
  )
}