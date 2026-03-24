"use client"

import { useMemo, useState } from "react"
import {
  CalendarDays,
  Sparkles,
  Globe,
  Target,
  Copy,
  Trash2,
  Activity,
  Cpu,
  Zap,
  Rocket,
  ChevronRight,
  Shield,
  Layers3,
  Clapperboard,
  NotebookPen,
  Flame,
} from "lucide-react"
import { saveToHistory } from "@/lib/history"

const quickNiches = [
  "Faith discipline",
  "Luxury lifestyle",
  "Business mindset",
  "AI education",
  "Skincare brand",
  "Creator growth",
]

const quickPlatforms = ["TikTok", "Instagram", "YouTube", "Facebook", "X"]

const quickGoals = [
  "Go viral",
  "Increase sales",
  "Build authority",
  "Boost engagement",
  "Grow followers",
  "Launch products",
]

const quickFrequencies = [
  "1 post per day",
  "2 posts per day",
  "3 posts per day",
  "5 posts per week",
]

const quickStyles = [
  "Luxury",
  "Motivational",
  "Faith-based",
  "CEO",
  "Educational",
  "Soft sell",
]

type DayCard = {
  day: string
  topic: string
  hook: string
  contentIdea: string
  captionAngle: string
  cta: string
}

export default function AIContentCalendarPage() {
  const [niche, setNiche] = useState("")
  const [platform, setPlatform] = useState("")
  const [goal, setGoal] = useState("")
  const [postingFrequency, setPostingFrequency] = useState("")
  const [contentStyle, setContentStyle] = useState("")
  const [language, setLanguage] = useState("English")
  const [result, setResult] = useState("")
  const [loading, setLoading] = useState(false)

  const calendarScore = useMemo(() => {
    let score = 0
    if (niche) score += 20
    if (platform) score += 20
    if (goal) score += 20
    if (postingFrequency) score += 20
    if (contentStyle) score += 10
    if (language) score += 10
    return score
  }, [niche, platform, goal, postingFrequency, contentStyle, language])

  const statusLabel = useMemo(() => {
    if (calendarScore >= 90) return "Elite"
    if (calendarScore >= 70) return "Strong"
    if (calendarScore >= 40) return "Building"
    return "Idle"
  }, [calendarScore])

  const generateCalendar = async () => {
    if (!niche || !platform || !goal || !postingFrequency || !contentStyle) {
      setResult("Please fill all fields.")
      return
    }

    try {
      setLoading(true)
      setResult("")

      const res = await fetch("/api/ai-content-calendar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          niche,
          platform,
          goal,
          postingFrequency,
          contentStyle,
          language,
        }),
      })

      const data = await res.json()
      const output = data.result || data.error || "No content calendar generated."

      setResult(output)

      if (data.result) {
        await saveToHistory({
          module: "AI Content Calendar",
          title: `${niche || "General"} Content Calendar`,
          input: {
            niche,
            platform,
            goal,
            postingFrequency,
            contentStyle,
            language,
          },
          output: data.result,
        })
      }
    } catch {
      setResult("Something went wrong.")
    } finally {
      setLoading(false)
    }
  }

  const clearAll = () => {
    setNiche("")
    setPlatform("")
    setGoal("")
    setPostingFrequency("")
    setContentStyle("")
    setLanguage("English")
    setResult("")
  }

  const copyResult = async () => {
    if (!result) return
    await navigator.clipboard.writeText(result)
  }

  const extractBlock = (label: string, nextLabels: string[]) => {
    if (!result) return ""
    const escapedLabel = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    const nextPattern = nextLabels
      .map((l) => l.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
      .join("|")

    const regex = new RegExp(
      `${escapedLabel}:\\s*([\\s\\S]*?)(?=\\n(?:${nextPattern}):|$)`,
      "i"
    )
    const match = result.match(regex)
    return match ? match[1].trim() : ""
  }

  const extractField = (block: string, label: string) => {
    const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    const regex = new RegExp(
      `${escaped}:\\s*([\\s\\S]*?)(?=\\n[A-Za-z][A-Za-z ]+:|$)`,
      "i"
    )
    const match = block.match(regex)
    return match ? match[1].trim() : ""
  }

  const weeklyStrategy = extractBlock("WEEKLY STRATEGY", ["DAY 1"])

  const days: DayCard[] = Array.from({ length: 7 }, (_, i) => {
    const day = `DAY ${i + 1}`
    const next =
      i < 6 ? [`DAY ${i + 2}`] : ["BONUS CONTENT IDEAS", "BEST POSTING DIRECTION"]
    const block = extractBlock(day, next)

    return {
      day,
      topic: extractField(block, "Topic"),
      hook: extractField(block, "Hook"),
      contentIdea: extractField(block, "Content Idea"),
      captionAngle: extractField(block, "Caption Angle"),
      cta: extractField(block, "CTA"),
    }
  })

  const bonusIdeas = extractBlock("BONUS CONTENT IDEAS", ["BEST POSTING DIRECTION"])
  const bestPostingDirection = extractBlock("BEST POSTING DIRECTION", [])

  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(250,204,21,0.16),transparent_20%),radial-gradient(circle_at_top_right,rgba(245,158,11,0.10),transparent_18%),radial-gradient(circle_at_bottom_center,rgba(234,179,8,0.10),transparent_26%)]" />
        <div className="absolute left-[-120px] top-[-120px] h-[360px] w-[360px] rounded-full bg-yellow-400/10 blur-3xl" />
        <div className="absolute right-[-120px] top-[60px] h-[320px] w-[320px] rounded-full bg-amber-400/10 blur-3xl" />
        <div className="absolute bottom-[-150px] left-[18%] h-[330px] w-[330px] rounded-full bg-yellow-500/10 blur-3xl" />
        <div className="absolute inset-0 opacity-[0.05] [background-image:linear-gradient(to_right,#facc15_1px,transparent_1px),linear-gradient(to_bottom,#facc15_1px,transparent_1px)] [background-size:88px_88px]" />
      </div>

      <div className="relative z-10 space-y-8 p-4 md:p-6 xl:p-8">
        <div className="grid gap-6 xl:grid-cols-[1.45fr_0.95fr]">
          <div className="relative overflow-hidden rounded-[32px] border border-yellow-500/20 bg-gradient-to-br from-[#090909] via-black to-[#121212] p-6 md:p-8 xl:p-10 shadow-[0_0_60px_rgba(234,179,8,0.08)]">
            <div className="absolute right-0 top-0 h-52 w-52 rounded-full bg-yellow-500/10 blur-3xl" />
            <div className="absolute bottom-0 left-0 h-36 w-36 rounded-full bg-yellow-400/10 blur-3xl" />

            <div className="flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-yellow-500/20 bg-yellow-500/10 px-3 py-1.5 text-[11px] uppercase tracking-[0.28em] text-yellow-300">
                <CalendarDays className="h-3.5 w-3.5" />
                COS MODULE
              </div>

              <div className="inline-flex items-center gap-2 rounded-full border border-yellow-500/10 bg-zinc-900/80 px-3 py-1.5 text-xs text-zinc-300">
                <Sparkles className="h-3.5 w-3.5 text-yellow-400" />
                Content Planning Engine
              </div>

              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs text-emerald-300">
                <Activity className="h-3.5 w-3.5" />
                System Active
              </div>
            </div>

            <h1 className="mt-6 max-w-4xl text-4xl font-extrabold tracking-tight text-yellow-400 md:text-5xl xl:text-6xl">
              AI Content Calendar
            </h1>

            <p className="mt-4 max-w-3xl text-sm leading-8 text-zinc-400 md:text-base">
              Build a premium weekly content calendar with hooks, content ideas,
              caption direction, and CTAs tailored to your niche, platform, and goal.
            </p>

            <div className="mt-8 flex flex-wrap gap-2">
              {[
                "weekly strategy",
                "daily content",
                "hook planning",
                "caption direction",
                "CTA flow",
              ].map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-yellow-500/20 bg-yellow-500/10 px-3 py-1.5 text-xs text-yellow-200"
                >
                  {item}
                </span>
              ))}
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-4">
              <div className="rounded-2xl border border-yellow-500/15 bg-black/60 p-4 backdrop-blur-sm">
                <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-yellow-500/70">
                  <Cpu className="h-4 w-4" />
                  Engine
                </div>
                <p className="mt-3 text-2xl font-bold text-yellow-400">Elite</p>
              </div>

              <div className="rounded-2xl border border-yellow-500/15 bg-black/60 p-4 backdrop-blur-sm">
                <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-yellow-500/70">
                  <CalendarDays className="h-4 w-4" />
                  Signal
                </div>
                <p className="mt-3 text-2xl font-bold text-white">{statusLabel}</p>
              </div>

              <div className="rounded-2xl border border-yellow-500/15 bg-black/60 p-4 backdrop-blur-sm">
                <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-yellow-500/70">
                  <Zap className="h-4 w-4" />
                  Plan Power
                </div>
                <p className="mt-3 text-2xl font-bold text-white">{calendarScore}%</p>
              </div>

              <div className="rounded-2xl border border-yellow-500/15 bg-black/60 p-4 backdrop-blur-sm">
                <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-yellow-500/70">
                  <Rocket className="h-4 w-4" />
                  Focus
                </div>
                <p className="mt-3 text-2xl font-bold text-white">Weekly</p>
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[32px] border border-yellow-500/20 bg-gradient-to-br from-[#0a0a0a] via-black to-[#101010] p-6 md:p-8 shadow-[0_0_60px_rgba(234,179,8,0.06)]">
            <div className="absolute inset-0 opacity-60">
              <div className="absolute left-1/2 top-1/2 h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full border border-yellow-500/10" />
              <div className="absolute left-1/2 top-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full border border-yellow-500/10" />
            </div>

            <div className="relative z-10 flex h-full flex-col justify-between">
              <div className="flex flex-wrap gap-2">
                {["days", "hooks", "topics", "captions"].map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-yellow-500/20 bg-yellow-500/10 px-3 py-1 text-xs text-yellow-200"
                  >
                    {item}
                  </span>
                ))}
              </div>

              <div className="rounded-[28px] border border-yellow-500/15 bg-black/65 p-6 backdrop-blur-sm">
                <p className="text-xs uppercase tracking-[0.28em] text-yellow-500/70">
                  Calendar Core
                </p>

                <h2 className="mt-3 text-2xl font-bold text-yellow-400 md:text-3xl">
                  Weekly Planning Intelligence
                </h2>

                <p className="mt-4 text-sm leading-8 text-zinc-400">
                  This module turns your niche, platform, and goal into a structured weekly plan
                  so creators do not waste time guessing what to post next.
                </p>

                <div className="mt-6 grid gap-3">
                  <div className="flex items-center justify-between rounded-2xl border border-yellow-500/10 bg-zinc-950/80 px-4 py-3">
                    <span className="text-sm text-zinc-400">Daily Topics</span>
                    <span className="font-semibold text-yellow-300">Ready</span>
                  </div>

                  <div className="flex items-center justify-between rounded-2xl border border-yellow-500/10 bg-zinc-950/80 px-4 py-3">
                    <span className="text-sm text-zinc-400">Hook Planning</span>
                    <span className="font-semibold text-yellow-300">Active</span>
                  </div>

                  <div className="flex items-center justify-between rounded-2xl border border-yellow-500/10 bg-zinc-950/80 px-4 py-3">
                    <span className="text-sm text-zinc-400">CTA Flow</span>
                    <span className="font-semibold text-yellow-300">High</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-8 xl:grid-cols-[500px_minmax(0,1fr)]">
          <div className="rounded-[32px] border border-yellow-500/20 bg-zinc-950/95 p-6 md:p-7 shadow-[0_0_50px_rgba(234,179,8,0.07)]">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/10 p-3 text-yellow-400">
                <NotebookPen className="h-5 w-5" />
              </div>

              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-yellow-500/70">
                  Input Engine
                </p>
                <h2 className="mt-1 text-xl font-bold text-white">
                  Build your weekly plan
                </h2>
              </div>
            </div>

            <p className="mt-4 text-sm leading-7 text-zinc-400">
              Enter your niche, platform, goal, posting frequency, content style,
              and language to generate a 7-day AI content calendar.
            </p>

            <div className="mt-7 space-y-5">
              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-yellow-300">
                  <Layers3 className="h-4 w-4" />
                  Niche
                </label>
                <input
                  value={niche}
                  onChange={(e) => setNiche(e.target.value)}
                  placeholder="Luxury lifestyle"
                  className="w-full rounded-2xl border border-yellow-500/20 bg-black px-4 py-4 text-white outline-none transition focus:border-yellow-400/50"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                {quickNiches.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setNiche(item)}
                    className="rounded-full border border-yellow-500/20 bg-yellow-500/5 px-3 py-1.5 text-xs text-yellow-200 transition hover:bg-yellow-500/10"
                  >
                    {item}
                  </button>
                ))}
              </div>

              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-yellow-300">
                  <Clapperboard className="h-4 w-4" />
                  Platform
                </label>
                <input
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value)}
                  placeholder="TikTok"
                  className="w-full rounded-2xl border border-yellow-500/20 bg-black px-4 py-4 text-white outline-none transition focus:border-yellow-400/50"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                {quickPlatforms.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setPlatform(item)}
                    className="rounded-full border border-yellow-500/20 bg-yellow-500/5 px-3 py-1.5 text-xs text-yellow-200 transition hover:bg-yellow-500/10"
                  >
                    {item}
                  </button>
                ))}
              </div>

              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-yellow-300">
                  <Target className="h-4 w-4" />
                  Goal
                </label>
                <input
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  placeholder="Build authority"
                  className="w-full rounded-2xl border border-yellow-500/20 bg-black px-4 py-4 text-white outline-none transition focus:border-yellow-400/50"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                {quickGoals.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setGoal(item)}
                    className="rounded-full border border-yellow-500/20 bg-yellow-500/5 px-3 py-1.5 text-xs text-yellow-200 transition hover:bg-yellow-500/10"
                  >
                    {item}
                  </button>
                ))}
              </div>

              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-yellow-300">
                  <CalendarDays className="h-4 w-4" />
                  Posting Frequency
                </label>
                <input
                  value={postingFrequency}
                  onChange={(e) => setPostingFrequency(e.target.value)}
                  placeholder="1 post per day"
                  className="w-full rounded-2xl border border-yellow-500/20 bg-black px-4 py-4 text-white outline-none transition focus:border-yellow-400/50"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                {quickFrequencies.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setPostingFrequency(item)}
                    className="rounded-full border border-yellow-500/20 bg-yellow-500/5 px-3 py-1.5 text-xs text-yellow-200 transition hover:bg-yellow-500/10"
                  >
                    {item}
                  </button>
                ))}
              </div>

              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-yellow-300">
                  <Flame className="h-4 w-4" />
                  Content Style
                </label>
                <input
                  value={contentStyle}
                  onChange={(e) => setContentStyle(e.target.value)}
                  placeholder="Luxury"
                  className="w-full rounded-2xl border border-yellow-500/20 bg-black px-4 py-4 text-white outline-none transition focus:border-yellow-400/50"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                {quickStyles.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setContentStyle(item)}
                    className="rounded-full border border-yellow-500/20 bg-yellow-500/5 px-3 py-1.5 text-xs text-yellow-200 transition hover:bg-yellow-500/10"
                  >
                    {item}
                  </button>
                ))}
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-yellow-300">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full border border-yellow-500/20 bg-yellow-500/10 text-yellow-400">
                    <Globe className="h-4 w-4" />
                  </div>
                  🌍 Language
                </label>

                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full rounded-2xl border border-yellow-500/20 bg-black px-4 py-4 text-white outline-none transition focus:border-yellow-400/50"
                >
                  <option>English</option>
                  <option>French</option>
                  <option>Spanish</option>
                  <option>Portuguese</option>
                  <option>Haitian Creole</option>
                </select>
              </div>

              <div className="grid gap-3 pt-3 sm:grid-cols-2">
                <button
                  onClick={generateCalendar}
                  disabled={loading}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-500 px-4 py-4 font-bold text-black transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <CalendarDays className="h-4 w-4" />
                  {loading ? "Generating..." : "Generate Calendar"}
                </button>

                <button
                  onClick={clearAll}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-yellow-500/25 bg-black px-4 py-4 font-semibold text-yellow-300 transition hover:bg-yellow-500/5"
                >
                  <Trash2 className="h-4 w-4" />
                  Clear
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-5">
            <div className="rounded-[28px] border border-yellow-500/20 bg-zinc-950/95 p-6 shadow-[0_0_40px_rgba(234,179,8,0.06)]">
              <div className="mb-5 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-yellow-500/70">
                    Output Panel
                  </p>
                  <h2 className="mt-1 text-2xl font-bold text-white">
                    Weekly Calendar
                  </h2>
                </div>

                <div className="flex flex-wrap gap-2">
                  {result && (
                    <button
                      onClick={copyResult}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl bg-yellow-400 px-4 py-2.5 text-sm font-bold text-black transition hover:scale-[1.02]"
                    >
                      <Copy className="h-4 w-4" />
                      Copy
                    </button>
                  )}

                  <div className="inline-flex items-center gap-2 rounded-2xl border border-yellow-500/20 bg-black px-4 py-2.5 text-sm text-zinc-300">
                    <Shield className="h-4 w-4 text-yellow-400" />
                    Premium Output
                  </div>
                </div>
              </div>

              {!result && !loading && (
                <div className="relative min-h-[760px] overflow-hidden rounded-[24px] border border-yellow-500/10 bg-black">
                  <div className="relative z-10 flex min-h-[760px] flex-col items-center justify-center px-6 text-center">
                    <div className="mb-6 rounded-full border border-yellow-500/20 bg-yellow-500/10 p-5 text-yellow-400">
                      <CalendarDays className="h-9 w-9" />
                    </div>
                    <h3 className="text-2xl font-bold text-yellow-400">
                      Your content calendar will appear here
                    </h3>
                    <p className="mt-4 max-w-xl text-sm leading-8 text-zinc-500">
                      Generate a premium 7-day calendar with daily topics, hooks,
                      caption direction, and CTAs.
                    </p>
                  </div>
                </div>
              )}

              {loading && (
                <div className="relative min-h-[760px] overflow-hidden rounded-[24px] border border-yellow-500/10 bg-black">
                  <div className="relative z-10 flex min-h-[760px] flex-col items-center justify-center px-6 text-center">
                    <div className="mb-6 rounded-full border border-yellow-500/20 bg-yellow-500/10 p-5 text-yellow-400">
                      <CalendarDays className="h-9 w-9 animate-pulse" />
                    </div>
                    <h3 className="text-2xl font-bold text-yellow-400">
                      AI building your weekly plan...
                    </h3>
                    <p className="mt-4 max-w-xl text-sm leading-8 text-zinc-500">
                      Mapping days, hooks, topics, caption angles, and CTAs.
                    </p>
                  </div>
                </div>
              )}

              {result && !loading && (
                <div className="space-y-5">
                  {weeklyStrategy && (
                    <div className="rounded-2xl border border-yellow-500/10 bg-black p-5">
                      <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-yellow-300">
                        <ChevronRight className="h-4 w-4" />
                        Weekly Strategy
                      </div>
                      <div className="whitespace-pre-wrap text-sm leading-7 text-zinc-300">
                        {weeklyStrategy}
                      </div>
                    </div>
                  )}

                  <div className="grid gap-4 md:grid-cols-2">
                    {days.map((day) => (
                      <div
                        key={day.day}
                        className="rounded-2xl border border-yellow-500/10 bg-black p-5"
                      >
                        <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-yellow-300">
                          <CalendarDays className="h-4 w-4" />
                          {day.day}
                        </div>

                        <div className="space-y-3 text-sm text-zinc-300">
                          {day.topic && (
                            <div>
                              <div className="text-yellow-500/80">Topic</div>
                              <div className="whitespace-pre-wrap">{day.topic}</div>
                            </div>
                          )}
                          {day.hook && (
                            <div>
                              <div className="text-yellow-500/80">Hook</div>
                              <div className="whitespace-pre-wrap">{day.hook}</div>
                            </div>
                          )}
                          {day.contentIdea && (
                            <div>
                              <div className="text-yellow-500/80">Content Idea</div>
                              <div className="whitespace-pre-wrap">{day.contentIdea}</div>
                            </div>
                          )}
                          {day.captionAngle && (
                            <div>
                              <div className="text-yellow-500/80">Caption Angle</div>
                              <div className="whitespace-pre-wrap">{day.captionAngle}</div>
                            </div>
                          )}
                          {day.cta && (
                            <div>
                              <div className="text-yellow-500/80">CTA</div>
                              <div className="whitespace-pre-wrap">{day.cta}</div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {bonusIdeas && (
                    <div className="rounded-2xl border border-yellow-500/10 bg-black p-5">
                      <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-yellow-300">
                        <Sparkles className="h-4 w-4" />
                        Bonus Content Ideas
                      </div>
                      <div className="whitespace-pre-wrap text-sm leading-7 text-zinc-300">
                        {bonusIdeas}
                      </div>
                    </div>
                  )}

                  {bestPostingDirection && (
                    <div className="rounded-2xl border border-yellow-500/10 bg-black p-5">
                      <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-yellow-300">
                        <Rocket className="h-4 w-4" />
                        Best Posting Direction
                      </div>
                      <div className="whitespace-pre-wrap text-sm leading-7 text-zinc-300">
                        {bestPostingDirection}
                      </div>
                    </div>
                  )}

                  <details className="rounded-2xl border border-yellow-500/10 bg-black p-5">
                    <summary className="cursor-pointer text-sm font-semibold text-yellow-300">
                      Full Raw Output
                    </summary>
                    <pre className="mt-4 whitespace-pre-wrap text-sm leading-7 text-zinc-400">
                      {result}
                    </pre>
                  </details>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}