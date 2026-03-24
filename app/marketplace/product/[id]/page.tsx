"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { useParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import ContactSellerButton from "@/components/marketplace/contact-seller-button"
import {
  ArrowLeft,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  Minus,
  Send,
  ShoppingCart,
  Star,
  Store,
  Tag,
  Plus,
  PlayCircle,
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
  colors: string[] | null
  sizes: string[] | null
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
  color?: string | null
  size?: string | null
}

type ShopReview = {
  id: string
  shop_id: string
  user_id: string
  rating: number
  review_text: string | null
  created_at: string
}

export default function ProductDetailPage() {
  const params = useParams()
  const supabase = useMemo(() => createClient(), [])

  const [loading, setLoading] = useState(true)
  const [product, setProduct] = useState<Product | null>(null)
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  const [cartCount, setCartCount] = useState(0)

  const [shopReviews, setShopReviews] = useState<ShopReview[]>([])
  const [avgRating, setAvgRating] = useState(0)
  const [ratingCount, setRatingCount] = useState(0)

  const [selectedRating, setSelectedRating] = useState(5)
  const [reviewText, setReviewText] = useState("")
  const [submittingReview, setSubmittingReview] = useState(false)

  const [selectedColor, setSelectedColor] = useState<string | null>(null)
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [galleryIndex, setGalleryIndex] = useState(0)

  const productId = String(params?.id || "")

  useEffect(() => {
    if (!productId) return
    void loadProduct()
    loadCartCount()
  }, [productId])

  async function loadProduct() {
    try {
      setLoading(true)

      const { data: productRow, error: productError } = await supabase
        .from("products")
        .select(
          "id, user_id, shop_id, name, description, price, type, category, image_url, video_url, status, inventory_count, published_at, colors, sizes"
        )
        .eq("id", productId)
        .eq("status", "published")
        .maybeSingle()

      if (productError) {
        console.error(productError)
        setProduct(null)
        return
      }

      if (!productRow) {
        setProduct(null)
        return
      }

      const { data: shopsRows, error: shopsError } = await supabase
        .from("shops")
        .select("id, user_id, store_name, slug, approved, status")

      if (shopsError) {
        console.error(shopsError)
        setProduct(null)
        return
      }

      const shopsMap = new Map<string, Shop>()
      for (const shop of (shopsRows ?? []) as Shop[]) {
        shopsMap.set(shop.id, shop)
      }

      const shop = productRow.shop_id
        ? shopsMap.get(productRow.shop_id) ?? null
        : null

      if (!shop || !shop.approved || shop.status !== "approved") {
        setProduct(null)
        return
      }

      const mergedProduct: Product = {
        ...(productRow as ProductRow),
        shop,
      }

      setProduct(mergedProduct)

      const firstColor = mergedProduct.colors?.[0] ?? null
      const firstSize = mergedProduct.sizes?.[0] ?? null

      setSelectedColor(firstColor)
      setSelectedSize(firstSize)
      setQuantity(1)
      setGalleryIndex(0)

      await loadShopReviews(shop.id)

      const { data: relatedRows, error: relatedError } = await supabase
        .from("products")
        .select(
          "id, user_id, shop_id, name, description, price, type, category, image_url, video_url, status, inventory_count, published_at, colors, sizes"
        )
        .eq("status", "published")
        .neq("id", productId)
        .order("published_at", { ascending: false })
        .limit(8)

      if (relatedError) {
        console.error(relatedError)
        setRelatedProducts([])
        return
      }

      const relatedMerged: Product[] = ((relatedRows ?? []) as ProductRow[])
        .map((item) => ({
          ...item,
          shop: item.shop_id ? shopsMap.get(item.shop_id) ?? null : null,
        }))
        .filter(
          (item) =>
            item.shop !== null &&
            item.shop.approved === true &&
            item.shop.status === "approved"
        )

      const sameCategory = relatedMerged.filter(
        (item) =>
          (item.category || "").toLowerCase() ===
          (mergedProduct.category || "").toLowerCase()
      )

      setRelatedProducts(
        (sameCategory.length > 0 ? sameCategory : relatedMerged).slice(0, 4)
      )
    } catch (error) {
      console.error(error)
      setProduct(null)
      setRelatedProducts([])
      setShopReviews([])
      setAvgRating(0)
      setRatingCount(0)
    } finally {
      setLoading(false)
    }
  }

  async function loadShopReviews(shopId: string) {
    try {
      const { data, error } = await supabase
        .from("shop_reviews")
        .select("id, shop_id, user_id, rating, review_text, created_at")
        .eq("shop_id", shopId)
        .order("created_at", { ascending: false })
        .limit(20)

      if (error) {
        console.error("shop reviews error:", error)
        setShopReviews([])
        setAvgRating(0)
        setRatingCount(0)
        return
      }

      const reviews = (data ?? []) as ShopReview[]
      setShopReviews(reviews)
      setRatingCount(reviews.length)

      if (reviews.length > 0) {
        const total = reviews.reduce((sum, item) => sum + Number(item.rating || 0), 0)
        setAvgRating(total / reviews.length)
      } else {
        setAvgRating(0)
      }
    } catch (error) {
      console.error(error)
      setShopReviews([])
      setAvgRating(0)
      setRatingCount(0)
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

  function buildGallery(item: Product) {
    const list: { type: "image" | "video"; src: string }[] = []
    if (item.image_url) list.push({ type: "image", src: item.image_url })
    if (item.video_url) list.push({ type: "video", src: item.video_url })
    if (!item.image_url && !item.video_url) {
      list.push({ type: "image", src: "" })
    }
    return list
  }

  function requireVariantSelection(item: Product) {
    if (item.colors && item.colors.length > 0 && !selectedColor) {
      alert("Please select a color.")
      return false
    }

    if (item.sizes && item.sizes.length > 0 && !selectedSize) {
      alert("Please select a size.")
      return false
    }

    return true
  }

  function addToCart(item: Product) {
    if (!requireVariantSelection(item)) return

    try {
      const raw = localStorage.getItem("creatorgoat-cart")
      const cart: CartItem[] = raw ? JSON.parse(raw) : []

      const existing = cart.find(
        (cartItem) =>
          cartItem.id === item.id &&
          (cartItem.color || null) === (selectedColor || null) &&
          (cartItem.size || null) === (selectedSize || null)
      )

      if (existing) {
        existing.quantity += quantity
      } else {
        cart.push({
          id: item.id,
          name: item.name,
          price: Number(item.price || 0),
          image_url: item.image_url || null,
          quantity,
          color: selectedColor,
          size: selectedSize,
        })
      }

      localStorage.setItem("creatorgoat-cart", JSON.stringify(cart))
      const total = cart.reduce((sum, cartItem) => sum + cartItem.quantity, 0)
      setCartCount(total)
      alert("Added to cart.")
    } catch (error) {
      console.error(error)
      alert("Could not add to cart.")
    }
  }

  function buyNow(item: Product) {
    if (!requireVariantSelection(item)) return
    addToCart(item)
    window.location.href = "/cart"
  }

  async function handleSubmitSellerReview() {
    if (!product?.shop?.id) {
      alert("Shop not found.")
      return
    }

    try {
      setSubmittingReview(true)

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        alert("Please sign in first to rate this seller.")
        return
      }

      const { data: existingReview, error: existingError } = await supabase
        .from("shop_reviews")
        .select("id")
        .eq("shop_id", product.shop.id)
        .eq("user_id", user.id)
        .maybeSingle()

      if (existingError) {
        console.error(existingError)
      }

      if (existingReview?.id) {
        const { error } = await supabase
          .from("shop_reviews")
          .update({
            rating: selectedRating,
            review_text: reviewText.trim() || null,
          })
          .eq("id", existingReview.id)

        if (error) {
          alert(error.message)
          return
        }
      } else {
        const { error } = await supabase.from("shop_reviews").insert({
          shop_id: product.shop.id,
          user_id: user.id,
          rating: selectedRating,
          review_text: reviewText.trim() || null,
        })

        if (error) {
          alert(error.message)
          return
        }
      }

      setReviewText("")
      setSelectedRating(5)
      await loadShopReviews(product.shop.id)
      alert("Seller rating submitted.")
    } catch (error) {
      console.error(error)
      alert("Could not submit seller review.")
    } finally {
      setSubmittingReview(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white px-6">
        <div className="rounded-[2rem] border border-zinc-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 h-12 w-12 animate-pulse rounded-full bg-zinc-200" />
          <h2 className="text-lg font-semibold text-zinc-900">
            Loading product...
          </h2>
          <p className="mt-2 text-sm text-zinc-600">
            Preparing product details.
          </p>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-white px-6 py-16 text-zinc-900">
        <div className="mx-auto max-w-3xl rounded-[2rem] border border-zinc-200 bg-white p-10 text-center shadow-sm">
          <h1 className="text-3xl font-semibold">Product not found</h1>
          <p className="mt-3 text-sm text-zinc-600">
            This product may be unavailable or no longer published.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link
              href="/marketplace/explore"
              className="rounded-2xl bg-zinc-900 px-5 py-3 text-sm font-semibold text-white"
            >
              Back to Explore
            </Link>
            <Link
              href="/cart"
              className="rounded-2xl border border-zinc-200 px-5 py-3 text-sm font-semibold text-zinc-900"
            >
              View Cart
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const inStock =
    product.type === "digital" || (product.inventory_count ?? 0) > 0

  const gallery = buildGallery(product)
  const activeMedia = gallery[galleryIndex] ?? gallery[0]

  return (
    <div className="min-h-screen bg-white text-zinc-900">
      <div className="sticky top-0 z-40 border-b border-zinc-200 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-8">
          <Link
            href="/marketplace/explore"
            className="inline-flex items-center gap-2 text-sm font-medium text-zinc-700 transition hover:text-zinc-950"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Explore
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

      <div className="mx-auto max-w-7xl px-5 py-10 md:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <div className="overflow-hidden rounded-[2rem] border border-zinc-200 bg-white shadow-sm">
              <div className="relative aspect-square bg-zinc-100">
                {activeMedia?.type === "video" && activeMedia.src ? (
                  <video
                    src={activeMedia.src}
                    controls
                    playsInline
                    className="h-full w-full object-cover"
                  />
                ) : activeMedia?.src ? (
                  <img
                    src={activeMedia.src}
                    alt={product.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-zinc-400">
                    No image
                  </div>
                )}

                <div className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-700">
                  {product.type}
                </div>

                {gallery.length > 1 ? (
                  <>
                    <button
                      type="button"
                      onClick={() =>
                        setGalleryIndex((prev) => (prev === 0 ? gallery.length - 1 : prev - 1))
                      }
                      className="absolute left-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-zinc-900 shadow-sm"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setGalleryIndex((prev) => (prev === gallery.length - 1 ? 0 : prev + 1))
                      }
                      className="absolute right-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-zinc-900 shadow-sm"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </>
                ) : null}
              </div>
            </div>

            <div className="mt-4 flex gap-3 overflow-x-auto pb-1">
              {gallery.map((media, index) => (
                <button
                  key={`${media.type}-${media.src || index}`}
                  type="button"
                  onClick={() => setGalleryIndex(index)}
                  className={`relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl border ${
                    galleryIndex === index
                      ? "border-zinc-900"
                      : "border-zinc-200"
                  } bg-zinc-100`}
                >
                  {media.type === "video" ? (
                    <>
                      {media.src ? (
                        <video
                          src={media.src}
                          muted
                          playsInline
                          className="h-full w-full object-cover"
                        />
                      ) : null}
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                        <PlayCircle className="h-6 w-6 text-white" />
                      </div>
                    </>
                  ) : media.src ? (
                    <img
                      src={media.src}
                      alt={product.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="text-xs text-zinc-400">No image</div>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs font-medium text-zinc-700">
                <Store className="h-3.5 w-3.5" />
                {product.shop?.store_name || "Verified Store"}
              </div>

              <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs font-medium text-zinc-700">
                <Tag className="h-3.5 w-3.5" />
                {product.category || "General"}
              </div>

              <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs font-medium text-zinc-700">
                <Star className="h-3.5 w-3.5" />
                Premium Listing
              </div>
            </div>

            <h1 className="text-4xl font-semibold leading-tight text-zinc-950 md:text-5xl">
              {product.name}
            </h1>

            <p className="mt-5 text-sm leading-7 text-zinc-600 md:text-base">
              {product.description || "Premium marketplace product from a verified seller."}
            </p>

            <div className="mt-6 rounded-[1.5rem] border border-zinc-200 bg-zinc-50 p-5">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <Star
                        key={index}
                        className={`h-4 w-4 ${
                          index < Math.round(avgRating)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-zinc-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-semibold text-zinc-950">
                    {ratingCount > 0 ? avgRating.toFixed(1) : "New"}
                  </span>
                </div>

                <div className="text-sm text-zinc-500">
                  {ratingCount} seller review{ratingCount !== 1 ? "s" : ""}
                </div>

                <div className="text-sm text-zinc-500">
                  Seller: {product.shop?.store_name || "Verified Store"}
                </div>
              </div>
            </div>

            <div className="mt-8 rounded-[2rem] border border-zinc-200 bg-zinc-50 p-6">
              <p className="text-xs uppercase tracking-[0.12em] text-zinc-500">
                Price
              </p>
              <p className="mt-2 text-4xl font-semibold text-zinc-950">
                ${Number(product.price || 0).toFixed(2)}
              </p>

              <div className="mt-5 flex flex-wrap items-center gap-3">
                <div
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                    inStock
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {inStock ? "Available" : "Out of stock"}
                </div>

                {product.type === "physical" ? (
                  <div className="text-sm text-zinc-500">
                    Inventory: {product.inventory_count ?? 0}
                  </div>
                ) : (
                  <div className="text-sm text-zinc-500">Instant digital delivery</div>
                )}
              </div>

              {product.colors && product.colors.length > 0 ? (
                <div className="mt-6">
                  <p className="mb-3 text-sm font-medium text-zinc-800">Choose Color</p>
                  <div className="flex flex-wrap gap-2">
                    {product.colors.map((color) => {
                      const active = selectedColor === color
                      return (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setSelectedColor(color)}
                          className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                            active
                              ? "bg-zinc-900 text-white"
                              : "border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-100"
                          }`}
                        >
                          {color}
                        </button>
                      )
                    })}
                  </div>
                </div>
              ) : null}

              {product.sizes && product.sizes.length > 0 ? (
                <div className="mt-6">
                  <p className="mb-3 text-sm font-medium text-zinc-800">Choose Size</p>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((size) => {
                      const active = selectedSize === size
                      return (
                        <button
                          key={size}
                          type="button"
                          onClick={() => setSelectedSize(size)}
                          className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                            active
                              ? "bg-zinc-900 text-white"
                              : "border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-100"
                          }`}
                        >
                          {size}
                        </button>
                      )
                    })}
                  </div>
                </div>
              ) : null}

              <div className="mt-6">
                <p className="mb-3 text-sm font-medium text-zinc-800">Quantity</p>
                <div className="inline-flex items-center overflow-hidden rounded-full border border-zinc-300 bg-white">
                  <button
                    type="button"
                    onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                    className="flex h-11 w-11 items-center justify-center text-zinc-900 transition hover:bg-zinc-100"
                  >
                    <Minus className="h-4 w-4" />
                  </button>

                  <div className="min-w-[56px] text-center text-sm font-semibold text-zinc-950">
                    {quantity}
                  </div>

                  <button
                    type="button"
                    onClick={() => setQuantity((prev) => prev + 1)}
                    className="flex h-11 w-11 items-center justify-center text-zinc-900 transition hover:bg-zinc-100"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={() => addToCart(product)}
                  disabled={!inStock}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-zinc-900 px-6 text-sm font-semibold text-white transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <ShoppingCart className="h-4 w-4" />
                  Add to Cart
                </button>

                <button
                  type="button"
                  onClick={() => buyNow(product)}
                  disabled={!inStock}
                  className="inline-flex h-12 items-center justify-center rounded-2xl bg-yellow-500 px-6 text-sm font-semibold text-black transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Buy Now
                </button>

                <ContactSellerButton productId={Number(product.id)} />
              </div>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <InfoCard
                title="Verified Seller"
                description="This product belongs to a verified marketplace shop."
              />
              <InfoCard
                title="Protected Checkout"
                description="Buyer flow is structured for clean checkout and trusted purchase paths."
              />
            </div>
          </div>
        </div>

        <section className="mt-16 grid gap-8 lg:grid-cols-[1fr_0.9fr]">
          <div>
            <div className="mb-6">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
                Seller Reviews
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-zinc-950">
                What customers say about this seller
              </h2>
            </div>

            {shopReviews.length === 0 ? (
              <div className="rounded-[2rem] border border-zinc-200 bg-white p-8 shadow-sm">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-100">
                  <MessageSquare className="h-5 w-5 text-zinc-700" />
                </div>
                <h3 className="text-lg font-semibold text-zinc-950">
                  No seller reviews yet
                </h3>
                <p className="mt-2 text-sm leading-6 text-zinc-600">
                  Be the first customer to leave a seller review.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {shopReviews.slice(0, 6).map((review) => (
                  <div
                    key={review.id}
                    className="rounded-[2rem] border border-zinc-200 bg-white p-5 shadow-sm"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <div className="flex">
                          {Array.from({ length: 5 }).map((_, index) => (
                            <Star
                              key={index}
                              className={`h-4 w-4 ${
                                index < Number(review.rating)
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-zinc-300"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm font-semibold text-zinc-950">
                          {Number(review.rating).toFixed(1)}
                        </span>
                      </div>

                      <span className="text-xs text-zinc-500">
                        {new Date(review.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    <p className="mt-3 text-sm leading-6 text-zinc-600">
                      {review.review_text || "Customer left a rating without written feedback."}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <div className="rounded-[2rem] border border-zinc-200 bg-zinc-50 p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
                Rate Seller
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-zinc-950">
                Leave a seller review
              </h2>
              <p className="mt-2 text-sm leading-6 text-zinc-600">
                Rate this seller based on your marketplace experience, shipping, communication,
                and product delivery flow.
              </p>

              <div className="mt-6">
                <label className="mb-3 block text-sm font-medium text-zinc-800">
                  Your Rating
                </label>
                <div className="flex gap-2">
                  {Array.from({ length: 5 }).map((_, index) => {
                    const value = index + 1
                    const active = value <= selectedRating

                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setSelectedRating(value)}
                        className="rounded-2xl border border-zinc-200 bg-white p-3 transition hover:bg-zinc-100"
                      >
                        <Star
                          className={`h-5 w-5 ${
                            active
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-zinc-300"
                          }`}
                        />
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="mt-6">
                <label className="mb-3 block text-sm font-medium text-zinc-800">
                  Review
                </label>
                <textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  rows={5}
                  placeholder="Share your experience with this seller..."
                  className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-zinc-400"
                />
              </div>

              <button
                onClick={handleSubmitSellerReview}
                disabled={submittingReview}
                className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-zinc-900 px-6 text-sm font-semibold text-white transition hover:scale-[1.01] disabled:opacity-60"
              >
                <Send className="h-4 w-4" />
                {submittingReview ? "Submitting..." : "Submit Seller Review"}
              </button>
            </div>
          </div>
        </section>

        {relatedProducts.length > 0 ? (
          <section className="mt-16">
            <div className="mb-6">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
                Related
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-zinc-950">
                You may also like
              </h2>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
              {relatedProducts.map((item) => (
                <RelatedCard
                  key={item.id}
                  product={item}
                  onAddToCart={() => addToCart(item)}
                />
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </div>
  )
}

function InfoCard({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <div className="rounded-[1.5rem] border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-zinc-100">
        <CheckCircle2 className="h-5 w-5 text-zinc-900" />
      </div>
      <h3 className="text-sm font-semibold text-zinc-950">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-zinc-600">{description}</p>
    </div>
  )
}

function RelatedCard({
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
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-zinc-400">
              No image
            </div>
          )}
        </div>
      </Link>

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
          {product.description || "Premium product listing from a verified seller."}
        </p>

        <div className="mt-5 flex items-center justify-between">
          <p className="text-xl font-semibold text-zinc-950">
            ${Number(product.price || 0).toFixed(2)}
          </p>

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