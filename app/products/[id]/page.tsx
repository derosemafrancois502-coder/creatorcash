"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useParams, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { addItemToCart } from "@/lib/cart"
import StoreNavbar from "@/components/store-navbar"

type Product = {
  id: string
  user_id: string
  name: string
  price: number
  stock: number
  description: string
  image_url: string | null
  video_url: string | null
  category: string | null
  created_at: string
}

export default function ProductPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const productId = params.id as string

  const [product, setProduct] = useState<Product | null>(null)
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const ref = searchParams.get("ref")

    if (ref && typeof window !== "undefined") {
      localStorage.setItem("affiliate_ref", ref)
    }
  }, [searchParams])

  useEffect(() => {
    const supabase = createClient()

    async function fetchProduct() {
      setLoading(true)

      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", productId)
        .single()

      if (error) {
        console.error("Product fetch error:", error)
        setLoading(false)
        return
      }

      setProduct(data)

      const { data: related, error: relatedError } = await supabase
        .from("products")
        .select("*")
        .neq("id", productId)
        .limit(4)
        .order("created_at", { ascending: false })

      if (relatedError) {
        console.error("Related products fetch error:", relatedError)
      } else {
        setRelatedProducts(related || [])
      }

      setLoading(false)
    }

    if (productId) {
      fetchProduct()
    }
  }, [productId])

  function handleAddToCart() {
    if (!product) return

    addItemToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image_url: product.image_url,
    })

    alert("Added to cart!")
  }

  const inStock = useMemo(() => {
    return (product?.stock ?? 0) > 0
  }, [product])

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <StoreNavbar />
        <div className="mx-auto max-w-6xl p-8 text-zinc-400">
          Loading product...
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-black text-white">
        <StoreNavbar />
        <div className="mx-auto max-w-6xl p-8 text-zinc-400">
          Product not found.
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <StoreNavbar />

      <div className="mx-auto max-w-7xl px-8 py-10">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-5">
            <div className="overflow-hidden rounded-3xl border border-yellow-500/20 bg-zinc-950">
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="h-[560px] w-full object-cover"
                />
              ) : (
                <div className="flex h-[560px] items-center justify-center text-zinc-500">
                  No Image
                </div>
              )}
            </div>

            {product.video_url ? (
              <div className="overflow-hidden rounded-3xl border border-yellow-500/20 bg-zinc-950 p-4">
                <p className="mb-3 text-sm font-medium text-zinc-300">
                  Product Video
                </p>
                <video
                  src={product.video_url}
                  controls
                  className="w-full rounded-2xl bg-black"
                />
              </div>
            ) : null}
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl border border-yellow-500/20 bg-zinc-950 p-8">
              <div className="mb-4 flex flex-wrap items-center gap-3">
                {product.category ? (
                  <span className="rounded-full border border-yellow-500/30 bg-yellow-500/10 px-4 py-1 text-sm text-yellow-400">
                    {product.category}
                  </span>
                ) : null}

                {product.video_url ? (
                  <span className="rounded-full bg-yellow-500 px-4 py-1 text-sm font-semibold text-black">
                    Video Included
                  </span>
                ) : null}
              </div>

              <h1 className="text-4xl font-bold text-yellow-400">
                {product.name}
              </h1>

              <p className="mt-4 text-4xl font-semibold text-white">
                ${Number(product.price).toFixed(2)}
              </p>

              <div className="mt-4">
                <span
                  className={`rounded-full px-4 py-2 text-sm font-medium ${
                    inStock
                      ? "bg-green-500/10 text-green-400"
                      : "bg-red-500/10 text-red-400"
                  }`}
                >
                  {inStock ? `In Stock: ${product.stock}` : "Out of Stock"}
                </span>
              </div>

              <p className="mt-6 leading-7 text-zinc-400">
                {product.description || "No description available."}
              </p>

              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                <button
                  onClick={handleAddToCart}
                  disabled={!inStock}
                  className="rounded-xl bg-yellow-500 px-6 py-3 font-semibold text-black disabled:opacity-50"
                >
                  {inStock ? "Add to Cart" : "Out of Stock"}
                </button>

                <Link
                  href={`/shop/${product.user_id}`}
                  className="rounded-xl border border-zinc-700 px-6 py-3 text-center text-white"
                >
                  View Creator Shop
                </Link>

                <Link
                  href="/cart"
                  className="rounded-xl border border-yellow-500/30 px-6 py-3 text-center text-yellow-400"
                >
                  Go to Cart
                </Link>
              </div>
            </div>

            <div className="rounded-3xl border border-yellow-500/20 bg-zinc-950 p-6">
              <p className="text-sm text-zinc-500">Creator Brand</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">
                Shop from this creator
              </h2>
              <p className="mt-3 text-zinc-400">
                Explore more products from this creator’s storefront and discover
                their brand collection.
              </p>

              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  href={`/shop/${product.user_id}`}
                  className="rounded-xl bg-yellow-500 px-5 py-3 font-semibold text-black"
                >
                  Visit Creator Shop
                </Link>

                <Link
                  href="/marketplace"
                  className="rounded-xl border border-zinc-700 px-5 py-3 text-white"
                >
                  Back to Marketplace
                </Link>
              </div>
            </div>

            <div className="rounded-3xl border border-yellow-500/20 bg-zinc-950 p-6">
              <p className="text-sm text-zinc-500">Product Details</p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-zinc-800 p-4">
                  <p className="text-xs text-zinc-500">Product ID</p>
                  <p className="mt-1 text-white">{product.id}</p>
                </div>

                <div className="rounded-2xl border border-zinc-800 p-4">
                  <p className="text-xs text-zinc-500">Date Added</p>
                  <p className="mt-1 text-white">
                    {new Date(product.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <section className="mt-14">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm text-zinc-500">More to explore</p>
              <h2 className="text-3xl font-bold text-yellow-400">
                You may also like
              </h2>
            </div>

            <Link href="/marketplace" className="text-sm text-yellow-400">
              View all products →
            </Link>
          </div>

          {relatedProducts.length === 0 ? (
            <div className="rounded-3xl border border-yellow-500/20 bg-zinc-950 p-8 text-zinc-400">
              No related products yet.
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              {relatedProducts.map((item) => (
                <div
                  key={item.id}
                  className="overflow-hidden rounded-3xl border border-yellow-500/20 bg-zinc-950"
                >
                  <div className="aspect-square bg-zinc-900">
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-zinc-500">
                        No Image
                      </div>
                    )}
                  </div>

                  <div className="space-y-3 p-5">
                    <h3 className="text-lg font-semibold text-white">
                      {item.name}
                    </h3>
                    <p className="text-yellow-400">
                      ${Number(item.price).toFixed(2)}
                    </p>
                    <p className="line-clamp-2 text-sm text-zinc-400">
                      {item.description || "No description"}
                    </p>

                    <Link
                      href={`/products/${item.id}`}
                      className="block rounded-xl bg-yellow-500 px-4 py-3 text-center font-semibold text-black"
                    >
                      View Product
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}