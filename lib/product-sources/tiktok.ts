export type Product = {
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

function normalizeQuery(query: string) {
  return query.toLowerCase().trim()
}

function matchesQuery(product: Product, query: string) {
  const q = normalizeQuery(query)

  if (!q) return true

  return [
    product.name,
    product.category || "",
    product.whyItsHot || "",
    product.contentAngle || "",
  ]
    .join(" ")
    .toLowerCase()
    .includes(q)
}

const tiktokFallbackProducts: Product[] = [
  {
    id: "tiktok-body-butter-1",
    name: "Viral Whipped Body Butter",
    price: 18.99,
    image: "/images/products/tiktok-body-butter.jpg",
    rating: 4.8,
    reviews: "12.4K",
    estimatedSales: "8.2K/mo",
    competition: "Medium",
    trendScore: 94,
    category: "Beauty",
    whyItsHot:
      "Strong repeat-purchase behavior, beauty niche momentum, and high TikTok visual appeal.",
    contentAngle:
      "Show dry skin → apply body butter → instant glow close-up → CTA.",
    source: "TikTok",
    url: "",
  },
  {
    id: "tiktok-hair-oil-1",
    name: "Rosemary Hair Growth Oil",
    price: 14.99,
    image: "/images/products/tiktok-hair-oil.jpg",
    rating: 4.7,
    reviews: "9.1K",
    estimatedSales: "6.5K/mo",
    competition: "Medium",
    trendScore: 92,
    category: "Hair Care",
    whyItsHot:
      "Hair growth and repair products keep performing well with before-and-after content.",
    contentAngle:
      "Hook with hairline/scalp pain point → show oil routine → transformation promise.",
    source: "TikTok",
    url: "",
  },
  {
    id: "tiktok-lip-oil-1",
    name: "Hydrating Lip Oil Set",
    price: 12.99,
    image: "/images/products/tiktok-lip-oil.jpg",
    rating: 4.6,
    reviews: "5.4K",
    estimatedSales: "4.1K/mo",
    competition: "High",
    trendScore: 88,
    category: "Beauty",
    whyItsHot:
      "Low-ticket beauty products perform well with creator demos and aesthetic packaging.",
    contentAngle:
      "Close-up glossy lips → color reveal → soft luxury CTA.",
    source: "TikTok",
    url: "",
  },
  {
    id: "tiktok-led-mask-1",
    name: "LED Face Mask",
    price: 49.99,
    image: "/images/products/tiktok-led-mask.jpg",
    rating: 4.5,
    reviews: "3.2K",
    estimatedSales: "2.3K/mo",
    competition: "Low",
    trendScore: 90,
    category: "Skincare",
    whyItsHot:
      "Premium beauty tech products attract strong engagement and high perceived value.",
    contentAngle:
      "Night routine aesthetic → LED mask visual → premium self-care positioning.",
    source: "TikTok",
    url: "",
  },
  {
    id: "tiktok-waist-trainer-1",
    name: "Snatched Waist Trainer",
    price: 29.99,
    image: "/images/products/tiktok-waist-trainer.jpg",
    rating: 4.4,
    reviews: "7.8K",
    estimatedSales: "5.7K/mo",
    competition: "Medium",
    trendScore: 86,
    category: "Fitness",
    whyItsHot:
      "Transformation-style content and body confidence angles keep this category moving.",
    contentAngle:
      "Before fit check → waist trainer reveal → silhouette transformation.",
    source: "TikTok",
    url: "",
  },
  {
    id: "tiktok-car-vacuum-1",
    name: "Mini Portable Car Vacuum",
    price: 24.99,
    image: "/images/products/tiktok-car-vacuum.jpg",
    rating: 4.6,
    reviews: "6.3K",
    estimatedSales: "3.9K/mo",
    competition: "Low",
    trendScore: 84,
    category: "Car Accessories",
    whyItsHot:
      "Problem-solving products do well on TikTok because the demo sells itself fast.",
    contentAngle:
      "Messy car interior → vacuum demo → satisfying clean reveal.",
    source: "TikTok",
    url: "",
  },
]

export async function searchTikTokProducts(query: string): Promise<Product[]> {
  const cleanQuery = normalizeQuery(query)

  if (!cleanQuery) {
    return tiktokFallbackProducts.slice(0, 6)
  }

  const matched = tiktokFallbackProducts.filter((product) =>
    matchesQuery(product, cleanQuery)
  )

  if (matched.length > 0) {
    return matched
  }

  return tiktokFallbackProducts
    .filter((product) =>
      product.category?.toLowerCase().includes(cleanQuery)
    )
    .slice(0, 6)
}