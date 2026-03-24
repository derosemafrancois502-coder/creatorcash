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
  "Shopify",
  "Amazon",
  "Website",
]

const audienceOptions = [
  "Beauty Buyers",
  "Luxury Buyers",
  "Hair Care Buyers",
  "Skincare Buyers",
  "Women",
  "General Shoppers",
]

function ProductPedestalVisual() {
  return (
    <div className="relative flex h-[340px] w-full items-center justify-center overflow-hidden rounded-[32px] border border-yellow-500/20 bg-[radial-gradient(circle_at_center,rgba(250,204,21,0.08),transparent_48%),linear-gradient(180deg,rgba(10,10,10,0.98),rgba(18,18,18,0.98))]">
      <div className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-yellow-500/10 blur-3xl" />

      <div className="absolute h-[250px] w-[250px] rounded-full border border-yellow-500/15 animate-spin [animation-duration:18s]" />
      <div className="absolute h-[180px] w-[180px] rounded-full border border-yellow-300/20 animate-spin [animation-direction:reverse] [animation-duration:12s]" />

      <div className="absolute left-[12%] top-[20%] rounded-full border border-yellow-400/20 bg-yellow-500/10 px-4 py-2 text-xs text-yellow-200/90 shadow-[0_0_30px_rgba(250,204,21,0.12)] rotate-[-8deg]">
        premium copy
      </div>
      <div className="absolute right-[10%] top-[26%] rounded-full border border-amber-400/20 bg-amber-500/10 px-4 py-2 text-xs text-amber-200/90 shadow-[0_0_30px_rgba(250,204,21,0.12)] rotate-[8deg]">
        benefits
      </div>
      <div className="absolute left-[10%] bottom-[20%] rounded-full border border-orange-400/20 bg-orange-500/10 px-4 py-2 text-xs text-orange-200/90 shadow-[0_0_30px_rgba(250,204,21,0.12)] rotate-[6deg]">
        desire
      </div>
      <div className="absolute right-[12%] bottom-[18%] rounded-full border border-yellow-300/20 bg-yellow-500/10 px-4 py-2 text-xs text-yellow-200/90 shadow-[0_0_30px_rgba(250,204,21,0.12)] rotate-[-6deg]">
        conversion
      </div>

      <div className="relative flex flex-col items-center">
        <div className="relative flex h-36 w-28 items-center justify-center rounded-[26px] border border-yellow-300/30 bg-[linear-gradient(180deg,rgba(32,32,32,0.98),rgba(12,12,12,0.98))] shadow-[0_0_60px_rgba(250,204,21,0.22)]">
          <div className="absolute top-3 h-2 w-14 rounded-full bg-yellow-300/50 blur-sm" />
          <div className="absolute inset-3 rounded-[20px] border border-yellow-500/10 bg-[radial-gradient(circle_at_30%_30%,rgba(255,240,180,0.16),transparent_50%)]" />
          <div className="text-center">
            <p className="text-4xl">📦</p>
            <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-yellow-300">
              Product
            </p>
          </div>
        </div>

        <div className="mt-4 h-5 w-44 rounded-full bg-yellow-500/20 blur-md" />
        <div className="mt-[-8px] h-6 w-52 rounded-[999px] border border-yellow-500/20 bg-[linear-gradient(180deg,rgba(55,45,20,0.95),rgba(20,15,8,0.95))]" />
      </div>

      <div className="absolute bottom-6 left-6 right-6">
        <div className="rounded-2xl border border-yellow-500/20 bg-black/35 p-4 backdrop-blur-sm">
          <p className="text-xs uppercase tracking-[0.22em] text-yellow-300/70">
            Product Writing Core
          </p>
          <p className="mt-2 text-sm text-zinc-300">
            Premium description engine for luxury positioning, product benefits, and stronger sales copy.
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

export default function ProductWriterPage() {
  const [topic, setTopic] = useState("")
  const [platform, setPlatform] = useState("TikTok")
  const [audience, setAudience] = useState("Beauty Buyers")
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
          tool: "product-writer",
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
      setResult("Failed to generate product copy.")
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
              CreatorGoat Product Writer
            </div>

            <h1 className="text-4xl font-bold tracking-tight text-yellow-400 sm:text-5xl">
              Product Writer
            </h1>

            <p className="mt-4 max-w-2xl text-base leading-7 text-zinc-400">
              Generate premium product descriptions that increase desire, improve
              product positioning, and help your offers sell better.
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <StatCard label="Mode" value="Premium" />
              <StatCard label="Output" value={`${resultCount}`} />
              <StatCard label="Focus" value="Sales" />
            </div>
          </div>

          <ProductPedestalVisual />
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-[30px] border border-yellow-500/20 bg-zinc-950 p-6 shadow-[0_0_40px_rgba(250,204,21,0.05)]">
          <div className="mb-6">
            <p className="text-xs uppercase tracking-[0.22em] text-yellow-300/70">
              Input Engine
            </p>
            <h2 className="mt-2 text-2xl font-bold text-yellow-400">
              Build your product copy request
            </h2>
            <p className="mt-2 text-sm text-zinc-400">
              Choose the product, platform, audience, and language to generate
              stronger, more premium selling copy.
            </p>
          </div>

          <div className="space-y-5">
            <div>
              <label className="mb-2 block text-sm text-zinc-400">Product</label>
              <input
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Chebe Shampoo Set"
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
              This module is built for product descriptions, luxury product copy,
              beauty product messaging, TikTok shop text, and premium conversion writing.
            </div>

            <button
              onClick={handleGenerate}
              disabled={loading || !topic.trim()}
              className="w-full rounded-2xl bg-yellow-400 px-5 py-3 font-semibold text-black transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Generating..." : "Generate Product Copy"}
            </button>
          </div>
        </div>

        <div className="rounded-[30px] border border-yellow-500/20 bg-zinc-950 p-6 shadow-[0_0_40px_rgba(250,204,21,0.05)]">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-yellow-300/70">
                Output Panel
              </p>
              <h2 className="mt-2 text-2xl font-bold text-yellow-400">Result</h2>
            </div>

            {result && (
              <button
                onClick={() => navigator.clipboard.writeText(result)}
                className="rounded-2xl bg-yellow-400 px-4 py-2 text-sm font-semibold text-black transition hover:opacity-90"
              >
                Copy Product Copy
              </button>
            )}
          </div>

          <div className="mt-5 rounded-3xl border border-zinc-800 bg-black/30 p-5">
            <pre className="min-h-[420px] whitespace-pre-wrap text-sm leading-7 text-zinc-300">
              {result ||
                "Your product copy will appear here. Generate premium product descriptions for your store, TikTok shop, product pages, and luxury product positioning."}
            </pre>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-zinc-800 bg-black/20 p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">
                Product
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