"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { getCartCount, subscribeToCart } from "@/lib/cart"

export default function StoreNavbar() {
  const [cartCount, setCartCount] = useState(0)

  useEffect(() => {
    function refreshCart() {
      setCartCount(getCartCount())
    }

    refreshCart()
    const unsubscribe = subscribeToCart(refreshCart)

    return unsubscribe
  }, [])

  return (
    <header className="border-b border-yellow-500/20 bg-zinc-950">
      <div className="mx-auto flex max-w-7xl items-center justify-between p-6">
        <Link href="/" className="text-xl font-bold text-yellow-400">
          CreatorGoat
        </Link>

        <nav className="flex items-center gap-4 text-sm">
          <Link href="/marketplace" className="text-zinc-300 hover:text-white">
            Marketplace
          </Link>

          <Link href="/discover" className="text-zinc-300 hover:text-white">
            Discover
          </Link>

          <Link href="/saved" className="text-zinc-300 hover:text-white">
            Saved
          </Link>

          <Link href="/dashboard" className="text-zinc-300 hover:text-white">
            Dashboard
          </Link>

          <Link
            href="/cart"
            className="rounded-xl border border-yellow-500/30 px-4 py-2 text-yellow-400"
          >
            Cart ({cartCount})
          </Link>
        </nav>
      </div>
    </header>
  )
}