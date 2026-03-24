"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import {
  BookOpen,
  ChevronRight,
  Clock3,
  Filter,
  Flame,
  FolderHeart,
  Layers3,
  PlayCircle,
  Search,
  Sparkles,
  Trophy,
} from "lucide-react"
import {
  formatDuration,
  getLearnTypeLabel,
  getLevelBadgeColor,
  getTypeBadgeColor,
  type LearnApiResponse,
  type LearnItem,
} from "@/lib/learn-data"
import { saveToHistory } from "@/lib/history"

const typeFilters = [
  { label: "All", value: "" },
  { label: "Modules", value: "module" },
  { label: "Learning Paths", value: "learningPath" },
  { label: "Courses", value: "course" },
  { label: "Certifications", value: "certification" },
  { label: "Exams", value: "exam" },
]

function getLearnHref(item: LearnItem) {
  return `/dashboard/cos/learn/course/${item.slug}`
}

function StatCard({
  title,
  value,
  subtext,
  icon,
}: {
  title: string
  value: string
  subtext: string
  icon: React.ReactNode
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 shadow-[0_0_40px_rgba(0,0,0,0.25)] backdrop-blur-sm">
      <div className="mb-4 flex items-center justify-between">
        <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-3 text-cyan-300">
          {icon}
        </div>
      </div>

      <div className="space-y-1">
        <p className="text-sm text-zinc-400">{title}</p>
        <h3 className="text-3xl font-semibold tracking-tight text-white">
          {value}
        </h3>
        <p className="text-xs text-zinc-500">{subtext}</p>
      </div>
    </div>
  )
}

