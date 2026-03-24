"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import {
  ArrowLeft,
  CheckCircle2,
  RotateCcw,
  ShieldCheck,
} from "lucide-react"

type ReturnStatus =
  | "requested"
  | "approved"
  | "rejected"
  | "item_sent_back"
  | "received"
  | "refunded"
  | "partial_refund"

const reasonOptions = [
  "Damaged item",
  "Wrong item received",
  "Item not as described",
  "Missing parts",
  "Changed my mind",
  "Delivery issue",
  "Other",
]

export default function ReturnRequestPage() {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])

  const [orderId, setOrderId] = useState("")
  const [productId, setProductId] = useState("")
  const [reason, setReason] = useState(reasonOptions[0])
  const [details, setDetails] = useState("")
  const [loading, setLoading] = useState(false)
  const [successId, setSuccessId] = useState<string | null>(null)

  async function handleSubmit() {
    if (!orderId.trim()) {
      alert("Enter the order ID.")
      return
    }

    if (!productId.trim()) {
      alert("Enter the product ID.")
      return
    }

    if (!reason.trim()) {
      alert("Select a return reason.")
      return
    }

    try {
      setLoading(true)

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError || !user) {
        alert("You must be signed in to request a return.")
        return
      }

      const numericOrderId = Number(orderId)
      const numericProductId = Number(productId)

      if (Number.isNaN(numericOrderId) || Number.isNaN(numericProductId)) {
        alert("Order ID and Product ID must be numbers.")
        return
      }

      const { data: product, error: productError } = await supabase
        .from("products")
        .select("id, user_id, name")
        .eq("id", numericProductId)
        .maybeSingle()

      if (productError) {
        alert(productError.message)
        return
      }

      if (!product) {
        alert("Product not found.")
        return
      }

      const sellerUserId = product.user_id

      const { data: existingReturn, error: existingError } = await supabase
        .from("returns")
        .select("id, status")
        .eq("order_id", numericOrderId)
        .eq("product_id", numericProductId)
        .eq("buyer_user_id", user.id)
        .maybeSingle()

      if (existingError) {
        alert(existingError.message)
        return
      }

      if (existingReturn) {
        alert(`A return already exists for this item. Current status: ${existingReturn.status}`)
        return
      }

      const { data, error } = await supabase
        .from("returns")
        .insert({
          order_id: numericOrderId,
          buyer_user_id: user.id,
          seller_user_id: sellerUserId,
          product_id: numericProductId,
          reason,
          details: details.trim() || null,
          status: "requested" satisfies ReturnStatus,
          refund_amount: 0,
        })
        .select("id")
        .single()

      if (error) {
        alert(error.message)
        return
      }

      setSuccessId(data?.id ?? null)
      setOrderId("")
      setProductId("")
      setReason(reasonOptions[0])
      setDetails("")
    } catch (error) {
      console.error(error)
      alert("Could not submit return request.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white text-zinc-900">
      <div className="border-b border-zinc-200 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4 md:px-8">
          <Link
            href="/orders"
            className="inline-flex items-center gap-2 text-sm font-medium text-zinc-600 transition hover:text-zinc-950"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Orders
          </Link>

          <Link
            href="/marketplace/explore"
            className="rounded-full border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-900 transition hover:bg-zinc-50"
          >
            Marketplace
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-5 py-10 md:px-8">
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-yellow-600/80">
            CreatorGoat Returns
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-zinc-950 md:text-5xl">
            Request a Return
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-zinc-500 md:text-base">
            Submit a return request for an order item. Once requested, the seller
            or admin team can review, approve, reject, and process the refund.
          </p>
        </div>

        {successId ? (
          <div className="mb-8 rounded-[2rem] border border-emerald-200 bg-emerald-50 p-6">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-700" />
              <div>
                <h2 className="text-lg font-semibold text-emerald-900">
                  Return request submitted
                </h2>
                <p className="mt-2 text-sm leading-6 text-emerald-800">
                  Your return request was created successfully.
                </p>
                <p className="mt-2 text-sm text-emerald-800">
                  Return ID: <span className="font-semibold">{successId}</span>
                </p>
              </div>
            </div>
          </div>
        ) : null}

        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-sm md:p-8">
            <div className="mb-6">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
                Return Form
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-zinc-950">
                Return Details
              </h2>
            </div>

            <div className="space-y-5">
              <Field
                label="Order ID"
                value={orderId}
                onChange={setOrderId}
                placeholder="Example: 1024"
                type="number"
              />

              <Field
                label="Product ID"
                value={productId}
                onChange={setProductId}
                placeholder="Example: 55"
                type="number"
              />

              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-800">
                  Return Reason
                </label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="h-12 w-full rounded-2xl border border-zinc-300 bg-white px-4 text-sm text-zinc-900 outline-none transition focus:border-yellow-500/40"
                >
                  {reasonOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-800">
                  Additional Details
                </label>
                <textarea
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  rows={6}
                  placeholder="Explain what happened, the issue with the item, and any details the seller should know."
                  className="w-full rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-yellow-500/40"
                />
              </div>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-yellow-500 px-6 text-sm font-semibold text-black transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <RotateCcw className="h-4 w-4" />
                {loading ? "Submitting..." : "Submit Return Request"}
              </button>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-[2rem] border border-zinc-200 bg-zinc-50 p-6">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-white shadow-sm">
                <ShieldCheck className="h-5 w-5 text-yellow-700" />
              </div>
              <h3 className="text-lg font-semibold text-zinc-950">
                Return Status Flow
              </h3>
              <div className="mt-4 space-y-3 text-sm text-zinc-600">
                <p><span className="font-medium text-zinc-900">requested</span> — buyer submitted the return</p>
                <p><span className="font-medium text-zinc-900">approved</span> — seller/admin approved it</p>
                <p><span className="font-medium text-zinc-900">rejected</span> — return denied</p>
                <p><span className="font-medium text-zinc-900">item_sent_back</span> — buyer shipped it back</p>
                <p><span className="font-medium text-zinc-900">received</span> — seller received the item</p>
                <p><span className="font-medium text-zinc-900">refunded</span> — full refund completed</p>
                <p><span className="font-medium text-zinc-900">partial_refund</span> — partial refund completed</p>
              </div>
            </div>

            <div className="rounded-[2rem] border border-zinc-200 bg-zinc-50 p-6">
              <h3 className="text-lg font-semibold text-zinc-950">
                Important Notes
              </h3>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-zinc-600">
                <li>Use the correct Order ID and Product ID from your purchase.</li>
                <li>One return request should be submitted per item.</li>
                <li>Refund approval depends on seller/admin review.</li>
                <li>Stripe refund processing should be triggered only after approval.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  type?: string
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-zinc-800">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-12 w-full rounded-2xl border border-zinc-300 bg-white px-4 text-sm text-zinc-900 outline-none transition focus:border-yellow-500/40"
      />
    </div>
  )
}