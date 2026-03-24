"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import {
  BadgeCheck,
  Package,
  PlayCircle,
  ShoppingBag,
  Store,
} from "lucide-react"

type Shop = {
  id: string
  user_id: string
  store_name: string
  slug: string
  bio: string | null
  logo_url: string | null
  banner_url: string | null
  approved: boolean
  status: string
}

type Product = {
  id: string
  user_id: string
  shop_id: string | null
  name: string
  price: number
  inventory_count: number | null
  description: string | null
  image_url: string | null
  video_url: string | null
  category: string | null
  created_at: string
  status: "draft" | "published" | "archived"
}

export default function CreatorShopPage() {
  const params = useParams()
  const slug = String(params.slug || "")
  const supabase = useMemo(() => createClient(), [])

  const [shop, setShop] = useState<Shop | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchShopAndProducts() {
      try {
        setLoading(true)

        const { data: shopData, error: shopError } = await supabase
          .from("shops")
          .select(
            "id, user_id, store_name, slug, bio, logo_url, banner_url, approved, status"
          )
          .eq("slug", slug)
          .maybeSingle()

        if (shopError) {
          console.error("Shop fetch error:", shopError)
          setShop(null)
          setProducts([])
          return
        }

        if (!shopData || !shopData.approved || shopData.status !== "approved") {
          setShop(null)
          setProducts([])
          return
        }

        setShop(shopData as Shop)

        const { data: productData, error: productError } = await supabase
          .from("products")
          .select(
            "id, user_id, shop_id, name, price, inventory_count, description, image_url, video_url, category, created_at, status"
          )
          .eq("shop_id", shopData.id)
          .eq("status", "published")
          .order("created_at", { ascending: false })

        if (productError) {
          console.error("Products fetch error:", productError)
          setProducts([])
          return
        }

        setProducts((productData ?? []) as Product[])
      } catch (error) {
        console.error(error)
        setShop(null)
        setProducts([])
      } finally {
        setLoading(false)
      }
    }

    if (slug) {
      void fetchShopAndProducts()
    }
  }, [slug, supabase])

  if (loading) {
    return (
      <div className="min-h-screen bg-white px-5 py-8 text-zinc-900 md:px-8 md:py-10">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-[2rem] border border-zinc-200 bg-white p-10 text-center shadow-sm">
            <div className="mx-auto mb-5 h-14 w-14 animate-pulse rounded-full bg-zinc-200" />
            <h2 className="text-2xl font-semibold text-zinc-950">Loading shop...</h2>
            <p className="mt-3 text-sm text-zinc-500">
              Preparing this creator storefront.
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (!shop) {
    return (
      <div className="min-h-screen bg-white px-5 py-8 text-zinc-900 md:px-8 md:py-10">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-[2rem] border border-zinc-200 bg-white p-10 text-center shadow-sm">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100">
              <Store className="h-8 w-8 text-zinc-600" />
            </div>
            <h2 className="text-2xl font-semibold text-zinc-950">
              Shop not found
            </h2>
            <p className="mt-3 text-sm leading-7 text-zinc-500">
              This shop may be unavailable or not approved yet.
            </p>
            <Link
              href="/marketplace/explore"
              className="mt-6 inline-flex items-center justify-center rounded-2xl bg-yellow-500 px-5 py-3 text-sm font-semibold text-black transition hover:scale-[1.01]"
            >
              Back to Marketplace
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white px-5 py-8 text-zinc-900 md:px-8 md:py-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 overflow-hidden rounded-[2rem] border border-zinc-200 bg-gradient-to-br from-white via-zinc-50 to-yellow-50 shadow-sm">
          {shop.banner_url ? (
            <div className="h-52 w-full bg-zinc-100">
              <img
                src={shop.banner_url}
                alt={shop.store_name}
                className="h-full w-full object-cover"
              />
            </div>
          ) : null}

          <div className="grid gap-8 p-8 md:grid-cols-[1.2fr_0.8fr] md:p-10">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-yellow-200 bg-yellow-50 px-4 py-2 text-sm font-medium text-yellow-700">
                <BadgeCheck className="h-4 w-4" />
                Verified Creator Shop
              </div>

              <h1 className="mt-5 text-4xl font-semibold tracking-tight text-zinc-950 md:text-6xl">
                {shop.store_name}
              </h1>

              <p className="mt-5 max-w-2xl text-sm leading-7 text-zinc-600 md:text-base">
                {shop.bio ||
                  "Explore this creator’s storefront, discover premium products, and browse their collection in a clean marketplace experience."}
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <div className="rounded-2xl border border-zinc-200 bg-white px-5 py-4 shadow-sm">
                  <p className="text-xs uppercase tracking-[0.15em] text-zinc-500">
                    Products
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-zinc-950">
                    {products.length}
                  </p>
                </div>

                <div className="rounded-2xl border border-zinc-200 bg-white px-5 py-4 shadow-sm">
                  <p className="text-xs uppercase tracking-[0.15em] text-zinc-500">
                    Store Type
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-zinc-950">
                    Premium
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center">
              <div className="flex h-full min-h-[220px] w-full items-center justify-center rounded-[2rem] border border-zinc-200 bg-white shadow-sm">
                <div className="text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-yellow-50">
                    {shop.logo_url ? (
                      <img
                        src={shop.logo_url}
                        alt={shop.store_name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Store className="h-8 w-8 text-yellow-700" />
                    )}
                  </div>
                  <p className="mt-4 text-sm font-medium text-zinc-500">
                    Curated creator storefront
                  </p>
                  <p className="mt-2 text-lg font-semibold text-zinc-950">
                    Luxury marketplace layout
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {products.length === 0 ? (
          <div className="rounded-[2rem] border border-zinc-200 bg-white p-10 text-center shadow-sm">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100">
              <Package className="h-8 w-8 text-zinc-600" />
            </div>
            <h2 className="text-2xl font-semibold text-zinc-950">
              No products found
            </h2>
            <p className="mt-3 text-sm leading-7 text-zinc-500">
              This creator shop does not have any visible products right now.
            </p>
            <Link
              href="/marketplace/explore"
              className="mt-6 inline-flex items-center justify-center rounded-2xl bg-yellow-500 px-5 py-3 text-sm font-semibold text-black transition hover:scale-[1.01]"
            >
              Back to Marketplace
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
                  Storefront
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-zinc-950 md:text-3xl">
                  Available Products
                </h2>
              </div>

              <div className="hidden items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 px-4 py-2 text-sm font-medium text-zinc-700 md:inline-flex">
                <ShoppingBag className="h-4 w-4" />
                {products.length} item{products.length !== 1 ? "s" : ""}
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="overflow-hidden rounded-[2rem] border border-zinc-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="relative aspect-square bg-zinc-100">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-zinc-400">
                        No Image
                      </div>
                    )}

                    {product.video_url ? (
                      <div className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-black/85 px-3 py-1.5 text-xs font-semibold text-white">
                        <PlayCircle className="h-3.5 w-3.5" />
                        Video
                      </div>
                    ) : null}

                    <div className="absolute right-3 top-3 rounded-full bg-white/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-700">
                      {product.category || "General"}
                    </div>
                  </div>

                  <div className="space-y-4 p-5">
                    <div>
                      <h2 className="line-clamp-1 text-lg font-semibold text-zinc-950">
                        {product.name}
                      </h2>

                      <p className="mt-2 text-2xl font-semibold text-yellow-600">
                        ${Number(product.price).toFixed(2)}
                      </p>
                    </div>

                    <p className="line-clamp-3 text-sm leading-6 text-zinc-500">
                      {product.description || "No description available for this product."}
                    </p>

                    <div className="flex items-center justify-between text-xs text-zinc-500">
                      <span>
                        Stock:{" "}
                        <span className="font-medium text-zinc-800">
                          {product.inventory_count ?? 0}
                        </span>
                      </span>

                      <span>
                        {new Date(product.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    <Link
                      href={`/marketplace/product/${product.id}`}
                      className="inline-flex h-12 w-full items-center justify-center rounded-2xl bg-yellow-500 px-4 text-center text-sm font-semibold text-black transition hover:scale-[1.01]"
                    >
                      View Product
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}