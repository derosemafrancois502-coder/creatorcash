"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import {
  ArrowLeft,
  ExternalLink,
  Mail,
  MapPin,
  Package,
  Phone,
  ShoppingBag,
  Store,
  UserRound,
} from "lucide-react"

type UserRow = {
  id: string
  username: string | null
  name: string | null
  brand_name: string | null
  bio: string | null
  email: string | null
  phone_number: string | null
  address: string | null
  profile_image: string | null
  profile_photo: string | null
}

type LinkRow = {
  id: string
  user_id: string
  title: string
  url: string
  description: string | null
  is_active: boolean
  clicks: number | null
  created_at: string
}

type ProductRow = {
  id: number
  user_id: string
  name: string
  price: number
  stock: number | null
  description: string | null
  image_url: string | null
  video_url: string | null
  category: string | null
  created_at: string
}

export default function CreatorProfilePage() {
  const params = useParams()
  const username = params.username as string

  const [profile, setProfile] = useState<UserRow | null>(null)
  const [links, setLinks] = useState<LinkRow[]>([])
  const [products, setProducts] = useState<ProductRow[]>([])
  const [loading, setLoading] = useState(true)
  const [pageError, setPageError] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()

    async function loadCreatorPage() {
      if (!username) {
        setProfile(null)
        setLinks([])
        setProducts([])
        setPageError("Missing creator username.")
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setPageError(null)

        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("*")
          .eq("username", username)
          .maybeSingle()

        if (userError) {
          console.error("User fetch error:", userError)
          setProfile(null)
          setLinks([])
          setProducts([])
          setPageError("Unable to load this creator page right now.")
          setLoading(false)
          return
        }

        if (!userData) {
          setProfile(null)
          setLinks([])
          setProducts([])
          setPageError(null)
          setLoading(false)
          return
        }

        setProfile(userData)

        const [{ data: linksData, error: linksError }, { data: productsData, error: productsError }] =
          await Promise.all([
            supabase
              .from("links")
              .select("*")
              .eq("user_id", userData.id)
              .eq("is_active", true)
              .order("created_at", { ascending: false }),
            supabase
              .from("products")
              .select("*")
              .eq("user_id", userData.id)
              .order("created_at", { ascending: false }),
          ])

        if (linksError) {
          console.error("Links fetch error:", linksError)
          setLinks([])
        } else {
          setLinks(linksData || [])
        }

        if (productsError) {
          console.error("Products fetch error:", productsError)
          setProducts([])
        } else {
          setProducts(productsData || [])
        }
      } catch (error) {
        console.error("Creator page load error:", error)
        setProfile(null)
        setLinks([])
        setProducts([])
        setPageError("Something went wrong while loading this creator page.")
      } finally {
        setLoading(false)
      }
    }

    loadCreatorPage()
  }, [username])

  const displayName = useMemo(() => {
    if (!profile) return "Creator"
    return profile.brand_name || profile.name || profile.username || "Creator"
  }, [profile])

  const displayBio = profile?.bio || "Welcome to this creator shop."
  const avatar = profile?.profile_photo || profile?.profile_image

  if (loading) {
    return (
      <div className="min-h-screen bg-black px-6 py-10 text-white">
        <div className="mx-auto max-w-6xl rounded-3xl border border-yellow-500/20 bg-zinc-950 p-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-40 rounded bg-zinc-900" />
            <div className="h-56 rounded-3xl bg-zinc-900" />
            <div className="grid gap-6 md:grid-cols-2">
              <div className="h-56 rounded-3xl bg-zinc-900" />
              <div className="h-56 rounded-3xl bg-zinc-900" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-black px-6 py-10 text-white">
        <div className="mx-auto max-w-5xl space-y-6">
          <div className="flex justify-end">
            <Link
              href="/dashboard/cos/marketplace-os"
              className="inline-flex items-center gap-2 rounded-xl border border-zinc-700 px-4 py-2 text-sm text-white transition hover:border-yellow-400 hover:text-yellow-400"
            >
              <ArrowLeft size={16} />
              Back to Marketplace OS
            </Link>
          </div>

          <div className="rounded-3xl border border-yellow-500/20 bg-zinc-950 p-10 text-center">
            <h1 className="text-3xl font-bold text-yellow-400">
              Creator not found
            </h1>
            <p className="mt-3 text-zinc-400">
              {pageError || "This creator page does not exist yet."}
            </p>
            <div className="mt-6">
              <Link
                href="/dashboard/cos/marketplace-os"
                className="inline-flex rounded-xl border border-zinc-700 px-5 py-3 text-white transition hover:border-yellow-400 hover:text-yellow-400"
              >
                Back to Marketplace
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black px-6 py-10 text-white">
      <div className="mx-auto max-w-6xl space-y-10">
        <div className="flex justify-end">
          <Link
            href="/dashboard/cos/marketplace-os"
            className="inline-flex items-center gap-2 rounded-xl border border-zinc-700 px-4 py-2 text-sm text-white transition hover:border-yellow-400 hover:text-yellow-400"
          >
            <ArrowLeft size={16} />
            Back to Marketplace OS
          </Link>
        </div>

        <section className="overflow-hidden rounded-3xl border border-yellow-500/20 bg-zinc-950">
          <div className="h-32 bg-gradient-to-r from-zinc-900 via-yellow-500/10 to-zinc-900" />

          <div className="-mt-14 px-8 pb-8">
            <div className="mx-auto mb-5 h-28 w-28 overflow-hidden rounded-full border-4 border-black bg-zinc-900 shadow-lg">
              {avatar ? (
                <img
                  src={avatar}
                  alt={displayName}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-zinc-500">
                  <UserRound className="h-8 w-8" />
                </div>
              )}
            </div>

            <div className="text-center">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-yellow-500/20 bg-yellow-500/10 px-3 py-1 text-xs uppercase tracking-[0.25em] text-yellow-300">
                <Store size={14} />
                Creator Shop
              </div>

              <h1 className="text-4xl font-bold text-yellow-400">
                {displayName}
              </h1>

              <p className="mt-2 text-sm text-zinc-500">
                @{profile.username || "no-username"}
              </p>

              <p className="mx-auto mt-4 max-w-2xl text-zinc-400">
                {displayBio}
              </p>

              <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-sm text-zinc-400">
                {profile.email ? (
                  <span className="inline-flex items-center gap-2 rounded-full border border-zinc-800 px-3 py-1">
                    <Mail size={14} />
                    {profile.email}
                  </span>
                ) : null}

                {profile.phone_number ? (
                  <span className="inline-flex items-center gap-2 rounded-full border border-zinc-800 px-3 py-1">
                    <Phone size={14} />
                    {profile.phone_number}
                  </span>
                ) : null}

                {profile.address ? (
                  <span className="inline-flex items-center gap-2 rounded-full border border-zinc-800 px-3 py-1">
                    <MapPin size={14} />
                    {profile.address}
                  </span>
                ) : null}
              </div>
            </div>
          </div>
        </section>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-yellow-500/20 bg-zinc-950 p-5">
            <Store className="mb-3 text-yellow-400" />
            <p className="text-sm text-zinc-400">Store Status</p>
            <p className="text-2xl font-bold text-white">Live</p>
          </div>

          <div className="rounded-2xl border border-yellow-500/20 bg-zinc-950 p-5">
            <ExternalLink className="mb-3 text-yellow-400" />
            <p className="text-sm text-zinc-400">Active Links</p>
            <p className="text-2xl font-bold text-white">{links.length}</p>
          </div>

          <div className="rounded-2xl border border-yellow-500/20 bg-zinc-950 p-5">
            <ShoppingBag className="mb-3 text-yellow-400" />
            <p className="text-sm text-zinc-400">Products</p>
            <p className="text-2xl font-bold text-white">{products.length}</p>
          </div>
        </div>

        <section className="rounded-3xl border border-yellow-500/20 bg-zinc-950 p-8">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-yellow-400">Links</h2>
              <p className="mt-1 text-sm text-zinc-500">
                Important links from this creator
              </p>
            </div>
            <div className="rounded-full border border-zinc-800 px-3 py-1 text-xs text-zinc-400">
              {links.length} {links.length === 1 ? "link" : "links"}
            </div>
          </div>

          <div className="space-y-4">
            {links.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-zinc-800 bg-black/20 p-6 text-zinc-500">
                No active links yet.
              </div>
            ) : (
              links.map((link) => (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                  className="block rounded-2xl border border-zinc-800 bg-black/20 p-5 transition hover:border-yellow-400 hover:bg-black/30"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        {link.title}
                      </h3>
                      <p className="mt-2 text-sm text-zinc-400">
                        {link.description || "Visit this link"}
                      </p>
                    </div>

                    <span className="inline-flex shrink-0 items-center gap-2 rounded-full border border-zinc-700 px-3 py-1 text-xs text-zinc-500">
                      <ExternalLink size={12} />
                      External
                    </span>
                  </div>
                </a>
              ))
            )}
          </div>
        </section>

        <section className="rounded-3xl border border-yellow-500/20 bg-zinc-950 p-8">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-yellow-400">Products</h2>
              <p className="mt-1 text-sm text-zinc-500">
                Shop products from this creator
              </p>
            </div>
            <div className="rounded-full border border-zinc-800 px-3 py-1 text-xs text-zinc-400">
              {products.length} {products.length === 1 ? "product" : "products"}
            </div>
          </div>

          {products.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-zinc-800 bg-black/20 p-6 text-zinc-500">
              No products available yet.
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="overflow-hidden rounded-3xl border border-zinc-800 bg-black/20 transition hover:border-yellow-400/50"
                >
                  <div className="aspect-square bg-zinc-900">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-zinc-500">
                        <Package className="h-10 w-10" />
                      </div>
                    )}
                  </div>

                  <div className="space-y-4 p-5">
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        {product.name}
                      </h3>
                      <p className="mt-2 text-xl font-bold text-yellow-400">
                        ${Number(product.price).toFixed(2)}
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-xs text-zinc-500">
                      <span className="rounded-full border border-zinc-800 px-2 py-1">
                        {product.category || "General"}
                      </span>
                      <span>Stock: {product.stock ?? 0}</span>
                    </div>

                    <p className="line-clamp-3 min-h-[60px] text-sm text-zinc-400">
                      {product.description ||
                        "No description available for this product."}
                    </p>

                    <Link
                      href={`/products/${product.id}`}
                      className="block rounded-xl bg-yellow-500 px-4 py-3 text-center font-semibold text-black transition hover:bg-yellow-400"
                    >
                      View Product
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}