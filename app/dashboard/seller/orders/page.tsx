"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Loader2,
  Package,
  Printer,
  RefreshCw,
  Search,
  ShoppingBag,
  Truck,
  User,
} from "lucide-react"

type OrderRow = Record<string, any>
type OrderItemRow = Record<string, any>
type AddressRow = Record<string, any>
type ShipmentRow = Record<string, any>
type ProductRow = Record<string, any>
type ShippingProfileRow = Record<string, any>

type SellerOrder = {
  order: OrderRow
  items: OrderItemRow[]
  address: AddressRow | null
  shipment: ShipmentRow | null
  parcel: {
    weight: number
    weight_unit: string
    length: number
    width: number
    height: number
    distance_unit: string
  }
}

function money(value: any) {
  const num = Number(value ?? 0)
  return `$${num.toFixed(2)}`
}

function text(v: any, fallback = "—") {
  if (v === null || v === undefined || v === "") return fallback
  return String(v)
}

function formatDate(v: any) {
  if (!v) return "—"
  const d = new Date(v)
  if (Number.isNaN(d.getTime())) return String(v)
  return d.toLocaleString()
}

function normalizeStatus(v: any) {
  return String(v || "pending").replaceAll("_", " ")
}

function computeParcel(items: OrderItemRow[], productMap: Map<string, ProductRow>) {
  let totalWeight = 0
  let maxLength = 0
  let maxWidth = 0
  let totalHeight = 0
  let weightUnit = "lb"
  let distanceUnit = "in"

  for (const item of items) {
    const productId =
      item.product_id ?? item.productId ?? item.product?.id ?? item.products?.id ?? null
    const qty = Math.max(Number(item.quantity ?? 1), 1)
    const product = productId ? productMap.get(String(productId)) : null

    const itemWeight = Number(product?.weight ?? 0)
    const itemLength = Number(product?.length ?? 0)
    const itemWidth = Number(product?.width ?? 0)
    const itemHeight = Number(product?.height ?? 0)

    if (product?.weight_unit) weightUnit = String(product.weight_unit)
    if (product?.distance_unit) distanceUnit = String(product.distance_unit)

    totalWeight += itemWeight * qty
    maxLength = Math.max(maxLength, itemLength)
    maxWidth = Math.max(maxWidth, itemWidth)
    totalHeight += itemHeight * qty
  }

  return {
    weight: totalWeight > 0 ? totalWeight : 1,
    weight_unit: weightUnit,
    length: maxLength > 0 ? maxLength : 10,
    width: maxWidth > 0 ? maxWidth : 8,
    height: totalHeight > 0 ? totalHeight : 4,
    distance_unit: distanceUnit,
  }
}

