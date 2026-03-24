"use client"

import { useState } from "react"

export default function AIContentCalendarPage() {
  const [niche, setNiche] = useState("")
  const [platform, setPlatform] = useState("TikTok")
  const [goal, setGoal] = useState("")
  const [postingFrequency, setPostingFrequency] = useState("")
  const [contentStyle, setContentStyle] = useState("")
  const [language, setLanguage] = useState("English")
  const [mode, setMode] = useState<"7-day" | "30-day">("7-day")
  const [result, setResult] = useState("")
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  async function handleGenerate() {
    try {
      setLoading(true)
      setErrorMessage("")
      setResult("")

      const response = await fetch(
        "/dashboard/cos/ai-content-calendar/generate",
        {
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
            mode,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        setErrorMessage(data?.error || "Failed to generate content calendar.")
        return
      }

      setResult(data?.result || "")
    } catch {
      setErrorMessage("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black p-6 text-white">
      <div className="mx-auto max-w-5xl">
        <h1 className="mb-2 text-3xl font-bold text-yellow-400">
          AI Content Calendar
        </h1>
        <p className="mb-8 text-zinc-400">
          Generate a premium 7-day or 30-day content calendar.
        </p>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-yellow-500/20 bg-zinc-950 p-6">
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm text-zinc-400">Niche</label>
                <input
                  value={niche}
                  onChange={(e) => setNiche(e.target.value)}
                  placeholder="Luxury lifestyle, fitness, AI, beauty..."
                  className="w-full rounded-2xl border border-zinc-700 bg-black px-4 py-3 text-white outline-none focus:border-yellow-400"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-zinc-400">Platform</label>
                <input
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value)}
                  placeholder="TikTok"
                  className="w-full rounded-2xl border border-zinc-700 bg-black px-4 py-3 text-white outline-none focus:border-yellow-400"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-zinc-400">Goal</label>
                <input
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  placeholder="Grow audience, sell products, get leads..."
                  className="w-full rounded-2xl border border-zinc-700 bg-black px-4 py-3 text-white outline-none focus:border-yellow-400"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-zinc-400">
                  Posting Frequency
                </label>
                <input
                  value={postingFrequency}
                  onChange={(e) => setPostingFrequency(e.target.value)}
                  placeholder="1x daily, 2x daily, 5x weekly..."
                  className="w-full rounded-2xl border border-zinc-700 bg-black px-4 py-3 text-white outline-none focus:border-yellow-400"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-zinc-400">
                  Content Style
                </label>
                <input
                  value={contentStyle}
                  onChange={(e) => setContentStyle(e.target.value)}
                  placeholder="Luxury, educational, bold, motivational..."
                  className="w-full rounded-2xl border border-zinc-700 bg-black px-4 py-3 text-white outline-none focus:border-yellow-400"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-zinc-400">Language</label>
                <input
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  placeholder="English"
                  className="w-full rounded-2xl border border-zinc-700 bg-black px-4 py-3 text-white outline-none focus:border-yellow-400"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-zinc-400">Mode</label>
                <select
                  value={mode}
                  onChange={(e) => setMode(e.target.value as "7-day" | "30-day")}
                  className="w-full rounded-2xl border border-zinc-700 bg-black px-4 py-3 text-white outline-none focus:border-yellow-400"
                >
                  <option value="7-day">7-day</option>
                  <option value="30-day">30-day</option>
                </select>
              </div>

              {errorMessage ? (
                <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                  {errorMessage}
                </div>
              ) : null}

              <button
                onClick={handleGenerate}
                disabled={loading}
                className="w-full rounded-2xl bg-yellow-400 px-5 py-3 font-semibold text-black transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Generating..." : "Generate Content Calendar"}
              </button>
            </div>
          </div>

          <div className="rounded-3xl border border-yellow-500/20 bg-zinc-950 p-6">
            <h2 className="mb-4 text-xl font-semibold text-yellow-400">Result</h2>
            <pre className="min-h-[500px] whitespace-pre-wrap rounded-2xl border border-zinc-800 bg-black p-4 text-sm text-zinc-200">
              {result || "Your generated content calendar will appear here."}
            </pre>
          </div>
        </div>
      </div>
    </div>
  )
}