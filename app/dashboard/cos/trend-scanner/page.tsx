"use client"

import { useMemo, useState } from "react"
import {
  Radar,
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
  TrendingUp,
  Search,
  Layers3,
  Eye,
  Flame,
  BarChart3,
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
  "Find winning angles",
  "Spot opportunities",
]

export default function TrendScannerPage() {
  const [niche, setNiche] = useState("")
  const [platform, setPlatform] = useState("")
  const [goal, setGoal] = useState("")
  const [language, setLanguage] = useState("English")
  const [result, setResult] = useState("")
  const [loading, setLoading] = useState(false)

  const scanScore = useMemo(() => {
    let score = 0
    if (niche) score += 35
    if (platform) score += 25
    if (goal) score += 25
    if (language) score += 15
    return score
  }, [niche, platform, goal, language])

  const statusLabel = useMemo(() => {
    if (scanScore >= 90) return "Locked"
    if (scanScore >= 70) return "Strong"
    if (scanScore >= 40) return "Building"
    return "Idle"
  }, [scanScore])

  const generateTrends = async () => {
    if (!niche || !platform || !goal) {
      setResult("Please fill all fields.")
      return
    }

    try {
      setLoading(true)
      setResult("")

      const res = await fetch("/api/trend-scanner", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          niche,
          platform,
          goal,
          language,
        }),
      })

      const data = await res.json()
      const output = data.result || "No trend report generated."

      setResult(output)

      if (data.result) {
        await saveToHistory({
          module: "Trend Scanner",
          title: `${niche || "General"} Trend Report`,
          input: {
            niche,
            platform,
            goal,
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
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(250,204,21,0.14),transparent_22%),radial-gradient(circle_at_top_right,rgba(245,158,11,0.12),transparent_18%),radial-gradient(circle_at_bottom_center,rgba(234,179,8,0.10),transparent_24%)]" />
        <div className="absolute left-[-140px] top-[-120px] h-[380px] w-[380px] rounded-full bg-yellow-400/10 blur-3xl" />
        <div className="absolute right-[-110px] top-[80px] h-[340px] w-[340px] rounded-full bg-amber-400/10 blur-3xl" />
        <div className="absolute bottom-[-160px] left-[22%] h-[360px] w-[360px] rounded-full bg-yellow-500/10 blur-3xl" />
        <div className="absolute inset-0 opacity-[0.06] [background-image:linear-gradient(to_right,#facc15_1px,transparent_1px),linear-gradient(to_bottom,#facc15_1px,transparent_1px)] [background-size:88px_88px]" />
      </div>

      <div className="relative z-10 space-y-8 p-4 md:p-6 xl:p-8">
        <div className="grid gap-6 xl:grid-cols-[1.45fr_0.95fr]">
          <div className="relative overflow-hidden rounded-[32px] border border-yellow-500/20 bg-gradient-to-br from-[#090909] via-black to-[#111111] p-6 md:p-8 xl:p-10 shadow-[0_0_60px_rgba(234,179,8,0.08)]">
            <div className="absolute right-0 top-0 h-56 w-56 rounded-full bg-yellow-500/10 blur-3xl" />
            <div className="absolute bottom-0 left-0 h-40 w-40 rounded-full bg-yellow-400/10 blur-3xl" />
            <div className="absolute right-8 top-8 h-28 w-28 rounded-full border border-yellow-500/10" />
            <div className="absolute right-2 top-2 h-40 w-40 rounded-full border border-yellow-500/5" />

            <div className="flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-yellow-500/20 bg-yellow-500/10 px-3 py-1.5 text-[11px] uppercase tracking-[0.28em] text-yellow-300">
                <Radar className="h-3.5 w-3.5" />
                COS MODULE
              </div>

              <div className="inline-flex items-center gap-2 rounded-full border border-yellow-500/10 bg-zinc-900/80 px-3 py-1.5 text-xs text-zinc-300">
                <Sparkles className="h-3.5 w-3.5 text-yellow-400" />
                Trend Intelligence
              </div>

              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs text-emerald-300">
                <Activity className="h-3.5 w-3.5" />
                System Active
              </div>
            </div>

            <h1 className="mt-6 max-w-4xl text-4xl font-extrabold tracking-tight text-yellow-400 md:text-5xl xl:text-6xl">
              Trend Scanner
            </h1>

            <p className="mt-4 max-w-3xl text-sm leading-8 text-zinc-400 md:text-base">
              Discover trending angles, viral topics, and short-form content
              opportunities faster. This module helps you spot what is moving,
              what creators can use now, and where attention may be shifting.
            </p>

            <div className="mt-8 flex flex-wrap gap-2">
              {[
                "trend signals",
                "viral angles",
                "attention shifts",
                "opportunities",
                "content timing",
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
                  System
                </div>
                <p className="mt-3 text-2xl font-bold text-yellow-400">Elite</p>
              </div>

              <div className="rounded-2xl border border-yellow-500/15 bg-black/60 p-4 backdrop-blur-sm">
                <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-yellow-500/70">
                  <Radar className="h-4 w-4" />
                  Signal
                </div>
                <p className="mt-3 text-2xl font-bold text-white">
                  {statusLabel}
                </p>
              </div>

              <div className="rounded-2xl border border-yellow-500/15 bg-black/60 p-4 backdrop-blur-sm">
                <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-yellow-500/70">
                  <Zap className="h-4 w-4" />
                  Scan Power
                </div>
                <p className="mt-3 text-2xl font-bold text-white">
                  {scanScore}%
                </p>
              </div>

              <div className="rounded-2xl border border-yellow-500/15 bg-black/60 p-4 backdrop-blur-sm">
                <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-yellow-500/70">
                  <Rocket className="h-4 w-4" />
                  Focus
                </div>
                <p className="mt-3 text-2xl font-bold text-white">
                  Discovery
                </p>
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[32px] border border-yellow-500/20 bg-gradient-to-br from-[#0a0a0a] via-black to-[#101010] p-6 md:p-8 shadow-[0_0_60px_rgba(234,179,8,0.06)]">
            <div className="absolute inset-0 opacity-60">
              <div className="absolute left-1/2 top-1/2 h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full border border-yellow-500/10" />
              <div className="absolute left-1/2 top-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full border border-yellow-500/10" />
              <div className="absolute left-1/2 top-1/2 h-[430px] w-[430px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-yellow-500/5" />
            </div>

            <div className="relative z-10 flex h-full flex-col justify-between">
              <div className="flex flex-wrap gap-2">
                {["signals", "angles", "trends", "momentum"].map((item) => (
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
                  Scanner Core
                </p>

                <h2 className="mt-3 text-2xl font-bold text-yellow-400 md:text-3xl">
                  Market Signal Radar
                </h2>

                <p className="mt-4 text-sm leading-8 text-zinc-400">
                  This module helps creators read movement faster—what people
                  are reacting to, what formats are heating up, and what content
                  opportunities may have strong timing right now.
                </p>

                <div className="mt-6 space-y-3">
                  <div className="flex items-center justify-between rounded-2xl border border-yellow-500/10 bg-zinc-950/80 px-4 py-3">
                    <span className="text-sm text-zinc-400">Trend Signals</span>
                    <span className="font-semibold text-yellow-300">Ready</span>
                  </div>

                  <div className="flex items-center justify-between rounded-2xl border border-yellow-500/10 bg-zinc-950/80 px-4 py-3">
                    <span className="text-sm text-zinc-400">Opportunity Map</span>
                    <span className="font-semibold text-yellow-300">High</span>
                  </div>

                  <div className="flex items-center justify-between rounded-2xl border border-yellow-500/10 bg-zinc-950/80 px-4 py-3">
                    <span className="text-sm text-zinc-400">Timing Intel</span>
                    <span className="font-semibold text-yellow-300">Active</span>
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
                <Search className="h-5 w-5" />
              </div>

              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-yellow-500/70">
                  Input Engine
                </p>
                <h2 className="mt-1 text-xl font-bold text-white">
                  Build your scan
                </h2>
              </div>
            </div>

            <p className="mt-4 text-sm leading-7 text-zinc-400">
              Enter your niche, platform, and goal so the scanner can generate
              stronger trend direction and opportunity-based content ideas.
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
                  placeholder="Creator growth"
                  className="w-full rounded-2xl border border-yellow-500/20 bg-black px-4 py-4 text-white outline-none transition focus:border-yellow-400/50 focus:shadow-[0_0_0_4px_rgba(250,204,21,0.06)]"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                {quickNiches.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setNiche(item)}
                    className="rounded-full border border-yellow-500/20 bg-yellow-500/5 px-3 py-1.5 text-xs text-yellow-200 transition hover:scale-[1.02] hover:bg-yellow-500/10"
                  >
                    {item}
                  </button>
                ))}
              </div>

              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-yellow-300">
                  <Eye className="h-4 w-4" />
                  Platform
                </label>
                <input
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value)}
                  placeholder="TikTok"
                  className="w-full rounded-2xl border border-yellow-500/20 bg-black px-4 py-4 text-white outline-none transition focus:border-yellow-400/50 focus:shadow-[0_0_0_4px_rgba(250,204,21,0.06)]"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                {quickPlatforms.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setPlatform(item)}
                    className="rounded-full border border-yellow-500/20 bg-yellow-500/5 px-3 py-1.5 text-xs text-yellow-200 transition hover:scale-[1.02] hover:bg-yellow-500/10"
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
                  placeholder="Find winning angles"
                  className="w-full rounded-2xl border border-yellow-500/20 bg-black px-4 py-4 text-white outline-none transition focus:border-yellow-400/50 focus:shadow-[0_0_0_4px_rgba(250,204,21,0.06)]"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                {quickGoals.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setGoal(item)}
                    className="rounded-full border border-yellow-500/20 bg-yellow-500/5 px-3 py-1.5 text-xs text-yellow-200 transition hover:scale-[1.02] hover:bg-yellow-500/10"
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
                  className="w-full rounded-2xl border border-yellow-500/20 bg-black px-4 py-4 text-white outline-none transition focus:border-yellow-400/50 focus:shadow-[0_0_0_4px_rgba(250,204,21,0.06)]"
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
                  onClick={generateTrends}
                  disabled={loading}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-500 px-4 py-4 font-bold text-black transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Radar className="h-4 w-4" />
                  {loading ? "Scanning..." : "Scan Trends"}
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

          <div className="rounded-[32px] border border-yellow-500/20 bg-zinc-950/95 p-6 md:p-7 shadow-[0_0_50px_rgba(234,179,8,0.07)]">
            <div className="mb-5 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-yellow-500/70">
                  Output Panel
                </p>
                <h2 className="mt-1 text-2xl font-bold text-white">
                  Trend Report
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

            <div className="mb-5 grid gap-4 md:grid-cols-4">
              <div className="rounded-2xl border border-yellow-500/15 bg-black/70 p-4">
                <p className="text-[11px] uppercase tracking-[0.2em] text-yellow-500/70">
                  Trends
                </p>
                <p className="mt-2 text-sm text-zinc-400">
                  Spot what is heating up faster.
                </p>
              </div>

              <div className="rounded-2xl border border-yellow-500/15 bg-black/70 p-4">
                <p className="text-[11px] uppercase tracking-[0.2em] text-yellow-500/70">
                  Angles
                </p>
                <p className="mt-2 text-sm text-zinc-400">
                  Turn signals into usable content ideas.
                </p>
              </div>

              <div className="rounded-2xl border border-yellow-500/15 bg-black/70 p-4">
                <p className="text-[11px] uppercase tracking-[0.2em] text-yellow-500/70">
                  Timing
                </p>
                <p className="mt-2 text-sm text-zinc-400">
                  Find better windows for posting direction.
                </p>
              </div>

              <div className="rounded-2xl border border-yellow-500/15 bg-black/70 p-4">
                <p className="text-[11px] uppercase tracking-[0.2em] text-yellow-500/70">
                  Opportunities
                </p>
                <p className="mt-2 text-sm text-zinc-400">
                  Convert trend movement into creator action.
                </p>
              </div>
            </div>

            <div className="relative min-h-[680px] overflow-hidden rounded-[28px] border border-yellow-500/10 bg-black">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(250,204,21,0.14),transparent_24%)]" />
              <div className="absolute right-0 top-0 h-48 w-48 rounded-full bg-yellow-500/10 blur-3xl" />

              {result ? (
                <div className="relative z-10 h-full p-5 md:p-7">
                  <div className="mb-5 flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-yellow-500/70">
                    <ChevronRight className="h-4 w-4" />
                    Generated Trend Intelligence Report
                  </div>

                  <pre className="whitespace-pre-wrap font-sans text-sm leading-8 text-zinc-300">
                    {result}
                  </pre>
                </div>
              ) : (
                <div className="relative z-10 flex min-h-[680px] flex-col items-center justify-center px-6 text-center">
                  <div className="mb-6 rounded-full border border-yellow-500/20 bg-yellow-500/10 p-5 text-yellow-400">
                    <Radar className="h-9 w-9" />
                  </div>

                  <h3 className="text-2xl font-bold text-yellow-400">
                    Trend report will appear here
                  </h3>

                  <p className="mt-4 max-w-xl text-sm leading-8 text-zinc-500">
                    Generate a premium trend report with viral topic direction,
                    emerging content angles, short-form opportunities, and
                    stronger timing intelligence.
                  </p>

                  <div className="mt-8 grid w-full max-w-3xl gap-3 md:grid-cols-3">
                    <div className="rounded-2xl border border-yellow-500/10 bg-zinc-950/80 p-4 text-left">
                      <p className="text-xs uppercase tracking-[0.2em] text-yellow-500/70">
                        Trend Signals
                      </p>
                      <p className="mt-2 text-sm text-zinc-400">
                        Discover what content energy is moving now.
                      </p>
                    </div>

                    <div className="rounded-2xl border border-yellow-500/10 bg-zinc-950/80 p-4 text-left">
                      <p className="text-xs uppercase tracking-[0.2em] text-yellow-500/70">
                        Opportunity Map
                      </p>
                      <p className="mt-2 text-sm text-zinc-400">
                        Identify where you can create stronger content angles.
                      </p>
                    </div>

                    <div className="rounded-2xl border border-yellow-500/10 bg-zinc-950/80 p-4 text-left">
                      <p className="text-xs uppercase tracking-[0.2em] text-yellow-500/70">
                        Timing Intel
                      </p>
                      <p className="mt-2 text-sm text-zinc-400">
                        Use better timing instead of posting blindly.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-yellow-500/15 bg-black/70 p-4">
                <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-yellow-500/70">
                  <TrendingUp className="h-4 w-4" />
                  Momentum
                </div>
                <p className="mt-2 text-sm text-zinc-400">
                  Helps you move toward what is gaining attention.
                </p>
              </div>

              <div className="rounded-2xl border border-yellow-500/15 bg-black/70 p-4">
                <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-yellow-500/70">
                  <Flame className="h-4 w-4" />
                  Relevance
                </div>
                <p className="mt-2 text-sm text-zinc-400">
                  Keeps your content closer to what people react to.
                </p>
              </div>

              <div className="rounded-2xl border border-yellow-500/15 bg-black/70 p-4">
                <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-yellow-500/70">
                  <BarChart3 className="h-4 w-4" />
                  Action
                </div>
                <p className="mt-2 text-sm text-zinc-400">
                  Turns data-like signals into creator moves you can use.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}