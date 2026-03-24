import Link from "next/link"
import {
  ChevronLeft,
  ChevronRight,
  Clock3,
  ExternalLink,
  FolderHeart,
  Trophy,
  Video,
} from "lucide-react"
import {
  fallbackLearnItems,
  formatDuration,
  getLearnTypeLabel,
  getLevelBadgeColor,
  getTypeBadgeColor,
} from "@/lib/learn-data"

export default function SavedLearnPage() {
  const savedItems = fallbackLearnItems

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
        </div>

        <section className="relative overflow-hidden rounded-[34px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(250,204,21,0.12),transparent_28%),radial-gradient(circle_at_top_right,rgba(34,211,238,0.12),transparent_22%),linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] p-6 md:p-8 xl:p-10">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:38px_38px] opacity-20" />

          <div className="relative z-10 grid gap-6 xl:grid-cols-[1.2fr_0.8fr] xl:items-end">
            <div className="space-y-4">
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-yellow-400/20 bg-yellow-400/10 px-4 py-2 text-sm text-yellow-200">
                <FolderHeart className="h-4 w-4" />
                Saved Learning Vault
              </div>

              <div>
                <h1 className="text-4xl font-semibold tracking-tight md:text-5xl xl:text-6xl">
                  Saved Courses
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-zinc-300 md:text-base">
                  Your premium saved learning area. Keep your best technical and
                  professional content organized in one clean system.
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3 xl:grid-cols-1">
              <div className="rounded-3xl border border-white/10 bg-black/20 p-5 backdrop-blur-md">
                <p className="text-sm text-zinc-400">Saved Items</p>
                <h3 className="mt-2 text-2xl font-semibold">
                  {savedItems.length}
                </h3>
              </div>

              <div className="rounded-3xl border border-white/10 bg-black/20 p-5 backdrop-blur-md">
                <p className="text-sm text-zinc-400">Video Preview</p>
                <h3 className="mt-2 text-2xl font-semibold">
                  {savedItems.filter((item) => item.videoPreviewUrl).length}
                </h3>
              </div>

              <div className="rounded-3xl border border-white/10 bg-black/20 p-5 backdrop-blur-md">
                <p className="text-sm text-zinc-400">Types</p>
                <h3 className="mt-2 text-2xl font-semibold">
                  {new Set(savedItems.map((item) => item.type)).size}
                </h3>
              </div>
            </div>
          </div>
        </section>

        {savedItems.length > 0 ? (
          <section className="grid gap-5 xl:grid-cols-2">
            {savedItems.map((item) => {
              const typeBadge = getTypeBadgeColor(item.type)
              const levelBadge = getLevelBadgeColor(item.level)

              return (
                <div
                  key={item.id}
                  className="overflow-hidden rounded-[28px] border border-white/10 bg-gradient-to-b from-white/[0.05] to-white/[0.02] transition-all hover:-translate-y-1 hover:border-cyan-400/20 hover:shadow-[0_16px_60px_rgba(0,0,0,0.35)]"
                >
                  <div className="relative h-52 w-full overflow-hidden bg-[#08101f]">
                    {item.videoPreviewUrl ? (
                      <video
                        src={item.videoPreviewUrl}
                        className="h-full w-full object-cover"
                        autoPlay
                        muted
                        loop
                        playsInline
                      />
                    ) : (
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="h-full w-full object-cover"
                      />
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                    <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                      <span
                        className={`rounded-full border px-3 py-1 text-xs ${typeBadge}`}
                      >
                        {getLearnTypeLabel(item.type)}
                      </span>
                      <span
                        className={`rounded-full border px-3 py-1 text-xs ${levelBadge}`}
                      >
                        {item.level}
                      </span>
                    </div>

                    {item.videoPreviewUrl && (
                      <div className="absolute bottom-4 right-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-3 py-1 text-xs text-white backdrop-blur-md">
                        <Video className="h-3.5 w-3.5" />
                        Preview
                      </div>
                    )}
                  </div>

                  <div className="space-y-4 p-5">
                    <div>
                      <h2 className="text-xl font-semibold text-white">
                        {item.title}
                      </h2>
                      <p className="mt-1 text-sm text-zinc-400">
                        {item.provider}
                      </p>
                    </div>

                    <p className="text-sm leading-6 text-zinc-400">
                      {item.summary}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-400">
                      <span className="inline-flex items-center gap-2">
                        <Clock3 className="h-4 w-4" />
                        {formatDuration(item.durationInMinutes)}
                      </span>

                      <span className="inline-flex items-center gap-2">
                        <FolderHeart className="h-4 w-4" />
                        Saved
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 pt-2">
                      <Link
                        href={`/dashboard/learn/course/${item.slug}`}
                        className="inline-flex items-center gap-2 rounded-2xl bg-cyan-400 px-4 py-2 text-sm font-medium text-black transition hover:scale-[1.02]"
                      >
                        Open Details
                        <ChevronRight className="h-4 w-4" />
                      </Link>

                      <a
                        href={item.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-zinc-200 transition hover:bg-white/[0.08]"
                      >
                        Source
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </div>
                  </div>
                </div>
              )
            })}
          </section>
        ) : (
          <section className="rounded-[28px] border border-dashed border-white/10 bg-white/[0.02] p-10 text-center">
            <Trophy className="mx-auto mb-4 h-10 w-10 text-zinc-500" />
            <h2 className="text-2xl font-semibold text-white">
              No saved content yet
            </h2>
            <p className="mt-3 text-sm text-zinc-400">
              Start building your learning vault.
            </p>
          </section>
        )}
      </div>
    </div>
  )
}