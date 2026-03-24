"use client"

import Image from "next/image"
import Link from "next/link"
import { useMemo, useState } from "react"
import {
  Loader2,
  Search,
  Wand2,
  PenSquare,
  Megaphone,
  Sparkles,
  TrendingUp,
  Package2,
  ShoppingCart,
  ExternalLink,
} from "lucide-react"
import { saveToHistory } from "@/lib/history"
import { addItemToCart } from "@/lib/cart"

type Product = {
  id: string
  name: string
  price: number
  image: string
  rating?: number
  reviews?: string
  estimatedSales?: string
  competition?: string
  trendScore?: number
  category?: string
  whyItsHot?: string
  contentAngle?: string
  source?: string
  url?: string
}

const sourceOptions = [
  { label: "All Sources", value: "all" },
  { label: "TikTok", value: "tiktok" },
  { label: "Amazon", value: "amazon" },
]

function getSafeImage(product: Product) {
  if (typeof product.image === "string" && product.image.trim()) {
    return product.image
  }

  return `data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="800" height="800" viewBox="0 0 800 800">
      <rect width="800" height="800" fill="#0a0a0a"/>
      <rect x="40" y="40" width="720" height="720" rx="36" fill="#111111" stroke="#facc15" stroke-opacity="0.28" stroke-width="4"/>
      <text x="50%" y="46%" text-anchor="middle" fill="#facc15" font-size="42" font-family="Arial, Helvetica, sans-serif">
        CreatorGoat
      </text>
      <text x="50%" y="54%" text-anchor="middle" fill="#ffffff" fill-opacity="0.82" font-size="28" font-family="Arial, Helvetica, sans-serif">
        Product Image
      </text>
    </svg>
  `)}`
}

export default function ProductDiscoveryPage() {
  const [query, setQuery] = useState("")
  const [source, setSource] = useState("all")
  const [loading, setLoading] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")
  const [actionMessage, setActionMessage] = useState("")
  const [detectedCategory, setDetectedCategory] = useState("")

  const amazonProductUrl =
    process.env.NEXT_PUBLIC_AMAZON_PRODUCT_URL || ""
  const amazonBeautyUrl =
    process.env.NEXT_PUBLIC_AMAZON_BEAUTY_URL || ""

  async function handleSearch(customQuery?: string) {
    try {
      const finalQuery = (customQuery || query).trim()

      if (!finalQuery) {
        setError("Please enter a product search.")
        setProducts([])
        setMessage("")
        setDetectedCategory("")
        return
      }

      setLoading(true)
      setError("")
      setMessage("")
      setActionMessage("")
      setDetectedCategory("")

      const res = await fetch("/api/product-discovery", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: finalQuery,
          source,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch products.")
      }

      const liveProducts = Array.isArray(data.products) ? data.products : []

      setProducts(liveProducts)
      setMessage(data.message || "")
      setDetectedCategory(data.detectedCategory || "")

      if (liveProducts.length > 0) {
        const historySummary = liveProducts
          .slice(0, 8)
          .map((product: Product, index: number) => {
            return `${index + 1}. ${product.name} | $${Number(product.price || 0).toFixed(2)} | Trend Score: ${product.trendScore ?? "N/A"} | Competition: ${product.competition || "Medium"} | Source: ${product.source || "Live Source"}`
          })
          .join("\n")

        await saveToHistory({
          module: "Product Discovery Engine",
          title: `${finalQuery} Product Discovery`,
          input: {
            query: finalQuery,
            source,
            detectedCategory: data.detectedCategory || "",
          },
          output: `Product Discovery Search
Query: ${finalQuery}
Source: ${source}
Detected Category: ${data.detectedCategory || "Unknown"}
Results Found: ${liveProducts.length}

