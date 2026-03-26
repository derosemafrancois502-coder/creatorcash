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
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import {
  ArrowRight,
  Bell,
  Camera,
  Grid3X3,
  Heart,
  MessageCircle,
  Mic,
  Search,
  ShoppingCart,
  Sparkles,
  Star,
  Store,
  Tag,
  User,
  ShieldCheck,
  Zap,
  Flame,
  BadgeCheck,
  Receipt,
  Bot,
  X,
  ChevronRight,
  Users,
  Check,
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

type Notice = {
  id: number
  title: string
  text: string
}

type ExploreTab = "all" | "following" | "favorites"

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
  "Physical",
]

const notificationsSeed: Notice[] = [
  {
    id: 1,
    title: "Marketplace live",
    text: "Browse approved shops and published products only.",
  },
  {
    id: 2,
    title: "Favorites ready",
    text: "Tap the heart on products to save them here.",
  },
  {
    id: 3,
    title: "Following ready",
    text: "Tap follow on seller cards to track their products.",
  },
]

const assistantSuggestions = [
  "How do I track my order?",
  "How can I change my shipping address?",
  "Where do I message a seller?",
  "How do returns work?",
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
  const router = useRouter()
  const searchParams = useSearchParams()

  const [loading, setLoading] = useState(true)
  const [products, setProducts] = useState<Product[]>([])
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])

  const [search, setSearch] = useState("")
  const [appliedSearch, setAppliedSearch] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [sortBy, setSortBy] = useState("latest")
  const [cartCount, setCartCount] = useState(0)
  const [activeTab, setActiveTab] = useState<ExploreTab>("all")

  const [favoriteIds, setFavoriteIds] = useState<string[]>([])
  const [followingSellerIds, setFollowingSellerIds] = useState<string[]>([])

  const [isListening, setIsListening] = useState(false)
  const [imageSearchPreview, setImageSearchPreview] = useState<string | null>(null)
  const [imageSearchLabel, setImageSearchLabel] = useState("")
  const [voiceSupported, setVoiceSupported] = useState(false)

  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [assistantOpen, setAssistantOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notice[]>(notificationsSeed)

  const [assistantMessages, setAssistantMessages] = useState<
    { role: "assistant" | "user"; text: string }[]
  >([
    {
      role: "assistant",
      text:
        "Hi. I can help with products, orders, shipping status, seller contact, favorites, and how the marketplace works.",
    },
  ])
  const [assistantInput, setAssistantInput] = useState("")

  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const recognitionRef = useRef<any>(null)
  const searchInputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    void loadMarketplace()
    loadCartCount()
    loadSavedState()
  }, [])

  useEffect(() => {
    const queryValue = searchParams.get("q")?.trim() || ""
    const categoryValue = searchParams.get("category")?.trim() || ""
    const tabValue = searchParams.get("tab")?.trim() || ""

    if (queryValue) {
      setSearch(queryValue)
      setAppliedSearch(queryValue)
    }

    if (categoryValue) {
      setSelectedCategory(categoryValue)
    }

    if (tabValue === "digital") {
      setSelectedCategory("Digital")
    }

    if (tabValue === "physical") {
      setSelectedCategory("Physical")
    }

    if (tabValue === "favorites") {
      setActiveTab("favorites")
    } else if (tabValue === "following") {
      setActiveTab("following")
    } else {
      setActiveTab("all")
    }
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

  useEffect(() => {
    function handleOutsideClick() {
      setNotificationsOpen(false)
      setProfileOpen(false)
    }

    if (notificationsOpen || profileOpen) {
      window.addEventListener("click", handleOutsideClick)
    }

    return () => {
      window.removeEventListener("click", handleOutsideClick)
    }
  }, [notificationsOpen, profileOpen])

  function loadSavedState() {
    try {
      const rawFavorites = localStorage.getItem("creatorgoat-favorites")
      const rawFollowing = localStorage.getItem("creatorgoat-following-sellers")

      const parsedFavorites = rawFavorites ? JSON.parse(rawFavorites) : []
      const parsedFollowing = rawFollowing ? JSON.parse(rawFollowing) : []

      setFavoriteIds(Array.isArray(parsedFavorites) ? parsedFavorites : [])
      setFollowingSellerIds(Array.isArray(parsedFollowing) ? parsedFollowing : [])
    } catch {
      setFavoriteIds([])
      setFollowingSellerIds([])
    }
  }

  function persistFavorites(nextIds: string[]) {
    setFavoriteIds(nextIds)
    localStorage.setItem("creatorgoat-favorites", JSON.stringify(nextIds))
  }

  function persistFollowing(nextIds: string[]) {
    setFollowingSellerIds(nextIds)
    localStorage.setItem("creatorgoat-following-sellers", JSON.stringify(nextIds))
  }

  function toggleFavorite(productId: string) {
    const exists = favoriteIds.includes(productId)
    const next = exists
      ? favoriteIds.filter((id) => id !== productId)
      : [...favoriteIds, productId]

    persistFavorites(next)
  }

  function toggleFollowSeller(sellerId: string | null) {
    if (!sellerId) return

    const exists = followingSellerIds.includes(sellerId)
    const next = exists
      ? followingSellerIds.filter((id) => id !== sellerId)
      : [...followingSellerIds, sellerId]

    persistFollowing(next)
  }

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
    setActiveTab("all")
    searchInputRef.current?.focus()
  }

  function clearNotifications() {
    setNotifications([])
  }

  function openFavoritesTab() {
    setActiveTab("favorites")
    router.push("/marketplace/explore?tab=favorites")
  }

  function openFollowingTab() {
    setActiveTab("following")
    router.push("/marketplace/explore?tab=following")
  }

  function backToAllTab() {
    setActiveTab("all")
    router.push("/marketplace/explore")
  }

  function handleAssistantAsk(question: string) {
    const q = question.trim()
    if (!q) return

    setAssistantMessages((prev) => [...prev, { role: "user", text: q }])

    const lower = q.toLowerCase()

    let answer =
      "I can help with marketplace products, orders, shipping, seller contact, favorites, and checkout questions."

    if (lower.includes("track") || lower.includes("order")) {
      answer =
        "Open My Orders to see what you bought, payment status, shipping status, tracking number, and order details."
    } else if (lower.includes("shipping address") || lower.includes("address")) {
      answer =
        "Shipping address is entered during checkout before payment. If you already placed an order, use My Orders and contact the seller or support for address-change help."
    } else if (lower.includes("message") || lower.includes("seller")) {
      answer =
        "Use My Orders, open the order you bought, then use the order conversation flow to contact the seller about shipping, product issues, or updates."
    } else if (lower.includes("return")) {
      answer =
        "Returns depend on the seller and marketplace policy. Open the order, review its status, and contact the seller from your order support flow."
    } else if (lower.includes("favorite")) {
      answer =
        "Tap the heart on any product card to save it. Then open Favorites from the quick actions row or profile menu."
    } else if (lower.includes("follow")) {
      answer =
        "Tap Follow Seller on a product card. Then open Following to browse products from sellers you chose to follow."
    } else if (lower.includes("checkout") || lower.includes("pay")) {
      answer =
        "Add products to cart, open Cart, review your items, then continue to checkout to enter shipping information and payment."
    }

    setAssistantMessages((prev) => [...prev, { role: "assistant", text: answer }])
    setAssistantInput("")
  }

  const filteredProductsBase = [...products]
    .filter((product) => {
      const keyword = appliedSearch.trim().toLowerCase()

      const matchesSearch =
        keyword.length === 0 ||
        product.name.toLowerCase().includes(keyword) ||
        (product.description || "").toLowerCase().includes(keyword) ||
        (product.shop?.store_name || "").toLowerCase().includes(keyword) ||
        (product.category || "").toLowerCase().includes(keyword)

      const categoryValue = (product.category || "").toLowerCase()
      const typeValue = (product.type || "").toLowerCase()
      const selected = selectedCategory.toLowerCase()

      const matchesCategory =
        selectedCategory === "All" ||
        categoryValue === selected ||
        typeValue === selected

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

  const filteredProducts =
    activeTab === "favorites"
      ? filteredProductsBase.filter((product) => favoriteIds.includes(product.id))
      : activeTab === "following"
      ? filteredProductsBase.filter((product) =>
          product.shop?.user_id
            ? followingSellerIds.includes(product.shop.user_id)
            : false
        )
      : filteredProductsBase

  const shopCount = new Set(products.map((p) => p.shop_id).filter(Boolean)).size

  const flashDeals = [...filteredProductsBase]
    .sort((a, b) => Number(a.price) - Number(b.price))
    .slice(0, 4)

  const digitalPicks = filteredProductsBase
    .filter((product) => product.type === "digital")
    .slice(0, 4)

  const physicalPicks = filteredProductsBase
    .filter((product) => product.type === "physical")
    .slice(0, 4)

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

      {assistantOpen ? (
        <div className="fixed inset-0 z-[80] flex items-end justify-end bg-black/40 p-4 md:p-6">
          <div className="flex h-[78vh] w-full max-w-md flex-col overflow-hidden rounded-[2rem] border border-zinc-200 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-4">
              <div>
                <p className="text-sm font-semibold text-zinc-950">
                  Marketplace AI Assistant
                </p>
                <p className="text-xs text-zinc-500">
                  Orders, shipping, seller contact, favorites, checkout help
                </p>
              </div>

              <button
                type="button"
                onClick={() => setAssistantOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-700 transition hover:bg-zinc-50"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
              {assistantMessages.map((message, index) => (
                <div
                  key={`${message.role}-${index}`}
                  className={`max-w-[90%] rounded-2xl px-4 py-3 text-sm leading-6 ${
                    message.role === "assistant"
                      ? "bg-zinc-100 text-zinc-900"
                      : "ml-auto bg-zinc-900 text-white"
                  }`}
                >
                  {message.text}
                </div>
              ))}
            </div>

            <div className="border-t border-zinc-200 px-4 py-3">
              <div className="mb-3 flex flex-wrap gap-2">
                {assistantSuggestions.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => handleAssistantAsk(item)}
                    className="rounded-full border border-zinc-200 bg-white px-3 py-2 text-xs font-medium text-zinc-700 transition hover:bg-zinc-50"
                  >
                    {item}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <input
                  value={assistantInput}
                  onChange={(e) => setAssistantInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      handleAssistantAsk(assistantInput)
                    }
                  }}
                  placeholder="Ask about orders, shipping, address, seller help..."
                  className="h-12 flex-1 rounded-2xl border border-zinc-200 px-4 text-sm text-zinc-900 outline-none focus:border-zinc-400"
                />

                <button
                  type="button"
                  onClick={() => handleAssistantAsk(assistantInput)}
                  className="inline-flex h-12 items-center justify-center rounded-2xl bg-zinc-900 px-4 text-sm font-semibold text-white transition hover:bg-zinc-800"
                >
                  Ask
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <div className="sticky top-0 z-50 border-b border-zinc-200 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-4 md:px-8">
          <Link href="/marketplace" className="flex min-w-fit items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-zinc-900 text-white">
              <Store className="h-5 w-5" />
            </div>

            <div className="hidden sm:block">
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-zinc-500">
                CreatorGoat
              </p>
              <h1 className="text-base font-semibold text-zinc-950">
                Marketplace Explore
              </h1>
            </div>
          </Link>

          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-zinc-400" />

            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search products, categories, verified sellers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  applySearch()
                }
              }}
              className="h-12 w-full rounded-2xl border border-zinc-200 bg-white pl-11 pr-32 text-sm text-zinc-900 outline-none transition focus:border-zinc-400 focus:ring-2 focus:ring-zinc-200"
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
            className="hidden h-12 rounded-2xl bg-zinc-900 px-5 text-sm font-semibold text-white transition hover:scale-[1.02] hover:bg-zinc-800 md:inline-flex md:items-center md:justify-center"
          >
            Search
          </button>

          <div className="relative">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                setNotificationsOpen((prev) => !prev)
                setProfileOpen(false)
              }}
              className="relative flex h-11 w-11 items-center justify-center rounded-2xl border border-zinc-200 bg-white text-zinc-800 transition hover:bg-zinc-50"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" />
              {notifications.length > 0 ? (
                <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-amber-500" />
              ) : null}
            </button>

            {notificationsOpen ? (
              <div
                onClick={(e) => e.stopPropagation()}
                className="absolute right-0 top-14 w-[320px] overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-2xl"
              >
                <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold text-zinc-950">Notifications</p>
                    <p className="text-xs text-zinc-500">Marketplace updates</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setNotificationsOpen(false)}
                    className="flex h-8 w-8 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-700 transition hover:bg-zinc-50"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="px-4 py-6 text-sm text-zinc-500">
                      No new notifications.
                    </div>
                  ) : (
                    notifications.map((item) => (
                      <div
                        key={item.id}
                        className="border-b border-zinc-100 px-4 py-4 last:border-b-0"
                      >
                        <p className="text-sm font-semibold text-zinc-950">
                          {item.title}
                        </p>
                        <p className="mt-1 text-xs leading-5 text-zinc-600">
                          {item.text}
                        </p>
                      </div>
                    ))
                  )}
                </div>

                <div className="flex items-center justify-between border-t border-zinc-200 px-4 py-3">
                  <button
                    type="button"
                    onClick={clearNotifications}
                    className="text-xs font-semibold text-zinc-900 transition hover:text-zinc-700"
                  >
                    Clear all
                  </button>

                  <button
                    type="button"
                    onClick={() => setNotificationsOpen(false)}
                    className="text-xs font-semibold text-zinc-500 transition hover:text-zinc-800"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : null}
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                setProfileOpen((prev) => !prev)
                setNotificationsOpen(false)
              }}
              className="flex h-11 w-11 items-center justify-center rounded-2xl border border-zinc-200 bg-white text-zinc-800 transition hover:bg-zinc-50"
              aria-label="Profile"
            >
              <User className="h-5 w-5" />
            </button>

            {profileOpen ? (
              <div
                onClick={(e) => e.stopPropagation()}
                className="absolute right-0 top-14 w-[250px] overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-2xl"
              >
                <div className="border-b border-zinc-200 px-4 py-3">
                  <p className="text-sm font-semibold text-zinc-950">Customer Menu</p>
                  <p className="text-xs text-zinc-500">
                    Orders, favorites, following
                  </p>
                </div>

                <div className="p-2">
                  <ProfileMenuButton
                    icon={<Receipt className="h-4 w-4" />}
                    label="My Orders"
                    onClick={() => {
                      setProfileOpen(false)
                      router.push("/orders")
                    }}
                  />

                  <ProfileMenuButton
                    icon={<MessageCircle className="h-4 w-4" />}
                    label="Order Messages"
                    onClick={() => {
                      setProfileOpen(false)
                      router.push("/orders")
                    }}
                  />

                  <ProfileMenuButton
                    icon={<Heart className="h-4 w-4" />}
                    label="Favorites"
                    onClick={() => {
                      setProfileOpen(false)
                      openFavoritesTab()
                    }}
                  />

                  <ProfileMenuButton
                    icon={<Users className="h-4 w-4" />}
                    label="Following"
                    onClick={() => {
                      setProfileOpen(false)
                      openFollowingTab()
                    }}
                  />
                </div>
              </div>
            ) : null}
          </div>

          <Link
            href="/cart"
            className="inline-flex items-center gap-2 rounded-2xl bg-zinc-900 px-4 py-3 text-sm font-semibold text-white transition hover:scale-[1.02]"
          >
            <ShoppingCart className="h-4 w-4" />
            <span className="hidden sm:inline">Cart</span>
            {cartCount > 0 ? (
              <span className="rounded-full bg-white px-2 py-0.5 text-xs font-bold text-zinc-900">
                {cartCount}
              </span>
            ) : null}
          </Link>
        </div>

        <div className="mx-auto max-w-7xl px-4 pb-4 md:px-8 md:hidden">
          <button
            type="button"
            onClick={applySearch}
            className="h-11 w-full rounded-2xl bg-zinc-900 text-sm font-semibold text-white transition hover:bg-zinc-800"
          >
            Search
          </button>
        </div>
      </div>

      <section className="border-b border-zinc-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-5 md:px-8">
          <div className="grid gap-4 md:grid-cols-5">
            <QuickActionCard
              icon={<Receipt className="h-5 w-5" />}
              label="Orders"
              text="What you bought"
              href="/orders"
            />
            <QuickActionCard
              icon={<MessageCircle className="h-5 w-5" />}
              label="Messages"
              text="Order chats"
              href="/orders"
            />
            <QuickActionButton
              icon={<Sparkles className="h-5 w-5" />}
              label="Following"
              text={`Followed sellers (${followingSellerIds.length})`}
              onClick={openFollowingTab}
            />
            <QuickActionButton
              icon={<Bot className="h-5 w-5" />}
              label="AI Assistant"
              text="Marketplace help"
              onClick={() => setAssistantOpen(true)}
            />
            <QuickActionButton
              icon={<Heart className="h-5 w-5" />}
              label="Favorites"
              text={`Saved products (${favoriteIds.length})`}
              onClick={openFavoritesTab}
            />
          </div>
        </div>
      </section>

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

        <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/40 to-black/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />

        <div className="relative mx-auto max-w-7xl px-4 py-16 md:px-8 md:py-24">
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
              <HeroStat title="Verified Shops" value={String(shopCount)} />
              <HeroStat title="Published Products" value={String(products.length)} />
              <HeroStat title="Protected Flow" value="Live" />
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-zinc-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6 md:px-8">
          <div className="grid gap-4 lg:grid-cols-[1fr_220px]">
            <div className="rounded-[1.5rem] border border-zinc-200 bg-zinc-50 p-4">
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-2 text-xs font-semibold text-zinc-700">
                  <Flame className="h-3.5 w-3.5" />
                  Trending Products
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-2 text-xs font-semibold text-zinc-700">
                  <Zap className="h-3.5 w-3.5" />
                  Flash Deals
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-2 text-xs font-semibold text-zinc-700">
                  <BadgeCheck className="h-3.5 w-3.5" />
                  Verified Sellers
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-2 text-xs font-semibold text-zinc-700">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Protected Checkout
                </span>
              </div>
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="h-14 rounded-2xl border border-zinc-200 bg-white px-4 text-sm text-zinc-900 outline-none transition focus:border-zinc-400"
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
                    Camera, voice, and search are active for MVP mode.
                  </p>
                ) : (
                  <p className="text-xs text-zinc-500">
                    Camera search is active. Voice search depends on browser support.
                  </p>
                )}
              </div>

              {(imageSearchPreview || appliedSearch) && (
                <button
                  type="button"
                  onClick={() => {
                    clearImageSearch()
                    setSearch("")
                    setAppliedSearch("")
                    setActiveTab("all")
                    searchInputRef.current?.focus()
                    router.push("/marketplace/explore")
                  }}
                  className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
                >
                  <X className="h-4 w-4" />
                  Clear
                </button>
              )}
            </div>
          )}

          <div className="mt-4 flex flex-wrap gap-3">
            {categoryPills.map((item) => {
              const active = selectedCategory === item

              return (
                <button
                  key={item}
                  onClick={() => {
                    setSelectedCategory(item)
                    setActiveTab("all")
                    router.push(`/marketplace/explore?category=${encodeURIComponent(item)}`)
                  }}
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

          {activeTab !== "all" ? (
            <div className="mt-4 rounded-[1.5rem] border border-zinc-200 bg-zinc-50 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-zinc-950">
                    {activeTab === "favorites" ? "Favorites view" : "Following view"}
                  </p>
                  <p className="mt-1 text-sm text-zinc-600">
                    {activeTab === "favorites"
                      ? favoriteIds.length > 0
                        ? "These are the products you saved."
                        : "You do not have saved products yet. Tap the heart button on products to save them."
                      : followingSellerIds.length > 0
                      ? "These are products from sellers you follow."
                      : "You are not following any sellers yet. Tap Follow on a seller product card."}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={backToAllTab}
                  className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
                >
                  <X className="h-4 w-4" />
                  Back to all
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </section>

      <section className="bg-zinc-50">
        <div className="mx-auto max-w-7xl px-4 py-10 md:px-8">
          <div className="grid gap-4 md:grid-cols-4">
            <SectionInfoCard
              icon={<Flame className="h-5 w-5" />}
              title="Trending Products"
              text="Published products getting premium placement right now."
            />
            <SectionInfoCard
              icon={<Zap className="h-5 w-5" />}
              title="Flash Deals"
              text="Lower-price picks that help drive traction and conversions."
            />
            <SectionInfoCard
              icon={<BadgeCheck className="h-5 w-5" />}
              title="Verified Sellers"
              text="Only approved shops are shown inside the marketplace."
            />
            <SectionInfoCard
              icon={<Sparkles className="h-5 w-5" />}
              title="Picks For You"
              text="Curated products split by type and category for cleaner discovery."
            />
          </div>
        </div>
      </section>

      {featuredProducts.length > 0 ? (
        <section className="bg-zinc-50">
          <div className="mx-auto max-w-7xl px-4 pb-10 md:px-8">
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
                  badge="Trending"
                  isFavorite={favoriteIds.includes(product.id)}
                  isFollowing={
                    product.shop?.user_id
                      ? followingSellerIds.includes(product.shop.user_id)
                      : false
                  }
                  onAddToCart={() => addToCart(product)}
                  onToggleFavorite={() => toggleFavorite(product.id)}
                  onToggleFollow={() => toggleFollowSeller(product.shop?.user_id || null)}
                />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {flashDeals.length > 0 ? (
        <section className="bg-white">
          <div className="mx-auto max-w-7xl px-4 py-10 md:px-8">
            <div className="mb-6">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
                Flash Deals
              </p>
              <h3 className="mt-2 text-2xl font-semibold text-zinc-950">
                Fast-moving deal products
              </h3>
            </div>

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {flashDeals.map((product) => (
                <FeaturedCard
                  key={product.id}
                  product={product}
                  badge="Deal"
                  isFavorite={favoriteIds.includes(product.id)}
                  isFollowing={
                    product.shop?.user_id
                      ? followingSellerIds.includes(product.shop.user_id)
                      : false
                  }
                  onAddToCart={() => addToCart(product)}
                  onToggleFavorite={() => toggleFavorite(product.id)}
                  onToggleFollow={() => toggleFollowSeller(product.shop?.user_id || null)}
                />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {(digitalPicks.length > 0 || physicalPicks.length > 0) && (
        <section className="bg-zinc-50">
          <div className="mx-auto max-w-7xl px-4 py-10 md:px-8">
            <div className="mb-6">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
                Picks For You
              </p>
              <h3 className="mt-2 text-2xl font-semibold text-zinc-950">
                Curated digital and physical picks
              </h3>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-[2rem] border border-zinc-200 bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
                      Digital
                    </p>
                    <h4 className="mt-1 text-lg font-semibold text-zinc-950">
                      Creator tools & digital products
                    </h4>
                  </div>
                </div>

                <div className="space-y-4">
                  {digitalPicks.length === 0 ? (
                    <EmptyMini text="No digital picks yet." />
                  ) : (
                    digitalPicks.map((product) => (
                      <MiniProductRow
                        key={product.id}
                        product={product}
                        isFavorite={favoriteIds.includes(product.id)}
                        isFollowing={
                          product.shop?.user_id
                            ? followingSellerIds.includes(product.shop.user_id)
                            : false
                        }
                        onAddToCart={() => addToCart(product)}
                        onToggleFavorite={() => toggleFavorite(product.id)}
                        onToggleFollow={() =>
                          toggleFollowSeller(product.shop?.user_id || null)
                        }
                      />
                    ))
                  )}
                </div>
              </div>

              <div className="rounded-[2rem] border border-zinc-200 bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
                      Physical
                    </p>
                    <h4 className="mt-1 text-lg font-semibold text-zinc-950">
                      Real products from verified shops
                    </h4>
                  </div>
                </div>

                <div className="space-y-4">
                  {physicalPicks.length === 0 ? (
                    <EmptyMini text="No physical picks yet." />
                  ) : (
                    physicalPicks.map((product) => (
                      <MiniProductRow
                        key={product.id}
                        product={product}
                        isFavorite={favoriteIds.includes(product.id)}
                        isFollowing={
                          product.shop?.user_id
                            ? followingSellerIds.includes(product.shop.user_id)
                            : false
                        }
                        onAddToCart={() => addToCart(product)}
                        onToggleFavorite={() => toggleFavorite(product.id)}
                        onToggleFollow={() =>
                          toggleFollowSeller(product.shop?.user_id || null)
                        }
                      />
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-10 md:px-8">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
                Browse
              </p>
              <h3 className="mt-2 text-2xl font-semibold text-zinc-950">
                {activeTab === "favorites"
                  ? "Saved favorite products"
                  : activeTab === "following"
                  ? "Products from followed sellers"
                  : "All marketplace products"}
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
                {activeTab === "favorites"
                  ? "No favorite products yet"
                  : activeTab === "following"
                  ? "No followed seller products yet"
                  : "No products found"}
              </h4>
              <p className="mt-2 text-sm text-zinc-600">
                {activeTab === "favorites"
                  ? "Tap the heart on products to save them here."
                  : activeTab === "following"
                  ? "Tap Follow on a seller product card to bring their products here."
                  : "Try changing your search, category filter, or check if products are published and seller shops are approved."}
              </p>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  isFavorite={favoriteIds.includes(product.id)}
                  isFollowing={
                    product.shop?.user_id
                      ? followingSellerIds.includes(product.shop.user_id)
                      : false
                  }
                  onAddToCart={() => addToCart(product)}
                  onToggleFavorite={() => toggleFavorite(product.id)}
                  onToggleFollow={() => toggleFollowSeller(product.shop?.user_id || null)}
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

function QuickActionCard({
  icon,
  label,
  text,
  href,
}: {
  icon: React.ReactNode
  label: string
  text: string
  href: string
}) {
  return (
    <Link
      href={href}
      className="group rounded-[1.7rem] border border-zinc-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="flex items-center justify-between">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-zinc-900 text-white">
          {icon}
        </div>
        <ChevronRight className="h-4 w-4 text-zinc-400 transition group-hover:text-zinc-700" />
      </div>

      <p className="mt-4 text-sm font-semibold text-zinc-950">{label}</p>
      <p className="mt-1 text-xs text-zinc-500">{text}</p>
    </Link>
  )
}

function QuickActionButton({
  icon,
  label,
  text,
  onClick,
}: {
  icon: React.ReactNode
  label: string
  text: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group rounded-[1.7rem] border border-zinc-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="flex items-center justify-between">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-zinc-900 text-white">
          {icon}
        </div>
        <ChevronRight className="h-4 w-4 text-zinc-400 transition group-hover:text-zinc-700" />
      </div>

      <p className="mt-4 text-sm font-semibold text-zinc-950">{label}</p>
      <p className="mt-1 text-xs text-zinc-500">{text}</p>
    </button>
  )
}

function ProfileMenuButton({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode
  label: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm font-medium text-zinc-800 transition hover:bg-zinc-50"
    >
      {icon}
      <span>{label}</span>
    </button>
  )
}

function SectionInfoCard({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode
  title: string
  text: string
}) {
  return (
    <div className="rounded-[1.8rem] border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-zinc-900 text-white">
        {icon}
      </div>
      <h4 className="text-base font-semibold text-zinc-950">{title}</h4>
      <p className="mt-2 text-sm leading-6 text-zinc-600">{text}</p>
    </div>
  )
}

function FeaturedCard({
  product,
  onAddToCart,
  onToggleFavorite,
  onToggleFollow,
  isFavorite,
  isFollowing,
  badge,
}: {
  product: Product
  onAddToCart: () => void
  onToggleFavorite: () => void
  onToggleFollow: () => void
  isFavorite: boolean
  isFollowing: boolean
  badge: string
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
          {badge}
        </div>

        <button
          type="button"
          onClick={onToggleFavorite}
          className={`absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full border backdrop-blur-md transition ${
            isFavorite
              ? "border-red-200 bg-red-50 text-red-500"
              : "border-white/30 bg-white/80 text-zinc-800 hover:bg-white"
          }`}
        >
          <Heart className={`h-4 w-4 ${isFavorite ? "fill-current" : ""}`} />
        </button>
      </div>

      <div className="p-5">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <Store className="h-3.5 w-3.5" />
            {product.shop?.store_name || "Verified Store"}
          </div>

          {product.shop?.user_id ? (
            <button
              type="button"
              onClick={onToggleFollow}
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold transition ${
                isFollowing
                  ? "bg-zinc-900 text-white"
                  : "border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50"
              }`}
            >
              {isFollowing ? <Check className="h-3 w-3" /> : <Users className="h-3 w-3" />}
              {isFollowing ? "Following" : "Follow"}
            </button>
          ) : null}
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
  onToggleFavorite,
  onToggleFollow,
  isFavorite,
  isFollowing,
}: {
  product: Product
  onAddToCart: () => void
  onToggleFavorite: () => void
  onToggleFollow: () => void
  isFavorite: boolean
  isFollowing: boolean
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

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              onToggleFavorite()
            }}
            className={`absolute left-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full border backdrop-blur-md transition ${
              isFavorite
                ? "border-red-200 bg-red-50 text-red-500"
                : "border-white/30 bg-white/80 text-zinc-800 hover:bg-white"
            }`}
          >
            <Heart className={`h-4 w-4 ${isFavorite ? "fill-current" : ""}`} />
          </button>
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

        {product.shop?.user_id ? (
          <button
            type="button"
            onClick={onToggleFollow}
            className={`mb-3 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold transition ${
              isFollowing
                ? "bg-zinc-900 text-white"
                : "border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50"
            }`}
          >
            {isFollowing ? <Check className="h-3 w-3" /> : <Users className="h-3 w-3" />}
            {isFollowing ? "Following" : "Follow Seller"}
          </button>
        ) : null}

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

function MiniProductRow({
  product,
  onAddToCart,
  onToggleFavorite,
  onToggleFollow,
  isFavorite,
  isFollowing,
}: {
  product: Product
  onAddToCart: () => void
  onToggleFavorite: () => void
  onToggleFollow: () => void
  isFavorite: boolean
  isFollowing: boolean
}) {
  return (
    <div className="flex items-center gap-4 rounded-[1.4rem] border border-zinc-200 p-3">
      <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-zinc-100">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-zinc-400">
            No media
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-zinc-950">{product.name}</p>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <p className="truncate text-xs text-zinc-500">
            {product.shop?.store_name || "Verified Store"}
          </p>

          {product.shop?.user_id ? (
            <button
              type="button"
              onClick={onToggleFollow}
              className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-semibold transition ${
                isFollowing
                  ? "bg-zinc-900 text-white"
                  : "border border-zinc-200 bg-white text-zinc-700"
              }`}
            >
              {isFollowing ? "Following" : "Follow"}
            </button>
          ) : null}
        </div>

        <p className="mt-2 text-sm font-semibold text-zinc-900">
          ${Number(product.price || 0).toFixed(2)}
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={onToggleFavorite}
          className={`inline-flex h-9 w-9 items-center justify-center rounded-xl border transition ${
            isFavorite
              ? "border-red-200 bg-red-50 text-red-500"
              : "border-zinc-200 bg-white text-zinc-700"
          }`}
        >
          <Heart className={`h-4 w-4 ${isFavorite ? "fill-current" : ""}`} />
        </button>

        <button
          onClick={onAddToCart}
          className="rounded-xl border border-zinc-200 px-3 py-2 text-xs font-semibold text-zinc-900 transition hover:bg-zinc-50"
        >
          Add
        </button>
      </div>
    </div>
  )
}

function EmptyMini({ text }: { text: string }) {
  return (
    <div className="rounded-[1.4rem] border border-dashed border-zinc-300 bg-zinc-50 p-4 text-sm text-zinc-500">
      {text}
    </div>
  )
}