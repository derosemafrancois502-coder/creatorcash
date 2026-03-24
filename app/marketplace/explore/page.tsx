"use client"

import Link from "next/link"
import {
  ChangeEvent,
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import { useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import {
  ArrowRight,
  Camera,
  Grid3X3,
  Mic,
  Search,
  ShoppingCart,
  Sparkles,
  Star,
  Store,
  Tag,
  X,
} from "lucide-react"

type Shop = {
  id: string
  user_id: string
  store_name: string
  slug: string
  approved: boolean
  status: string
}

type ProductRow = {
  id: string
  user_id: string
  shop_id: string | null
  name: string
  description: string | null
  price: number
  type: "digital" | "physical"
  category: string | null
  image_url: string | null
  video_url: string | null
  status: "draft" | "published" | "archived"
  inventory_count: number | null
  published_at: string | null
}

type Product = ProductRow & {
  shop: Shop | null
}

type CartItem = {
  id: string
  name: string
  price: number
  image_url: string | null
  quantity: number
}

declare global {
  interface Window {
    webkitSpeechRecognition?: any
    SpeechRecognition?: any
  }
}

const categoryPills = [
  "All",
  "Beauty",
  "Fashion",
  "Digital",
  "Fitness",
  "Tech",
  "Lifestyle",
]

export default function MarketplaceExplorePage() {
  return (
    <Suspense fallback={<MarketplaceExploreFallback />}>
      <MarketplaceExploreContent />
    </Suspense>
  )
}

function MarketplaceExploreContent() {
  const supabase = useMemo(() => createClient(), [])
  const searchParams = useSearchParams()

  const [loading, setLoading] = useState(true)
  const [products, setProducts] = useState<Product[]>([])
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])

  const [search, setSearch] = useState("")
  const [appliedSearch, setAppliedSearch] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [sortBy, setSortBy] = useState("latest")
  const [cartCount, setCartCount] = useState(0)

  const [isListening, setIsListening] = useState(false)
  const [imageSearchPreview, setImageSearchPreview] = useState<string | null>(null)
  const [imageSearchLabel, setImageSearchLabel] = useState<string>("")
  const [voiceSupported, setVoiceSupported] = useState(false)

  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const recognitionRef = useRef<any>(null)
  const searchInputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    void loadMarketplace()
    loadCartCount()
  }, [])

  useEffect(() => {
    const queryValue = searchParams.get("q")?.trim() || ""

    if (!queryValue) return

    setSearch(queryValue)
    setAppliedSearch(queryValue)
  }, [searchParams])

  useEffect(() => {
    const SpeechRecognition =
      typeof window !== "undefined"
        ? window.SpeechRecognition || window.webkitSpeechRecognition
        : null

    setVoiceSupported(Boolean(SpeechRecognition))

    if (!SpeechRecognition) return

    const recognition = new SpeechRecognition()
    recognition.lang = "en-US"
    recognition.continuous = false
    recognition.interimResults = false

    recognition.onstart = () => {
      setIsListening(true)
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognition.onerror = () => {
      setIsListening(false)
      alert("Voice search is not available right now.")
    }

    recognition.onresult = (event: any) => {
      const transcript = event?.results?.[0]?.[0]?.transcript || ""
      if (transcript) {
        setSearch(transcript)
        setAppliedSearch(transcript)
      }
    }

    recognitionRef.current = recognition

    return () => {
      try {
        recognition.stop()
      } catch {}
    }
  }, [])

  useEffect(() => {
    return () => {
      if (imageSearchPreview) {
        URL.revokeObjectURL(imageSearchPreview)
      }
    }
  }, [imageSearchPreview])

  async function loadMarketplace() {
    try {
      setLoading(true)

      const { data: productRows, error: productsError } = await supabase
        .from("products")
        .select(
          "id, user_id, shop_id, name, description, price, type, category, image_url, video_url, status, inventory_count, published_at"
        )
        .eq("status", "published")
        .order("published_at", { ascending: false })

      if (productsError) {
        console.error(
          "Load marketplace products error:",
          productsError.message,
          productsError.details,
          productsError.hint,
          productsError
        )
        alert(`Failed to load marketplace products. ${productsError.message}`)
        setProducts([])
        setFeaturedProducts([])
        return
      }

      const { data: shopsRows, error: shopsError } = await supabase
        .from("shops")
        .select("id, user_id, store_name, slug, approved, status")
        .eq("approved", true)
        .eq("status", "approved")

      if (shopsError) {
        console.error(
          "Load marketplace shops error:",
          shopsError.message,
          shopsError.details,
          shopsError.hint,
          shopsError
        )
        alert(`Failed to load marketplace shops. ${shopsError.message}`)
        setProducts([])
        setFeaturedProducts([])
        return
      }

      const shopsMap = new Map<string, Shop>()
      for (const shop of (shopsRows ?? []) as Shop[]) {
        shopsMap.set(shop.id, shop)
      }

      const mergedProducts: Product[] = ((productRows ?? []) as ProductRow[])
        .map((product) => {
          const shop = product.shop_id ? shopsMap.get(product.shop_id) ?? null : null
          return {
            ...product,
            shop,
          }
        })
        .filter(
          (product) =>
            product.shop !== null &&
            product.shop.approved === true &&
            product.shop.status === "approved"
        )

      setProducts(mergedProducts)
      setFeaturedProducts(mergedProducts.slice(0, 4))
    } catch (error) {
      console.error("Load marketplace unexpected error:", error)
      alert("Could not load marketplace right now.")
      setProducts([])
      setFeaturedProducts([])
    } finally {
      setLoading(false)
    }
  }

  function loadCartCount() {
    try {
      const raw = localStorage.getItem("creatorgoat-cart")
      const parsed: CartItem[] = raw ? JSON.parse(raw) : []
      const total = parsed.reduce((sum, item) => sum + item.quantity, 0)
      setCartCount(total)
    } catch {
      setCartCount(0)
    }
  }

  function addToCart(product: Product) {
    try {
      const raw = localStorage.getItem("creatorgoat-cart")
      const cart: CartItem[] = raw ? JSON.parse(raw) : []

      const existing = cart.find((item) => item.id === product.id)

      if (existing) {
        existing.quantity += 1
      } else {
        cart.push({
          id: product.id,
          name: product.name,
          price: Number(product.price || 0),
          image_url: product.image_url || null,
          quantity: 1,
        })
      }

      localStorage.setItem("creatorgoat-cart", JSON.stringify(cart))
      const total = cart.reduce((sum, item) => sum + item.quantity, 0)
      setCartCount(total)
      alert("Added to cart.")
    } catch (error) {
      console.error("Add to cart error:", error)
      alert("Could not add to cart.")
    }
  }

  function openCameraSearch() {
    fileInputRef.current?.click()
  }

  function extractSearchTermsFromFilename(filename: string) {
    return filename
      .replace(/\.[^/.]+$/, "")
      .replace(/[-_]+/g, " ")
      .replace(/\s+/g, " ")
      .trim()
  }

  function handleImageSearchUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    if (imageSearchPreview) {
      URL.revokeObjectURL(imageSearchPreview)
    }

    const previewUrl = URL.createObjectURL(file)
    const derivedSearch = extractSearchTermsFromFilename(file.name)

    setImageSearchPreview(previewUrl)
    setImageSearchLabel(file.name)

    const nextSearch = derivedSearch || file.name
    setSearch(nextSearch)
    setAppliedSearch(nextSearch)
  }

  function clearImageSearch() {
    if (imageSearchPreview) {
      URL.revokeObjectURL(imageSearchPreview)
    }
    setImageSearchPreview(null)
    setImageSearchLabel("")
  }

  function startVoiceSearch() {
    if (!recognitionRef.current) {
      alert("Voice search is not supported in this browser.")
      return
    }

    try {
      recognitionRef.current.start()
    } catch {
      alert("Voice search is already running.")
    }
  }

  function applySearch() {
    setAppliedSearch(search)
    searchInputRef.current?.focus()
  }

  const filteredProducts = [...products]
    .filter((product) => {
      const keyword = appliedSearch.trim().toLowerCase()

      const matchesSearch =
        keyword.length === 0 ||
        product.name.toLowerCase().includes(keyword) ||
        (product.description || "").toLowerCase().includes(keyword) ||
        (product.shop?.store_name || "").toLowerCase().includes(keyword) ||
        (product.category || "").toLowerCase().includes(keyword)

      const matchesCategory =
        selectedCategory === "All" ||
        (product.category || "").toLowerCase() === selectedCategory.toLowerCase()

      return matchesSearch && matchesCategory
    })
    .sort((a, b) => {
      if (sortBy === "price-low") return Number(a.price) - Number(b.price)
      if (sortBy === "price-high") return Number(b.price) - Number(a.price)
      if (sortBy === "name") return a.name.localeCompare(b.name)

      return (
        new Date(b.published_at || 0).getTime() -
        new Date(a.published_at || 0).getTime()
      )
    })

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white px-6">
        <div className="rounded-[2rem] border border-zinc-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 h-12 w-12 animate-pulse rounded-full bg-zinc-200" />
          <h2 className="text-lg font-semibold text-zinc-900">
            Loading marketplace...
          </h2>
          <p className="mt-2 text-sm text-zinc-600">
            Preparing premium product discovery.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white text-zinc-900">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleImageSearchUpload}
      />

      <div className="sticky top-0 z-40 border-b border-zinc-200 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-zinc-500">
              CreatorGoat
            </p>
            <h1 className="mt-1 text-xl font-semibold text-zinc-950">
              Marketplace Explore
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/marketplace"
              className="hidden rounded-full border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-800 transition hover:bg-zinc-50 md:inline-flex"
            >
              Marketplace Gate
            </Link>

            <Link
              href="/cart"
              className="inline-flex items-center gap-2 rounded-full bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition hover:scale-[1.02]"
            >
              <ShoppingCart className="h-4 w-4" />
              Cart
              {cartCount > 0 ? (
                <span className="rounded-full bg-white px-2 py-0.5 text-xs font-bold text-zinc-900">
                  {cartCount}
                </span>
              ) : null}
            </Link>
          </div>
        </div>
      </div>

      <section className="relative overflow-hidden border-b border-zinc-200 bg-zinc-950 text-white">
        <div className="absolute inset-0">
          <video
            autoPlay
            muted
            loop
            playsInline
            className="h-full w-full object-cover opacity-55"
          >
            <source src="/videos/cg-marketplace-products.mp4" type="video/mp4" />
          </video>
        </div>

        <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/35 to-black/25" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />

        <div className="relative mx-auto max-w-7xl px-5 py-16 md:px-8 md:py-24">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/12 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/90 backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5" />
              Verified marketplace discovery
            </div>

            <h2 className="mt-5 text-4xl font-semibold leading-tight md:text-6xl">
              Discover premium products
              <br />
              from verified sellers
            </h2>

            <p className="mt-5 max-w-2xl text-sm leading-7 text-white/85 md:text-base">
              Explore products, brands, and creator shops inside a controlled marketplace
              built for clean discovery, trusted sellers, and premium product presentation.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <HeroStat
                title="Verified Shops"
                value={String(new Set(products.map((p) => p.shop_id).filter(Boolean)).size)}
              />
              <HeroStat title="Published Products" value={String(products.length)} />
              <HeroStat title="Premium Flow" value="Curated" />
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-zinc-200 bg-white">
        <div className="mx-auto max-w-7xl px-5 py-6 md:px-8">
          <div className="grid gap-4 lg:grid-cols-[1fr_220px]">
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-zinc-400" />

                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search products, descriptions, seller stores..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      applySearch()
                    }
                  }}
                  className="h-12 w-full rounded-2xl border border-zinc-200 bg-white pl-11 pr-28 text-sm text-zinc-900 outline-none transition focus:border-zinc-400 focus:ring-2 focus:ring-zinc-200"
                />

                <div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-2">
                  <button
                    type="button"
                    onClick={openCameraSearch}
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-700 transition hover:bg-zinc-50"
                    aria-label="Visual search"
                    title="Visual search"
                  >
                    <Camera className="h-4 w-4" />
                  </button>

                  <button
                    type="button"
                    onClick={startVoiceSearch}
                    className={`flex h-9 w-9 items-center justify-center rounded-xl border transition ${
                      isListening
                        ? "border-red-300 bg-red-50 text-red-600"
                        : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50"
                    }`}
                    aria-label="Voice search"
                    title={voiceSupported ? "Voice search" : "Voice search not supported"}
                  >
                    <Mic className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={applySearch}
                className="h-12 rounded-2xl bg-zinc-900 px-5 text-sm font-semibold text-white transition hover:scale-[1.02] hover:bg-zinc-800"
              >
                Search
              </button>
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="h-12 rounded-2xl border border-zinc-200 bg-white px-4 text-sm text-zinc-900 outline-none transition focus:border-zinc-400"
            >
              <option value="latest">Latest</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="name">Name</option>
            </select>
          </div>

          {(imageSearchPreview || imageSearchLabel || isListening || appliedSearch) && (
            <div className="mt-4 flex flex-wrap items-center gap-3 rounded-[1.5rem] border border-zinc-200 bg-zinc-50 p-3">
              {imageSearchPreview ? (
                <img
                  src={imageSearchPreview}
                  alt="Visual search preview"
                  className="h-14 w-14 rounded-xl object-cover"
                />
              ) : null}

              <div className="min-w-0 flex-1">
                {imageSearchLabel ? (
                  <p className="truncate text-sm font-medium text-zinc-900">
                    Image search: {imageSearchLabel}
                  </p>
                ) : null}

                {appliedSearch ? (
                  <p className="truncate text-sm text-zinc-700">
                    Search active: <span className="font-medium">{appliedSearch}</span>
                  </p>
                ) : null}

                {isListening ? (
                  <p className="text-sm text-red-600">Listening...</p>
                ) : voiceSupported ? (
                  <p className="text-xs text-zinc-500">
                    Camera, voice, and search button are active for MVP mode.
                  </p>
                ) : (
                  <p className="text-xs text-zinc-500">
                    Camera search is active. Voice search depends on browser support.
                  </p>
                )}
              </div>

              {(imageSearchPreview || appliedSearch) ? (
                <button
                  type="button"
                  onClick={() => {
                    clearImageSearch()
                    setSearch("")
                    setAppliedSearch("")
                    searchInputRef.current?.focus()
                  }}
                  className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
                >
                  <X className="h-4 w-4" />
                  Clear
                </button>
              ) : null}
            </div>
          )}

          <div className="mt-4 flex flex-wrap gap-3">
            {categoryPills.map((item) => {
              const active = selectedCategory === item

              return (
                <button
                  key={item}
                  onClick={() => setSelectedCategory(item)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                    active
                      ? "bg-zinc-900 text-white"
                      : "border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50"
                  }`}
                >
                  {item}
                </button>
              )
            })}
          </div>
        </div>
      </section>

      {featuredProducts.length > 0 ? (
        <section className="bg-zinc-50">
          <div className="mx-auto max-w-7xl px-5 py-10 md:px-8">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
                  Featured
                </p>
                <h3 className="mt-2 text-2xl font-semibold text-zinc-950">
                  Trending right now
                </h3>
              </div>

              <Link
                href="/cart"
                className="hidden items-center gap-2 text-sm font-medium text-zinc-800 md:inline-flex"
              >
                View Cart
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {featuredProducts.map((product) => (
                <FeaturedCard
                  key={product.id}
                  product={product}
                  onAddToCart={() => addToCart(product)}
                />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-5 py-10 md:px-8">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
                Browse
              </p>
              <h3 className="mt-2 text-2xl font-semibold text-zinc-950">
                All marketplace products
              </h3>
            </div>

            <div className="hidden items-center gap-2 text-sm text-zinc-500 md:inline-flex">
              <Grid3X3 className="h-4 w-4" />
              {filteredProducts.length} items
            </div>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="rounded-[2rem] border border-dashed border-zinc-300 bg-zinc-50 p-12 text-center">
              <Tag className="mx-auto h-10 w-10 text-zinc-400" />
              <h4 className="mt-4 text-lg font-semibold text-zinc-900">
                No products found
              </h4>
              <p className="mt-2 text-sm text-zinc-600">
                Try changing your search, category filter, or check if products are published and seller shops are approved.
              </p>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={() => addToCart(product)}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

function MarketplaceExploreFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-6">
      <div className="rounded-[2rem] border border-zinc-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-4 h-12 w-12 animate-pulse rounded-full bg-zinc-200" />
        <h2 className="text-lg font-semibold text-zinc-900">
          Loading marketplace...
        </h2>
        <p className="mt-2 text-sm text-zinc-600">
          Preparing premium product discovery.
        </p>
      </div>
    </div>
  )
}

function HeroStat({
  title,
  value,
}: {
  title: string
  value: string
}) {
  return (
    <div className="rounded-3xl border border-white/15 bg-white/12 p-4 backdrop-blur-xl">
      <p className="text-xs uppercase tracking-[0.15em] text-white/80">{title}</p>
      <p className="mt-2 text-xl font-semibold text-white">{value}</p>
    </div>
  )
}

function FeaturedCard({
  product,
  onAddToCart,
}: {
  product: Product
  onAddToCart: () => void
}) {
  return (
    <div className="overflow-hidden rounded-[2rem] border border-zinc-200 bg-white shadow-sm">
      <div className="relative h-64 bg-zinc-100">
        {product.video_url ? (
          <video
            src={product.video_url}
            className="h-full w-full object-cover"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            poster={product.image_url || undefined}
          />
        ) : product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-zinc-100 text-zinc-400">
            No media
          </div>
        )}

        <div className="absolute left-4 top-4 inline-flex items-center gap-1 rounded-full bg-black/70 px-3 py-1.5 text-xs font-semibold text-white">
          <Star className="h-3.5 w-3.5" />
          Featured
        </div>
      </div>

      <div className="p-5">
        <div className="mb-3 flex items-center gap-2 text-xs text-zinc-500">
          <Store className="h-3.5 w-3.5" />
          {product.shop?.store_name || "Verified Store"}
        </div>

        <Link
          href={`/marketplace/product/${product.id}`}
          className="text-lg font-semibold text-zinc-950 transition hover:text-zinc-700"
        >
          {product.name}
        </Link>

        <p className="mt-2 line-clamp-2 text-sm leading-6 text-zinc-600">
          {product.description || "Premium marketplace product from a verified seller."}
        </p>

        <div className="mt-4 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.12em] text-zinc-400">
              Price
            </p>
            <p className="text-xl font-semibold text-zinc-950">
              ${Number(product.price || 0).toFixed(2)}
            </p>
          </div>

          <button
            onClick={onAddToCart}
            className="rounded-2xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition hover:scale-[1.02]"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  )
}

function ProductCard({
  product,
  onAddToCart,
}: {
  product: Product
  onAddToCart: () => void
}) {
  return (
    <div className="overflow-hidden rounded-[2rem] border border-zinc-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <Link href={`/marketplace/product/${product.id}`} className="block">
        <div className="relative h-56 bg-zinc-100">
          {product.video_url ? (
            <video
              src={product.video_url}
              className="h-full w-full object-cover"
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              poster={product.image_url || undefined}
            />
          ) : product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-zinc-100 text-zinc-400">
              No media
            </div>
          )}

          <div className="absolute right-4 top-4 rounded-full bg-white/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-700">
            {product.type}
          </div>
        </div>
      </Link>

      <div className="p-5">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="inline-flex items-center gap-2 text-xs text-zinc-500">
            <Store className="h-3.5 w-3.5" />
            {product.shop?.store_name || "Verified Store"}
          </div>

          <div className="rounded-full bg-zinc-100 px-2.5 py-1 text-[11px] font-medium text-zinc-600">
            {product.category || "General"}
          </div>
        </div>

        <Link
          href={`/marketplace/product/${product.id}`}
          className="text-lg font-semibold text-zinc-950 transition hover:text-zinc-700"
        >
          {product.name}
        </Link>

        <p className="mt-2 line-clamp-2 text-sm leading-6 text-zinc-600">
          {product.description || "Premium product listing from a verified seller."}
        </p>

        <div className="mt-5 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.12em] text-zinc-400">
              Price
            </p>
            <p className="text-xl font-semibold text-zinc-950">
              ${Number(product.price || 0).toFixed(2)}
            </p>
          </div>

          <button
            onClick={onAddToCart}
            className="rounded-2xl border border-zinc-200 px-4 py-2 text-sm font-semibold text-zinc-900 transition hover:bg-zinc-50"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  )
}