import { NextResponse } from "next/server"
import {
  searchTikTokProducts,
  type Product,
} from "@/lib/product-sources/tiktok"
import { searchAmazonProducts } from "@/lib/product-sources/amazon"

function enrichProducts(products: Product[]): Product[] {
  return products.map((product, index) => {
    const rating =
      typeof product.rating === "number"
        ? product.rating
        : Number(product.rating ?? 4.5)

    const trendScore =
      typeof product.trendScore === "number"
        ? product.trendScore
        : Math.max(75, 95 - index * 2)

    return {
      ...product,
      rating,
      reviews: product.reviews || "N/A",
      estimatedSales: product.estimatedSales || "N/A",
      competition: product.competition || "Medium",
      trendScore,
      category: product.category || "General",
      whyItsHot:
        product.whyItsHot || "Live product found from a verified source.",
      contentAngle:
        product.contentAngle ||
        "Hook: problem → show product → transformation → CTA",
      source: product.source || "Live Source",
      image: product.image || "",
    }
  })
}

function normalizeSource(source: string) {
  const clean = source.trim().toLowerCase()

  if (clean === "tiktok") return "tiktok"
  if (clean === "amazon") return "amazon"
  return "all"
}

function dedupeProducts(products: Product[]) {
  return products.filter((product, index, arr) => {
    const currentKey =
      product.id ||
      `${product.name}-${product.url || ""}-${product.source || ""}`

    return (
      arr.findIndex((item) => {
        const itemKey =
          item.id || `${item.name}-${item.url || ""}-${item.source || ""}`
        return itemKey === currentKey
      }) === index
    )
  })
}

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const query = typeof body?.query === "string" ? body.query.trim() : ""
    const source = normalizeSource(
      typeof body?.source === "string" ? body.source : "all"
    )

    if (!query) {
      return NextResponse.json({ error: "Missing query." }, { status: 400 })
    }

    let results: Product[] = []
    const unavailable: string[] = []

    if (source === "all" || source === "tiktok") {
      try {
        const tiktok = await searchTikTokProducts(query)
        results.push(...tiktok)

        if (!tiktok.length) {
          unavailable.push("TikTok")
        }
      } catch (error) {
        console.error("TikTok error:", error)
        unavailable.push("TikTok")
      }
    }

    if (source === "all" || source === "amazon") {
      try {
        const amazon = await searchAmazonProducts(query)
        results.push(...amazon)

        if (!amazon.length) {
          unavailable.push("Amazon")
        }
      } catch (error) {
        console.error("Amazon error:", error)
        unavailable.push("Amazon")
      }
    }

    const uniqueResults = dedupeProducts(results)

    if (!uniqueResults.length) {
      return NextResponse.json({
        products: [],
        detectedCategory: "",
        message:
          unavailable.length > 0
            ? `No results. Unavailable: ${unavailable.join(", ")}`
            : "No results found.",
      })
    }

    const enriched = enrichProducts(uniqueResults)

    return NextResponse.json({
      products: enriched,
      detectedCategory: enriched[0]?.category || "",
      message: `Live results for "${query}"`,
    })
  } catch (error) {
    console.error("product-discovery error:", error)

    return NextResponse.json(
      {
        products: [],
        detectedCategory: "",
        message: error instanceof Error ? error.message : "Search failed.",
      },
      { status: 200 }
    )
  }
}