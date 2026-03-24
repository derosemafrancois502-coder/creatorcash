import { NextRequest, NextResponse } from "next/server"
import { type LearnItem } from "@/lib/learn-data"

const MICROSOFT_LEARN_CATALOG_URL = "https://learn.microsoft.com/api/catalog/"

type MicrosoftCatalogRecord = {
  uid?: string
  url?: string
  title?: string
  summary?: string
  type?: string
  levels?: string[]
  roles?: string[]
  products?: string[]
  duration_in_minutes?: number
  locale?: string
}

type MicrosoftCatalogResponse = {
  modules?: MicrosoftCatalogRecord[]
  units?: MicrosoftCatalogRecord[]
  learningPaths?: MicrosoftCatalogRecord[]
  instructorLedTrainingCourses?: MicrosoftCatalogRecord[]
  certifications?: MicrosoftCatalogRecord[]
  exams?: MicrosoftCatalogRecord[]
  appliedSkills?: MicrosoftCatalogRecord[]
  mergedCertifications?: MicrosoftCatalogRecord[]
}

function safeText(value: unknown): string {
  return typeof value === "string" ? value.trim() : ""
}

function safeArray(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value.filter(
    (item): item is string => typeof item === "string" && item.trim().length > 0
  )
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

function slugFromMicrosoftUrlOrTitle(url: string, title: string): string {
  const cleanUrl = safeText(url)

  if (cleanUrl) {
    try {
      const parsed = new URL(cleanUrl)
      const segments = parsed.pathname.split("/").filter(Boolean)
      const lastSegment = segments[segments.length - 1]
      if (lastSegment && lastSegment !== "training") {
        return slugify(lastSegment)
      }
    } catch {
      const withoutQuery = cleanUrl.split("?")[0]
      const segments = withoutQuery.split("/").filter(Boolean)
      const lastSegment = segments[segments.length - 1]
      if (lastSegment) {
        return slugify(lastSegment)
      }
    }
  }

  return slugify(title)
}

function mapToLearnItem(
  item: MicrosoftCatalogRecord,
  forcedType?: string
): LearnItem | null {
  const title = safeText(item.title)
  const url = safeText(item.url)
  const summary = safeText(item.summary)
  const level = safeArray(item.levels)[0] || "Beginner"
  const slug = slugFromMicrosoftUrlOrTitle(url, title)

  if (!title || !url || !slug) return null

  return {
    id: safeText(item.uid) || url,
    slug,
    title,
    summary: summary || "Microsoft Learn content.",
    type: forcedType || safeText(item.type) || "module",
    level,
    provider: "Microsoft Learn",
    durationInMinutes:
      typeof item.duration_in_minutes === "number" ? item.duration_in_minutes : 0,
    locale: safeText(item.locale) || "en-us",
    url,
    imageUrl: "",
    videoPreviewUrl: "",
    products: safeArray(item.products),
    roles: safeArray(item.roles),
  }
}

async function getCatalog(): Promise<MicrosoftCatalogResponse> {
  const res = await fetch(MICROSOFT_LEARN_CATALOG_URL, {
    method: "GET",
    cache: "no-store",
    headers: {
      Accept: "application/json",
    },
  })

  if (!res.ok) {
    throw new Error(`Microsoft Learn API failed with status ${res.status}`)
  }

  return (await res.json()) as MicrosoftCatalogResponse
}

function sameText(a: string, b: string) {
  return a.trim().toLowerCase() === b.trim().toLowerCase()
}

function buildKeywordSet(title: string, products: string[]) {
  const words = title
    .toLowerCase()
    .split(/\s+/)
    .map((w) => w.replace(/[^a-z0-9]/g, ""))
    .filter((w) => w.length > 2)

  const productWords = products
    .flatMap((p) => p.toLowerCase().split(/\s+/))
    .map((w) => w.replace(/[^a-z0-9]/g, ""))
    .filter((w) => w.length > 2)

  return [...new Set([...words, ...productWords])]
}

function scoreItem(item: MicrosoftCatalogRecord, keywords: string[]) {
  const haystack = [
    safeText(item.title),
    safeText(item.summary),
    ...safeArray(item.products),
    ...safeArray(item.roles),
  ]
    .join(" ")
    .toLowerCase()

  let score = 0
  for (const word of keywords) {
    if (haystack.includes(word)) score += 1
  }

  if (safeText(item.title).toLowerCase().includes(keywords[0] || "")) score += 2

  return score
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const slug = safeText(searchParams.get("slug"))
    const title = safeText(searchParams.get("title"))
    const type = safeText(searchParams.get("type"))
    const products = safeArray(searchParams.getAll("product"))
    const limit = Number(searchParams.get("limit") || "8")

    if (!slug && !title) {
      return NextResponse.json(
        { items: [], error: "Missing slug or title parameter." },
        { status: 400 }
      )
    }

    const catalog = await getCatalog()
    const modules = catalog.modules || []
    const units = catalog.units || []
    const learningPaths = catalog.learningPaths || []

    const targetLearningPath = learningPaths.find((item) => {
      const itemSlug = slugFromMicrosoftUrlOrTitle(
        safeText(item.url),
        safeText(item.title)
      )
      return sameText(itemSlug, slug)
    })

    const targetModule = modules.find((item) => {
      const itemSlug = slugFromMicrosoftUrlOrTitle(
        safeText(item.url),
        safeText(item.title)
      )
      return sameText(itemSlug, slug)
    })

    const keywords = buildKeywordSet(title || safeText(targetLearningPath?.title) || safeText(targetModule?.title), products)

    if (targetLearningPath || type === "learningPath" || type === "course") {
      const relatedModules = modules
        .map((item) => ({
          raw: item,
          score: scoreItem(item, keywords),
        }))
        .filter((entry) => entry.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map((entry) => mapToLearnItem(entry.raw, "module"))
        .filter((item): item is LearnItem => item !== null)

      return NextResponse.json({ items: relatedModules }, { status: 200 })
    }

    if (targetModule || type === "module") {
      const relatedUnits = units
        .map((item) => ({
          raw: item,
          score: scoreItem(item, keywords),
        }))
        .filter((entry) => entry.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map((entry) => mapToLearnItem(entry.raw, "unit"))
        .filter((item): item is LearnItem => item !== null)

      return NextResponse.json({ items: relatedUnits }, { status: 200 })
    }

    return NextResponse.json({ items: [] }, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      {
        items: [],
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 200 }
    )
  }
}