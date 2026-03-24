"use client"

import { useMemo, useState } from "react"

const languages = [
  "English",
  "French",
  "Spanish",
  "Portuguese",
  "Arabic",
  "Hindi",
  "Creole",
]

const platformOptions = [
  "TikTok",
  "Instagram",
  "YouTube",
  "Website",
  "CreatorGoat",
]

const audienceOptions = [
  "Creators",
  "Entrepreneurs",
  "Students",
  "Beauty Buyers",
  "Business Owners",
  "Faith Audience",
]

function CourseAcademyVisual() {
  return (
    <div className="relative flex h-[340px] w-full items-center justify-center overflow-hidden rounded-[32px] border border-yellow-500/20 bg-[radial-gradient(circle_at_center,rgba(250,204,21,0.08),transparent_48%),linear-gradient(180deg,rgba(10,10,10,0.98),rgba(18,18,18,0.98))]">
      <div className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-yellow-500/10 blur-3xl" />

      <div className="absolute h-[250px] w-[250px] rounded-full border border-yellow-500/15 animate-spin [animation-duration:18s]" />
      <div className="absolute h-[180px] w-[180px] rounded-full border border-yellow-300/20 animate-spin [animation-direction:reverse] [animation-duration:12s]" />

      <div className="absolute left-[10%] top-[18%] rounded-full border border-yellow-400/20 bg-yellow-500/10 px-4 py-2 text-xs text-yellow-200/90 rotate-[-8deg] shadow-[0_0_30px_rgba(250,204,21,0.12)]">
        modules
      </div>
      <div className="absolute right-[10%] top-[24%] rounded-full border border-amber-400/20 bg-amber-500/10 px-4 py-2 text-xs text-amber-200/90 rotate-[8deg] shadow-[0_0_30px_rgba(250,204,21,0.12)]">
        lessons
      </div>
      <div className="absolute left-[12%] bottom-[20%] rounded-full border border-orange-400/20 bg-orange-500/10 px-4 py-2 text-xs text-orange-200/90 rotate-[6deg] shadow-[0_0_30px_rgba(250,204,21,0.12)]">
        offer
      </div>
      <div className="absolute right-[12%] bottom-[18%] rounded-full border border-yellow-300/20 bg-yellow-500/10 px-4 py-2 text-xs text-yellow-200/90 rotate-[-6deg] shadow-[0_0_30px_rgba(250,204,21,0.12)]">
        knowledge
      </div>

      <div className="relative flex h-40 w-32 items-center justify-center rounded-[28px] border border-yellow-300/30 bg-[linear-gradient(180deg,rgba(32,32,32,0.98),rgba(12,12,12,0.98))] shadow-[0_0_60px_rgba(250,204,21,0.24)]">
        <div className="absolute inset-3 rounded-[22px] border border-yellow-500/10 bg-[radial-gradient(circle_at_30%_30%,rgba(255,240,180,0.16),transparent_50%)]" />
        <div className="relative text-center">
          <p className="text-5xl">🎓</p>
          <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-yellow-300">
            Academy
          </p>
        </div>
      </div>

      <div className="absolute bottom-6 left-6 right-6">
        <div className="rounded-2xl border border-yellow-500/20 bg-black/35 p-4 backdrop-blur-sm">
          <p className="text-xs uppercase tracking-[0.22em] text-yellow-300/70">
            Course Intelligence Core
          </p>
          <p className="mt-2 text-sm text-zinc-300">
            Premium blueprint engine for modules, lessons, positioning, and course structure.
          </p>
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-yellow-500/20 bg-zinc-950 p-5">
      <p className="text-sm text-zinc-500">{label}</p>
      <p className="mt-2 text-2xl font-bold text-yellow-400">{value}</p>
    </div>
  )
}

