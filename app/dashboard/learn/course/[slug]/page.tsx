import Link from "next/link"
import { notFound } from "next/navigation"
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Clock3,
  ExternalLink,
  FolderHeart,
  Globe,
  PlayCircle,
  Sparkles,
  Tag,
  Trophy,
  User,
  Video,
} from "lucide-react"
import {
  formatDuration,
  getLearnItemBySlug,
  getLearnTypeLabel,
  getLevelBadgeColor,
  getTypeBadgeColor,
  fallbackLearnItems,
} from "@/lib/learn-data"
import { getLearnCatalog } from "@/lib/microsoft-learn"

type PageProps = {
  params: Promise<{
    slug: string
  }>
}

type LearnItemSafe = {
  id: string
  slug: string
  title: string
  summary: string
  type: string
  level: string
  provider: string
  locale: string
  url: string
  durationInMinutes: number
  products: string[]
  roles: string[]
  skills?: string[]
  videoPreviewUrl?: string
  imageUrl?: string
}

function normalizeLearnItem(raw: any): LearnItemSafe {
  return {
    id: String(raw?.id ?? ""),
    slug: String(raw?.slug ?? ""),
    title: String(raw?.title ?? "Untitled"),
    summary: String(raw?.summary ?? ""),
    type: String(raw?.type ?? "module"),
    level: String(raw?.level ?? "Beginner"),
    provider: String(raw?.provider ?? "Microsoft Learn"),
    locale: String(raw?.locale ?? "en-us"),
    url: String(raw?.url ?? "#"),
    durationInMinutes:
      typeof raw?.durationInMinutes === "number" ? raw.durationInMinutes : 0,
    products: Array.isArray(raw?.products)
      ? raw.products.filter((value: unknown) => typeof value === "string")
      : [],
    roles: Array.isArray(raw?.roles)
      ? raw.roles.filter((value: unknown) => typeof value === "string")
      : [],
    skills: Array.isArray(raw?.skills)
      ? raw.skills.filter((value: unknown) => typeof value === "string")
      : [],
    videoPreviewUrl:
      typeof raw?.videoPreviewUrl === "string" ? raw.videoPreviewUrl : undefined,
    imageUrl: typeof raw?.imageUrl === "string" ? raw.imageUrl : undefined,
  }
}

