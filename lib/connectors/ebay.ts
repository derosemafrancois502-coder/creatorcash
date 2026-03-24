type EbayTokenResponse = {
  access_token: string
  expires_in: number
  token_type: string
}

type EbaySearchResponse = {
  itemSummaries?: Array<{
    itemId?: string
    title?: string
    leafCategoryIds?: string[]
    categories?: Array<{ categoryName?: string }>
    price?: {
      value?: string
      currency?: string
    }
    image?: {
      imageUrl?: string
    }
    itemWebUrl?: string
    seller?: {
      username?: string
    }
    condition?: string
    shortDescription?: string
  }>
}

export type EbayProduct = {
  id: string
  source: "ebay"
  marketplace: string
  externalId?: string
  name: string
  category: string
  description: string
  price: string
  rating?: string
  reviews?: string
  image: string
  productUrl: string
}

const EBAY_CLIENT_ID = process.env.EBAY_CLIENT_ID || ""
const EBAY_CLIENT_SECRET = process.env.EBAY_CLIENT_SECRET || ""
const EBAY_MARKETPLACE_ID = process.env.EBAY_MARKETPLACE_ID || "EBAY_US"

let cachedToken: { value: string; expiresAt: number } | null = null

function hasEbayCredentials() {
  return Boolean(EBAY_CLIENT_ID && EBAY_CLIENT_SECRET)
}

function toBase64(value: string) {
  return Buffer.from(value).toString("base64")
}

async function getEbayAccessToken() {
  if (!hasEbayCredentials()) {
    throw new Error("Missing eBay credentials in .env.local")
  }

  const now = Date.now()
  if (cachedToken && cachedToken.expiresAt > now + 60_000) {
    return cachedToken.value
  }

  const basic = toBase64(`${EBAY_CLIENT_ID}:${EBAY_CLIENT_SECRET}`)

  const body = new URLSearchParams({
    grant_type: "client_credentials",
    scope: "https://api.ebay.com/oauth/api_scope",
  })

  const res = await fetch("https://api.ebay.com/identity/v1/oauth2/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
    cache: "no-store",
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`eBay token request failed: ${res.status} ${text}`)
  }

  const data = (await res.json()) as EbayTokenResponse

  cachedToken = {
    value: data.access_token,
    expiresAt: now + data.expires_in * 1000,
  }

  return data.access_token
}

function formatPrice(
  price?: { value?: string; currency?: string }
): string {
  if (!price?.value) return "unavailable"
  return price.currency ? `${price.value} ${price.currency}` : price.value
}

function mapEbayItem(item: NonNullable<EbaySearchResponse["itemSummaries"]>[number]): EbayProduct {
  const category =
    item.categories?.[0]?.categoryName ||
    "General"

  return {
    id: item.itemId || crypto.randomUUID(),
    source: "ebay",
    marketplace: "eBay",
    externalId: item.itemId,
    name: item.title || "Untitled Product",
    category,
    description:
      item.shortDescription ||
      item.condition ||
      `${category} product discovered from eBay.`,
    price: formatPrice(item.price),
    rating: "unavailable",
    reviews: "unavailable",
    image: item.image?.imageUrl || "/products/placeholder.jpg",
    productUrl: item.itemWebUrl || "#",
  }
}

export async function searchEbayProducts(query: string): Promise<EbayProduct[]> {
  if (!query.trim()) return []
  if (!hasEbayCredentials()) return []

  const token = await getEbayAccessToken()

  const url = new URL("https://api.ebay.com/buy/browse/v1/item_summary/search")
  url.searchParams.set("q", query.trim())
  url.searchParams.set("limit", "12")

  const res = await fetch(url.toString(), {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "X-EBAY-C-MARKETPLACE-ID": EBAY_MARKETPLACE_ID,
      Accept: "application/json",
    },
    cache: "no-store",
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`eBay search failed: ${res.status} ${text}`)
  }

  const data = (await res.json()) as EbaySearchResponse
  const items = data.itemSummaries || []

  return items.map(mapEbayItem)
}