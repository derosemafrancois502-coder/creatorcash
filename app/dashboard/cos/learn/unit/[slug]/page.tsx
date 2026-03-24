import Link from "next/link"
import {
  ArrowLeft,
  BookOpen,
  Clock3,
  Layers3,
  Sparkles,
  Tag,
  User2,
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

function InfoPill({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-zinc-300">
      {children}
    </div>
  )
}

function OverviewCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
      <div className="mb-3 inline-flex rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-3 text-cyan-300">
        {icon}
      </div>
      <p className="text-sm text-zinc-400">{label}</p>
      <h3 className="mt-1 text-lg font-semibold text-white">{value}</h3>
    </div>
  )
}

export default async function LearnUnitDetailPage({ params }: PageProps) {
  const { slug } = await params
  const { item, source, error } = await getLearnItem(slug)

  if (!item) {
    return (
      <div className="min-h-screen bg-[#050816] px-4 py-8 text-white md:px-6 xl:px-8">
        <div className="mx-auto max-w-5xl">
          <Link
            href="/dashboard/cos/learn"
            className="mb-6 inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white transition hover:bg-white/[0.08]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Learn
          </Link>

          <div className="rounded-[32px] border border-red-400/20 bg-red-400/10 p-8">
            <h1 className="text-2xl font-semibold text-white">
              Lesson not found
            </h1>
            <p className="mt-3 text-sm text-red-100">
              {error || "This lesson or unit could not be loaded."}
            </p>
          </div>
        </div>
      </div>
    )
  }

  const typeLabel = getLearnTypeLabel(item.type)
  const typeBadge = getTypeBadgeColor(item.type)
  const levelBadge = getLevelBadgeColor(item.level)
  const sourceLabel =
    source === "microsoft-learn" ? "Live Microsoft Learn" : "Fallback Catalog"

  const hasImage =
    typeof item.imageUrl === "string" && item.imageUrl.trim() !== ""
  const hasVideo =
    typeof item.videoPreviewUrl === "string" && item.videoPreviewUrl.trim() !== ""

  return (
    <div className="min-h-screen bg-[#050816] text-white">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-6 md:px-6 xl:px-8">
        <div className="flex items-center justify-between gap-4">
          <Link
            href="/dashboard/cos/learn"
            className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white transition hover:bg-white/[0.08]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Learn
          </Link>

          <div className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-xs text-cyan-200">
            {sourceLabel}
          </div>
        </div>

        <section className="overflow-hidden rounded-[34px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.16),transparent_28%),radial-gradient(circle_at_top_right,rgba(59,130,246,0.14),transparent_22%),linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))]">
          <div className="grid gap-0 xl:grid-cols-[1.05fr_0.95fr]">
            <div className="p-6 md:p-8 xl:p-10">
              <div className="mb-5 flex flex-wrap items-center gap-3">
                <span className={`rounded-full border px-3 py-1 text-xs ${typeBadge}`}>
                  {typeLabel}
                </span>
                <span className={`rounded-full border px-3 py-1 text-xs ${levelBadge}`}>
                  {item.level}
                </span>
                <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-zinc-300">
                  {item.provider}
                </span>
              </div>

              <div className="space-y-4">
                <h1 className="max-w-4xl text-4xl font-semibold tracking-tight text-white md:text-5xl">
                  {item.title}
                </h1>

                <p className="max-w-3xl text-sm leading-7 text-zinc-300 md:text-base">
                  {item.summary}
                </p>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <InfoPill>
                  <span className="inline-flex items-center gap-2">
                    <Clock3 className="h-4 w-4 text-cyan-300" />
                    {formatDuration(item.durationInMinutes)}
                  </span>
                </InfoPill>

                <InfoPill>
                  <span className="inline-flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-cyan-300" />
                    {item.locale}
                  </span>
                </InfoPill>

                <InfoPill>
                  <span className="inline-flex items-center gap-2">
                    <Layers3 className="h-4 w-4 text-cyan-300" />
                    {typeLabel}
                  </span>
                </InfoPill>
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/dashboard/cos/learn"
                  className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-3 text-sm text-white transition hover:bg-white/[0.08]"
                >
                  Browse More
                </Link>
              </div>
            </div>

            <div className="relative min-h-[320px] border-t border-white/10 xl:min-h-full xl:border-l xl:border-t-0">
              {hasVideo ? (
                <video
                  src={item.videoPreviewUrl}
                  className="h-full w-full object-cover"
                  autoPlay
                  muted
                  loop
                  playsInline
                />
              ) : hasImage ? (
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full min-h-[320px] w-full items-center justify-center bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.18),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))]">
                  <div className="text-center">
                    <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-3xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-300">
                      <Sparkles className="h-10 w-10" />
                    </div>
                    <p className="text-lg font-medium text-white">
                      CreatorGoat Lesson View
                    </p>
                    <p className="mt-2 text-sm text-zinc-400">
                      Internal lesson detail page
                    </p>
                  </div>
                </div>
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[30px] border border-white/10 bg-white/[0.03] p-6">
            <h2 className="mb-5 text-2xl font-semibold text-white">
              Lesson overview
            </h2>

            <div className="grid gap-4 md:grid-cols-2">
              <OverviewCard
                icon={<BookOpen className="h-5 w-5" />}
                label="Level"
                value={item.level}
              />
              <OverviewCard
                icon={<Layers3 className="h-5 w-5" />}
                label="Type"
                value={typeLabel}
              />
              <OverviewCard
                icon={<Clock3 className="h-5 w-5" />}
                label="Estimated Duration"
                value={formatDuration(item.durationInMinutes)}
              />
              <OverviewCard
                icon={<Tag className="h-5 w-5" />}
                label="Locale"
                value={item.locale}
              />
            </div>
          </div>

          <div className="rounded-[30px] border border-white/10 bg-white/[0.03] p-6">
            <h2 className="mb-5 text-2xl font-semibold text-white">
              Role & product alignment
            </h2>

            <div className="space-y-5">
              <div>
                <div className="mb-3 inline-flex items-center gap-2 text-sm text-cyan-200">
                  <User2 className="h-4 w-4" />
                  Roles
                </div>

                <div className="flex flex-wrap gap-2">
                  {item.roles.length > 0 ? (
                    item.roles.map((role) => (
                      <span
                        key={role}
                        className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-sm text-zinc-300"
                      >
                        {role}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-zinc-500">No roles listed</span>
                  )}
                </div>
              </div>

              <div>
                <div className="mb-3 inline-flex items-center gap-2 text-sm text-cyan-200">
                  <Tag className="h-4 w-4" />
                  Products
                </div>

                <div className="flex flex-wrap gap-2">
                  {item.products.length > 0 ? (
                    item.products.map((product) => (
                      <span
                        key={product}
                        className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-sm text-zinc-300"
                      >
                        {product}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-zinc-500">No products listed</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[30px] border border-white/10 bg-white/[0.03] p-6">
          <h2 className="mb-5 text-2xl font-semibold text-white">
            Lesson summary
          </h2>

          <div className="rounded-[24px] border border-white/10 bg-white/[0.02] p-6">
            <p className="text-sm leading-7 text-zinc-300 md:text-base">
              {item.summary}
            </p>

            <div className="mt-6 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-4">
              <p className="text-sm text-cyan-100">
                This lesson page stays inside CreatorGoat and shows the Microsoft Learn
                catalog item as a structured internal learning view.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}