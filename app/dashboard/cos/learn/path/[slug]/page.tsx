import Link from "next/link"
import {
  ArrowLeft,
  BookOpen,
  ChevronRight,
  Clock3,
  Sparkles,
} from "lucide-react"
import {
  formatDuration,
  getLearnTypeLabel,
  getLevelBadgeColor,
  getTypeBadgeColor,
  type LearnItem,
} from "@/lib/learn-data"

type PageProps = {
  params: Promise<{
    slug: string
  }>
}

async function getLearnItem(slug: string): Promise<{
  item: LearnItem | null
  source?: string
  error?: string
}> {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.VERCEL_URL ||
    "http://localhost:3000"

  const normalizedBaseUrl = baseUrl.startsWith("http")
    ? baseUrl
    : `https://${baseUrl}`

  try {
    const res = await fetch(
      `${normalizedBaseUrl}/api/learn/by-slug?slug=${encodeURIComponent(slug)}`,
      { cache: "no-store" }
    )

    const json = await res.json()

    if (!res.ok) {
      return {
        item: null,
        error: json?.error || "Failed to load learning item.",
      }
    }

    return {
      item: json?.item || null,
      source: json?.source || "",
    }
  } catch (error) {
    return {
      item: null,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

async function getRelatedItems(slug: string): Promise<LearnItem[]> {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.VERCEL_URL ||
    "http://localhost:3000"

  const normalizedBaseUrl = baseUrl.startsWith("http")
    ? baseUrl
    : `https://${baseUrl}`

  try {
    const res = await fetch(
      `${normalizedBaseUrl}/api/learn/related?slug=${encodeURIComponent(slug)}`,
      { cache: "no-store" }
    )

    const json = await res.json()
    return Array.isArray(json?.items) ? json.items : []
  } catch {
    return []
  }
}

function RelatedCard({ item }: { item: LearnItem }) {
  const href =
    item.type === "module"
      ? `/dashboard/cos/learn/module/${item.slug}`
      : item.type === "unit"
      ? `/dashboard/cos/learn/unit/${item.slug}`
      : `/dashboard/cos/learn/course/${item.slug}`

  return (
    <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-5">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className={`rounded-full border px-3 py-1 text-xs ${getTypeBadgeColor(item.type)}`}>
          {getLearnTypeLabel(item.type)}
        </span>
        <span className={`rounded-full border px-3 py-1 text-xs ${getLevelBadgeColor(item.level)}`}>
          {item.level}
        </span>
      </div>

      <h3 className="text-lg font-semibold text-white">{item.title}</h3>

      <p className="mt-2 line-clamp-3 text-sm leading-6 text-zinc-400">
        {item.summary}
      </p>

      <div className="mt-4 flex items-center gap-4 text-sm text-zinc-400">
        <span className="inline-flex items-center gap-2">
          <Clock3 className="h-4 w-4" />
          {formatDuration(item.durationInMinutes)}
        </span>
        <span className="inline-flex items-center gap-2">
          <BookOpen className="h-4 w-4" />
          {item.locale}
        </span>
      </div>

      <div className="mt-5">
        <Link
          href={href}
          className="inline-flex items-center gap-2 rounded-2xl bg-cyan-400 px-4 py-2 text-sm font-medium text-black transition hover:scale-[1.02]"
        >
          Open
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  )
}

export default async function LearnPathPage({ params }: PageProps) {
  const { slug } = await params
  const { item, source, error } = await getLearnItem(slug)
  const related = await getRelatedItems(slug)

  if (!item) {
    return (
      <div className="min-h-screen bg-[#050816] px-4 py-8 text-white md:px-6 xl:px-8">
        <div className="mx-auto max-w-6xl">
          <Link
            href="/dashboard/cos/learn"
            className="mb-6 inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white hover:bg-white/[0.08]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Learn
          </Link>

          <div className="rounded-[30px] border border-red-400/20 bg-red-400/10 p-8">
            <h1 className="text-2xl font-semibold">Learning path not found</h1>
            <p className="mt-3 text-sm text-red-100">
              {error || "Unable to load this learning path."}
            </p>
          </div>
        </div>
      </div>
    )
  }

  const sourceLabel =
    source === "microsoft-learn" ? "Live Microsoft Learn" : "Fallback Catalog"

  return (
    <div className="min-h-screen bg-[#050816] text-white">
      <div className="mx-auto max-w-6xl px-4 py-6 md:px-6 xl:px-8">
        <div className="mb-6 flex items-center justify-between gap-4">
          <Link
            href="/dashboard/cos/learn"
            className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white hover:bg-white/[0.08]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Learn
          </Link>

          <div className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-xs text-cyan-200">
            {sourceLabel}
          </div>
        </div>

        <section className="overflow-hidden rounded-[34px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.16),transparent_28%),radial-gradient(circle_at_top_right,rgba(59,130,246,0.14),transparent_22%),linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))]">
          <div className="grid xl:grid-cols-[1.1fr_0.9fr]">
            <div className="p-6 md:p-8 xl:p-10">
              <div className="mb-4 flex flex-wrap items-center gap-3">
                <span className={`rounded-full border px-3 py-1 text-xs ${getTypeBadgeColor(item.type)}`}>
                  {getLearnTypeLabel(item.type)}
                </span>
                <span className={`rounded-full border px-3 py-1 text-xs ${getLevelBadgeColor(item.level)}`}>
                  {item.level}
                </span>
                <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-zinc-300">
                  {item.provider}
                </span>
              </div>

              <h1 className="max-w-4xl text-4xl font-semibold tracking-tight md:text-5xl">
                {item.title}
              </h1>

              <p className="mt-4 max-w-3xl text-sm leading-7 text-zinc-300 md:text-base">
                {item.summary}
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-zinc-300">
                  {formatDuration(item.durationInMinutes)}
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-zinc-300">
                  {item.locale}
                </div>
              </div>
            </div>

            <div className="relative min-h-[320px] border-t border-white/10 xl:border-l xl:border-t-0">
              {item.imageUrl ? (
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full min-h-[320px] items-center justify-center">
                  <div className="text-center">
                    <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-3xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-300">
                      <Sparkles className="h-10 w-10" />
                    </div>
                    <p className="text-lg font-medium">Learning Path</p>
                    <p className="mt-2 text-sm text-zinc-400">
                      Internal CreatorGoat view
                    </p>
                  </div>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
            </div>
          </div>
        </section>

        <section className="mt-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Modules & related content</h2>
            <span className="text-sm text-zinc-400">{related.length} items</span>
          </div>

          {related.length > 0 ? (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {related.map((entry) => (
                <RelatedCard key={`${entry.type}-${entry.slug}`} item={entry} />
              ))}
            </div>
          ) : (
            <div className="rounded-[26px] border border-white/10 bg-white/[0.03] p-8 text-zinc-400">
              No related modules found yet for this path.
            </div>
          )}
        </section>
      </div>
    </div>
  )
}