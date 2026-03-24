"use client"

import { useState } from "react"

type AIGeneratorFormProps = {
  tool: string
  title: string
  description: string
  buttonText: string
  topicPlaceholder?: string
  resultPlaceholder?: string
  failureMessage?: string
}

const languages = [
  "English",
  "French",
  "Spanish",
  "Portuguese",
  "Arabic",
  "Hindi",
  "Creole",
]

export default function AIGeneratorForm({
  tool,
  title,
  description,
  buttonText,
  topicPlaceholder = "Faith discipline",
  resultPlaceholder = "Your result will appear here.",
  failureMessage = "Failed to generate content.",
}: AIGeneratorFormProps) {
  const [topic, setTopic] = useState("")
  const [platform, setPlatform] = useState("TikTok")
  const [audience, setAudience] = useState("Entrepreneurs")
  const [language, setLanguage] = useState("English")
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
          tool,
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
      setResult(failureMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full space-y-6">
      <div className="rounded-3xl border border-yellow-500/30 bg-zinc-950 p-8">
        <h1 className="text-4xl font-bold text-yellow-400">{title}</h1>
        <p className="mt-2 text-zinc-400">{description}</p>

        <div className="mt-4 flex flex-wrap gap-2">
          <span className="rounded-full border border-yellow-500/30 bg-yellow-500/10 px-3 py-1 text-xs text-yellow-300">
            AI Powered
          </span>
          <span className="rounded-full border border-zinc-700 px-3 py-1 text-xs text-zinc-400">
            Multi-language
          </span>
          <span className="rounded-full border border-zinc-700 px-3 py-1 text-xs text-zinc-400">
            Creator Ready
          </span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4 rounded-3xl border border-yellow-500/25 bg-zinc-950 p-6">
          <div>
            <label className="mb-2 block text-sm text-zinc-400">Topic</label>
            <input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder={topicPlaceholder}
              className="w-full rounded-2xl border border-zinc-700 bg-black px-4 py-3 text-white outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-zinc-400">Platform</label>
            <input
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              placeholder="TikTok"
              className="w-full rounded-2xl border border-zinc-700 bg-black px-4 py-3 text-white outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-zinc-400">Audience</label>
            <input
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              placeholder="Entrepreneurs"
              className="w-full rounded-2xl border border-zinc-700 bg-black px-4 py-3 text-white outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-zinc-400">Language</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full rounded-2xl border border-zinc-700 bg-black px-4 py-3 text-white outline-none"
            >
              {languages.map((lang) => (
                <option key={lang} value={lang}>
                  🌍 {lang}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading || !topic.trim()}
            className="w-full rounded-2xl bg-yellow-400 px-5 py-3 font-semibold text-black transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Generating with AI..." : buttonText}
          </button>
        </div>

        <div className="rounded-3xl border border-yellow-500/25 bg-zinc-950 p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-2xl font-bold text-yellow-400">Result</h2>

            {result && (
              <span className="rounded-full border border-zinc-700 px-3 py-1 text-xs text-zinc-400">
                Ready to copy
              </span>
            )}
          </div>

          <div className="mt-4 rounded-2xl border border-zinc-800 bg-black/30 p-4">
            <pre className="whitespace-pre-wrap text-sm leading-7 text-zinc-300">
              {result || resultPlaceholder}
            </pre>
          </div>

          {result && (
            <button
              onClick={() => navigator.clipboard.writeText(result)}
              className="mt-4 rounded-2xl bg-yellow-400 px-4 py-2 text-sm font-semibold text-black transition hover:opacity-90"
            >
              Copy Result
            </button>
          )}
        </div>
      </div>
    </div>
  )
}