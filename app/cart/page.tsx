"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import StoreNavbar from "@/components/store-navbar"
import MobileBottomNav from "@/components/mobile-bottom-nav"
import { getCart, subscribeToCart, CartItem } from "@/lib/cart"
import {
  ArrowLeft,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingCart,
  Trash2,
  Tag,
} from "lucide-react"

type ShippingMethod = "pickup" | "standard" | "express"

type CartVariantItem = CartItem & {
  color?: string | null
  size?: string | null
}

const STATE_TAX_RATES: Record<string, number> = {
  AL: 0.04,
  AK: 0.0,
  AZ: 0.056,
  AR: 0.065,
  CA: 0.0725,
  CO: 0.029,
  CT: 0.0635,
  DE: 0.0,
  FL: 0.06,
  GA: 0.04,
  HI: 0.04,
  ID: 0.06,
  IL: 0.0625,
  IN: 0.07,
  IA: 0.06,
  KS: 0.065,
  KY: 0.06,
  LA: 0.0445,
  ME: 0.055,
  MD: 0.06,
  MA: 0.0625,
  MI: 0.06,
  MN: 0.06875,
  MS: 0.07,
  MO: 0.04225,
  MT: 0.0,
  NE: 0.055,
  NV: 0.0685,
  NH: 0.0,
  NJ: 0.06625,
  NM: 0.05125,
  NY: 0.04,
  NC: 0.0475,
  ND: 0.05,
  OH: 0.0575,
  OK: 0.045,
  OR: 0.0,
  PA: 0.06,
  RI: 0.07,
  SC: 0.06,
  SD: 0.045,
  TN: 0.07,
  TX: 0.0625,
  UT: 0.061,
  VT: 0.06,
  VA: 0.053,
  WA: 0.065,
  WV: 0.06,
  WI: 0.05,
  WY: 0.04,
}

function getShippingFee(method: ShippingMethod, subtotal: number) {
  if (method === "pickup") return 0
  if (method === "standard") return subtotal > 50 ? 0 : 6.99
  if (method === "express") return 14.99
  return 0
}

function getVariantKey(item: CartVariantItem) {
  return `${item.id}__${item.color || "no-color"}__${item.size || "no-size"}`
}

function emitCartRefresh() {
  if (typeof window === "undefined") return

  try {
    window.dispatchEvent(new Event("storage"))
  } catch {}

  try {
    window.dispatchEvent(new Event("cart-updated"))
  } catch {}
}

