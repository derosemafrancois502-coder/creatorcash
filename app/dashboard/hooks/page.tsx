"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import {
  checkModuleAccess,
  type AccessProfile,
} from "@/lib/access/guard"

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
  "YouTube Shorts",
  "Facebook",
  "X",
]

const audienceOptions = [
  "Entrepreneurs",
  "Creators",
  "Students",
  "Faith Audience",
  "Luxury Audience",
  "Business Owners",
]

const styleOptions = [
  "Viral",
  "Luxury",
  "Motivational",
  "Faith",
  "Soft Sell",
  "Story",
  "Authority",
]

function HookWaveVisual() {
  return (
    <div className="relative flex h-[340px] w-full items-center justify-center overflow-hidden rounded-[32px] border border-yellow-500/20 bg-black shadow-[0_0_50px_rgba(250,204,21,0.08)]">
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 h-full w-full object-cover opacity-100"
      >
        <source src="/videos/hooks-logo.mp4" type="video/mp4" />
      </video>

      <div className="absolute inset-0 bg-black/5" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(250,204,21,0.08),transparent_55%)]" />
      <div className="absolute inset-0 rounded-[32px] ring-1 ring-yellow-400/10" />

      <div className="absolute bottom-5 left-5 rounded-2xl border border-yellow-500/20 bg-black/35 px-4 py-3 backdrop-blur-md">
        <p className="text-xs uppercase tracking-[0.22em] text-yellow-300/70">
          Hook Flow Engine
        </p>
        <p className="mt-2 text-sm text-zinc-200">
          Premium hooks built for attention, curiosity, and scroll-stopping power.
        </p>
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