function FilterPill({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition-all ${
        active
          ? "border-cyan-400/40 bg-cyan-400/15 text-cyan-200 shadow-[0_0_20px_rgba(34,211,238,0.12)]"
          : "border-white/10 bg-white/[0.03] text-zinc-300 hover:border-white/20 hover:bg-white/[0.06]"
      }`}
    >
      {label}
    </button>
  )
}

function LearnCard({ item }: { item: LearnItem }) {
  const typeLabel = getLearnTypeLabel(item.type)
  const typeBadge = getTypeBadgeColor(item.type)
  const levelBadge = getLevelBadgeColor(item.level)
  const hasImage =
    typeof item.imageUrl === "string" && item.imageUrl.trim() !== ""

  return (
    <div className="group overflow-hidden rounded-[28px] border border-white/10 bg-gradient-to-b from-white/[0.05] to-white/[0.02] transition-all hover:-translate-y-1 hover:border-cyan-400/20 hover:shadow-[0_16px_60px_rgba(0,0,0,0.35)]">
      <div className="relative h-56 w-full overflow-hidden bg-[#08101f]">
        {hasImage ? (
          <img
            src={item.imageUrl}
            alt={item.title}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.18),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))]">
            <PlayCircle className="h-14 w-14 text-cyan-300" />
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        <div className="absolute left-4 top-4 flex flex-wrap gap-2">
          <span
            className={`rounded-full border px-3 py-1 text-xs backdrop-blur-md ${typeBadge}`}
          >
            {typeLabel}
          </span>

          <span
            className={`rounded-full border px-3 py-1 text-xs backdrop-blur-md ${levelBadge}`}
          >
            {item.level}
          </span>
        </div>

        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
          <div className="rounded-full border border-white/10 bg-black/40 px-3 py-1 text-xs text-white backdrop-blur-md">
            {item.provider}
          </div>
        </div>
      </div>

      <div className="space-y-4 p-5">
        <div>
          <h3 className="line-clamp-2 text-lg font-semibold text-white transition-colors group-hover:text-cyan-200">
            {item.title}
          </h3>
          <p className="mt-2 line-clamp-3 text-sm leading-6 text-zinc-400">
            {item.summary}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {item.products.slice(0, 2).map((product) => (
            <span
              key={product}
              className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-zinc-300"
            >
              {product}
            </span>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-400">
          <span className="inline-flex items-center gap-2">
            <Clock3 className="h-4 w-4" />
            {formatDuration(item.durationInMinutes)}
          </span>

          <span className="inline-flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            {item.locale}
          </span>
        </div>

        <div className="pt-2">
          <Link
            href={getLearnHref(item)}
            className="inline-flex items-center gap-2 rounded-2xl bg-cyan-400 px-4 py-2 text-sm font-medium text-black transition hover:scale-[1.02]"
          >
            Open Course
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}

function HeroPreview({ item }: { item: LearnItem | null }) {
  if (!item) {
    return (
      <div className="rounded-3xl border border-white/10 bg-black/20 p-5 backdrop-blur-md">
        <p className="text-sm text-zinc-400">Live Preview</p>
        <h3 className="mt-2 text-xl font-semibold text-white">
          Search real learning content
        </h3>
        <p className="mt-2 text-sm text-zinc-400">
          Microsoft Learn results ap parèt isit la.
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-white/10 bg-black/20 backdrop-blur-md">
      <div className="relative h-56 w-full overflow-hidden bg-[#08101f]">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.18),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))]">
            <PlayCircle className="h-14 w-14 text-cyan-300" />
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4">
          <div className="inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs text-cyan-200 backdrop-blur-md">
            Featured Preview
          </div>
        </div>
      </div>

      <div className="space-y-2 p-5">
        <p className="text-sm text-zinc-400">{item.provider}</p>
        <h3 className="text-xl font-semibold text-white">{item.title}</h3>
        <p className="line-clamp-3 text-sm text-zinc-400">{item.summary}</p>
      </div>
    </div>
  )
}

export default function LearnPage() {
  const [searchInput, setSearchInput] = useState("azure")
  const [submittedSearch, setSubmittedSearch] = useState("azure")
  const [activeType, setActiveType] = useState("")
  const [data, setData] = useState<LearnApiResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const historySavedRef = useRef("")

  useEffect(() => {
    let cancelled = false

    async function loadLearn() {
      try {
        setLoading(true)
        setError("")

        const params = new URLSearchParams()
        params.set("q", submittedSearch || "azure")
        if (activeType) params.set("type", activeType)

        const res = await fetch(`/api/learn?${params.toString()}`, {
          method: "GET",
          cache: "no-store",
        })

        const json = (await res.json()) as LearnApiResponse | { error?: string }

        if (!res.ok) {
          throw new Error(
            "error" in json && json.error ? json.error : "Failed to load learning content"
          )
        }

        if (!cancelled) {
          setData(json as LearnApiResponse)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Unknown error")
          setData(null)
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadLearn()

    return () => {
      cancelled = true
    }
  }, [submittedSearch, activeType])

  useEffect(() => {
    async function saveLearnHistory() {
      if (loading) return
      if (error) return
      if (!data) return

      const historyKey = `${submittedSearch}__${activeType || "all"}__${data.items?.length || 0}`
      if (historySavedRef.current === historyKey) return
      historySavedRef.current = historyKey

      try {
        const topItems = (data.items || []).slice(0, 8)
        const topItemsText =
          topItems.length > 0
            ? topItems
                .map((item, index) => {
                  return [
                    `${index + 1}. ${item.title}`,
                    `Type: ${getLearnTypeLabel(item.type)}`,
                    `Level: ${item.level}`,
                    `Provider: ${item.provider}`,
                    `Duration: ${formatDuration(item.durationInMinutes)}`,
                    `Locale: ${item.locale}`,
                  ].join(" | ")
                })
                .join("\n")
            : "No items returned."

        await saveToHistory({
          module: "Learn",
          title: `${submittedSearch} Learn Search`,
          input: {
            query: submittedSearch,
            type: activeType || "all",
            source: data.source,
          },
          output: [
            "Learn Search Snapshot",
            `Query: ${submittedSearch}`,
            `Type Filter: ${activeType || "all"}`,
            `Source: ${data.source}`,
            `Total Results: ${data.items?.length || 0}`,
            "",
            "Top Results:",
            topItemsText,
          ].join("\n"),
        })
      } catch (saveError) {
        console.error("save learn history error:", saveError)
      }
    }

    saveLearnHistory()
  }, [loading, error, data, submittedSearch, activeType])

  const items = data?.items || []
  const featuredItems = useMemo(() => items.slice(0, 6), [items])
  const previewItem = items[0] || null

  const sourceLabel =
    data?.source === "microsoft-learn"
      ? "Live Microsoft Learn"
      : "Fallback Catalog"

  return (
    <div className="min-h-screen w-full bg-[#050816] text-white">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-6 md:px-6 xl:px-8">
        <section className="relative overflow-hidden rounded-[34px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.16),transparent_28%),radial-gradient(circle_at_top_right,rgba(59,130,246,0.14),transparent_22%),linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] p-6 md:p-8 xl:p-10">
          <div className="relative z-10 grid gap-8 xl:grid-cols-[1.2fr_0.8fr] xl:items-end">
            <div className="space-y-6">
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-200">
                <Sparkles className="h-4 w-4" />
                Real Professional Learning Hub
              </div>

              <div className="space-y-3">
                <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-white md:text-5xl xl:text-6xl">
                  Learn with real Microsoft catalog content.
                </h1>
                <p className="max-w-2xl text-sm leading-7 text-zinc-300 md:text-base">
                  Search modules, learning paths, courses, certifications, and exams
                  inside one premium dashboard.
                </p>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  setSubmittedSearch(searchInput.trim() || "azure")
                }}
                className="flex flex-col gap-3 md:flex-row"
              >
                <div className="relative flex-1">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-500" />
                  <input
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="Search Azure, Linux, cybersecurity, AI..."
                    className="h-14 w-full rounded-2xl border border-white/10 bg-[#0a1020] pl-12 pr-4 text-sm text-white outline-none transition placeholder:text-zinc-500 focus:border-cyan-400/30"
                  />
                </div>

                <button
                  type="submit"
                  className="inline-flex h-14 items-center justify-center gap-2 rounded-2xl bg-cyan-400 px-5 text-sm font-semibold text-black transition hover:scale-[1.02]"
                >
                  Search Learn
                  <ChevronRight className="h-4 w-4" />
                </button>
              </form>

              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href="/dashboard/cos/learn/saved"
                  className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-3 text-sm text-white transition hover:bg-white/[0.08]"
                >
                  View Saved Courses
                  <FolderHeart className="h-4 w-4" />
                </Link>
              </div>
            </div>

            <HeroPreview item={previewItem} />
          </div>
        </section>

        <section className="rounded-[30px] border border-white/10 bg-white/[0.03] p-4 md:p-5">
          <div className="flex flex-wrap items-center gap-3">
            <div className="mr-1 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-zinc-300">
              <Filter className="h-4 w-4" />
              Content Type
            </div>

            {typeFilters.map((filter) => (
              <FilterPill
                key={filter.value || "all"}
                label={filter.label}
                active={activeType === filter.value}
                onClick={() => setActiveType(filter.value)}
              />
            ))}
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Live Results"
            value={String(items.length)}
            subtext={sourceLabel}
            icon={<BookOpen className="h-5 w-5" />}
          />
          <StatCard
            title="Catalog Source"
            value={data?.source === "microsoft-learn" ? "Live" : "Fallback"}
            subtext="Content provider state"
            icon={<Layers3 className="h-5 w-5" />}
          />
          <StatCard
            title="Search Focus"
            value={submittedSearch}
            subtext="Current keyword"
            icon={<Search className="h-5 w-5" />}
          />
          <StatCard
            title="Learning Streak"
            value="12d"
            subtext="Consistency compounds"
            icon={<Flame className="h-5 w-5" />}
          />
        </section>

        <section className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-white">
                Featured Learning Content
              </h2>
              <p className="mt-1 text-sm text-zinc-400">
                Search: <span className="text-white">{submittedSearch}</span>
              </p>
            </div>

            <div className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-zinc-300">
              {sourceLabel}
            </div>
          </div>

          {loading ? (
            <div className="grid gap-5 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.03]"
                >
                  <div className="h-56 animate-pulse bg-white/[0.05]" />
                  <div className="space-y-3 p-5">
                    <div className="h-4 w-24 animate-pulse rounded bg-white/[0.06]" />
                    <div className="h-6 w-3/4 animate-pulse rounded bg-white/[0.06]" />
                    <div className="h-4 w-full animate-pulse rounded bg-white/[0.06]" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="rounded-[28px] border border-red-400/20 bg-red-400/10 p-8 text-center">
              <Trophy className="mx-auto mb-4 h-10 w-10 text-red-200" />
              <h3 className="text-lg font-semibold text-white">
                Failed to load learning content
              </h3>
              <p className="mt-2 text-sm text-red-100">{error}</p>
            </div>
          ) : featuredItems.length > 0 ? (
            <div className="grid gap-5 xl:grid-cols-3">
              {featuredItems.map((item) => (
                <LearnCard key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <div className="rounded-[28px] border border-dashed border-white/10 bg-white/[0.02] p-10 text-center">
              <Trophy className="mx-auto mb-4 h-10 w-10 text-zinc-500" />
              <h3 className="text-lg font-semibold text-white">
                No learning content found
              </h3>
              <p className="mt-2 text-sm text-zinc-400">
                Try another keyword or switch content type filters.
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}