export default function CartPage() {
  const [cart, setCart] = useState<CartVariantItem[]>([])
  const [checkingOut, setCheckingOut] = useState(false)
  const [shippingMethod, setShippingMethod] =
    useState<ShippingMethod>("standard")
  const [stateCode, setStateCode] = useState("KY")

  useEffect(() => {
    function refreshCart() {
      setCart((getCart() as CartVariantItem[]) || [])
    }

    refreshCart()
    const unsubscribe = subscribeToCart(refreshCart)
    return unsubscribe
  }, [])

  function saveCart(nextCart: CartVariantItem[]) {
    setCart(nextCart)
    localStorage.setItem("creatorgoat-cart", JSON.stringify(nextCart))
    emitCartRefresh()
  }

  function updateVariantQuantity(itemToUpdate: CartVariantItem, change: number) {
    const currentCart = (getCart() as CartVariantItem[]) || []
    const targetKey = getVariantKey(itemToUpdate)

    const nextCart = currentCart
      .map((item) => {
        if (getVariantKey(item) !== targetKey) return item

        const nextQuantity = Number(item.quantity || 0) + change
        return {
          ...item,
          quantity: nextQuantity,
        }
      })
      .filter((item) => Number(item.quantity || 0) > 0)

    saveCart(nextCart)
  }

  function removeVariantItem(itemToRemove: CartVariantItem) {
    const currentCart = (getCart() as CartVariantItem[]) || []
    const targetKey = getVariantKey(itemToRemove)

    const nextCart = currentCart.filter(
      (item) => getVariantKey(item) !== targetKey
    )

    saveCart(nextCart)
  }

  const subtotal = useMemo(() => {
    return cart.reduce(
      (sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0),
      0
    )
  }, [cart])

  const taxRate = useMemo(() => {
    return STATE_TAX_RATES[stateCode] ?? 0.06
  }, [stateCode])

  const shipping = useMemo(() => {
    return cart.length > 0 ? getShippingFee(shippingMethod, subtotal) : 0
  }, [cart.length, shippingMethod, subtotal])

  const tax = useMemo(() => {
    return subtotal * taxRate
  }, [subtotal, taxRate])

  const total = useMemo(() => {
    return subtotal + shipping + tax
  }, [subtotal, shipping, tax])

  const itemCount = useMemo(() => {
    return cart.reduce((sum, item) => sum + Number(item.quantity || 0), 0)
  }, [cart])

  async function handleCheckout() {
    if (cart.length === 0) {
      alert("Your cart is empty.")
      return
    }

    try {
      setCheckingOut(true)

      const raw = localStorage.getItem("creatorgoat-settings")
      const parsed = raw ? JSON.parse(raw) : null
      const sellerStripeAccountId = parsed?.stripeAccountId || ""

      if (!sellerStripeAccountId) {
        alert("Stripe account not connected yet.")
        return
      }

      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: cart,
          shippingMethod,
          stateCode,
          sellerStripeAccountId,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data?.error || "Failed to start checkout.")
      }

      if (!data?.url) {
        throw new Error("No checkout URL returned.")
      }

      window.location.href = data.url
    } catch (error) {
      console.error("Checkout error:", error)
      alert(
        error instanceof Error
          ? error.message
          : "Checkout failed. Please try again."
      )
    } finally {
      setCheckingOut(false)
    }
  }

  return (
    <div className="min-h-screen bg-white pb-24 text-zinc-900 md:pb-0">
      <StoreNavbar />
      <MobileBottomNav />

      <div className="mx-auto max-w-7xl px-5 py-8 md:px-8 md:py-10">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <Link
              href="/marketplace/explore"
              className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-zinc-500 transition hover:text-zinc-900"
            >
              <ArrowLeft className="h-4 w-4" />
              Continue Shopping
            </Link>

            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-yellow-600/80">
              CreatorGoat
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-zinc-950 md:text-5xl">
              Your Cart
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-zinc-500 md:text-base">
              Review your selected items, update quantities, and continue to secure
              checkout.
            </p>
          </div>

          {cart.length > 0 ? (
            <div className="inline-flex items-center gap-2 self-start rounded-full border border-yellow-200 bg-yellow-50 px-4 py-2 text-sm font-medium text-yellow-700">
              <ShoppingCart className="h-4 w-4" />
              {itemCount} item{itemCount !== 1 ? "s" : ""} in cart
            </div>
          ) : null}
        </div>

        {cart.length === 0 ? (
          <div className="rounded-[2rem] border border-zinc-200 bg-white p-10 text-center shadow-sm">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-50">
              <ShoppingCart className="h-7 w-7 text-yellow-600" />
            </div>

            <h2 className="text-2xl font-semibold text-zinc-950 md:text-3xl">
              Your cart is empty
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-zinc-500">
              Browse the marketplace and add premium products before checkout.
            </p>

            <Link
              href="/marketplace/explore"
              className="mt-6 inline-flex items-center justify-center rounded-2xl bg-yellow-500 px-5 py-3 text-sm font-semibold text-black transition hover:scale-[1.01]"
            >
              Go to Marketplace
            </Link>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[1.3fr_0.7fr]">
            <div className="space-y-4">
              {cart.map((item) => (
                <div
                  key={getVariantKey(item)}
                  className="grid gap-4 rounded-[2rem] border border-zinc-200 bg-white p-4 shadow-sm md:grid-cols-[120px_1fr_auto]"
                >
                  <div className="overflow-hidden rounded-2xl bg-zinc-100">
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="h-[120px] w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-[120px] items-center justify-center text-zinc-400">
                        No Image
                      </div>
                    )}
                  </div>

                  <div>
                    <h2 className="text-lg font-semibold text-zinc-950 md:text-xl">
                      {item.name}
                    </h2>

                    <p className="mt-2 text-sm text-zinc-500">
                      Premium marketplace item
                    </p>

                    {(item.color || item.size) && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {item.color ? (
                          <span className="inline-flex items-center gap-1 rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs font-medium text-zinc-700">
                            <Tag className="h-3.5 w-3.5" />
                            Color: {item.color}
                          </span>
                        ) : null}

                        {item.size ? (
                          <span className="inline-flex items-center rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs font-medium text-zinc-700">
                            Size: {item.size}
                          </span>
                        ) : null}
                      </div>
                    )}

                    <p className="mt-3 text-lg font-semibold text-yellow-600">
                      ${Number(item.price).toFixed(2)}
                    </p>

                    <div className="mt-4 flex flex-wrap items-center gap-3">
                      <div className="inline-flex items-center overflow-hidden rounded-full border border-zinc-300 bg-white">
                        <button
                          type="button"
                          onClick={() => updateVariantQuantity(item, -1)}
                          className="flex h-10 w-10 items-center justify-center text-zinc-900 transition hover:bg-zinc-100"
                        >
                          <Minus className="h-4 w-4" />
                        </button>

                        <div className="min-w-[48px] text-center text-sm font-semibold text-zinc-950">
                          {item.quantity}
                        </div>

                        <button
                          type="button"
                          onClick={() => updateVariantQuantity(item, 1)}
                          className="flex h-10 w-10 items-center justify-center text-zinc-900 transition hover:bg-zinc-100"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeVariantItem(item)}
                        className="inline-flex items-center gap-2 rounded-full border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                        Remove
                      </button>
                    </div>
                  </div>

                  <div className="text-left md:text-right">
                    <p className="text-xs uppercase tracking-[0.15em] text-zinc-400">
                      Item Total
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-zinc-950">
                      ${(Number(item.price) * Number(item.quantity)).toFixed(2)}
                    </p>
                    <p className="mt-2 text-sm text-zinc-500">
                      ${Number(item.price).toFixed(2)} each
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <aside>
              <div className="sticky top-24 rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-md">
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-yellow-600/80">
                  Summary
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-zinc-950">
                  Order Summary
                </h2>

                <div className="mt-6 space-y-4">
                  <div>
                    <label className="mb-2 block text-sm text-zinc-500">
                      Shipping Method
                    </label>
                    <select
                      value={shippingMethod}
                      onChange={(e) =>
                        setShippingMethod(e.target.value as ShippingMethod)
                      }
                      className="w-full rounded-2xl border border-zinc-300 bg-white p-3 text-zinc-900 outline-none transition focus:border-yellow-500/40"
                    >
                      <option value="pickup">Local Pickup (Free)</option>
                      <option value="standard">
                        Standard Shipping {subtotal > 50 ? "(Free over $50)" : "($6.99)"}
                      </option>
                      <option value="express">Express Shipping ($14.99)</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm text-zinc-500">
                      Tax State
                    </label>
                    <select
                      value={stateCode}
                      onChange={(e) => setStateCode(e.target.value)}
                      className="w-full rounded-2xl border border-zinc-300 bg-white p-3 text-zinc-900 outline-none transition focus:border-yellow-500/40"
                    >
                      {Object.keys(STATE_TAX_RATES).map((state) => (
                        <option key={state} value={state}>
                          {state}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                    <div className="space-y-3 text-sm">
                      <SummaryRow label="Subtotal" value={`$${subtotal.toFixed(2)}`} />
                      <SummaryRow label="Shipping" value={`$${shipping.toFixed(2)}`} />
                      <SummaryRow
                        label={`Tax (${(taxRate * 100).toFixed(2)}%)`}
                        value={`$${tax.toFixed(2)}`}
                      />
                    </div>

                    <div className="mt-4 border-t border-zinc-200 pt-4">
                      <div className="flex items-center justify-between">
                        <span className="text-base font-semibold text-zinc-950">Total</span>
                        <span className="text-2xl font-semibold text-yellow-600">
                          ${total.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleCheckout}
                  disabled={checkingOut}
                  className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-2xl bg-yellow-500 px-6 text-sm font-semibold text-black transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {checkingOut ? "Redirecting..." : "Proceed to Checkout"}
                </button>

                <div className="mt-4 rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                  <div className="flex items-start gap-3">
                    <ShieldCheck className="mt-0.5 h-5 w-5 text-yellow-600" />
                    <div>
                      <p className="text-sm font-semibold text-zinc-950">
                        Secure Checkout Flow
                      </p>
                      <p className="mt-1 text-sm leading-6 text-zinc-500">
                        Shipping, tax, and payment confirmation will continue in the
                        secure checkout flow.
                      </p>
                    </div>
                  </div>
                </div>

                <Link
                  href="/marketplace/explore"
                  className="mt-4 inline-flex h-12 w-full items-center justify-center rounded-2xl border border-zinc-300 bg-white text-sm font-semibold text-zinc-900 transition hover:bg-zinc-50"
                >
                  Continue Shopping
                </Link>
              </div>
            </aside>
          </div>
        )}
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