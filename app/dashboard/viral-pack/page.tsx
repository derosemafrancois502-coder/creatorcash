"use client"

import { useState } from "react"

export default function ViralPackPage() {
  const [topic, setTopic] = useState("")
  const [platform, setPlatform] = useState("TikTok")
  const [audience, setAudience] = useState("Entrepreneurs")
  const [result, setResult] = useState("")
  const [loading, setLoading] = useState(false)

  const handleGenerate = async () => {
    try {
      setLoading(true)
      setResult("")

      const res = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tool: "viral-pack",
          topic,
          platform,
          audience,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setResult(data.error || "Something went wrong.")
        return
      }

      setResult(data.result.replace(/\*\*/g, ""))
    } catch (error) {
      setResult("Failed to generate viral pack.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full space-y-6">
      <div className="rounded-3xl border border-yellow-500/30 bg-zinc-950 p-8">
        <h1 className="text-4xl font-bold text-yellow-400">
          AI Viral Pack Generator
        </h1>
        <p className="mt-2 text-zinc-400">
          Generate hooks, captions, scripts, and replies in one click.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-yellow-500/25 bg-zinc-950 p-6 space-y-4">
          <div>
            <label className="mb-2 block text-sm text-zinc-400">Topic</label>
            <input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="How to get rich in 2026"
              className="w-full rounded-2xl border border-zinc-700 bg-black px-4 py-3 text-white outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-zinc-400">Platform</label>
            <input
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              className="w-full rounded-2xl border border-zinc-700 bg-black px-4 py-3 text-white outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-zinc-400">Audience</label>
            <input
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              className="w-full rounded-2xl border border-zinc-700 bg-black px-4 py-3 text-white outline-none"
            />
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading || !topic}
            className="w-full rounded-2xl bg-yellow-400 px-5 py-3 font-semibold text-black disabled:opacity-50"
          >
            {loading ? "Generating..." : "Generate Viral Pack"}
          </button>
        </div>

        <div className="rounded-3xl border border-yellow-500/25 bg-zinc-950 p-6">
          <h2 className="text-2xl font-bold text-yellow-400">Result</h2>

          <pre className="mt-4 whitespace-pre-wrap text-sm text-zinc-300">
            {result || "Your viral pack will appear here."}
          </pre>

          {result && (
            <button
              onClick={() => navigator.clipboard.writeText(result)}
              className="mt-4 rounded-2xl bg-yellow-400 px-4 py-2 text-sm font-semibold text-black"
            >
              Copy Viral Pack
            </button>
          )}
        </div>
      </div>
    </div>
  )
}