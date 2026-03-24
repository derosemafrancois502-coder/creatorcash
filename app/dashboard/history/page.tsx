"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  Copy,
  Search,
  Trash2,
  History as HistoryIcon,
  Filter,
  FileText,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Brain,
  Flame,
  TrendingUp,
  PackageSearch,
  Clapperboard,
  Sparkles,
} from "lucide-react"

type HistoryItem = {
  id: string
  user_id: string | null
  module: string
  title: string
  input: Record<string, unknown> | null
  output: string
  created_at: string
}

const moduleOptions = [
  "",
  "Creator Brain",
  "AI Creator Copilot",
  "Auto-Viral Video Engine",
  "Trend Scanner",
  "Viral Trend Radar",
  "Product Discovery Engine",
  "Video Cloning System",
  "AI Content Calendar",
  "Marketplace OS",
  "Affiliate Network",
  "Learn",
]

function getModuleIcon(module: string) {
  if (module === "Creator Brain") return Brain
  if (module === "AI Creator Copilot") return Brain
  if (module === "Auto-Viral Video Engine") return Flame
  if (module === "Trend Scanner") return TrendingUp
  if (module === "Viral Trend Radar") return TrendingUp
  if (module === "Product Discovery Engine") return PackageSearch
  if (module === "Video Cloning System") return Clapperboard
  return Sparkles
}

function getModuleCount(items: HistoryItem[], module: string) {
  return items.filter((item) => item.module === module).length
}

