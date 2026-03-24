"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { ArrowLeft, Copy, Link2, Plus, Power, PowerOff } from "lucide-react"

type AffiliateLinkRow = {
  id: string
  affiliate_user_id: string
  product_id: number
  shop_user_id: string
  code: string
  is_active: boolean
  created_at: string
  clicks: number
  referral_url: string
}

type ProductOption = {
  id: number
  name: string
  user_id: string
}

export default function ReferralLinksPage() {
  const [affiliateUserId, setAffiliateUserId] = useState("")
  const [shopUserId, setShopUserId] = useState("")
  const [productId, setProductId] = useState("")
  const [links, setLinks] = useState<AffiliateLinkRow[]>([])
  const [products, setProducts] = useState<ProductOption[]>([])
  const [loading, setLoading] = useState(false)
  const [creating, setCreating] = useState(false)
  const [message, setMessage] = useState("")

  async function loadProducts() {
    try {
      const res = await fetch("/api/products")
      const data = await res.json()

      if (!res.ok) {
        setMessage(data?.error || "Failed to load products.")
        setProducts([])
        return
      }

      setProducts(Array.isArray(data?.products) ? data.products : [])
    } catch (error) {
      console.error("load products error:", error)
      setMessage("Failed to load products.")
      setProducts([])
    }
  }

  async function loadLinks(userId: string) {
    if (!userId.trim()) {
      setMessage("Enter affiliateUserId first.")
      setLinks([])
      return
    }

    try {
      setLoading(true)
      setMessage("")

      const res = await fetch(
        `/api/affiliate-links?affiliateUserId=${encodeURIComponent(userId)}`
      )
      const data = await res.json()

      if (!res.ok) {
        setMessage(data?.error || "Failed to load referral links.")
        setLinks([])
        return
      }

      setLinks(Array.isArray(data?.links) ? data.links : [])
    } catch (error) {
      console.error("load links error:", error)
      setMessage("Failed to load referral links.")
      setLinks([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProducts()
  }, [])

  const selectedProduct = useMemo(() => {
    return products.find((p) => String(p.id) === String(productId)) || null
  }, [products, productId])

  async function createLink() {
    if (!affiliateUserId.trim() || !productId || !shopUserId.trim()) {
      setMessage("affiliateUserId, productId, and shopUserId are required.")
      return
    }

    try {
      setCreating(true)
      setMessage("")

      const res = await fetch("/api/affiliate-links/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          affiliateUserId: affiliateUserId.trim(),
          productId: Number(productId),
          shopUserId: shopUserId.trim(),
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setMessage(data?.error || "Failed to create link.")
        return
      }

      setMessage("Referral link created.")
      await loadLinks(affiliateUserId.trim())
    } catch (error) {
      console.error("create link error:", error)
      setMessage("Failed to create link.")
    } finally {
      setCreating(false)
    }
  }

  async function toggleLink(id: string, nextValue: boolean) {
    try {
      setMessage("")

      const res = await fetch("/api/affiliate-links", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id,
          is_active: nextValue,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setMessage(data?.error || "Failed to update link.")
        return
      }

      await loadLinks(affiliateUserId.trim())
    } catch (error) {
      console.error("toggle link error:", error)
      setMessage("Failed to update link.")
    }
  }

  async function copyText(text: string) {
    try {
      await navigator.clipboard.writeText(text)
      setMessage("Copied.")
    } catch (error) {
      console.error("copy error:", error)
      setMessage("Failed to copy.")
    }
  }

  return (
    <div className="min-h-screen bg-black p-6 text-white">
      <Link
        href="/dashboard/cos/affiliate-network"
        className="mb-6 inline-flex items-center gap-2 rounded-xl border border-yellow-500/20 bg-zinc-950 px-4 py-2 text-sm text-yellow-300"
      >
        <ArrowLeft size={16} />
        Back to Affiliate Network
      </Link>

      <div className="rounded-3xl border border-yellow-500/20 bg-zinc-950 p-8">
        <Link2 className="mb-4 text-yellow-400" />
        <h1 className="text-4xl font-bold text-yellow-400">Referral Links</h1>
        <p className="mt-3 max-w-3xl text-zinc-400">
          Create real affiliate links, copy live referral URLs, and control
          whether each link is active or inactive.
        </p>
      </div>

      {message ? (
        <div className="mt-6 rounded-2xl border border-yellow-500/20 bg-zinc-950 p-4 text-sm text-yellow-300">
          {message}
        </div>
      ) : null}

      <div className="mt-6 grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
        <div className="rounded-3xl border border-yellow-500/20 bg-zinc-950 p-6">
          <h2 className="text-xl font-bold text-white">Create Link</h2>

          <div className="mt-5 space-y-4">
            <input
              value={affiliateUserId}
              onChange={(e) => setAffiliateUserId(e.target.value)}
              placeholder="affiliateUserId"
              className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-3 text-white outline-none"
            />

            <input
              value={shopUserId}
              onChange={(e) => setShopUserId(e.target.value)}
              placeholder="shopUserId"
              className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-3 text-white outline-none"
            />

            <select
              value={productId}
              onChange={(e) => {
                setProductId(e.target.value)
                const product = products.find(
                  (p) => String(p.id) === e.target.value
                )
                if (product) {
                  setShopUserId(product.user_id)
                }
              }}
              className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-3 text-white outline-none"
            >
              <option value="">Select product</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name} (#{product.id})
                </option>
              ))}
            </select>

            {selectedProduct ? (
              <div className="rounded-2xl border border-yellow-500/10 bg-black p-4 text-sm text-zinc-400">
                Selected: {selectedProduct.name}
              </div>
            ) : null}

            <button
              onClick={createLink}
              disabled={creating}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-yellow-400 px-4 py-3 font-bold text-black disabled:opacity-60"
            >
              <Plus size={16} />
              {creating ? "Creating..." : "Create Referral Link"}
            </button>

            <button
              onClick={() => loadLinks(affiliateUserId)}
              className="w-full rounded-xl border border-yellow-500/20 px-4 py-3 text-yellow-300"
            >
              Load My Links
            </button>
          </div>
        </div>

        <div className="rounded-3xl border border-yellow-500/20 bg-zinc-950 p-6">
          <h2 className="text-xl font-bold text-white">My Referral Links</h2>

          {loading ? (
            <div className="mt-5 rounded-2xl border border-zinc-800 bg-black p-5 text-zinc-400">
              Loading links...
            </div>
          ) : links.length === 0 ? (
            <div className="mt-5 rounded-2xl border border-dashed border-zinc-800 bg-black p-5 text-zinc-500">
              No referral links found.
            </div>
          ) : (
            <div className="mt-5 space-y-4">
              {links.map((link) => (
                <div
                  key={link.id}
                  className="rounded-2xl border border-zinc-800 bg-black p-5"
                >
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                    <div>
                      <p className="text-sm text-zinc-500">Code</p>
                      <p className="text-lg font-bold text-yellow-400">
                        {link.code}
                      </p>
                      <p className="mt-2 break-all text-sm text-zinc-400">
                        {link.referral_url}
                      </p>
                    </div>

                    <div className="text-left xl:text-right">
                      <p className="text-sm text-zinc-500">Clicks</p>
                      <p className="text-lg font-bold text-white">
                        {link.clicks}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-3">
                    <button
                      onClick={() => copyText(link.referral_url)}
                      className="inline-flex items-center gap-2 rounded-xl bg-yellow-400 px-4 py-2 font-semibold text-black"
                    >
                      <Copy size={14} />
                      Copy URL
                    </button>

                    <button
                      onClick={() => toggleLink(link.id, !link.is_active)}
                      className="inline-flex items-center gap-2 rounded-xl border border-zinc-700 px-4 py-2 text-white"
                    >
                      {link.is_active ? (
                        <PowerOff size={14} />
                      ) : (
                        <Power size={14} />
                      )}
                      {link.is_active ? "Deactivate" : "Activate"}
                    </button>

                    <span className="rounded-full border border-yellow-500/20 bg-yellow-500/10 px-3 py-2 text-xs text-yellow-300">
                      {link.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}