"use client"

import { useState } from "react"

export default function AdminShopSyncPage() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  async function handleSync() {
    try {
      setLoading(true)
      setMessage("")

      const res = await fetch("/api/seller/sync-shop", {
        method: "POST",
      })

      const data = await res.json()

      if (!res.ok) {
        setMessage(data.error || "Sync failed.")
        return
      }

      setMessage(data.message || "Shop sync completed.")
    } catch (error) {
      console.error(error)
      setMessage("Something went wrong.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black px-6 py-10 text-white">
      <div className="mx-auto max-w-3xl rounded-[2rem] border border-white/10 bg-white/5 p-8">
        <p className="text-xs uppercase tracking-[0.25em] text-white/45">
          Admin Tool
        </p>
        <h1 className="mt-2 text-3xl font-semibold">Seller Shop Sync</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-white/60">
          This tool checks seller approval status and automatically creates or updates
          seller shops based on marketplace verification.
        </p>

        <button
          onClick={handleSync}
          disabled={loading}
          className="mt-6 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-black transition hover:scale-[1.01] disabled:opacity-60"
        >
          {loading ? "Syncing..." : "Run Shop Sync"}
        </button>

        {message ? (
          <div className="mt-5 rounded-2xl border border-white/10 bg-black/30 p-4 text-sm text-white/80">
            {message}
          </div>
        ) : null}
      </div>
    </div>
  )
}