export default async function LearnCourseDetailPage({ params }: PageProps) {
  const { slug } = await params

  const catalog = await getLearnCatalog({
    query: "",
    type: "",
    limit: 24,
    locale: "en-us",
  })

  const rawItems =
    Array.isArray(catalog?.items) && catalog.items.length > 0
      ? catalog.items
      : fallbackLearnItems

  const items = rawItems.map(normalizeLearnItem)
  const item = getLearnItemBySlug(items, slug) as LearnItemSafe | undefined

  if (!item) {
    notFound()
  }

  const itemProducts = Array.isArray(item.products) ? item.products : []
  const itemRoles = Array.isArray(item.roles) ? item.roles : []
  const itemSkills = Array.isArray(item.skills) ? item.skills : []

  const relatedItems = items
    .filter((course) => course.slug !== item.slug)
    .filter((course) => {
      const courseProducts = Array.isArray(course.products) ? course.products : []
      const courseRoles = Array.isArray(course.roles) ? course.roles : []

      const sameProduct = courseProducts.some((product) =>
        itemProducts.includes(product)
      )
      const sameRole = courseRoles.some((role) => itemRoles.includes(role))
      const sameType = course.type === item.type

      return sameProduct || sameRole || sameType
    })
    .slice(0, 3)

  const typeBadge = getTypeBadgeColor(item.type)
  const levelBadge = getLevelBadgeColor(item.level)
  const typeLabel = getLearnTypeLabel(item.type)

  return (
    <div className="min-h-screen w-full bg-[#050816] text-white">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-6 md:px-6 xl:px-8">
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/dashboard/learn"
            className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-zinc-200 transition hover:bg-white/[0.08]"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Learn
          </Link>

          <Link
            href="/dashboard/learn/saved"
            className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-zinc-200 transition hover:bg-white/[0.08]"
          >
            <FolderHeart className="h-4 w-4" />
            Saved
          </Link>
        </div>

        <section className="relative overflow-hidden rounded-[34px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.16),transparent_26%),radial-gradient(circle_at_top_right,rgba(59,130,246,0.14),transparent_22%),linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] p-6 md:p-8 xl:p-10">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:38px_38px] opacity-20" />

          <div className="relative z-10 grid gap-8 xl:grid-cols-[1.15fr_0.85fr] xl:items-end">
            <div className="space-y-5">
              <div className="flex flex-wrap items-center gap-3">
                <span
                  className={`rounded-full border px-4 py-2 text-sm ${typeBadge}`}
                >
                  {typeLabel}
                </span>

                <span
                  className={`rounded-full border px-4 py-2 text-sm ${levelBadge}`}
                >
                  {item.level}
                </span>

                <span className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-zinc-300">
                  {item.provider}
                </span>
              </div>

              <div>
                <h1 className="max-w-4xl text-4xl font-semibold tracking-tight md:text-5xl xl:text-6xl">
                  {item.title}
                </h1>
                <p className="mt-4 max-w-3xl text-sm leading-7 text-zinc-300 md:text-base">
                  {item.summary}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-300">
                <span className="inline-flex items-center gap-2">
                  <Clock3 className="h-4 w-4" />
                  {formatDuration(item.durationInMinutes)}
                </span>

                <span className="inline-flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  {item.locale}
                </span>

                <span className="inline-flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  {typeLabel}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <a
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-2xl bg-cyan-400 px-5 py-3 text-sm font-semibold text-black transition hover:scale-[1.02]"
                >
                  Start on Microsoft Learn
                  <ExternalLink className="h-4 w-4" />
                </a>

                <Link
                  href="/dashboard/learn"
                  className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-3 text-sm text-white transition hover:bg-white/[0.08]"
                >
                  Explore More
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            <div className="overflow-hidden rounded-3xl border border-white/10 bg-black/20 backdrop-blur-md">
              <div className="relative h-72 w-full overflow-hidden bg-[#08101f]">
                {item.videoPreviewUrl ? (
                  <video
                    src={item.videoPreviewUrl}
                    className="h-full w-full object-cover"
                    autoPlay
                    muted
                    loop
                    playsInline
                  />
                ) : item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <PlayCircle className="h-16 w-16 text-cyan-300" />
                  </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                  <span className="rounded-full border border-white/10 bg-black/40 px-3 py-1 text-xs text-white backdrop-blur-md">
                    Professional Preview
                  </span>

                  {item.videoPreviewUrl && (
                    <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-3 py-1 text-xs text-white backdrop-blur-md">
                      <Video className="h-3.5 w-3.5" />
                      Video Preview
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-3 p-5">
                <p className="text-sm text-zinc-400">Learning Source</p>
                <h3 className="text-xl font-semibold">{item.provider}</h3>
                <p className="text-sm text-zinc-400">
                  Real professional learning content with structured metadata,
                  product tags, role tags, and direct source access.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <div className="rounded-[30px] border border-white/10 bg-white/[0.03] p-5 md:p-6">
              <div className="mb-5">
                <h2 className="text-2xl font-semibold tracking-tight">
                  Overview
                </h2>
                <p className="mt-1 text-sm text-zinc-400">
                  Clean structured detail view for this learning content.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-sm text-zinc-400">Content Type</p>
                  <h3 className="mt-1 text-lg font-semibold">{typeLabel}</h3>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-sm text-zinc-400">Level</p>
                  <h3 className="mt-1 text-lg font-semibold">{item.level}</h3>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-sm text-zinc-400">Duration</p>
                  <h3 className="mt-1 text-lg font-semibold">
                    {formatDuration(item.durationInMinutes)}
                  </h3>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-sm text-zinc-400">Locale</p>
                  <h3 className="mt-1 text-lg font-semibold">{item.locale}</h3>
                </div>
              </div>

              <div className="mt-6 rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(34,211,238,0.08),rgba(255,255,255,0.03))] p-5">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-200">
                  <Sparkles className="h-4 w-4" />
                  Why this matters
                </div>

                <p className="text-sm leading-7 text-zinc-300">
                  This learning content helps build real skill capital. It gives
                  you a structured path in technical or professional growth so
                  you are not learning randomly. Use it to stack skills, improve
                  execution, and strengthen your long-term system.
                </p>
              </div>
            </div>

            <div className="rounded-[30px] border border-white/10 bg-white/[0.03] p-5 md:p-6">
              <div className="mb-5">
                <h2 className="text-2xl font-semibold tracking-tight">
                  Products
                </h2>
                <p className="mt-1 text-sm text-zinc-400">
                  Core platforms and tools connected to this content.
                </p>
              </div>

              {itemProducts.length > 0 ? (
                <div className="flex flex-wrap gap-3">
                  {itemProducts.map((product) => (
                    <span
                      key={product}
                      className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-zinc-200"
                    >
                      {product}
                    </span>
                  ))}
                </div>
              ) : (
                <div className="rounded-[24px] border border-dashed border-white/10 bg-white/[0.02] p-6 text-sm text-zinc-400">
                  No product tags available for this item.
                </div>
              )}
            </div>

            <div className="rounded-[30px] border border-white/10 bg-white/[0.03] p-5 md:p-6">
              <div className="mb-5">
                <h2 className="text-2xl font-semibold tracking-tight">Roles</h2>
                <p className="mt-1 text-sm text-zinc-400">
                  Professional roles related to this content.
                </p>
              </div>

              {itemRoles.length > 0 ? (
                <div className="flex flex-wrap gap-3">
                  {itemRoles.map((role) => (
                    <span
                      key={role}
                      className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-zinc-200"
                    >
                      <User className="h-4 w-4" />
                      {role}
                    </span>
                  ))}
                </div>
              ) : (
                <div className="rounded-[24px] border border-dashed border-white/10 bg-white/[0.02] p-6 text-sm text-zinc-400">
                  No role tags available for this item.
                </div>
              )}
            </div>

            {itemSkills.length > 0 && (
              <div className="rounded-[30px] border border-white/10 bg-white/[0.03] p-5 md:p-6">
                <div className="mb-5">
                  <h2 className="text-2xl font-semibold tracking-tight">
                    Skills
                  </h2>
                  <p className="mt-1 text-sm text-zinc-400">
                    Related skill areas connected to this content.
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  {itemSkills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-zinc-200"
                    >
                      <Tag className="h-4 w-4" />
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="rounded-[30px] border border-white/10 bg-white/[0.03] p-5 md:p-6">
              <div className="mb-5">
                <h2 className="text-2xl font-semibold tracking-tight">
                  Quick Actions
                </h2>
              </div>

              <div className="space-y-3">
                <a
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4 text-sm text-zinc-200 transition hover:bg-white/[0.06]"
                >
                  <span className="inline-flex items-center gap-2">
                    <ExternalLink className="h-4 w-4" />
                    Open on Microsoft Learn
                  </span>
                  <ChevronRight className="h-4 w-4" />
                </a>

                <Link
                  href="/dashboard/learn"
                  className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4 text-sm text-zinc-200 transition hover:bg-white/[0.06]"
                >
                  <span className="inline-flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    Explore More Learning
                  </span>
                  <ChevronRight className="h-4 w-4" />
                </Link>

                <Link
                  href="/dashboard/learn/saved"
                  className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4 text-sm text-zinc-200 transition hover:bg-white/[0.06]"
                >
                  <span className="inline-flex items-center gap-2">
                    <FolderHeart className="h-4 w-4" />
                    Go to Saved Area
                  </span>
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            <div className="rounded-[30px] border border-white/10 bg-white/[0.03] p-5 md:p-6">
              <div className="mb-5">
                <h2 className="text-2xl font-semibold tracking-tight">
                  Related Content
                </h2>
                <p className="mt-1 text-sm text-zinc-400">
                  Nearby learning content from the same system.
                </p>
              </div>

              <div className="space-y-4">
                {relatedItems.length > 0 ? (
                  relatedItems.map((related) => (
                    <Link
                      key={related.id}
                      href={`/dashboard/learn/course/${related.slug}`}
                      className="block rounded-[24px] border border-white/10 bg-white/[0.03] p-4 transition hover:border-cyan-400/20 hover:bg-white/[0.05]"
                    >
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded-full border px-3 py-1 text-xs ${getTypeBadgeColor(
                            related.type
                          )}`}
                        >
                          {getLearnTypeLabel(related.type)}
                        </span>

                        <span
                          className={`rounded-full border px-3 py-1 text-xs ${getLevelBadgeColor(
                            related.level
                          )}`}
                        >
                          {related.level}
                        </span>
                      </div>

                      <h3 className="line-clamp-2 text-lg font-semibold text-white">
                        {related.title}
                      </h3>
                      <p className="mt-2 line-clamp-2 text-sm text-zinc-400">
                        {related.summary}
                      </p>

                      <div className="mt-4 inline-flex items-center gap-2 text-sm text-cyan-300">
                        Open details
                        <ChevronRight className="h-4 w-4" />
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="rounded-[24px] border border-dashed border-white/10 bg-white/[0.02] p-6 text-sm text-zinc-400">
                    No related content found yet.
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(250,204,21,0.08),rgba(255,255,255,0.03))] p-5 md:p-6">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-yellow-400/20 bg-yellow-400/10 px-4 py-2 text-sm text-yellow-200">
                <Trophy className="h-4 w-4" />
                CEO Reminder
              </div>

              <h2 className="text-2xl font-semibold tracking-tight">
                Build skill capital daily
              </h2>
              <p className="mt-3 text-sm leading-7 text-zinc-300">
                One lesson, one module, one learning path at a time. Real skill
                compounds when you stay consistent and keep stacking knowledge in
                the right direction.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}