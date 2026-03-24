"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"

type LinkRow = {
  id: string
  user_id: string
  title: string
  url: string
  slug: string | null
  clicks?: number | null
}

export default function LinksPage() {
  const supabase = createClient()

  const [links, setLinks] = useState<LinkRow[]>([])
  const [title, setTitle] = useState("")
  const [url, setUrl] = useState("")
  const [loading, setLoading] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  useEffect(() => {
    loadLinks()
  }, [])

  async function loadLinks() {
    const { data, error } = await supabase
      .from("links")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Load links error:", error)
      return
    }

    setLinks((data as LinkRow[]) || [])
  }

  function makeSlug(value: string) {
    return value
      .toLowerCase()
      .trim()
      .replace(/https?:\/\//g, "")
      .replace(/www\./g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60)
  }

  function makeTrackedUrl(slug: string | null) {
    if (!slug) return ""
    if (typeof window === "undefined") return `/go/${slug}`
    return `${window.location.origin}/go/${slug}`
  }

  async function addLink() {
    try {
      setLoading(true)

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        alert("Ou dwe konekte avan.")
        return
      }

      if (!title.trim() || !url.trim()) {
        alert("Tanpri mete title ak URL.")
        return
      }

      let cleanUrl = url.trim()
      if (
        !cleanUrl.startsWith("http://") &&
        !cleanUrl.startsWith("https://")
      ) {
        cleanUrl = `https://${cleanUrl}`
      }

      const baseSlug = makeSlug(title || cleanUrl) || `link-${Date.now()}`
      const uniqueSlug = `${baseSlug}-${Date.now()}`

      const { error } = await supabase.from("links").insert({
        user_id: user.id,
        title: title.trim(),
        url: cleanUrl,
        slug: uniqueSlug,
        clicks: 0,
      })

      if (error) {
        console.error("Add link error:", error)
        alert("Gen yon pwoblèm pandan w ap ajoute link la.")
        return
      }

      setTitle("")
      setUrl("")
      await loadLinks()
    } catch (error) {
      console.error("Add link crash:", error)
      alert("Gen yon erè ki rive.")
    } finally {
      setLoading(false)
    }
  }

  async function copyTrackedLink(slug: string | null, id: string) {
    try {
      const trackedUrl = makeTrackedUrl(slug)

      if (!trackedUrl) {
        alert("Link sa a poko gen slug.")
        return
      }

      await navigator.clipboard.writeText(trackedUrl)
      setCopiedId(id)

      setTimeout(() => {
        setCopiedId(null)
      }, 2000)
    } catch (error) {
      console.error("Copy link error:", error)
      alert("Pa t ka copy link la.")
    }
  }

  function openTrackedLink(slug: string | null) {
    const trackedUrl = makeTrackedUrl(slug)

    if (!trackedUrl) {
      alert("Link sa a poko gen slug.")
      return
    }

    window.open(trackedUrl, "_blank", "noopener,noreferrer")
  }

  return (
    <div className="min-h-screen bg-black p-6 text-white">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-6 text-3xl font-bold">Links</h1>

        <div className="mb-8 rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="grid gap-3 md:grid-cols-3">
            <input
              className="rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <input
              className="rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none md:col-span-2"
              placeholder="URL"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>

          <button
            onClick={addLink}
            disabled={loading}
            className="mt-4 rounded-xl bg-white px-5 py-3 font-semibold text-black disabled:opacity-50"
          >
            {loading ? "Adding..." : "Add"}
          </button>
        </div>

        <div className="space-y-4">
          {links.map((l) => {
            const trackedUrl = makeTrackedUrl(l.slug)

            return (
              <div
                key={l.id}
                className="rounded-2xl border border-white/10 bg-white/5 p-4"
              >
                <div className="mb-2 text-xl font-semibold">{l.title}</div>

                <div className="mb-2 text-sm text-white/70 break-all">
                  Destination: {l.url}
                </div>

                <div className="mb-3 text-sm text-green-400 break-all">
                  Tracked Link: {trackedUrl || "Pa gen slug"}
                </div>

                <div className="mb-3 text-sm text-white/60">
                  Clicks: {l.clicks ?? 0}
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => openTrackedLink(l.slug)}
                    className="rounded-xl bg-blue-600 px-4 py-2 font-medium text-white"
                  >
                    Open
                  </button>

                  <button
                    onClick={() => copyTrackedLink(l.slug, l.id)}
                    className="rounded-xl bg-emerald-600 px-4 py-2 font-medium text-white"
                  >
                    {copiedId === l.id ? "Copied" : "Copy"}
                  </button>
                </div>
              </div>
            )
          })}

          {links.length === 0 && (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-white/60">
              Ou poko gen okenn link.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}