Top Results:
${historySummary}`,
        })
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong.")
      setProducts([])
      setMessage("")
      setDetectedCategory("")
    } finally {
      setLoading(false)
    }
  }

  function buildStoredProduct(product: Product) {
    const safeImage = getSafeImage(product)

    return {
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: safeImage,
      image_url: safeImage,
      creator: "CreatorGoat AI",
      category: product.category || "General",
      type: "physical",
      shortDescription:
        product.contentAngle ||
        product.whyItsHot ||
        "Live product discovered by Product Discovery.",
      source: product.source || "Live Source",
      rating: product.rating ?? null,
      reviews: product.reviews || "N/A",
      trendScore: product.trendScore ?? null,
      competition: product.competition || "Medium",
      estimatedSales: product.estimatedSales || "N/A",
      url: product.url || "",
      whyItsHot: product.whyItsHot || "",
      contentAngle: product.contentAngle || "",
    }
  }

  function addToCart(product: Product) {
    try {
      const safeImage = getSafeImage(product)

      addItemToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        image_url: safeImage,
      })

      setActionMessage(`${product.name} added to Cart.`)
    } catch (error) {
      console.error("addToCart error:", error)
      setActionMessage("Could not add product to Cart.")
    }
  }

  function saveHooksContext(product: Product) {
    try {
      localStorage.setItem(
        "creatorgoat-hooks-context",
        JSON.stringify(buildStoredProduct(product))
      )
      window.location.href = "/dashboard/hooks"
    } catch (error) {
      console.error("saveHooksContext error:", error)
      setActionMessage("Could not send product to Hooks.")
    }
  }

  function saveCaptionContext(product: Product) {
    try {
      localStorage.setItem(
        "creatorgoat-captions-context",
        JSON.stringify(buildStoredProduct(product))
      )
      window.location.href = "/dashboard/captions"
    } catch (error) {
      console.error("saveCaptionContext error:", error)
      setActionMessage("Could not send product to Captions.")
    }
  }

  function saveAdContext(product: Product) {
    try {
      localStorage.setItem(
        "creatorgoat-product-ad-context",
        JSON.stringify(buildStoredProduct(product))
      )
      window.location.href = "/dashboard/product-writer"
    } catch (error) {
      console.error("saveAdContext error:", error)
      setActionMessage("Could not send product to Ad Creator.")
    }
  }

  const totalProducts = products.length

  const avgTrendScore = useMemo(() => {
    if (!products.length) return 0
    const total = products.reduce(
      (sum, item) => sum + Number(item.trendScore || 0),
      0
    )
    return Math.round(total / products.length)
  }, [products])

  const lowCompetitionCount = useMemo(() => {
    return products.filter(
      (item) => (item.competition || "").toLowerCase() === "low"
    ).length
  }, [products])

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <section className="relative overflow-hidden rounded-[32px] border border-yellow-500/20 bg-zinc-950 shadow-2xl shadow-black/50">
          <div className="absolute inset-0">
            <video
              autoPlay
              muted
              loop
              playsInline
              className="h-full w-full object-cover opacity-95"
            >
              <source
                src="/videos/cg-productfinder-hero.mp4"
                type="video/mp4"
              />
            </video>

            <div className="absolute inset-0 bg-black/15" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-black/10 to-black/30" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,215,0,0.16),transparent_45%)]" />
          </div>

          <div className="relative z-10 px-6 py-8 md:px-8 md:py-10 xl:px-10 xl:py-12">
            <div className="max-w-4xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-yellow-400/20 bg-yellow-400/10 px-4 py-1.5 text-sm font-medium text-yellow-300 backdrop-blur-sm">
                <Sparkles className="h-4 w-4" />
                Live Product Intelligence
              </div>

              <h1 className="text-4xl font-bold tracking-tight text-white md:text-5xl xl:text-6xl">
                Product Discovery
              </h1>

              <p className="mt-3 max-w-3xl text-base leading-7 text-zinc-200 md:text-lg">
                Search live product sources only. No fake results, no invented
                products.
              </p>
            </div>

            <div className="mt-8 rounded-[28px] border border-white/10 bg-black/25 p-3 backdrop-blur-md md:p-4">
              <div className="grid gap-3 md:grid-cols-[1fr_190px_180px]">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400" />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSearch()
                    }}
                    placeholder="Search real products..."
                    className="h-14 w-full rounded-2xl border border-white/10 bg-white/5 pl-12 pr-4 text-white outline-none placeholder:text-zinc-400 focus:border-yellow-400/40"
                  />
                </div>

                <select
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  className="h-14 rounded-2xl border border-white/10 bg-white/5 px-4 text-white outline-none focus:border-yellow-400/40"
                >
                  {sourceOptions.map((item) => (
                    <option
                      key={item.value}
                      value={item.value}
                      className="bg-zinc-950"
                    >
                      {item.label}
                    </option>
                  ))}
                </select>

                <button
                  onClick={() => handleSearch()}
                  disabled={loading}
                  className="flex h-14 items-center justify-center gap-2 rounded-2xl bg-yellow-400 px-6 font-semibold text-black transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Search className="h-5 w-5" />
                  )}
                  {loading ? "Searching..." : "Find Products"}
                </button>
              </div>

              {error && <p className="mt-3 text-sm text-red-300">{error}</p>}

              {message && !error && (
                <p className="mt-3 text-sm text-yellow-200">{message}</p>
              )}

              {detectedCategory && !error && (
                <p className="mt-2 text-sm text-zinc-300">
                  Detected category:{" "}
                  <span className="text-yellow-300">{detectedCategory}</span>
                </p>
              )}

              {actionMessage && !error && (
                <p className="mt-3 text-sm text-emerald-300">{actionMessage}</p>
              )}
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <HeroStat
                icon={<Package2 className="h-5 w-5" />}
                label="Products Found"
                value={String(totalProducts)}
              />
              <HeroStat
                icon={<TrendingUp className="h-5 w-5" />}
                label="Average Trend Score"
                value={avgTrendScore ? String(avgTrendScore) : "--"}
              />
              <HeroStat
                icon={<Sparkles className="h-5 w-5" />}
                label="Low Competition"
                value={String(lowCompetitionCount)}
              />
            </div>

            {(amazonProductUrl || amazonBeautyUrl) && (
              <div className="mt-6 grid gap-4 lg:grid-cols-2">
                {amazonProductUrl && (
                  <div className="rounded-[24px] border border-yellow-400/15 bg-black/30 p-5 backdrop-blur-md">
                    <p className="text-xs uppercase tracking-[0.22em] text-zinc-400">
                      Amazon Featured Product
                    </p>
                    <h3 className="mt-2 text-2xl font-bold text-white">
                      Direct Product Link
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-zinc-300">
                      Open your featured affiliate product directly from Product Discovery.
                    </p>
                    <a
                      href={amazonProductUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-yellow-400 px-4 py-3 font-semibold text-black transition hover:scale-[1.01]"
                    >
                      <ExternalLink className="h-4 w-4" />
                      View Featured Product
                    </a>
                  </div>
                )}

                {amazonBeautyUrl && (
                  <div className="rounded-[24px] border border-yellow-400/15 bg-black/30 p-5 backdrop-blur-md">
                    <p className="text-xs uppercase tracking-[0.22em] text-zinc-400">
                      Amazon Beauty Discovery
                    </p>
                    <h3 className="mt-2 text-2xl font-bold text-white">
                      Explore Beauty Products
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-zinc-300">
                      Jump straight into your Amazon beauty affiliate search page and explore more products.
                    </p>
                    <a
                      href={amazonBeautyUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-4 inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 font-medium text-white transition hover:border-yellow-400/20 hover:bg-white/10"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Explore Beauty Products
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        {products.length === 0 && !loading && !error ? (
          <div className="mt-8 rounded-[28px] border border-white/10 bg-zinc-950/90 p-10 text-center">
            <h3 className="text-2xl font-bold text-white">No Live Results</h3>
            <p className="mt-3 text-zinc-400">
              No verified product results were found for this search.
            </p>
            <p className="mt-2 text-sm text-zinc-500">
              Try another keyword or search TikTok and Amazon sources.
            </p>
          </div>
        ) : null}

        {products.length > 0 && (
          <section className="mt-8">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-3xl font-bold tracking-tight text-white">
                  Live Results
                </h2>
                <p className="mt-2 text-zinc-400">
                  Verified products returned from connected sources.
                </p>
              </div>

              <Link
                href="/cart"
                className="inline-flex items-center gap-2 rounded-2xl border border-yellow-400/20 bg-yellow-400/10 px-4 py-3 font-medium text-yellow-300 transition hover:bg-yellow-400/15"
              >
                <ShoppingCart className="h-4 w-4" />
                Open Cart
              </Link>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="overflow-hidden rounded-[28px] border border-white/10 bg-zinc-950 shadow-2xl shadow-black/40 transition hover:border-yellow-400/20"
                >
                  <div className="relative h-72 bg-zinc-900">
                    <Image
                      src={getSafeImage(product)}
                      alt={product.name}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent" />

                    <div className="absolute left-4 top-4 rounded-full border border-yellow-400/30 bg-black/40 px-3 py-1 text-xs font-semibold text-yellow-300 backdrop-blur-md">
                      {product.source || "Live Source"}
                    </div>
                  </div>

                  <div className="p-5">
                    <p className="mb-2 text-xs uppercase tracking-[0.28em] text-zinc-500">
                      {product.category || "General"}
                    </p>

                    <h3 className="text-2xl font-bold leading-tight text-white">
                      {product.name}
                    </h3>

                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <Stat
                        label="Price"
                        value={`$${Number(product.price || 0).toFixed(2)}`}
                      />
                      <Stat
                        label="Estimated Sales"
                        value={product.estimatedSales || "N/A"}
                      />
                      <Stat
                        label="Rating"
                        value={String(product.rating ?? "N/A")}
                      />
                      <Stat label="Reviews" value={product.reviews || "N/A"} />
                      <Stat
                        label="Trend Score"
                        value={String(product.trendScore ?? "N/A")}
                      />
                      <Stat
                        label="Competition"
                        value={product.competition || "Medium"}
                      />
                    </div>

                    <div className="mt-5">
                      <p className="text-xs uppercase tracking-[0.28em] text-zinc-500">
                        Why It’s Hot
                      </p>
                      <p className="mt-2 text-base leading-7 text-zinc-300">
                        {product.whyItsHot ||
                          "Live product found. Analysis can be added after source validation."}
                      </p>
                    </div>

                    <div className="mt-4">
                      <p className="text-xs uppercase tracking-[0.28em] text-zinc-500">
                        Content Angle
                      </p>
                      <p className="mt-2 text-base leading-7 text-zinc-300">
                        {product.contentAngle ||
                          "Use real demos, close-up visuals, and problem-solution hooks."}
                      </p>
                    </div>

                    <div className="mt-6 grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => saveHooksContext(product)}
                        className="flex items-center justify-center gap-2 rounded-2xl bg-yellow-400 px-4 py-3 font-semibold text-black transition hover:scale-[1.02]"
                      >
                        <Wand2 className="h-4 w-4" />
                        Generate Hooks
                      </button>

                      <button
                        type="button"
                        onClick={() => saveCaptionContext(product)}
                        className="flex items-center justify-center gap-2 rounded-2xl bg-yellow-400 px-4 py-3 font-semibold text-black transition hover:scale-[1.02]"
                      >
                        <PenSquare className="h-4 w-4" />
                        Write Caption
                      </button>

                      <button
                        type="button"
                        onClick={() => saveAdContext(product)}
                        className="flex items-center justify-center gap-2 rounded-2xl bg-yellow-400 px-4 py-3 font-semibold text-black transition hover:scale-[1.02]"
                      >
                        <Megaphone className="h-4 w-4" />
                        Create Product Ad
                      </button>

                      <button
                        type="button"
                        onClick={() => addToCart(product)}
                        className="flex items-center justify-center gap-2 rounded-2xl bg-yellow-400 px-4 py-3 font-semibold text-black transition hover:scale-[1.02]"
                      >
                        <ShoppingCart className="h-4 w-4" />
                        Add to Cart
                      </button>

                      {product.url ? (
                        <a
                          href={product.url}
                          target="_blank"
                          rel="noreferrer"
                          className="col-span-2 flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 font-medium text-white transition hover:border-yellow-400/20 hover:bg-white/10"
                        >
                          <ExternalLink className="h-4 w-4" />
                          View Source Product
                        </a>
                      ) : null}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}

function HeroStat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-black/25 p-4 backdrop-blur-md">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-yellow-400/15 text-yellow-300">
        {icon}
      </div>
      <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">
        {label}
      </p>
      <p className="mt-2 text-2xl font-bold text-white">{value}</p>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/30 p-3">
      <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">
        {label}
      </p>
      <p className="mt-2 text-xl font-semibold text-white">{value}</p>
    </div>
  )
}