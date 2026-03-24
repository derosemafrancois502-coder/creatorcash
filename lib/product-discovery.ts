export type ProductDiscoveryItem = {
  id: string
  asin?: string
  name: string
  category: string
  description: string
  price: string
  estimatedSales: string
  rating: string
  reviews: string
  trendScore: string
  competition: "Low" | "Medium" | "High"
  badge: "Hot" | "Rising" | "Low Competition" | "Best Margin"
  whyHot: string
  contentAngle: string
  image: string
  productUrl: string
  source: "amazon-live" | "fallback"
}

export type ProductDiscoveryResponse = {
  items: ProductDiscoveryItem[]
  total: number
  query: string
  source: "amazon-live" | "fallback"
}

function safeText(value: unknown, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback
}

function containsQuery(text: string, query: string) {
  return text.toLowerCase().includes(query.toLowerCase())
}

export function filterDiscoveryItems(
  items: ProductDiscoveryItem[],
  query: string
) {
  const q = query.trim()
  if (!q) return items

  return items.filter((item) => {
    const haystack = [
      item.name,
      item.category,
      item.description,
      item.whyHot,
      item.contentAngle,
      item.badge,
    ].join(" ")

    return containsQuery(haystack, q)
  })
}

export function getFallbackProducts(query = ""): ProductDiscoveryResponse {
  const fallbackItems: ProductDiscoveryItem[] = [
    {
      id: "fallback-1",
      asin: "fallback-1",
      name: "Hydrating Collagen Body Milk",
      category: "Beauty",
      description:
        "Luxury daily body care product with strong glow-up and hydration content potential.",
      price: "$24.99",
      estimatedSales: "AI estimate",
      rating: "4.8",
      reviews: "1,248",
      trendScore: "92",
      competition: "Low",
      badge: "Hot",
      whyHot:
        "High repeat-purchase potential with strong skincare demand and strong visual demo appeal.",
      contentAngle:
        "Show glow-up routine, texture demo, and daily luxury care angle.",
      image: "/products/body-milk.jpg",
      productUrl: "https://www.amazon.com/",
      source: "fallback",
    },
    {
      id: "fallback-2",
      asin: "fallback-2",
      name: "Portable Ice Face Roller",
      category: "Beauty",
      description:
        "Fast visual skincare tool with strong self-care and before/after demo potential.",
      price: "$14.99",
      estimatedSales: "AI estimate",
      rating: "4.6",
      reviews: "2,014",
      trendScore: "90",
      competition: "Low",
      badge: "Low Competition",
      whyHot:
        "Easy to demonstrate, highly visual, and aligned with short-form self-care content trends.",
      contentAngle:
        "Use morning routine clips, de-puffing hooks, and luxury self-care positioning.",
      image: "/products/face-roller.jpg",
      productUrl: "https://www.amazon.com/",
      source: "fallback",
    },
    {
      id: "fallback-3",
      asin: "fallback-3",
      name: "Chebe Shampoo & Conditioner Set",
      category: "Beauty",
      description:
        "Haircare set with strong transformation and wash-day content opportunities.",
      price: "$45.90",
      estimatedSales: "AI estimate",
      rating: "4.7",
      reviews: "932",
      trendScore: "89",
      competition: "Medium",
      badge: "Rising",
      whyHot:
        "Hair growth, restoration, and premium wash-day content remain strong creator categories.",
      contentAngle:
        "Use before/after wash-day content, hair journey storytelling, and premium beauty framing.",
      image: "/products/chebe-set.jpg",
      productUrl: "https://www.amazon.com/",
      source: "fallback",
    },
    {
      id: "fallback-4",
      asin: "fallback-4",
      name: "MagSafe Travel Power Bank",
      category: "Tech",
      description:
        "Useful lifestyle tech product with travel and everyday creator utility.",
      price: "$34.99",
      estimatedSales: "AI estimate",
      rating: "4.7",
      reviews: "1,109",
      trendScore: "91",
      competition: "Medium",
      badge: "Rising",
      whyHot:
        "Practical products with everyday utility perform well in short-form content and creator routines.",
      contentAngle:
        "Use day-in-the-life videos, travel setup content, and phone battery emergency hooks.",
      image: "/products/power-bank.jpg",
      productUrl: "https://www.amazon.com/",
      source: "fallback",
    },
    {
      id: "fallback-5",
      asin: "fallback-5",
      name: "Minimalist LED Desk Lamp",
      category: "Home",
      description:
        "Clean workspace product with strong productivity and setup-video appeal.",
      price: "$39.99",
      estimatedSales: "AI estimate",
      rating: "4.8",
      reviews: "687",
      trendScore: "84",
      competition: "Low",
      badge: "Best Margin",
      whyHot:
        "Workspace setup content continues to perform well with clean, premium product presentation.",
      contentAngle:
        "Use desk transformation videos, productivity hooks, and premium workspace aesthetics.",
      image: "/products/desk-lamp.jpg",
      productUrl: "https://www.amazon.com/",
      source: "fallback",
    },
    {
      id: "fallback-6",
      asin: "fallback-6",
      name: "Creator Hook Pack Template Bundle",
      category: "Digital",
      description:
        "Digital creator product with fast delivery, high margin, and content-business appeal.",
      price: "$19.00",
      estimatedSales: "AI estimate",
      rating: "4.9",
      reviews: "514",
      trendScore: "88",
      competition: "Medium",
      badge: "Hot",
      whyHot:
        "Digital creator tools solve a direct pain point and fit naturally into creator monetization content.",
      contentAngle:
        "Show how creators save time, get better hooks, and monetize faster using the product.",
      image: "/products/hook-pack.jpg",
      productUrl: "https://www.amazon.com/",
      source: "fallback",
    },
  ]

  const items = filterDiscoveryItems(fallbackItems, query)

  return {
    items,
    total: items.length,
    query,
    source: "fallback",
  }
}

