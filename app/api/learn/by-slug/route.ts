import { NextRequest, NextResponse } from "next/server"
import { fallbackLearnCatalog, type LearnItem } from "@/lib/learn-data"

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

function normalizeType(type: string): LearnItem["type"] {
  switch (type) {
    case "module":
      return "module"
    case "unit":
      return "unit"
    case "learningPath":
      return "learningPath"
    case "course":
    case "instructorLedTrainingCourse":
      return "course"
    case "certification":
      return "certification"
    case "exam":
      return "exam"
    default:
      return "course"
  }
}

function mapMicrosoftItem(item: MicrosoftCatalogRecord): LearnItem | null {
  const title = safeText(item.title)
  const url = safeText(item.url)
  const summary = safeText(item.summary)
  const rawType = safeText(item.type)
  const level = safeArray(item.levels)[0] || "Beginner"
  const slug = slugFromMicrosoftUrlOrTitle(url, title)

  if (!title || !url || !slug) return null

  return {
    id: safeText(item.uid) || url,
    slug,
    title,
    summary: summary || "Microsoft Learn content.",
    type: normalizeType(rawType),
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

function flattenCatalog(data: MicrosoftCatalogResponse): LearnItem[] {
  const buckets: MicrosoftCatalogRecord[] = [
    ...(data.learningPaths || []),
    ...(data.modules || []),
    ...(data.units || []),
    ...(data.instructorLedTrainingCourses || []),
    ...(data.certifications || []),
    ...(data.exams || []),
    ...(data.appliedSkills || []),
    ...(data.mergedCertifications || []),
  ]

  const mapped = buckets
    .map(mapMicrosoftItem)
    .filter((item): item is LearnItem => item !== null)

  const seen = new Set<string>()

  return mapped.filter((item) => {
    const key = `${item.type}:${item.slug}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

function findBySlug(items: LearnItem[], slug: string) {
  return items.find((item) => item.slug === slug) || null
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const slug = safeText(searchParams.get("slug"))

  if (!slug) {
    return NextResponse.json(
      { item: null, error: "Missing slug parameter." },
      { status: 400 }
    )
  }

  try {
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

    const json = (await res.json()) as MicrosoftCatalogResponse
    const allItems = flattenCatalog(json)
    const item = findBySlug(allItems, slug)

    if (!item) {
      return NextResponse.json(
        { item: null, error: "Learning item not found." },
        { status: 404 }
      )
    }

    return NextResponse.json(
      {
        item,
        source: "microsoft-learn",
      },
      { status: 200 }
    )
  } catch {
    const item = findBySlug(fallbackLearnCatalog, slug)

    if (!item) {
      return NextResponse.json(
        { item: null, error: "Learning item not found." },
        { status: 404 }
      )
    }

    return NextResponse.json(
      {
        item,
        source: "fallback-catalog",
      },
      { status: 200 }
    )
  }
}