"use client"

import { useState } from "react"
import {
  Brain,
  Sparkles,
  Target,
  Globe,
  Wand2,
  Copy,
  Trash2,
  Cpu,
  BarChart3,
  Zap,
} from "lucide-react"
import { saveToHistory } from "@/lib/history"

const quickNiches = [
  "Faith discipline",
  "Luxury lifestyle",
  "Creator education",
  "Business mindset",
  "AI tools",
  "Ecommerce brand",
]

const quickGoals = [
  "Grow followers",
  "Increase sales",
  "Build authority",
  "Launch products",
  "Go viral",
  "Improve conversions",
]

const quickPlatforms = [
  "TikTok",
  "Instagram",
  "YouTube",
  "Facebook",
  "X",
]

export default function CreatorBrainPage() {
  const [niche, setNiche] = useState("")
  const [goal, setGoal] = useState("")
  const [platform, setPlatform] = useState("")
  const [language, setLanguage] = useState("English")
  const [result, setResult] = useState("")
  const [loading, setLoading] = useState(false)

  const generateStrategy = async () => {
    if (!niche || !goal || !platform) {
      setResult("Please fill all fields.")
      return
    }

    try {
      setLoading(true)
      setResult("")

      const res = await fetch("/api/creator-brain", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          niche,
          goal,
          platform,
          language,
        }),
      })

      const data = await res.json()
      const output = data.result || "No strategy generated."

      setResult(output)

      if (data.result) {
        await saveToHistory({
          module: "Creator Brain",
          title: `${niche || "General"} Strategy`,
          input: {
            niche,
            goal,
            platform,
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
    setGoal("")
    setPlatform("")
    setLanguage("English")
    setResult("")
  }

  const copyResult = async () => {
    if (!result) return
    await navigator.clipboard.writeText(result)
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-120px] top-[-120px] h-[320px] w-[320px] rounded-full bg-yellow-500/10 blur-3xl" />
        <div className="absolute right-[-100px] top-[120px] h-[280px] w-[280px] rounded-full bg-yellow-400/10 blur-3xl" />
        <div className="absolute bottom-[-120px] left-[20%] h-[260px] w-[260px] rounded-full bg-amber-500/10 blur-3xl" />
      </div>

      <div className="relative z-10 space-y-8 p-4 md:p-6 xl:p-8">
        <div className="grid gap-6 xl:grid-cols-[1.35fr_0.9fr]">
          <div className="relative overflow-hidden rounded-[28px] border border-yellow-500/20 bg-gradient-to-br from-[#0b0b0b] via-black to-[#111111] p-6 md:p-8">
            <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-yellow-500/10 blur-3xl" />
            <div className="absolute bottom-0 left-0 h-32 w-32 rounded-full bg-yellow-400/10 blur-3xl" />

            <div className="flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-yellow-500/20 bg-yellow-500/10 px-3 py-1 text-[11px] uppercase tracking-[0.28em] text-yellow-300">
                <Brain className="h-3.5 w-3.5" />
                COS MODULE
              </div>

              <div className="inline-flex items-center gap-2 rounded-full border border-yellow-500/10 bg-zinc-900/80 px-3 py-1 text-xs text-zinc-300">
                <Sparkles className="h-3.5 w-3.5 text-yellow-400" />
                AI Strategy Engine
              </div>
            </div>

            <h1 className="mt-5 max-w-3xl text-3xl font-extrabold tracking-tight text-yellow-400 md:text-5xl">
              Creator Brain
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-7 text-zinc-400 md:text-base">
              Generate a premium creator growth strategy with AI. Build
              positioning, content direction, conversion focus, and platform
              execution like a real operating system.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-yellow-500/15 bg-black/60 p-4">
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-yellow-500/70">
                  <Cpu className="h-4 w-4" />
                  Engine
                </div>
                <p className="mt-3 text-2xl font-bold text-yellow-400">
                  Premium
                </p>
              </div>

              <div className="rounded-2xl border border-yellow-500/15 bg-black/60 p-4">
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-yellow-500/70">
                  <BarChart3 className="h-4 w-4" />
                  Output
                </div>
                <p className="mt-3 text-2xl font-bold text-white">
                  {result ? "Ready" : "0"}
                </p>
              </div>

              <div className="rounded-2xl border border-yellow-500/15 bg-black/60 p-4">
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-yellow-500/70">
                  <Zap className="h-4 w-4" />
                  Focus
                </div>
                <p className="mt-3 text-2xl font-bold text-white">Growth</p>
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[28px] border border-yellow-500/20 bg-gradient-to-br from-[#0b0b0b] via-black to-[#101010] p-6">
            <div className="absolute inset-0 opacity-50">
              <div className="absolute left-1/2 top-1/2 h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full border border-yellow-500/10" />
              <div className="absolute left-1/2 top-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full border border-yellow-500/10" />
              <div className="absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-yellow-500/5" />
            </div>

            <div className="relative z-10 flex h-full flex-col justify-between">
              <div className="flex flex-wrap gap-2 text-xs text-yellow-300/90">
                <span className="rounded-full border border-yellow-500/20 bg-yellow-500/10 px-3 py-1">
                  positioning
                </span>
                <span className="rounded-full border border-yellow-500/20 bg-yellow-500/10 px-3 py-1">
                  growth
                </span>
                <span className="rounded-full border border-yellow-500/20 bg-yellow-500/10 px-3 py-1">
                  content map
                </span>
                <span className="rounded-full border border-yellow-500/20 bg-yellow-500/10 px-3 py-1">
                  conversion
                </span>
              </div>

              <div className="rounded-[26px] border border-yellow-500/15 bg-black/60 p-5 backdrop-blur-sm">
                <p className="text-xs uppercase tracking-[0.28em] text-yellow-500/70">
                  Strategic Core
                </p>
                <h2 className="mt-3 text-2xl font-bold text-yellow-400">
                  Creator Intelligence
                </h2>
                <p className="mt-3 text-sm leading-7 text-zinc-400">
                  Turn a niche, a goal, and a platform into a real execution
                  strategy with clearer content direction, stronger positioning,
                  and smarter action steps.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-8 xl:grid-cols-[460px_minmax(0,1fr)]">
          <div className="rounded-[28px] border border-yellow-500/20 bg-zinc-950/95 p-6 shadow-[0_0_40px_rgba(234,179,8,0.06)]">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/10 p-3 text-yellow-400">
                <Wand2 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-yellow-500/70">
                  Input Engine
                </p>
                <h2 className="mt-1 text-xl font-bold text-white">
                  Build your strategy request
                </h2>
              </div>
            </div>

            <p className="mt-4 text-sm leading-7 text-zinc-400">
              Choose your niche, growth goal, platform, and language to
              generate a premium strategic response.
            </p>

            <div className="mt-6 space-y-5">
              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-yellow-300">
                  <Target className="h-4 w-4" />
                  Niche
                </label>
                <input
                  value={niche}
                  onChange={(e) => setNiche(e.target.value)}
                  placeholder="Faith discipline"
                  className="w-full rounded-2xl border border-yellow-500/20 bg-black px-4 py-3.5 text-white outline-none transition focus:border-yellow-400/50"
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
                  <Sparkles className="h-4 w-4" />
                  Goal
                </label>
                <input
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  placeholder="Build authority"
                  className="w-full rounded-2xl border border-yellow-500/20 bg-black px-4 py-3.5 text-white outline-none transition focus:border-yellow-400/50"
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
                  <BarChart3 className="h-4 w-4" />
                  Platform
                </label>
                <input
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value)}
                  placeholder="TikTok"
                  className="w-full rounded-2xl border border-yellow-500/20 bg-black px-4 py-3.5 text-white outline-none transition focus:border-yellow-400/50"
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
                  <Globe className="h-4 w-4" />
                  Language
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full rounded-2xl border border-yellow-500/20 bg-black px-4 py-3.5 text-white outline-none transition focus:border-yellow-400/50"
                >
                  <option>English</option>
                  <option>French</option>
                  <option>Spanish</option>
                  <option>Portuguese</option>
                  <option>Haitian Creole</option>
                </select>
              </div>

              <div className="grid gap-3 pt-2 sm:grid-cols-2">
                <button
                  onClick={generateStrategy}
                  disabled={loading}
                  className="rounded-2xl bg-gradient-to-r from-yellow-300 to-yellow-500 px-4 py-3.5 font-bold text-black transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? "⚡ Generating..." : "Generate Strategy"}
                </button>

                <button
                  onClick={clearAll}
                  className="flex items-center justify-center gap-2 rounded-2xl border border-yellow-500/25 bg-black px-4 py-3.5 font-semibold text-yellow-300 transition hover:bg-yellow-500/5"
                >
                  <Trash2 className="h-4 w-4" />
                  Clear
                </button>
              </div>
            </div>
          </div>

          <div className="rounded-[28px] border border-yellow-500/20 bg-zinc-950/95 p-6 shadow-[0_0_40px_rgba(234,179,8,0.06)]">
            <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-yellow-500/70">
                  Output Panel
                </p>
                <h2 className="mt-1 text-xl font-bold text-white">
                  Strategic Result
                </h2>
              </div>

              {result && (
                <button
                  onClick={copyResult}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-yellow-400 px-4 py-2 text-sm font-bold text-black transition hover:scale-[1.02]"
                >
                  <Copy className="h-4 w-4" />
                  Copy
                </button>
              )}
            </div>

            <div className="relative min-h-[560px] overflow-hidden rounded-[24px] border border-yellow-500/10 bg-black">
              <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-yellow-500/10 blur-3xl" />

              {result ? (
                <div className="relative z-10 h-full p-5 md:p-6">
                  <pre className="whitespace-pre-wrap font-sans text-sm leading-7 text-zinc-300">
                    {result}
                  </pre>
                </div>
              ) : (
                <div className="relative z-10 flex min-h-[560px] flex-col items-center justify-center px-6 text-center">
                  <div className="mb-5 rounded-full border border-yellow-500/20 bg-yellow-500/10 p-4 text-yellow-400">
                    <Brain className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-bold text-yellow-400">
                    AI strategy will appear here
                  </h3>
                  <p className="mt-3 max-w-md text-sm leading-7 text-zinc-500">
                    Generate a premium growth strategy for your niche, audience,
                    and platform. The result can include positioning, content
                    direction, offers, and execution ideas.
                  </p>
                </div>
              )}
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-yellow-500/15 bg-black/70 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-yellow-500/70">
                  Positioning
                </p>
                <p className="mt-2 text-sm text-zinc-400">
                  Sharper brand angle and creator identity.
                </p>
              </div>

              <div className="rounded-2xl border border-yellow-500/15 bg-black/70 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-yellow-500/70">
                  Strategy
                </p>
                <p className="mt-2 text-sm text-zinc-400">
                  Better content direction and platform alignment.
                </p>
              </div>

              <div className="rounded-2xl border border-yellow-500/15 bg-black/70 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-yellow-500/70">
                  Conversion
                </p>
                <p className="mt-2 text-sm text-zinc-400">
                  Clearer actions to grow audience and sales.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}