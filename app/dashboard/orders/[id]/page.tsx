"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

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
  const productId = params.id as string

  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    async function fetchProduct() {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", productId)
        .single()

      if (error) {
        console.error("Product fetch error:", error)
      } else {
        setProduct(data)
      }

      setLoading(false)
    }

    if (productId) fetchProduct()
  }, [productId])

  async function addToCart() {
    if (!product) return

    const currentCart = JSON.parse(localStorage.getItem("cart") || "[]")

    const existing = currentCart.find((item: any) => item.id === product.id)

    let updatedCart

    if (existing) {
      updatedCart = currentCart.map((item: any) =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    } else {
      updatedCart = [
        ...currentCart,
        {
          id: product.id,
          name: product.name,
          price: product.price,
          image_url: product.image_url,
          quantity: 1,
        },
      ]
    }

    localStorage.setItem("cart", JSON.stringify(updatedCart))
    alert("Added to cart!")
  }

  if (loading) {
    return (
      <div className="p-8 text-zinc-400">Loading product...</div>
    )
  }

  if (!product) {
    return (
      <div className="p-8 text-zinc-400">Product not found.</div>
    )
  }

  return (
    <div className="min-h-screen bg-black px-8 py-10 text-white">
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-2">
        <div className="space-y-4">
          <div className="overflow-hidden rounded-3xl border border-yellow-500/20 bg-zinc-950">
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.name}
                className="h-[500px] w-full object-cover"
              />
            ) : (
              <div className="flex h-[500px] items-center justify-center text-zinc-500">
                No Image
              </div>
            )}
          </div>

          {product.video_url ? (
            <div className="overflow-hidden rounded-3xl border border-yellow-500/20 bg-zinc-950 p-4">
              <video
                src={product.video_url}
                controls
                className="w-full rounded-2xl"
              />
            </div>
          ) : null}
        </div>

        <div className="space-y-6">
          {product.category ? (
            <span className="rounded-full border border-yellow-500/30 bg-yellow-500/10 px-4 py-1 text-sm text-yellow-400">
              {product.category}
            </span>
          ) : null}

          <h1 className="text-4xl font-bold text-yellow-400">
            {product.name}
          </h1>

          <p className="text-3xl font-semibold text-white">
            ${Number(product.price).toFixed(2)}
          </p>

          <p className="leading-7 text-zinc-400">
            {product.description || "No description available."}
          </p>

          <div>
            <span
              className={`rounded-full px-4 py-2 text-sm font-medium ${
                (product.stock ?? 0) > 0
                  ? "bg-green-500/10 text-green-400"
                  : "bg-red-500/10 text-red-400"
              }`}
            >
              {(product.stock ?? 0) > 0
                ? `In Stock: ${product.stock}`
                : "Out of Stock"}
            </span>
          </div>

          <div className="flex flex-wrap gap-4">
            <button
              onClick={addToCart}
              className="rounded-xl bg-yellow-500 px-6 py-3 font-semibold text-black"
              disabled={(product.stock ?? 0) <= 0}
            >
              Add to Cart
            </button>

            <Link
              href={`/shop/${product.user_id}`}
              className="rounded-xl border border-zinc-700 px-6 py-3 text-white"
            >
              View Creator Shop
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}