import crypto from "crypto"
import { supabaseAdmin } from "@/lib/supabase/admin"

const APP_KEY = process.env.TIKTOK_SHOP_APP_KEY || ""
const APP_SECRET = process.env.TIKTOK_SHOP_APP_SECRET || ""
const ACCESS_TOKEN = process.env.TIKTOK_SHOP_ACCESS_TOKEN || ""
const REDIRECT_URI = process.env.TIKTOK_SHOP_REDIRECT_URI || ""

const BASE_URL =
  process.env.TIKTOK_SHOP_BASE_URL || "https://open-api.tiktokglobalshop.com"

const AUTH_BASE_URL =
  process.env.TIKTOK_SHOP_AUTH_BASE_URL ||
  "https://services.tiktokshop.com/open/authorize"

export type DiscoveryProduct = {
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

type TikTokSearchApiResponse = {
  code?: number
  message?: string
  data?: {
    products?: TikTokProduct[]
    product_list?: TikTokProduct[]
    list?: TikTokProduct[]
    total_count?: number
  }
}

type TikTokProduct = {
  id?: string | number
  product_id?: string | number
  title?: string
  name?: string
  product_name?: string
  category_name?: string
  category?: string

  main_image?: {
    uri?: string
    url_list?: string[]
    thumb_url_list?: string[]
  }

  images?: Array<{
    uri?: string
    url_list?: string[]
    thumb_url_list?: string[]
  }>

  skus?: Array<{
    sale_price?: {
      amount?: string | number
    }
    list_price?: {
      amount?: string | number
    }
    price?: {
      amount?: string | number
    }
  }>

  price?: {
    sale_price?: string | number
    original_price?: string | number
    amount?: string | number
  }

  rating?: string | number
  review_count?: string | number
  sales?: string | number
  sold_count?: string | number
}

function ensureCoreEnv() {
  if (!APP_KEY || !APP_SECRET) {
    throw new Error("Missing TikTok Shop app key or app secret.")
  }
}

function createTimestamp() {
  return Math.floor(Date.now() / 1000).toString()
}

function createSign(path: string, params: Record<string, string>) {
  const sortedKeys = Object.keys(params).sort()

  let paramString = ""
  for (const key of sortedKeys) {
    paramString += `${key}${params[key]}`
  }

  const stringToSign = `${APP_SECRET}${path}${paramString}${APP_SECRET}`

  return crypto
    .createHmac("sha256", APP_SECRET)
    .update(stringToSign)
    .digest("hex")
}

export function getTikTokAuthUrl() {
  ensureCoreEnv()

  if (!REDIRECT_URI) {
    throw new Error("Missing TikTok Shop redirect URI.")
  }

  const state = `creatorgoat-${Date.now()}`

  const url = new URL(AUTH_BASE_URL)
  url.searchParams.set("app_key", APP_KEY)
  url.searchParams.set("state", state)
  url.searchParams.set("redirect_uri", REDIRECT_URI)

  return url.toString()
}

export async function exchangeTikTokAuthCode(code: string) {
  ensureCoreEnv()

  if (!code) {
    throw new Error("Missing TikTok authorization code.")
  }

  const path = "/authorization/202309/token/get"
  const timestamp = createTimestamp()

  const queryParams: Record<string, string> = {
    app_key: APP_KEY,
    timestamp,
  }

  const sign = createSign(path, queryParams)

  const url = new URL(`${BASE_URL}${path}`)
  url.searchParams.set("app_key", APP_KEY)
  url.searchParams.set("timestamp", timestamp)
  url.searchParams.set("sign", sign)

  const body = {
    auth_code: code,
    grant_type: "authorized_code",
  }

  const res = await fetch(url.toString(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    cache: "no-store",
  })

  const data = await res.json()

  if (!res.ok) {
    throw new Error(data?.message || "Failed to exchange TikTok auth code.")
  }

  if (typeof data?.code !== "undefined" && data.code !== 0) {
    throw new Error(data?.message || `TikTok token error: ${data.code}`)
  }

  return data
}

export async function getSavedTikTokAccessToken() {
  const { data, error } = await supabaseAdmin
    .from("tiktok_shop_connections")
    .select("access_token")
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) {
    throw new Error(error.message)
  }

  if (!data?.access_token) {
    throw new Error("No saved TikTok access token found.")
  }

  return data.access_token as string
}

function safeNumber(value: unknown, fallback = 0) {
  const num = Number(value)
  return Number.isFinite(num) ? num : fallback
}

function pickName(product: TikTokProduct) {
  return (
    product.title ||
    product.name ||
    product.product_name ||
    "Untitled Product"
  )
}

function pickId(product: TikTokProduct, index: number) {
  return String(product.product_id || product.id || `tiktok-${index}`)
}

function pickImage(product: TikTokProduct) {
  return (
    product.main_image?.url_list?.[0] ||
    product.main_image?.thumb_url_list?.[0] ||
    product.images?.[0]?.url_list?.[0] ||
    product.images?.[0]?.thumb_url_list?.[0] ||
    "/placeholder-product.jpg"
  )
}

function pickCategory(product: TikTokProduct) {
  return product.category_name || product.category || "General"
}

