"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import StoreNavbar from "@/components/store-navbar"
import MobileBottomNav from "@/components/mobile-bottom-nav"

type Product = {
  id: string
  user_id: string
  name: string
  price: number
  description: string
  image_url: string | null
  video_url: string | null
}

type SavedMap = Record<string, boolean>

export default function SavedPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const rawSaved = localStorage.getItem("creatorgoat-saved-feed")
    let savedMap: SavedMap = {}

    if (rawSaved) {
      try {
        savedMap = JSON.parse(rawSaved)
      } catch {
        savedMap = {}
      }
    }

    const savedIds = Object.keys(savedMap).filter((id) => savedMap[id])

    async function fetchSavedProducts() {
      if (savedIds.length === 0) {
        setProducts([])
        setLoading(false)
        return
      }

      const supabase = createClient()

      const { data, error } = await supabase
        .from("products")
        .select("*")
        .in("id", savedIds)

      if (error) {
        console.error("Saved products fetch error:", error)
      } else {
        setProducts(data || [])
      }

      setLoading(false)
    }

    fetchSavedProducts()
  }, [])

  return (
    <div className="min-h-screen bg-white pb-24 text-black md:pb-0">
      <StoreNavbar />
      <MobileBottomNav />

      <div className="mx-auto max-w-7xl px-8 py-10">
        <div className="mb-8 rounded-3xl border border-black/10 bg-zinc-50 p-8">
          <span className="rounded-full border border-black/10 bg-black/5 px-4 py-1 text-sm text-black/70">
            Saved
          </span>

          <h1 className="mt-5 text-4xl font-bold text-black">Saved Products</h1>

          <p className="mt-3 text-zinc-600">
            Review the products you saved from the Discover feed.
          </p>
        </div>

        {loading ? (
          <div className="rounded-3xl border border-black/10 bg-zinc-50 p-8 text-zinc-500">
            Loading saved products...
          </div>
        ) : products.length === 0 ? (
          <div className="rounded-3xl border border-black/10 bg-zinc-50 p-8 text-zinc-500">
            No saved products yet.
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {products.map((product) => (
              <div
                key={product.id}
                className="overflow-hidden rounded-3xl border border-black/10 bg-white shadow-sm transition hover:shadow-xl"
              >
                <div className="aspect-square bg-zinc-100">
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-zinc-500">
                      No Image
                    </div>
                  )}
                </div>

                <div className="space-y-3 p-5">
                  <h2 className="text-lg font-semibold text-black">{product.name}</h2>

                  <p className="text-lg font-semibold text-black">
                    ${Number(product.price).toFixed(2)}
                  </p>

                  <p className="line-clamp-2 text-sm text-zinc-600">
                    {product.description || "No description"}
                  </p>

                  <div className="grid gap-3">
                    <Link
                      href={`/products/${product.id}`}
                      className="rounded-xl bg-black px-4 py-3 text-center font-semibold text-white"
                    >
                      View Product
                    </Link>

                    <Link
                      href={`/shop/${product.user_id}`}
                      className="rounded-xl border border-black/10 px-4 py-3 text-center text-black"
                    >
                      Visit Shop
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}