export default function CoursePage() {
  const [topic, setTopic] = useState("")
  const [platform, setPlatform] = useState("TikTok")
  const [audience, setAudience] = useState("Creators")
  const [language, setLanguage] = useState("English")
  const [result, setResult] = useState("")
  const [loading, setLoading] = useState(false)

  const resultCount = useMemo(() => {
    if (!result.trim()) return 0
    return result
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean).length
  }, [result])

  async function handleGenerate() {
    try {
      setLoading(true)
      setResult("")

      const res = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tool: "course",
          topic,
          platform,
          audience,
          language,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setResult(data.error || "Something went wrong.")
        return
      }

      setResult((data.result || "").replace(/\*\*/g, ""))
    } catch {
      setResult("Failed to generate course.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full space-y-8">
      <section className="rounded-[32px] border border-yellow-500/20 bg-[radial-gradient(circle_at_top_left,rgba(250,204,21,0.14),transparent_28%),linear-gradient(180deg,rgba(24,24,24,0.98),rgba(10,10,10,0.98))] p-8">
        <div className="grid gap-8 xl:grid-cols-[1.15fr_0.85fr] xl:items-center">
          <div>
            <div className="mb-4 inline-flex items-center rounded-full border border-yellow-500/20 bg-yellow-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-yellow-300">
              CreatorGoat Course Builder
            </div>

            <h1 className="text-4xl font-bold tracking-tight text-yellow-400 sm:text-5xl">
              Course Builder
            </h1>

            <p className="mt-4 max-w-2xl text-base leading-7 text-zinc-400">
              Turn your knowledge into a premium course blueprint with stronger
              structure, better lesson flow, and clearer positioning for sales.
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <StatCard label="Mode" value="Premium" />
              <StatCard label="Output" value={`${resultCount}`} />
              <StatCard label="Focus" value="Blueprint" />
            </div>
          </div>

          <CourseAcademyVisual />
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-[30px] border border-yellow-500/20 bg-zinc-950 p-6 shadow-[0_0_40px_rgba(250,204,21,0.05)]">
          <div className="mb-6">
            <p className="text-xs uppercase tracking-[0.22em] text-yellow-300/70">
              Input Engine
            </p>
            <h2 className="mt-2 text-2xl font-bold text-yellow-400">
              Build your course request
            </h2>
            <p className="mt-2 text-sm text-zinc-400">
              Choose the course topic, platform, audience, and language to generate
              a stronger course structure.
            </p>
          </div>

          <div className="space-y-5">
            <div>
              <label className="mb-2 block text-sm text-zinc-400">Course Topic</label>
              <input
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Build a $10k TikTok brand"
                className="w-full rounded-2xl border border-zinc-700 bg-black px-4 py-3 text-white outline-none transition focus:border-yellow-400"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-zinc-400">Platform</label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                className="w-full rounded-2xl border border-zinc-700 bg-black px-4 py-3 text-white outline-none transition focus:border-yellow-400"
              >
                {platformOptions.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm text-zinc-400">Audience</label>
              <select
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
                className="w-full rounded-2xl border border-zinc-700 bg-black px-4 py-3 text-white outline-none transition focus:border-yellow-400"
              >
                {audienceOptions.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm text-zinc-400">Language</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full rounded-2xl border border-zinc-700 bg-black px-4 py-3 text-white outline-none transition focus:border-yellow-400"
              >
                {languages.map((lang) => (
                  <option key={lang} value={lang}>
                    🌍 {lang}
                  </option>
                ))}
              </select>
            </div>

            <div className="rounded-2xl border border-yellow-500/15 bg-yellow-500/5 p-4 text-sm text-zinc-300">
              This module is built for premium course outlines, modules, lessons,
              offers, curriculum structure, and creator knowledge products.
            </div>

            <button
              onClick={handleGenerate}
              disabled={loading || !topic.trim()}
              className="w-full rounded-2xl bg-yellow-400 px-5 py-3 font-semibold text-black transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Generating..." : "Generate Course"}
            </button>
          </div>
        </div>

        <div className="rounded-[30px] border border-yellow-500/20 bg-zinc-950 p-6 shadow-[0_0_40px_rgba(250,204,21,0.05)]">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-yellow-300/70">
                Output Panel
              </p>
              <h2 className="mt-2 text-2xl font-bold text-yellow-400">
                Course Blueprint
              </h2>
            </div>

            {result && (
              <button
                onClick={() => navigator.clipboard.writeText(result)}
                className="rounded-2xl bg-yellow-400 px-4 py-2 text-sm font-semibold text-black transition hover:opacity-90"
              >
                Copy Course
              </button>
            )}
          </div>

          <div className="mt-5 rounded-3xl border border-zinc-800 bg-black/30 p-5">
            <pre className="min-h-[420px] whitespace-pre-wrap text-sm leading-7 text-zinc-300">
              {result ||
                "Your course blueprint will appear here. Generate premium modules, lesson ideas, transformation promises, and stronger course structure for your creator offers."}
            </pre>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-zinc-800 bg-black/20 p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">
                Topic
              </p>
              <p className="mt-2 text-sm font-medium text-white">
                {topic || "Not selected"}
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-black/20 p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">
                Platform
              </p>
              <p className="mt-2 text-sm font-medium text-white">{platform}</p>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-black/20 p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">
                Audience
              </p>
              <p className="mt-2 text-sm font-medium text-white">{audience}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}