export default function HooksPage() {
  const router = useRouter()
  const supabase = createClient()

  const [topic, setTopic] = useState("")
  const [platform, setPlatform] = useState("TikTok")
  const [audience, setAudience] = useState("Entrepreneurs")
  const [language, setLanguage] = useState("English")
  const [style, setStyle] = useState("Viral")
  const [result, setResult] = useState("")
  const [loading, setLoading] = useState(false)

  const [accessLoading, setAccessLoading] = useState(true)
  const [accessAllowed, setAccessAllowed] = useState(true)
  const [accessMessage, setAccessMessage] = useState("")

  const resultCount = useMemo(() => {
    if (!result.trim()) return 0
    return result
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean).length
  }, [result])

  useEffect(() => {
    let cancelled = false

    async function loadAccess() {
      try {
        setAccessLoading(true)

        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          if (!cancelled) {
            setAccessAllowed(false)
            setAccessMessage("Please log in first.")
          }
          return
        }

        const { data, error } = await supabase
          .from("profiles")
          .select("plan, trial_expires_at, subscription_expires_at")
          .eq("id", user.id)
          .single()

        if (error) {
          if (!cancelled) {
            setAccessAllowed(false)
            setAccessMessage("Unable to verify access right now.")
          }
          return
        }

        const access = checkModuleAccess((data || {}) as AccessProfile, {
          blockedWhenFree: true,
        })

        if (!cancelled) {
          setAccessAllowed(access.allowed)
          setAccessMessage(access.reason)
        }
      } catch {
        if (!cancelled) {
          setAccessAllowed(false)
          setAccessMessage("Unable to verify access right now.")
        }
      } finally {
        if (!cancelled) {
          setAccessLoading(false)
        }
      }
    }

    loadAccess()

    return () => {
      cancelled = true
    }
  }, [supabase])

  async function handleGenerate() {
    try {
      if (!accessAllowed) {
        setResult("Access locked. Upgrade Now.")
        return
      }

      setLoading(true)
      setResult("")

      const res = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tool: "hooks",
          topic,
          platform,
          audience,
          language,
          style,
          count: 10,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setResult(data.error || "Something went wrong.")
        return
      }

      setResult((data.result || "").replace(/\*\*/g, ""))
    } catch {
      setResult("Failed to generate hooks.")
    } finally {
      setLoading(false)
    }
  }

  if (accessLoading) {
    return (
      <div className="w-full space-y-8">
        <section className="rounded-[32px] border border-yellow-500/20 bg-zinc-950 p-8">
          <h1 className="text-4xl font-bold text-yellow-400">Hooks Generator</h1>
          <p className="mt-4 text-zinc-400">Checking access...</p>
        </section>
      </div>
    )
  }

  if (!accessAllowed) {
    return (
      <div className="w-full space-y-8">
        <section className="rounded-[32px] border border-yellow-500/20 bg-zinc-950 p-8">
          <div className="mb-4 inline-flex items-center rounded-full border border-red-500/20 bg-red-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-red-300">
            Access Locked
          </div>

          <h1 className="text-4xl font-bold tracking-tight text-yellow-400 sm:text-5xl">
            Hooks Generator
          </h1>

          <p className="mt-4 max-w-2xl text-base leading-7 text-zinc-300">
            {accessMessage || "This module is locked. Upgrade Now to continue."}
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <button
              onClick={() => router.push("/dashboard/billing")}
              className="rounded-2xl bg-yellow-400 px-5 py-3 text-sm font-semibold text-black transition hover:opacity-90"
            >
              Upgrade Now
            </button>

            <button
              onClick={() => router.push("/dashboard")}
              className="rounded-2xl border border-yellow-400 px-5 py-3 text-sm font-semibold text-yellow-400 transition hover:bg-yellow-400 hover:text-black"
            >
              Back to Dashboard
            </button>
          </div>
        </section>
      </div>
    )
  }

  return (
    <div className="w-full space-y-8">
      <section className="rounded-[32px] border border-yellow-500/20 bg-[radial-gradient(circle_at_top_left,rgba(250,204,21,0.14),transparent_28%),linear-gradient(180deg,rgba(24,24,24,0.98),rgba(10,10,10,0.98))] p-8">
        <div className="grid gap-8 xl:grid-cols-[1.15fr_0.85fr] xl:items-center">
          <div>
            <div className="mb-4 inline-flex items-center rounded-full border border-yellow-500/20 bg-yellow-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-yellow-300">
              CreatorGoat Hooks Engine
            </div>

            <h1 className="text-4xl font-bold tracking-tight text-yellow-400 sm:text-5xl">
              Hooks Generator
            </h1>

            <p className="mt-4 max-w-2xl text-base leading-7 text-zinc-400">
              Generate 10 premium hooks that stop the scroll, build curiosity,
              and make people watch your video.
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <StatCard label="Mode" value="Premium" />
              <StatCard label="Output" value={`${resultCount}`} />
              <StatCard label="Focus" value="Attention" />
            </div>
          </div>

          <HookWaveVisual />
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-[30px] border border-yellow-500/20 bg-zinc-950 p-6 shadow-[0_0_40px_rgba(250,204,21,0.05)]">
          <div className="mb-6">
            <p className="text-xs uppercase tracking-[0.22em] text-yellow-300/70">
              Input Engine
            </p>
            <h2 className="mt-2 text-2xl font-bold text-yellow-400">
              Build your hooks request
            </h2>
            <p className="mt-2 text-sm text-zinc-400">
              Choose the topic, platform, audience, language, and style to
              generate 10 stronger hooks.
            </p>
          </div>

          <div className="space-y-5">
            <div>
              <label className="mb-2 block text-sm text-zinc-400">Topic</label>
              <input
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Millionaire mindset"
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

            <div>
              <label className="mb-2 block text-sm text-zinc-400">Style</label>
              <select
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                className="w-full rounded-2xl border border-zinc-700 bg-black px-4 py-3 text-white outline-none transition focus:border-yellow-400"
              >
                {styleOptions.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div className="rounded-2xl border border-yellow-500/15 bg-yellow-500/5 p-4 text-sm text-zinc-300">
              This module is built for scroll-stopping hooks, motivational
              hooks, luxury hooks, storytelling hooks, and creator branding.
            </div>

            <button
              onClick={handleGenerate}
              disabled={loading || !topic.trim()}
              className="w-full rounded-2xl bg-yellow-400 px-5 py-3 font-semibold text-black transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Generating..." : "Generate 10 Hooks"}
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
                Copy Hooks
              </button>
            )}
          </div>

          <div className="mt-5 rounded-3xl border border-zinc-800 bg-black/30 p-5">
            <pre className="min-h-[420px] whitespace-pre-wrap text-sm leading-7 text-zinc-300">
              {result ||
                "Your 10 hooks will appear here. Generate premium first-line hooks for your videos, posts, brand, and storytelling."}
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