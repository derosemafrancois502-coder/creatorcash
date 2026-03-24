"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import {
  Store,
  Package,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  RefreshCw,
  Plus,
  FileText,
  ShoppingBag,
  Boxes,
  Printer,
  RotateCcw,
  MessageSquare,
} from "lucide-react"

type Shop = {
  id: string
  store_name: string
  approved: boolean
  status: string
}

type Verification = {
  application_status: string
  identity_status: string
  stripe_onboarding_complete: boolean
}

type ProductRow = {
  id: string
  name: string
  status: string
  inventory_count: number | null
  price?: number | null
  image_url?: string | null
}

type Stats = {
  totalProducts: number
  publishedProducts: number
  draftProducts: number
  totalUnits: number
  outOfStockProducts: number
  lowStockProducts: number
}

export default function SellerDashboard() {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])

  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [shop, setShop] = useState<Shop | null>(null)
  const [verification, setVerification] = useState<Verification | null>(null)
  const [products, setProducts] = useState<ProductRow[]>([])
  const [stats, setStats] = useState<Stats>({
    totalProducts: 0,
    publishedProducts: 0,
    draftProducts: 0,
    totalUnits: 0,
    outOfStockProducts: 0,
    lowStockProducts: 0,
  })

  async function loadData() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/marketplace")
        return
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle()

      if (!profile || (profile.role !== "seller" && profile.role !== "admin")) {
        router.push("/marketplace")
        return
      }

      const { data: ver } = await supabase
        .from("seller_verification")
        .select("application_status, identity_status, stripe_onboarding_complete")
        .eq("user_id", user.id)
        .maybeSingle()

      if (ver) setVerification(ver)

      const { data: shopData } = await supabase
        .from("shops")
        .select("id, store_name, approved, status")
        .eq("user_id", user.id)
        .maybeSingle()

      if (shopData) setShop(shopData)
      else setShop(null)

      const { data: productRows } = await supabase
        .from("products")
        .select("id, name, status, inventory_count, price, image_url")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      const nextProducts = (productRows ?? []) as ProductRow[]
      setProducts(nextProducts)

      const totalUnits = nextProducts.reduce(
        (sum, p) => sum + Math.max(Number(p.inventory_count ?? 0), 0),
        0
      )

      const outOfStockProducts = nextProducts.filter(
        (p) => Number(p.inventory_count ?? 0) <= 0
      ).length

      const lowStockProducts = nextProducts.filter((p) => {
        const count = Number(p.inventory_count ?? 0)
        return count > 0 && count <= 5
      }).length

      setStats({
        totalProducts: nextProducts.length,
        publishedProducts: nextProducts.filter((p) => p.status === "published").length,
        draftProducts: nextProducts.filter((p) => p.status === "draft").length,
        totalUnits,
        outOfStockProducts,
        lowStockProducts,
      })
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function syncShop() {
    try {
      setSyncing(true)
      await fetch("/api/seller/sync-shop", { method: "POST" })
      await loadData()
    } catch (error) {
      console.error(error)
    } finally {
      setSyncing(false)
    }
  }

  useEffect(() => {
    async function init() {
      setLoading(true)
      await syncShop()
    }
    void init()
  }, [])

  const isApproved =
    verification?.application_status === "approved" &&
    verification?.identity_status === "verified" &&
    verification?.stripe_onboarding_complete === true

  const inventoryPreview = products.slice(0, 6)

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-white">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-pulse rounded-full bg-white/10" />
          <p>Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="border-b border-white/10 bg-black/40 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <h1 className="text-2xl font-bold">Seller Dashboard</h1>
            <p className="mt-1 text-sm text-white/60">
              Manage your store, orders, inventory, products, and seller access
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={syncShop}
              disabled={syncing}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/5 disabled:opacity-60"
            >
              <RefreshCw className="h-4 w-4" />
              {syncing ? "Syncing..." : "Sync Shop"}
            </button>

            <Link
              href="/dashboard/seller/products/new"
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/5"
            >
              <Plus className="h-4 w-4" />
              Add Product
            </Link>

            <Link
              href="/dashboard/seller/products"
              className="rounded-xl bg-white px-5 py-2 text-sm font-semibold text-black transition hover:scale-[1.02]"
            >
              Manage Products
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-8">
        {!isApproved && (
          <div className="mb-6 rounded-2xl border border-yellow-500/20 bg-yellow-500/10 p-5">
            <div className="flex gap-3">
              <AlertTriangle className="text-yellow-300" />
              <div>
                <h3 className="font-semibold text-yellow-200">
                  Seller Not Fully Approved
                </h3>
                <p className="mt-1 text-sm text-yellow-100/70">
                  You cannot publish products yet.
                </p>
                <div className="mt-3 space-y-1 text-sm text-yellow-100/70">
                  <p>Application: {verification?.application_status || "pending"}</p>
                  <p>Identity: {verification?.identity_status || "pending"}</p>
                  <p>
                    Stripe:{" "}
                    {verification?.stripe_onboarding_complete ? "Complete" : "Pending"}
                  </p>
                </div>
                <Link
                  href="/marketplace/seller/pending"
                  className="mt-4 inline-flex rounded-xl border border-yellow-300/20 px-4 py-2"
                >
                  View Status
                </Link>
              </div>
            </div>
          </div>
        )}

        <div className="mb-8 grid gap-5 md:grid-cols-4">
          <Card
            title="Store"
            value={shop?.store_name || "No shop yet"}
            icon={<Store />}
          />
          <Card
            title="Products"
            value={String(stats.totalProducts)}
            icon={<Package />}
          />
          <Card
            title="Published"
            value={String(stats.publishedProducts)}
            icon={<CheckCircle2 />}
          />
          <Card
            title="Drafts"
            value={String(stats.draftProducts)}
            icon={<FileText />}
          />
        </div>

        <div className="mb-8 grid gap-5 md:grid-cols-3">
          <Card
            title="Inventory Units"
            value={String(stats.totalUnits)}
            icon={<Boxes />}
          />
          <Card
            title="Out of Stock"
            value={String(stats.outOfStockProducts)}
            icon={<AlertTriangle />}
          />
          <Card
            title="Low Stock"
            value={String(stats.lowStockProducts)}
            icon={<ShoppingBag />}
          />
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Link
            href="/dashboard/seller/products"
            className="rounded-2xl border border-white/10 bg-white/5 p-6 transition hover:bg-white/10"
          >
            <h3 className="mb-2 text-lg font-semibold">Manage Products</h3>
            <p className="text-sm text-white/60">
              Create, edit, save drafts, and publish your products.
            </p>
            <div className="mt-4 flex items-center text-sm">
              Open products <ArrowRight className="ml-2 h-4 w-4" />
            </div>
          </Link>

          <Link
            href="/dashboard/seller/products/new"
            className="rounded-2xl border border-white/10 bg-white/5 p-6 transition hover:bg-white/10"
          >
            <h3 className="mb-2 text-lg font-semibold">Add New Product</h3>
            <p className="text-sm text-white/60">
              Create a new product with barcode, SKU, colors, sizes, image, video,
              and shipping details.
            </p>
            <div className="mt-4 flex items-center text-sm">
              Create product <ArrowRight className="ml-2 h-4 w-4" />
            </div>
          </Link>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h3 className="mb-2 text-lg font-semibold">Store Status</h3>
            <p className="text-sm text-white/60">
              {shop?.approved
                ? "Your shop is approved and connected."
                : "Your shop is not active yet. Sync will create or update it after approval."}
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Orders</h3>
                <p className="text-sm text-white/60">
                  View customer purchases, prepare shipments, print labels, manage returns,
                  and respond to customer product conversations.
                </p>
              </div>
              <ShoppingBag className="h-5 w-5 text-white/70" />
            </div>

            <div className="space-y-3">
              <Link
                href="/dashboard/seller/orders"
                className="flex items-center justify-between rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm transition hover:bg-white/5"
              >
                <span>Manage Orders</span>
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                href="/dashboard/seller/returns"
                className="flex items-center justify-between rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm transition hover:bg-white/5"
              >
                <span>Manage Returns</span>
                <RotateCcw className="h-4 w-4" />
              </Link>

              <Link
                href="/dashboard/support-messages"
                className="flex items-center justify-between rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm transition hover:bg-white/5"
              >
                <span>Customer Messages</span>
                <MessageSquare className="h-4 w-4" />
              </Link>

              <Link
                href="/dashboard/seller/orders"
                className="flex items-center justify-between rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm transition hover:bg-white/5"
              >
                <span>Open Shipping / Label Center</span>
                <Printer className="h-4 w-4" />
              </Link>
            </div>

            <div className="mt-4 rounded-xl border border-white/10 bg-black/20 p-4 text-sm text-white/60">
              Customer orders, returns, and product conversations will appear here so the seller can
              review items, update shipping progress, answer buyers, manage return requests, and print labels.
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Inventory</h3>
                <p className="text-sm text-white/60">
                  Real stock status from your product inventory counts.
                </p>
              </div>
              <Boxes className="h-5 w-5 text-white/70" />
            </div>

            <div className="space-y-3">
              <Link
                href="/dashboard/seller/products"
                className="flex items-center justify-between rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm transition hover:bg-white/5"
              >
                <span>Manage Inventory</span>
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                href="/dashboard/seller/products/new"
                className="flex items-center justify-between rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm transition hover:bg-white/5"
              >
                <span>Add Stock via New Product</span>
                <Plus className="h-4 w-4" />
              </Link>
            </div>

            <div className="mt-4 rounded-xl border border-white/10 bg-black/20 p-4 text-sm text-white/60">
              If inventory reaches 0, the product should display <span className="font-semibold text-red-300">Out of stock</span>.  
              If stock is available, it should display a live count such as <span className="font-semibold text-emerald-300">4 in stock</span>.
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Inventory Preview</h3>
              <p className="text-sm text-white/60">
                This is your real stock preview from the products table.
              </p>
            </div>

            <Link
              href="/dashboard/seller/products"
              className="inline-flex items-center gap-2 text-sm text-white/80"
            >
              Open inventory <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {inventoryPreview.length === 0 ? (
            <div className="rounded-xl border border-dashed border-white/10 bg-black/20 p-6 text-sm text-white/50">
              No inventory yet.
            </div>
          ) : (
            <div className="space-y-3">
              {inventoryPreview.map((product) => {
                const count = Number(product.inventory_count ?? 0)
                const isOut = count <= 0
                const isLow = count > 0 && count <= 5

                return (
                  <div
                    key={product.id}
                    className="flex flex-col gap-3 rounded-xl border border-white/10 bg-black/20 p-4 md:flex-row md:items-center md:justify-between"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium text-white">{product.name}</p>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-white/50">
                        <span>{product.status}</span>
                        {typeof product.price === "number" ? (
                          <>
                            <span>•</span>
                            <span>${Number(product.price).toFixed(2)}</span>
                          </>
                        ) : null}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {isOut ? (
                        <span className="rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-300">
                          Out of stock
                        </span>
                      ) : isLow ? (
                        <span className="rounded-full border border-yellow-500/20 bg-yellow-500/10 px-3 py-1 text-xs font-semibold text-yellow-300">
                          {count} in stock
                        </span>
                      ) : (
                        <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">
                          {count} in stock
                        </span>
                      )}

                      <Link
                        href="/dashboard/seller/products"
                        className="rounded-lg border border-white/10 px-3 py-2 text-xs font-medium text-white transition hover:bg-white/5"
                      >
                        Manage
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function Card({
  title,
  value,
  icon,
}: {
  title: string
  value: string
  icon: React.ReactNode
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <div className="mb-3 text-white/70">{icon}</div>
      <p className="text-sm text-white/50">{title}</p>
      <p className="mt-1 text-xl font-semibold">{value}</p>
    </div>
  )
}