export default function HistoryPage() {
  const [items, setItems] = useState<HistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [errorText, setErrorText] = useState("")
  const [message, setMessage] = useState("")
  const [query, setQuery] = useState("")
  const [moduleFilter, setModuleFilter] = useState("")
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({})

  async function loadHistory() {
    try {
      setLoading(true)
      setErrorText("")
      setMessage("")

      const params = new URLSearchParams()
      if (query.trim()) params.set("q", query.trim())
      if (moduleFilter.trim()) params.set("module", moduleFilter.trim())

      const url = params.toString()
        ? `/api/history/list?${params.toString()}`
        : "/api/history/list"

      const res = await fetch(url)
      const data = await res.json()

      if (!res.ok) {
        setErrorText(data?.error || "Failed to load history.")
        setItems([])
        return
      }

      setItems(Array.isArray(data?.items) ? data.items : [])
    } catch (error) {
      console.error("load history error:", error)
      setErrorText("Failed to load history.")
      setItems([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadHistory()
  }, [moduleFilter])

  const stats = useMemo(() => {
    return {
      total: items.length,
      creatorBrain: getModuleCount(items, "Creator Brain"),
      autoViral: getModuleCount(items, "Auto-Viral Video Engine"),
      trendScanner:
        getModuleCount(items, "Trend Scanner") +
        getModuleCount(items, "Viral Trend Radar"),
      productDiscovery: getModuleCount(items, "Product Discovery Engine"),
      videoCloning: getModuleCount(items, "Video Cloning System"),
    }
  }, [items])

  const itemCountText = useMemo(() => {
    return `${items.length} ${items.length === 1 ? "item" : "items"}`
  }, [items])

  async function handleSearch() {
    await loadHistory()
  }

  async function handleDelete(id: string) {
    try {
      setMessage("")

      const res = await fetch("/api/history/delete", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      })

      const data = await res.json()

      if (!res.ok) {
        setMessage(data?.error || "Failed to delete item.")
        return
      }

      setMessage("History item deleted.")
      await loadHistory()
    } catch (error) {
      console.error("delete history error:", error)
      setMessage("Failed to delete item.")
    }
  }

  async function handleCopy(text: string) {
    try {
      await navigator.clipboard.writeText(text)
      setMessage("Copied.")
    } catch (error) {
      console.error("copy history error:", error)
      setMessage("Failed to copy.")
    }
  }

  function handleReuse(item: HistoryItem) {
    try {
      localStorage.setItem(
        "cg_history_reuse",
        JSON.stringify({
          module: item.module,
          title: item.title,
          input: item.input,
          output: item.output,
        })
      )
      setMessage("Saved for reuse.")
    } catch (error) {
      console.error("reuse history error:", error)
      setMessage("Failed to save for reuse.")
    }
  }

  function toggleExpand(id: string) {
    setExpandedItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  return (
    <div className="min-h-screen bg-black p-6 text-white">
      <Link
        href="/dashboard/cos"
        className="mb-6 inline-flex items-center gap-2 rounded-xl border border-yellow-500/20 bg-zinc-950 px-4 py-2 text-sm text-yellow-300"
      >
        <ArrowLeft size={16} />
        Back to COS
      </Link>

      <div className="rounded-3xl border border-yellow-500/20 bg-zinc-950 p-8">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-yellow-500/20 bg-yellow-500/10 px-3 py-1 text-xs uppercase tracking-[0.25em] text-yellow-300">
          <HistoryIcon size={14} />
          CreatorGoat
        </div>

        <h1 className="text-5xl font-bold tracking-tight text-white">
          <span className="text-yellow-400">AI History</span>
        </h1>

        <p className="mt-4 max-w-5xl text-lg leading-8 text-zinc-400">
          View, search, filter, and manage your real saved AI outputs from COS modules.
        </p>
      </div>

      {errorText ? (
        <div className="mt-6 rounded-2xl border border-red-500/20 bg-zinc-950 p-4 text-red-300">
          {errorText}
        </div>
      ) : null}

      {message ? (
        <div className="mt-6 rounded-2xl border border-yellow-500/20 bg-zinc-950 p-4 text-yellow-300">
          {message}
        </div>
      ) : null}

      <div className="mt-6 grid gap-4 md:grid-cols-3 xl:grid-cols-6">
        <div className="rounded-3xl border border-yellow-500/20 bg-zinc-950 p-5">
          <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">Total</p>
          <p className="mt-2 text-4xl font-bold text-yellow-400">{stats.total}</p>
        </div>

        <div className="rounded-3xl border border-yellow-500/20 bg-zinc-950 p-5">
          <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">Creator Brain</p>
          <p className="mt-2 text-4xl font-bold text-yellow-400">{stats.creatorBrain}</p>
        </div>

        <div className="rounded-3xl border border-yellow-500/20 bg-zinc-950 p-5">
          <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">Auto Viral</p>
          <p className="mt-2 text-4xl font-bold text-yellow-400">{stats.autoViral}</p>
        </div>

        <div className="rounded-3xl border border-yellow-500/20 bg-zinc-950 p-5">
          <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">Trend Scanner</p>
          <p className="mt-2 text-4xl font-bold text-yellow-400">{stats.trendScanner}</p>
        </div>

        <div className="rounded-3xl border border-yellow-500/20 bg-zinc-950 p-5">
          <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">Product Discovery</p>
          <p className="mt-2 text-4xl font-bold text-yellow-400">{stats.productDiscovery}</p>
        </div>

        <div className="rounded-3xl border border-yellow-500/20 bg-zinc-950 p-5">
          <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">Video Cloning</p>
          <p className="mt-2 text-4xl font-bold text-yellow-400">{stats.videoCloning}</p>
        </div>
      </div>

      <div className="mt-6 rounded-3xl border border-yellow-500/20 bg-zinc-950 p-6">
        <div className="grid gap-4 xl:grid-cols-[1fr_260px_180px]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search title, output, or module..."
              className="w-full rounded-xl border border-zinc-800 bg-black px-11 py-3 text-white outline-none"
            />
          </div>

          <div className="relative">
            <Filter className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <select
              value={moduleFilter}
              onChange={(e) => setModuleFilter(e.target.value)}
              className="w-full rounded-xl border border-zinc-800 bg-black px-11 py-3 text-white outline-none"
            >
              {moduleOptions.map((item) => (
                <option key={item || "all"} value={item}>
                  {item || "All Modules"}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleSearch}
            className="rounded-xl bg-yellow-400 px-4 py-3 font-bold text-black"
          >
            Search
          </button>
        </div>

        <div className="mt-4 inline-flex rounded-full border border-zinc-800 px-4 py-2 text-sm text-zinc-400">
          {itemCountText}
        </div>
      </div>

      <div className="mt-6">
        {loading ? (
          <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6 text-zinc-400">
            Loading history...
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-zinc-800 bg-zinc-950 p-10 text-center">
            <FileText className="mx-auto mb-4 h-10 w-10 text-zinc-600" />
            <h2 className="text-2xl font-semibold text-white">No history yet</h2>
            <p className="mt-3 text-zinc-500">
              Real saved AI outputs will appear here once your modules store results.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item) => {
              const ModuleIcon = getModuleIcon(item.module)
              const isExpanded = !!expandedItems[item.id]
              const preview =
                item.output.length > 320 && !isExpanded
                  ? `${item.output.slice(0, 320)}...`
                  : item.output

              return (
                <div
                  key={item.id}
                  className="rounded-3xl border border-yellow-500/20 bg-zinc-950 p-6"
                >
                  <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="mb-3 flex flex-wrap items-center gap-3">
                        <span className="inline-flex items-center gap-2 rounded-full border border-yellow-500/20 bg-yellow-500/10 px-3 py-1 text-xs text-yellow-300">
                          <ModuleIcon size={14} />
                          {item.module}
                        </span>

                        <span className="text-xs text-zinc-500">
                          {new Date(item.created_at).toLocaleString()}
                        </span>
                      </div>

                      <h2 className="text-2xl font-bold text-white">
                        {item.title}
                      </h2>

                      {item.input ? (
                        <div className="mt-4 rounded-2xl border border-zinc-800 bg-black p-4">
                          <p className="mb-2 text-xs uppercase tracking-[0.2em] text-zinc-500">
                            Input
                          </p>
                          <pre className="whitespace-pre-wrap text-sm text-zinc-400">
                            {JSON.stringify(item.input, null, 2)}
                          </pre>
                        </div>
                      ) : null}

                      <div className="mt-4 rounded-2xl border border-zinc-800 bg-black p-4">
                        <p className="mb-2 text-xs uppercase tracking-[0.2em] text-zinc-500">
                          Output
                        </p>
                        <pre className="whitespace-pre-wrap text-sm leading-7 text-zinc-300">
                          {preview}
                        </pre>
                      </div>
                    </div>

                    <div className="grid shrink-0 gap-3 sm:grid-cols-2 xl:w-[240px] xl:grid-cols-1">
                      <button
                        onClick={() => handleCopy(item.output)}
                        className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-yellow-400 px-4 py-3 font-semibold text-black"
                      >
                        <Copy size={14} />
                        Copy Output
                      </button>

                      <button
                        onClick={() => handleReuse(item)}
                        className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl border border-zinc-700 px-4 py-3 font-semibold text-white"
                      >
                        <RotateCcw size={14} />
                        Reuse
                      </button>

                      <button
                        onClick={() => toggleExpand(item.id)}
                        className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl border border-zinc-700 px-4 py-3 font-semibold text-white"
                      >
                        {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        {isExpanded ? "Collapse" : "Expand"}
                      </button>

                      <button
                        onClick={() => handleDelete(item.id)}
                        className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl border border-red-500/30 px-4 py-3 font-semibold text-red-300"
                      >
                        <Trash2 size={14} />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}