export function mapAmazonItem(raw: any): ProductDiscoveryItem {
  const title =
    safeText(raw?.ItemInfo?.Title?.DisplayValue) ||
    safeText(raw?.title) ||
    "Untitled Product"

  const image =
    safeText(raw?.Images?.Primary?.Large?.URL) ||
    safeText(raw?.Images?.Primary?.Medium?.URL) ||
    safeText(raw?.image) ||
    "/products/placeholder.jpg"

  const price =
    safeText(raw?.Offers?.Listings?.[0]?.Price?.DisplayAmount) ||
    safeText(raw?.price) ||
    "unavailable"

  const productUrl =
    safeText(raw?.DetailPageURL) ||
    safeText(raw?.url) ||
    "#"

  const category =
    safeText(raw?.ItemInfo?.Classifications?.ProductGroup?.DisplayValue) ||
    safeText(raw?.category) ||
    "General"

  const rating =
    safeText(raw?.CustomerReviews?.StarRating?.DisplayValue) ||
    safeText(raw?.rating) ||
    "unavailable"

  const reviews =
    safeText(raw?.CustomerReviews?.Count) ||
    safeText(raw?.reviews) ||
    "unavailable"

  const trendScore = "88"
  const competition: "Low" | "Medium" | "High" = "Medium"
  const badge: "Hot" | "Rising" | "Low Competition" | "Best Margin" = "Rising"

  return {
    id: safeText(raw?.ASIN) || crypto.randomUUID(),
    asin: safeText(raw?.ASIN),
    name: title,
    category,
    description:
      safeText(raw?.description) ||
      `${category} product discovered from real marketplace search.`,
    price,
    estimatedSales: "AI estimate",
    rating,
    reviews,
    trendScore,
    competition,
    badge,
    whyHot: `${title} shows product-market promise with creator-friendly content and strong marketplace appeal.`,
    contentAngle: `Use demo videos, problem-solution hooks, and premium positioning to market ${title}.`,
    image,
    productUrl,
    source: "amazon-live",
  }
}