function pickPrice(product: TikTokProduct) {
  const sku = product.skus?.[0]

  return (
    safeNumber(sku?.sale_price?.amount) ||
    safeNumber(sku?.list_price?.amount) ||
    safeNumber(sku?.price?.amount) ||
    safeNumber(product.price?.sale_price) ||
    safeNumber(product.price?.amount) ||
    safeNumber(product.price?.original_price) ||
    0
  )
}

function estimateTrendScore(rating: number, reviews: number, soldCount: number) {
  let score = 70

  if (rating >= 4.8) score += 10
  else if (rating >= 4.5) score += 7
  else if (rating >= 4.2) score += 4

  if (reviews >= 5000) score += 10
  else if (reviews >= 1000) score += 7
  else if (reviews >= 250) score += 4

  if (soldCount >= 5000) score += 10
  else if (soldCount >= 1000) score += 7
  else if (soldCount >= 200) score += 4

  return Math.min(score, 99)
}

function estimateCompetition(reviews: number, soldCount: number) {
  const pressure = reviews + soldCount

  if (pressure >= 7000) return "High"
  if (pressure >= 1500) return "Medium"
  return "Low"
}

function buildWhyItsHot(name: string, category: string, trendScore: number) {
  const lower = name.toLowerCase()

  if (
    lower.includes("chebe") ||
    lower.includes("shampoo") ||
    lower.includes("conditioner")
  ) {
    return "Hair-care transformation, wash-day, and restoration content remain strong creator-commerce categories."
  }

  if (
    lower.includes("milk") ||
    lower.includes("lotion") ||
    lower.includes("collagen")
  ) {
    return "Body-care products are repeat-purchase friendly and work well in glow-up and daily self-care content."
  }

  if (lower.includes("roller") || lower.includes("ice")) {
    return "Highly visual skincare tools perform well because they are easy to demonstrate in short-form video."
  }

  return `${category} products with a trend score of ${trendScore} can perform well when matched with strong demos and clear creator positioning.`
}

function buildContentAngle(name: string) {
  const lower = name.toLowerCase()

  if (
    lower.includes("chebe") ||
    lower.includes("shampoo") ||
    lower.includes("conditioner")
  ) {
    return "Use wash-day storytelling, hair journey before/after hooks, and premium restoration framing."
  }

  if (
    lower.includes("milk") ||
    lower.includes("lotion") ||
    lower.includes("collagen")
  ) {
    return "Use texture close-ups, hydration routines, glow-up framing, and premium self-care visuals."
  }

  if (lower.includes("roller") || lower.includes("ice")) {
    return "Use morning routine clips, de-puffing hooks, satisfying close-ups, and self-care positioning."
  }

  return "Use problem-solution hooks, close-up visuals, before/after framing, and lifestyle storytelling."
}

function normalizeTikTokProducts(items: TikTokProduct[]): DiscoveryProduct[] {
  return items.map((product, index) => {
    const name = pickName(product)
    const category = pickCategory(product)
    const rating = safeNumber(product.rating, 4.5)
    const reviewsNum = safeNumber(product.review_count, 0)
    const soldCount = safeNumber(product.sales, safeNumber(product.sold_count, 0))
    const trendScore = estimateTrendScore(rating, reviewsNum, soldCount)
    const competition = estimateCompetition(reviewsNum, soldCount)

    return {
      id: pickId(product, index),
      name,
      price: pickPrice(product),
      image: pickImage(product),
      rating,
      reviews: reviewsNum ? reviewsNum.toLocaleString() : "N/A",
      estimatedSales: soldCount ? soldCount.toLocaleString() : "AI estimate",
      competition,
      trendScore,
      category,
      whyItsHot: buildWhyItsHot(name, category, trendScore),
      contentAngle: buildContentAngle(name),
      source: "TikTok",
    }
  })
}

export async function searchTikTokShopProducts(keyword: string) {
  ensureCoreEnv()

  const token = ACCESS_TOKEN || (await getSavedTikTokAccessToken())

  if (!token) {
    throw new Error("Missing TikTok Shop access token.")
  }

  if (!keyword?.trim()) {
    return { data: { products: [] } }
  }

  const path = "/product/202309/products/search"
  const timestamp = createTimestamp()

  const queryParams: Record<string, string> = {
    app_key: APP_KEY,
    timestamp,
  }

  const sign = createSign(path, queryParams)

  const url = new URL(`${BASE_URL}${path}`)
  url.searchParams.set("app_key", APP_KEY)
  url.searchParams.set("timestamp", timestamp)
  url.searchParams.set("sign", sign)

  const body = {
    page_size: 12,
    page_number: 1,
    search_keyword: keyword,
  }

  const res = await fetch(url.toString(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-tts-access-token": token,
    },
    body: JSON.stringify(body),
    cache: "no-store",
  })

  const data = (await res.json()) as TikTokSearchApiResponse

  if (!res.ok) {
    throw new Error(data?.message || "TikTok Shop API request failed.")
  }

  if (typeof data?.code !== "undefined" && data.code !== 0) {
    throw new Error(data?.message || `TikTok API error: ${data.code}`)
  }

  return data
}

export async function searchTikTokProducts(
  query: string
): Promise<DiscoveryProduct[]> {
  const data = await searchTikTokShopProducts(query)

  const items =
    data?.data?.products ||
    data?.data?.product_list ||
    data?.data?.list ||
    []

  return normalizeTikTokProducts(items)
}