export default function SellerOrdersPage() {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])

  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [labelLoadingId, setLabelLoadingId] = useState<string | null>(null)
  const [shipmentUpdatingId, setShipmentUpdatingId] = useState<string | null>(null)

  const [orders, setOrders] = useState<SellerOrder[]>([])
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)
  const [search, setSearch] = useState("")

  async function loadOrders() {
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

      const { data: sellerProducts, error: productsError } = await supabase
        .from("products")
        .select("*")
        .eq("user_id", user.id)

      if (productsError) {
        console.error("Load seller products error:", productsError)
        setOrders([])
        return
      }

      const productRows = (sellerProducts ?? []) as ProductRow[]
      const productIds = productRows.map((p) => String(p.id))
      const productMap = new Map<string, ProductRow>(
        productRows.map((p) => [String(p.id), p])
      )

      if (productIds.length === 0) {
        setOrders([])
        return
      }

      const { data: itemRows, error: itemsError } = await supabase
        .from("order_items")
        .select("*")
        .in("product_id", productIds)

      if (itemsError) {
        console.error("Load order items error:", itemsError)
        setOrders([])
        return
      }

      const items = (itemRows ?? []) as OrderItemRow[]
      const orderIds = Array.from(
        new Set(
          items
            .map((item) => item.order_id ?? item.orderId)
            .filter(Boolean)
            .map((v) => String(v))
        )
      )

      if (orderIds.length === 0) {
        setOrders([])
        return
      }

      const [{ data: orderRows }, { data: addressRows }, { data: shipmentRows }, { data: shippingProfiles }] =
        await Promise.all([
          supabase.from("orders").select("*").in("id", orderIds),
          supabase.from("order_shipping_addresses").select("*").in("order_id", orderIds),
          supabase.from("shipments").select("*").in("order_id", orderIds),
          supabase.from("seller_shipping_profiles").select("*").eq("user_id", user.id).limit(1),
        ])

      const addressMap = new Map<string, AddressRow>(
        ((addressRows ?? []) as AddressRow[]).map((row) => [
          String(row.order_id ?? row.orderId),
          row,
        ])
      )

      const shipmentMap = new Map<string, ShipmentRow>(
        ((shipmentRows ?? []) as ShipmentRow[]).map((row) => [
          String(row.order_id ?? row.orderId),
          row,
        ])
      )

      const itemsByOrder = new Map<string, OrderItemRow[]>()
      for (const item of items) {
        const orderId = String(item.order_id ?? item.orderId)
        if (!itemsByOrder.has(orderId)) itemsByOrder.set(orderId, [])
        itemsByOrder.get(orderId)!.push(item)
      }

      const sellerOrders: SellerOrder[] = ((orderRows ?? []) as OrderRow[]).map((order) => {
        const orderId = String(order.id)
        const orderItems = itemsByOrder.get(orderId) ?? []
        return {
          order,
          items: orderItems,
          address: addressMap.get(orderId) ?? null,
          shipment: shipmentMap.get(orderId) ?? null,
          parcel: computeParcel(orderItems, productMap),
        }
      })

      sellerOrders.sort((a, b) => {
        const aTime = new Date(a.order.created_at ?? 0).getTime()
        const bTime = new Date(b.order.created_at ?? 0).getTime()
        return bTime - aTime
      })

      setOrders(sellerOrders)
      if (sellerOrders.length > 0) {
        setSelectedOrderId((prev) =>
          prev && sellerOrders.some((o) => String(o.order.id) === prev)
            ? prev
            : String(sellerOrders[0].order.id)
        )
      } else {
        setSelectedOrderId(null)
      }

      // Keep this available for label generation presence check
      if (!shippingProfiles?.[0]) {
        console.warn("No seller_shipping_profiles row found for current seller.")
      }
    } catch (error) {
      console.error("Load seller orders page error:", error)
      setOrders([])
    }
  }

  useEffect(() => {
    async function init() {
      setLoading(true)
      await loadOrders()
      setLoading(false)
    }
    void init()
  }, [router, supabase])

  async function refreshOrders() {
    setRefreshing(true)
    await loadOrders()
    setRefreshing(false)
  }

  async function updateShipmentStatus(orderId: string, nextStatus: string) {
    try {
      setShipmentUpdatingId(orderId)

      const selected = orders.find((o) => String(o.order.id) === orderId)
      if (!selected) return

      const existingShipmentId = selected.shipment?.id

      if (existingShipmentId) {
        const { error } = await supabase
          .from("shipments")
          .update({
            status: nextStatus,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingShipmentId)

        if (error) {
          alert(error.message)
          return
        }
      } else {
        const { error } = await supabase.from("shipments").insert({
          order_id: orderId,
          status: nextStatus,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })

        if (error) {
          alert(error.message)
          return
        }
      }

      await loadOrders()
    } catch (error) {
      console.error(error)
      alert("Could not update shipment status.")
    } finally {
      setShipmentUpdatingId(null)
    }
  }

  async function printLabel(orderId: string) {
    try {
      setLabelLoadingId(orderId)

      const selected = orders.find((o) => String(o.order.id) === orderId)
      if (!selected) return

      const res = await fetch("/api/shippo/label", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId,
          parcel: selected.parcel,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        alert(data?.error || "Could not generate label.")
        return
      }

      if (data?.label_url) {
        window.open(data.label_url, "_blank", "noopener,noreferrer")
      }

      await loadOrders()
    } catch (error) {
      console.error(error)
      alert("Could not generate shipping label.")
    } finally {
      setLabelLoadingId(null)
    }
  }

  const filteredOrders = orders.filter((entry) => {
    const term = search.trim().toLowerCase()
    if (!term) return true

    const orderId = String(entry.order.id).toLowerCase()
    const email = String(
      entry.order.email ??
        entry.order.customer_email ??
        entry.order.buyer_email ??
        entry.address?.email ??
        ""
    ).toLowerCase()

    const customerName = String(
      entry.order.customer_name ??
        entry.address?.name ??
        `${entry.address?.first_name ?? ""} ${entry.address?.last_name ?? ""}`
    ).toLowerCase()

    return (
      orderId.includes(term) ||
      email.includes(term) ||
      customerName.includes(term)
    )
  })

  const selectedOrder =
    filteredOrders.find((o) => String(o.order.id) === selectedOrderId) ?? filteredOrders[0] ?? null

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-white">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin" />
          <p>Loading seller orders...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="border-b border-white/10 bg-black/40 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <div className="mb-2">
              <Link
                href="/dashboard/seller"
                className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-white"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Seller Dashboard
              </Link>
            </div>
            <h1 className="text-2xl font-bold">Manage Orders</h1>
            <p className="mt-1 text-sm text-white/60">
              Review purchases, update shipment status, and print shipping labels.
            </p>
          </div>

          <button
            onClick={refreshOrders}
            disabled={refreshing}
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/5 disabled:opacity-60"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-6 grid gap-4 md:grid-cols-4">
          <StatCard title="Orders" value={String(orders.length)} icon={<ShoppingBag className="h-5 w-5" />} />
          <StatCard
            title="Pending"
            value={String(
              orders.filter((o) =>
                String(o.order.status ?? o.shipment?.status ?? "pending")
                  .toLowerCase()
                  .includes("pending")
              ).length
            )}
            icon={<Clock3 className="h-5 w-5" />}
          />
          <StatCard
            title="Packed"
            value={String(
              orders.filter((o) =>
                String(o.shipment?.status ?? "").toLowerCase().includes("packed")
              ).length
            )}
            icon={<Package className="h-5 w-5" />}
          />
          <StatCard
            title="Shipped"
            value={String(
              orders.filter((o) =>
                String(o.shipment?.status ?? "").toLowerCase().includes("shipped")
              ).length
            )}
            icon={<Truck className="h-5 w-5" />}
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="mb-4 flex items-center gap-3">
              <Search className="h-4 w-4 text-white/60" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by order ID, email, or customer"
                className="h-11 w-full rounded-xl border border-white/10 bg-black/20 px-4 text-sm text-white outline-none"
              />
            </div>

            {filteredOrders.length === 0 ? (
              <div className="rounded-xl border border-dashed border-white/10 bg-black/20 p-6 text-sm text-white/50">
                No orders found.
              </div>
            ) : (
              <div className="space-y-3">
                {filteredOrders.map((entry) => {
                  const isSelected = String(entry.order.id) === String(selectedOrder?.order.id)
                  const shipmentStatus = normalizeStatus(
                    entry.shipment?.status ?? entry.order.status ?? "pending"
                  )

                  return (
                    <button
                      key={String(entry.order.id)}
                      onClick={() => setSelectedOrderId(String(entry.order.id))}
                      className={`w-full rounded-xl border p-4 text-left transition ${
                        isSelected
                          ? "border-yellow-500/30 bg-yellow-500/10"
                          : "border-white/10 bg-black/20 hover:bg-white/5"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-medium text-white">
                            Order #{String(entry.order.id).slice(0, 8)}
                          </p>
                          <p className="mt-1 text-xs text-white/50">
                            {formatDate(entry.order.created_at)}
                          </p>
                        </div>

                        <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] uppercase tracking-[0.15em] text-white/70">
                          {shipmentStatus}
                        </span>
                      </div>

                      <div className="mt-3 text-sm text-white/70">
                        {text(
                          entry.order.customer_name ??
                            entry.address?.name ??
                            `${entry.address?.first_name ?? ""} ${entry.address?.last_name ?? ""}`.trim(),
                          "Customer"
                        )}
                      </div>

                      <div className="mt-1 text-xs text-white/50">
                        {text(
                          entry.order.email ??
                            entry.order.customer_email ??
                            entry.order.buyer_email ??
                            entry.address?.email
                        )}
                      </div>

                      <div className="mt-3 flex items-center justify-between text-xs text-white/55">
                        <span>{entry.items.length} items</span>
                        <span>
                          {money(
                            entry.order.total ??
                              entry.order.total_amount ??
                              entry.order.amount_total ??
                              entry.order.grand_total
                          )}
                        </span>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            {!selectedOrder ? (
              <div className="rounded-xl border border-dashed border-white/10 bg-black/20 p-6 text-sm text-white/50">
                Select an order to view details.
              </div>
            ) : (
              <>
                <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <h2 className="text-xl font-semibold">
                      Order #{String(selectedOrder.order.id).slice(0, 8)}
                    </h2>
                    <div className="mt-2 space-y-1 text-sm text-white/60">
                      <p>Created: {formatDate(selectedOrder.order.created_at)}</p>
                      <p>
                        Payment:{" "}
                        {text(
                          selectedOrder.order.payment_status ??
                            selectedOrder.order.checkout_status ??
                            selectedOrder.order.status
                        )}
                      </p>
                      <p>
                        Shipment:{" "}
                        {text(selectedOrder.shipment?.status ?? selectedOrder.order.status)}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => updateShipmentStatus(String(selectedOrder.order.id), "packed")}
                      disabled={shipmentUpdatingId === String(selectedOrder.order.id)}
                      className="rounded-xl border border-white/10 bg-black/20 px-4 py-2 text-sm font-medium text-white hover:bg-white/5 disabled:opacity-60"
                    >
                      {shipmentUpdatingId === String(selectedOrder.order.id)
                        ? "Updating..."
                        : "Mark Packed"}
                    </button>

                    <button
                      onClick={() => updateShipmentStatus(String(selectedOrder.order.id), "shipped")}
                      disabled={shipmentUpdatingId === String(selectedOrder.order.id)}
                      className="rounded-xl border border-white/10 bg-black/20 px-4 py-2 text-sm font-medium text-white hover:bg-white/5 disabled:opacity-60"
                    >
                      {shipmentUpdatingId === String(selectedOrder.order.id)
                        ? "Updating..."
                        : "Mark Shipped"}
                    </button>

                    <button
                      onClick={() => printLabel(String(selectedOrder.order.id))}
                      disabled={labelLoadingId === String(selectedOrder.order.id)}
                      className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black disabled:opacity-60"
                    >
                      <Printer className="h-4 w-4" />
                      {labelLoadingId === String(selectedOrder.order.id)
                        ? "Generating..."
                        : "Print Label"}
                    </button>
                  </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                  <div className="space-y-6">
                    <section className="rounded-xl border border-white/10 bg-black/20 p-5">
                      <h3 className="mb-4 text-lg font-semibold">Items</h3>
                      <div className="space-y-3">
                        {selectedOrder.items.map((item, index) => (
                          <div
                            key={String(item.id ?? `${selectedOrder.order.id}-${index}`)}
                            className="rounded-xl border border-white/10 bg-black/20 p-4"
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="min-w-0">
                                <p className="font-medium text-white">
                                  {text(
                                    item.product_name ??
                                      item.name ??
                                      item.title ??
                                      item.product?.name,
                                    "Product"
                                  )}
                                </p>
                                <div className="mt-2 flex flex-wrap gap-3 text-xs text-white/50">
                                  <span>Qty: {Number(item.quantity ?? 1)}</span>
                                  <span>
                                    Unit:{" "}
                                    {money(
                                      item.unit_price ??
                                        item.price ??
                                        item.product_price
                                    )}
                                  </span>
                                  <span>
                                    Total:{" "}
                                    {money(
                                      item.total_price ??
                                        Number(item.quantity ?? 1) *
                                          Number(item.unit_price ?? item.price ?? 0)
                                    )}
                                  </span>
                                </div>

                                {(item.selected_color || item.color || item.selected_size || item.size) ? (
                                  <div className="mt-2 flex flex-wrap gap-2 text-xs">
                                    {item.selected_color || item.color ? (
                                      <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-white/70">
                                        Color: {item.selected_color ?? item.color}
                                      </span>
                                    ) : null}
                                    {item.selected_size || item.size ? (
                                      <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-white/70">
                                        Size: {item.selected_size ?? item.size}
                                      </span>
                                    ) : null}
                                  </div>
                                ) : null}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>

                    <section className="rounded-xl border border-white/10 bg-black/20 p-5">
                      <h3 className="mb-4 text-lg font-semibold">Shipment Parcel</h3>
                      <div className="grid gap-3 md:grid-cols-2">
                        <Info label="Weight" value={`${selectedOrder.parcel.weight} ${selectedOrder.parcel.weight_unit}`} />
                        <Info
                          label="Dimensions"
                          value={`${selectedOrder.parcel.length} × ${selectedOrder.parcel.width} × ${selectedOrder.parcel.height} ${selectedOrder.parcel.distance_unit}`}
                        />
                      </div>
                    </section>
                  </div>

                  <div className="space-y-6">
                    <section className="rounded-xl border border-white/10 bg-black/20 p-5">
                      <h3 className="mb-4 text-lg font-semibold">Customer</h3>
                      <div className="space-y-3 text-sm text-white/70">
                        <Info
                          label="Name"
                          value={text(
                            selectedOrder.order.customer_name ??
                              selectedOrder.address?.name ??
                              `${selectedOrder.address?.first_name ?? ""} ${selectedOrder.address?.last_name ?? ""}`.trim()
                          )}
                        />
                        <Info
                          label="Email"
                          value={text(
                            selectedOrder.order.email ??
                              selectedOrder.order.customer_email ??
                              selectedOrder.order.buyer_email ??
                              selectedOrder.address?.email
                          )}
                        />
                        <Info
                          label="Phone"
                          value={text(
                            selectedOrder.order.phone ??
                              selectedOrder.address?.phone
                          )}
                        />
                      </div>
                    </section>

                    <section className="rounded-xl border border-white/10 bg-black/20 p-5">
                      <h3 className="mb-4 text-lg font-semibold">Ship To</h3>
                      <div className="space-y-2 text-sm text-white/70">
                        <p>{text(selectedOrder.address?.name)}</p>
                        <p>{text(selectedOrder.address?.street1 ?? selectedOrder.address?.address1)}</p>
                        {selectedOrder.address?.street2 || selectedOrder.address?.address2 ? (
                          <p>{text(selectedOrder.address?.street2 ?? selectedOrder.address?.address2)}</p>
                        ) : null}
                        <p>
                          {[
                            selectedOrder.address?.city,
                            selectedOrder.address?.state,
                            selectedOrder.address?.zip ?? selectedOrder.address?.postal_code,
                          ]
                            .filter(Boolean)
                            .join(", ")}
                        </p>
                        <p>{text(selectedOrder.address?.country, "US")}</p>
                      </div>
                    </section>

                    <section className="rounded-xl border border-white/10 bg-black/20 p-5">
                      <h3 className="mb-4 text-lg font-semibold">Order Summary</h3>
                      <div className="space-y-3 text-sm text-white/70">
                        <Info
                          label="Subtotal"
                          value={money(
                            selectedOrder.order.subtotal ??
                              selectedOrder.order.sub_total ??
                              selectedOrder.items.reduce(
                                (sum, item) =>
                                  sum +
                                  Number(
                                    item.total_price ??
                                      Number(item.quantity ?? 1) *
                                        Number(item.unit_price ?? item.price ?? 0)
                                  ),
                                0
                              )
                          )}
                        />
                        <Info
                          label="Shipping"
                          value={money(
                            selectedOrder.order.shipping_amount ??
                              selectedOrder.order.shipping_total ??
                              0
                          )}
                        />
                        <Info
                          label="Total"
                          value={money(
                            selectedOrder.order.total ??
                              selectedOrder.order.total_amount ??
                              selectedOrder.order.amount_total ??
                              selectedOrder.order.grand_total
                          )}
                        />
                      </div>
                    </section>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({
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

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/20 p-3">
      <p className="text-xs uppercase tracking-[0.15em] text-white/45">{label}</p>
      <p className="mt-1 text-sm text-white/80">{value}</p>
    </div>
  )
}