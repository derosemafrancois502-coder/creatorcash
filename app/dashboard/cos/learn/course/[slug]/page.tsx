import Link from "next/link"
import {
  ArrowLeft,
  BookOpen,
  ExternalLink,
  Globe,
  Layers3,
  Clock3,
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

function InfoCard({
  title,
  value,
  icon,
}: {
  title: string
  value: string
  icon: React.ReactNode
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-300">
        {icon}
      </div>
      <p className="text-sm text-zinc-400">{title}</p>
      <h3 className="mt-1 text-lg font-semibold text-white">{value}</h3>
    </div>
  )
}

export default async function LearnCoursePage({ params }: PageProps) {
  const { slug } = await params
  const { item, source, error } = await getLearnItem(slug)

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
            <h1 className="text-2xl font-semibold">Learning item not found</h1>
            <p className="mt-3 text-sm text-red-100">
              {error || "Unable to load this learning content."}
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

              <h1 className="max-w-4xl text-4xl font-semibold tracking-tight text-white md:text-5xl">
                {item.title}
              </h1>

              <p className="mt-4 max-w-3xl text-sm leading-7 text-zinc-300 md:text-base">
                {item.summary}
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                {item.products.slice(0, 3).map((product) => (
                  <span
                    key={product}
                    className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-zinc-300"
                  >
                    {product}
                  </span>
                ))}

                {item.roles.slice(0, 2).map((role) => (
                  <span
                    key={role}
                    className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-zinc-400"
                  >
                    {role}
                  </span>
                ))}
              </div>

              <div className="mt-8 flex flex-wrap gap-4">
                <a
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-2xl bg-cyan-400 px-5 py-3 text-sm font-semibold text-black transition hover:scale-[1.02]"
                >
                  Open Official Page
                  <ExternalLink className="h-4 w-4" />
                </a>

                <Link
                  href="/dashboard/cos/learn"
                  className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-3 text-sm text-white transition hover:bg-white/[0.08]"
                >
                  More Courses
                </Link>
              </div>
            </div>

            <div className="relative flex min-h-[320px] items-center justify-center border-t border-white/10 xl:border-l xl:border-t-0">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.16),transparent_35%),linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))]" />
              <div className="relative z-10 flex flex-col items-center text-center">
                <div className="mb-5 flex h-24 w-24 items-center justify-center rounded-3xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-300">
                  <BookOpen className="h-12 w-12" />
                </div>
                <p className="text-xl font-semibold text-white">{getLearnTypeLabel(item.type)}</p>
                <p className="mt-2 max-w-xs text-sm text-zinc-400">
                  Internal CreatorGoat learning detail view
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <InfoCard
            title="Content Type"
            value={getLearnTypeLabel(item.type)}
            icon={<Layers3 className="h-5 w-5" />}
          />
          <InfoCard
            title="Difficulty"
            value={item.level}
            icon={<BookOpen className="h-5 w-5" />}
          />
          <InfoCard
            title="Duration"
            value={formatDuration(item.durationInMinutes)}
            icon={<Clock3 className="h-5 w-5" />}
          />
          <InfoCard
            title="Locale"
            value={item.locale}
            icon={<Globe className="h-5 w-5" />}
          />
        </section>

        <section className="mt-8 rounded-[30px] border border-white/10 bg-white/[0.03] p-6">
          <h2 className="text-2xl font-semibold text-white">Course Summary</h2>
          <p className="mt-4 text-sm leading-7 text-zinc-300 md:text-base">
            {item.summary}
          </p>
        </section>
      </div>
    </div>
  )
}