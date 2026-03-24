"use client"

import { useMemo, useState } from "react"
import {
  Clapperboard,
  Copy,
  Globe,
  Layers3,
  Package,
  Sparkles,
  Trash2,
  Activity,
  Cpu,
  Zap,
  Rocket,
  ChevronRight,
  Shield,
  PlaySquare,
  ScanLine,
  Film,
  Wand2,
} from "lucide-react"
import { saveToHistory } from "@/lib/history"

const quickNiches = [
  "Luxury lifestyle",
  "Faith discipline",
  "Business mindset",
  "Skincare brand",
  "Creator growth",
  "AI education",
]

const quickProducts = [
  "Body lotion",
  "Hair oil",
  "Perfume",
  "Course",
  "Digital product",
  "Beauty set",
]

const quickPlatforms = ["TikTok", "Instagram", "YouTube", "Facebook", "X"]

export default function VideoCloningPage() {
  const [niche, setNiche] = useState("")
  const [product, setProduct] = useState("")
  const [platform, setPlatform] = useState("")
  const [language, setLanguage] = useState("English")
  const [result, setResult] = useState("")
  const [loading, setLoading] = useState(false)

  const cloneScore = useMemo(() => {
    let score = 0
    if (niche) score += 30
    if (product) score += 30
    if (platform) score += 25
    if (language) score += 15
    return score
  }, [niche, product, platform, language])

  const statusLabel = useMemo(() => {
    if (cloneScore >= 90) return "Explosive"
    if (cloneScore >= 70) return "Strong"
    if (cloneScore >= 40) return "Building"
    return "Idle"
  }, [cloneScore])

  const generateClone = async () => {
    if (!niche || !product || !platform) {
      setResult("Please fill all fields.")
      return
    }

    try {
      setLoading(true)
      setResult("")

      const res = await fetch("/api/video-cloning", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          niche,
          product,
          platform,
          language,
        }),
      })

      const data = await res.json()
      const output = data.result || data.error || "No result generated."

      setResult(output)

      if (data.result) {
        await saveToHistory({
          module: "Video Cloning System",
          title: `${product || niche || "General"} Video Clone`,
          input: {
            niche,
            product,
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
    setProduct("")
    setPlatform("")
    setLanguage("English")
    setResult("")
  }

  const copyResult = async () => {
    if (!result) return
    await navigator.clipboard.writeText(result)
  }

  const extract = (label: string) => {
    const regex = new RegExp(
      `${label}:\\s*([\\s\\S]*?)(?:\\n[A-Z0-9/ \\-]+:|$)`,
      "i"
    )
    const match = result.match(regex)
    return match ? match[1].trim() : ""
  }

  const sections = [
    { title: "Viral Video Pattern", key: "VIRAL VIDEO PATTERN", icon: ScanLine },
    { title: "Hook Style", key: "HOOK STYLE", icon: Sparkles },
    { title: "Video Flow", key: "VIDEO FLOW", icon: PlaySquare },
    { title: "Shot List", key: "SHOT LIST", icon: Film },
    { title: "On-Screen Text", key: "ON-SCREEN TEXT", icon: Wand2 },
    { title: "Script", key: "VOICEOVER / SCRIPT", icon: Clapperboard },
    { title: "CTA", key: "CTA", icon: Rocket },
    { title: "Why It Works", key: "WHY THIS CLONE CAN WORK", icon: Shield },
  ]

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
            <div className="absolute right-10 top-10 h-28 w-28 rounded-full border border-yellow-500/10" />
            <div className="absolute right-2 top-2 h-40 w-40 rounded-full border border-yellow-500/5" />

            <div className="flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-yellow-500/20 bg-yellow-500/10 px-3 py-1.5 text-[11px] uppercase tracking-[0.28em] text-yellow-300">
                <Clapperboard className="h-3.5 w-3.5" />
                COS MODULE
              </div>

              <div className="inline-flex items-center gap-2 rounded-full border border-yellow-500/10 bg-zinc-900/80 px-3 py-1.5 text-xs text-zinc-300">
                <Sparkles className="h-3.5 w-3.5 text-yellow-400" />
                Video Intelligence
              </div>

              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs text-emerald-300">
                <Activity className="h-3.5 w-3.5" />
                System Active
              </div>
            </div>

            <h1 className="mt-6 max-w-4xl text-4xl font-extrabold tracking-tight text-yellow-400 md:text-5xl xl:text-6xl">
              Video Cloning System
            </h1>

            <p className="mt-4 max-w-3xl text-sm leading-8 text-zinc-400 md:text-base">
              Analyze viral short-form video structure and recreate stronger,
              higher-converting versions for your niche, product, and platform.
            </p>

            <div className="mt-8 flex flex-wrap gap-2">
              {[
                "viral structure",
                "hook patterns",
                "shot list",
                "script flow",
                "CTA cloning",
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
                  <ScanLine className="h-4 w-4" />
                  Signal
                </div>
                <p className="mt-3 text-2xl font-bold text-white">{statusLabel}</p>
              </div>

              <div className="rounded-2xl border border-yellow-500/15 bg-black/60 p-4 backdrop-blur-sm">
                <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-yellow-500/70">
                  <Zap className="h-4 w-4" />
                  Clone Power
                </div>
                <p className="mt-3 text-2xl font-bold text-white">{cloneScore}%</p>
              </div>

              <div className="rounded-2xl border border-yellow-500/15 bg-black/60 p-4 backdrop-blur-sm">
                <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-yellow-500/70">
                  <Rocket className="h-4 w-4" />
                  Focus
                </div>
                <p className="mt-3 text-2xl font-bold text-white">Rebuild</p>
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[32px] border border-yellow-500/20 bg-gradient-to-br from-[#0a0a0a] via-black to-[#101010] p-6 md:p-8 shadow-[0_0_60px_rgba(234,179,8,0.06)]">
            <div className="absolute inset-0 opacity-60">
              <div className="absolute left-1/2 top-1/2 h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full border border-yellow-500/10" />
              <div className="absolute left-1/2 top-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full border border-yellow-500/10" />
              <div className="absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-yellow-500/5" />
            </div>

            <div className="relative z-10 flex h-full flex-col justify-between">
              <div className="flex flex-wrap gap-2">
                {["pattern", "flow", "shots", "script"].map((item) => (
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
                  Clone Core
                </p>

                <h2 className="mt-3 text-2xl font-bold text-yellow-400 md:text-3xl">
                  Viral Structure Engine
                </h2>

                <p className="mt-4 text-sm leading-8 text-zinc-400">
                  This module is designed to decode what makes a short-form
                  video work, then transform that structure into a stronger
                  version tailored to your product and niche.
                </p>

                <div className="mt-6 grid gap-3">
                  <div className="flex items-center justify-between rounded-2xl border border-yellow-500/10 bg-zinc-950/80 px-4 py-3">
                    <span className="text-sm text-zinc-400">Hook Pattern</span>
                    <span className="font-semibold text-yellow-300">Ready</span>
                  </div>

                  <div className="flex items-center justify-between rounded-2xl border border-yellow-500/10 bg-zinc-950/80 px-4 py-3">
                    <span className="text-sm text-zinc-400">Shot Mapping</span>
                    <span className="font-semibold text-yellow-300">Active</span>
                  </div>

                  <div className="flex items-center justify-between rounded-2xl border border-yellow-500/10 bg-zinc-950/80 px-4 py-3">
                    <span className="text-sm text-zinc-400">Conversion Flow</span>
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
                <Sparkles className="h-5 w-5" />
              </div>

              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-yellow-500/70">
                  Input Engine
                </p>
                <h2 className="mt-1 text-xl font-bold text-white">
                  Build your clone request
                </h2>
              </div>
            </div>

            <p className="mt-4 text-sm leading-7 text-zinc-400">
              Enter your niche, product, platform, and language to generate a
              stronger cloned video structure powered by AI.
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
                  <Package className="h-4 w-4" />
                  Product
                </label>
                <input
                  value={product}
                  onChange={(e) => setProduct(e.target.value)}
                  placeholder="Body lotion"
                  className="w-full rounded-2xl border border-yellow-500/20 bg-black px-4 py-4 text-white outline-none transition focus:border-yellow-400/50 focus:shadow-[0_0_0_4px_rgba(250,204,21,0.06)]"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                {quickProducts.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setProduct(item)}
                    className="rounded-full border border-yellow-500/20 bg-yellow-500/5 px-3 py-1.5 text-xs text-yellow-200 transition hover:scale-[1.02] hover:bg-yellow-500/10"
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
                  onClick={generateClone}
                  disabled={loading}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-500 px-4 py-4 font-bold text-black transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Clapperboard className="h-4 w-4" />
                  {loading ? "Cloning..." : "Generate Video Clone"}
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
            <div className="grid gap-4 md:grid-cols-4">
              <div className="rounded-2xl border border-yellow-500/15 bg-zinc-950/95 p-4">
                <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-yellow-500/70">
                  <ScanLine className="h-4 w-4" />
                  Pattern
                </div>
                <p className="mt-2 text-sm text-zinc-400">
                  Decode what structure is working.
                </p>
              </div>

              <div className="rounded-2xl border border-yellow-500/15 bg-zinc-950/95 p-4">
                <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-yellow-500/70">
                  <Film className="h-4 w-4" />
                  Shots
                </div>
                <p className="mt-2 text-sm text-zinc-400">
                  Build a cleaner recording flow.
                </p>
              </div>

              <div className="rounded-2xl border border-yellow-500/15 bg-zinc-950/95 p-4">
                <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-yellow-500/70">
                  <Wand2 className="h-4 w-4" />
                  Script
                </div>
                <p className="mt-2 text-sm text-zinc-400">
                  Turn structure into a usable script.
                </p>
              </div>

              <div className="rounded-2xl border border-yellow-500/15 bg-zinc-950/95 p-4">
                <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-yellow-500/70">
                  <Rocket className="h-4 w-4" />
                  CTA
                </div>
                <p className="mt-2 text-sm text-zinc-400">
                  End with a better conversion move.
                </p>
              </div>
            </div>

            <div className="rounded-[28px] border border-yellow-500/20 bg-zinc-950/95 p-6 shadow-[0_0_40px_rgba(234,179,8,0.06)]">
              <div className="mb-5 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-yellow-500/70">
                    Output Panel
                  </p>
                  <h2 className="mt-1 text-2xl font-bold text-white">
                    Clone Report
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
                <div className="relative min-h-[680px] overflow-hidden rounded-[24px] border border-yellow-500/10 bg-black">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(250,204,21,0.12),transparent_24%)]" />
                  <div className="relative z-10 flex min-h-[680px] flex-col items-center justify-center px-6 text-center">
                    <div className="mb-6 rounded-full border border-yellow-500/20 bg-yellow-500/10 p-5 text-yellow-400">
                      <Clapperboard className="h-9 w-9" />
                    </div>

                    <h3 className="text-2xl font-bold text-yellow-400">
                      Video clone result will appear here
                    </h3>

                    <p className="mt-4 max-w-xl text-sm leading-8 text-zinc-500">
                      Generate a premium cloned video structure with hook
                      direction, shot list, flow, script, and CTA built around
                      your niche and product.
                    </p>

                    <div className="mt-8 grid w-full max-w-3xl gap-3 md:grid-cols-3">
                      <div className="rounded-2xl border border-yellow-500/10 bg-zinc-950/80 p-4 text-left">
                        <p className="text-xs uppercase tracking-[0.2em] text-yellow-500/70">
                          Hook Pattern
                        </p>
                        <p className="mt-2 text-sm text-zinc-400">
                          Understand the opening structure first.
                        </p>
                      </div>

                      <div className="rounded-2xl border border-yellow-500/10 bg-zinc-950/80 p-4 text-left">
                        <p className="text-xs uppercase tracking-[0.2em] text-yellow-500/70">
                          Shot Mapping
                        </p>
                        <p className="mt-2 text-sm text-zinc-400">
                          Build the scenes in a cleaner order.
                        </p>
                      </div>

                      <div className="rounded-2xl border border-yellow-500/10 bg-zinc-950/80 p-4 text-left">
                        <p className="text-xs uppercase tracking-[0.2em] text-yellow-500/70">
                          CTA Structure
                        </p>
                        <p className="mt-2 text-sm text-zinc-400">
                          End with a stronger action prompt.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {loading && (
                <div className="relative min-h-[680px] overflow-hidden rounded-[24px] border border-yellow-500/10 bg-black">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(250,204,21,0.12),transparent_24%)]" />
                  <div className="relative z-10 flex min-h-[680px] flex-col items-center justify-center px-6 text-center">
                    <div className="mb-6 rounded-full border border-yellow-500/20 bg-yellow-500/10 p-5 text-yellow-400">
                      <ScanLine className="h-9 w-9 animate-pulse" />
                    </div>
                    <h3 className="text-2xl font-bold text-yellow-400">
                      AI analyzing viral structure...
                    </h3>
                    <p className="mt-4 max-w-xl text-sm leading-8 text-zinc-500">
                      Mapping pattern, hooks, scenes, script flow, and CTA logic.
                    </p>
                  </div>
                </div>
              )}

              {result && !loading && (
                <div className="space-y-5">
                  <div className="relative overflow-hidden rounded-[24px] border border-yellow-500/10 bg-black p-5 md:p-6">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(250,204,21,0.12),transparent_24%)]" />
                    <div className="relative z-10 flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-yellow-500/70">
                      <ChevronRight className="h-4 w-4" />
                      Generated Video Clone Intelligence
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    {sections.map((section) => {
                      const content = extract(section.key)
                      if (!content) return null

                      const Icon = section.icon

                      return (
                        <div
                          key={section.key}
                          className="rounded-2xl border border-yellow-500/10 bg-black p-4"
                        >
                          <div className="mb-3 flex items-center gap-2">
                            <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/10 p-2 text-yellow-400">
                              <Icon className="h-4 w-4" />
                            </div>
                            <h3 className="text-sm font-semibold text-yellow-300">
                              {section.title}
                            </h3>
                          </div>

                          <div className="whitespace-pre-wrap text-sm leading-7 text-zinc-300">
                            {content}
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  <div className="rounded-2xl border border-yellow-500/10 bg-black p-4">
                    <p className="mb-2 text-xs uppercase tracking-[0.2em] text-yellow-500/70">
                      Full Raw Output
                    </p>
                    <pre className="whitespace-pre-wrap text-sm leading-7 text-zinc-400">
                      {result}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}