"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import StoreNavbar from "@/components/store-navbar"
import MobileBottomNav from "@/components/mobile-bottom-nav"
import { addItemToCart } from "@/lib/cart"

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

type SavedMap = Record<string, boolean>
type EngagementMap = Record<string, { likes: number; comments: number; shares: number }>

function DiscoverVideoCard({
  product,
  isSaved,
  engagement,
  onToggleSave,
  onAddToCart,
  onShare,
}: {
  product: Product
  isSaved: boolean
  engagement: { likes: number; comments: number; shares: number }
  onToggleSave: (id: string) => void
  onAddToCart: (product: Product) => void
  onShare: (product: Product) => void
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [muted, setMuted] = useState(true)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          video.play().catch(() => {})
        } else {
          video.pause()
        }
      },
      { threshold: 0.7 }
    )

    observer.observe(video)

    return () => observer.disconnect()
  }, [])

  const inStock = (product.stock ?? 0) > 0

  return (
    <div className="snap-start overflow-hidden rounded-[2rem] border border-black/10 bg-white shadow-sm">
      <div className="relative h-[78vh] min-h-[640px] w-full bg-zinc-100 sm:h-[84vh]">
        {product.video_url ? (
          <video
            ref={videoRef}
            src={product.video_url}
            muted={muted}
            loop
            playsInline
            controls={false}
            className="h-full w-full object-cover"
          />
        ) : product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-zinc-500">
            No Media
          </div>
        )}

        <div className="absolute left-4 top-4 flex gap-2">
          {product.category ? (
            <span className="rounded-full bg-white/90 px-3 py-1 text-xs text-black shadow-sm backdrop-blur">
              {product.category}
            </span>
          ) : null}

          <span className="rounded-full bg-black px-3 py-1 text-xs font-semibold text-white">
            Shop Video
          </span>
        </div>

        <div className="absolute right-4 top-4">
          <button
            type="button"
            onClick={() => setMuted((prev) => !prev)}
            className="rounded-full border border-black/10 bg-white/90 px-4 py-2 text-sm text-black shadow-sm backdrop-blur"
          >
            {muted ? "Unmute" : "Mute"}
          </button>
        </div>

        <div className="absolute bottom-28 right-4 flex flex-col items-center gap-3">
          <button
            type="button"
            onClick={() => onToggleSave(product.id)}
            className={`rounded-full border px-4 py-3 text-sm font-medium shadow-sm backdrop-blur ${
              isSaved
                ? "border-red-500 bg-red-500 text-white"
                : "border-black/10 bg-white/90 text-black"
            }`}
          >
            ♥
          </button>
          <span className="text-xs font-medium text-white drop-shadow">
            {engagement.likes}
          </span>

          <div className="rounded-full border border-black/10 bg-white/90 px-4 py-3 text-sm text-black shadow-sm backdrop-blur">
            💬
          </div>
          <span className="text-xs font-medium text-white drop-shadow">
            {engagement.comments}
          </span>

          <button
            type="button"
            onClick={() => onShare(product)}
            className="rounded-full border border-black/10 bg-white/90 px-4 py-3 text-sm text-black shadow-sm backdrop-blur"
          >
            ↗
          </button>
          <span className="text-xs font-medium text-white drop-shadow">
            {engagement.shares}
          </span>
        </div>

        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/35 to-transparent p-5">
          <div className="space-y-3">
            <div className="flex items-end justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-white">{product.name}</h2>
                <p className="mt-2 max-w-xl text-sm text-white/90">
                  {product.description || "No description available."}
                </p>
              </div>

              <p className="shrink-0 text-xl font-semibold text-white">
                ${Number(product.price).toFixed(2)}
              </p>
            </div>

            <div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  inStock
                    ? "bg-green-500/20 text-green-100"
                    : "bg-red-500/20 text-red-100"
                }`}
              >
                {inStock ? `In Stock: ${product.stock}` : "Out of Stock"}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-3 bg-white p-5 sm:grid-cols-3">
        <button
          type="button"
          onClick={() => onAddToCart(product)}
          disabled={!inStock}
          className="rounded-xl bg-black px-4 py-3 font-semibold text-white disabled:opacity-50"
        >
          {inStock ? "Add to Cart" : "Out of Stock"}
        </button>

        <Link
          href={`/products/${product.id}`}
          className="rounded-xl border border-black/10 px-4 py-3 text-center text-black"
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
  )
}

export default function DiscoverPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [saved, setSaved] = useState<SavedMap>({})
  const [engagement, setEngagement] = useState<EngagementMap>({})

  useEffect(() => {
    const rawSaved = localStorage.getItem("creatorgoat-saved-feed")
    if (rawSaved) {
      try {
        setSaved(JSON.parse(rawSaved))
      } catch {
        setSaved({})
      }
    }

    const rawEngagement = localStorage.getItem("creatorgoat-feed-engagement")
    if (rawEngagement) {
      try {
        setEngagement(JSON.parse(rawEngagement))
      } catch {
        setEngagement({})
      }
    }
  }, [])

  useEffect(() => {
    const supabase = createClient()

    async function fetchProducts() {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .not("video_url", "is", null)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Discover fetch error:", error)
      } else {
        setProducts(data || [])

        const nextEngagement: EngagementMap = {}
        ;(data || []).forEach((product) => {
          nextEngagement[product.id] = engagement[product.id] || {
            likes: Math.floor(Math.random() * 900) + 100,
            comments: Math.floor(Math.random() * 80) + 5,
            shares: Math.floor(Math.random() * 50) + 1,
          }
        })

        setEngagement(nextEngagement)
        localStorage.setItem(
          "creatorgoat-feed-engagement",
          JSON.stringify(nextEngagement)
        )
      }

      setLoading(false)
    }

    fetchProducts()
  }, [])

  function handleAddToCart(product: Product) {
    addItemToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image_url: product.image_url,
    })

    alert("Added to cart!")
  }

  function handleToggleSave(id: string) {
    setSaved((prev) => {
      const next = {
        ...prev,
        [id]: !prev[id],
      }

      localStorage.setItem("creatorgoat-saved-feed", JSON.stringify(next))
      return next
    })
  }

  async function handleShare(product: Product) {
    const shareUrl = `${window.location.origin}/products/${product.id}`

    try {
      if (navigator.share) {
        await navigator.share({
          title: product.name,
          text: product.description || "Check out this product on CreatorGoat",
          url: shareUrl,
        })
      } else {
        await navigator.clipboard.writeText(shareUrl)
        alert("Product link copied!")
      }
    } catch {
      // user canceled
    }
  }

  return (
    <div className="min-h-screen bg-white pb-24 text-black md:pb-0">
      <StoreNavbar />
      <MobileBottomNav />

      <section className="mx-auto max-w-3xl px-3 py-6 sm:px-4 sm:py-8">
        <div className="mb-8 text-center">
          <span className="rounded-full border border-black/10 bg-black/5 px-4 py-1 text-sm text-black/70">
            Discover Feed
          </span>
          <h1 className="mt-4 text-4xl font-bold text-black">
            CreatorGoat Discover
          </h1>
          <p className="mt-3 text-zinc-600">
            Scroll products like TikTok Shop and add them to cart instantly.
          </p>
        </div>

        {loading ? (
          <div className="rounded-3xl border border-black/10 bg-zinc-50 p-8 text-center text-zinc-500">
            Loading discover feed...
          </div>
        ) : products.length === 0 ? (
          <div className="rounded-3xl border border-black/10 bg-zinc-50 p-8 text-center text-zinc-500">
            No video products yet.
          </div>
        ) : (
          <div className="snap-y snap-mandatory space-y-8">
            {products.map((product) => (
              <DiscoverVideoCard
                key={product.id}
                product={product}
                isSaved={!!saved[product.id]}
                engagement={
                  engagement[product.id] || { likes: 0, comments: 0, shares: 0 }
                }
                onToggleSave={handleToggleSave}
                onAddToCart={handleAddToCart}
                onShare={handleShare}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}