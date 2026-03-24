"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
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

export default function DashboardProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()

    async function fetchProducts() {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError) {
        console.error("User error:", userError)
        setLoading(false)
        return
      }

      if (!user) {
        console.error("No logged in user found.")
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Full Supabase error:", error)
      } else {
        setProducts(data || [])
      }

      setLoading(false)
    }

    fetchProducts()
  }, [])

  async function handleDelete(productId: string) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this product?"
    )
    if (!confirmed) return

    setDeletingId(productId)

    const supabase = createClient()

    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", productId)

    if (error) {
      console.error("Delete error:", error)
      alert(`Failed to delete product: ${error.message}`)
    } else {
      setProducts((prev) => prev.filter((product) => product.id !== productId))
    }

    setDeletingId(null)
  }

  return (
    <div className="mx-auto max-w-7xl p-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-yellow-400">My Products</h1>
          <p className="mt-2 text-sm text-zinc-400">
            Manage the products in your CreatorGoat shop.
          </p>
        </div>

        <Link
          href="/dashboard/products/new"
          className="inline-flex items-center justify-center rounded-lg bg-yellow-500 px-5 py-3 font-semibold text-black"
        >
          Add Product
        </Link>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-yellow-500/20 bg-zinc-950 p-8 text-center text-zinc-400">
          Loading products...
        </div>
      ) : products.length === 0 ? (
        <div className="rounded-2xl border border-yellow-500/20 bg-zinc-950 p-8 text-center">
          <h2 className="text-xl font-semibold text-white">No products yet</h2>
          <p className="mt-2 text-zinc-400">
            Add your first product to start building your shop.
          </p>

          <Link
            href="/dashboard/products/new"
            className="mt-6 inline-block rounded-lg bg-yellow-500 px-5 py-3 font-semibold text-black"
          >
            Add Your First Product
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {products.map((product) => {
            const inStock = (product.stock ?? 0) > 0

            return (
              <div
                key={product.id}
                className="overflow-hidden rounded-2xl border border-yellow-500/20 bg-zinc-950"
              >
                <div className="relative aspect-square w-full bg-zinc-900">
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

                  <div className="absolute left-3 top-3 flex gap-2">
                    {product.category ? (
                      <span className="rounded-full bg-black/70 px-3 py-1 text-xs font-medium text-white backdrop-blur">
                        {product.category}
                      </span>
                    ) : null}

                    {product.video_url ? (
                      <span className="rounded-full bg-yellow-500 px-3 py-1 text-xs font-semibold text-black">
                        Video
                      </span>
                    ) : null}
                  </div>
                </div>

                <div className="space-y-4 p-5">
                  <div className="flex items-start justify-between gap-4">
                    <h2 className="text-lg font-semibold text-white">
                      {product.name}
                    </h2>

                    <span className="shrink-0 rounded-full bg-yellow-500/10 px-3 py-1 text-sm font-medium text-yellow-400">
                      ${Number(product.price).toFixed(2)}
                    </span>
                  </div>

                  <p className="line-clamp-3 text-sm text-zinc-400">
                    {product.description || "No description"}
                  </p>

                  <div className="flex items-center justify-between text-sm">
                    <span
                      className={`rounded-full px-3 py-1 font-medium ${
                        inStock
                          ? "bg-green-500/10 text-green-400"
                          : "bg-red-500/10 text-red-400"
                      }`}
                    >
                      {inStock ? `In Stock: ${product.stock}` : "Out of Stock"}
                    </span>

                    <span className="text-zinc-500">
                      {new Date(product.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-3 pt-2">
                    {product.video_url ? (
                      <a
                        href={product.video_url}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-lg border border-yellow-500/30 px-4 py-2 text-sm font-medium text-yellow-400"
                      >
                        View Video
                      </a>
                    ) : null}

                    <Link
                      href={`/dashboard/products/${product.id}/edit`}
                      className="rounded-lg border border-zinc-700 px-4 py-2 text-sm font-medium text-white"
                    >
                      Edit
                    </Link>

                    <button
                      type="button"
                      onClick={() => handleDelete(product.id)}
                      disabled={deletingId === product.id}
                      className="rounded-lg border border-red-500/30 px-4 py-2 text-sm font-medium text-red-400 disabled:opacity-50"
                    >
                      {deletingId === product.id ? "Deleting..." : "Delete Product"}
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}