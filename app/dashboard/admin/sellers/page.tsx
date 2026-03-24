"use client"

import { useEffect, useMemo, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { sendSellerApprovedEmail } from "@/lib/email/sendSellerApprovedEmail"
import { sendSellerRejectedEmail } from "@/lib/email/sendSellerRejectedEmail"
import {
  BadgeCheck,
  CheckCircle2,
  Clock3,
  Mail,
  Phone,
  ShieldAlert,
  Store,
  User,
  XCircle,
} from "lucide-react"

type SellerApplication = {
  user_id: string
  full_name: string | null
  email: string | null
  phone: string | null
  country: string | null
  business_type: string | null
  store_name: string | null
  shop_handle: string | null
  business_category: string | null
  product_type: string | null
  bio: string | null
  website: string | null
  social_link: string | null
  shipping_countries: string | null
  legal_first_name: string | null
  legal_last_name: string | null
  dob: string | null
  address_line_1: string | null
  city: string | null
  state: string | null
  zip_code: string | null
  nationality: string | null
  id_type: string | null
  id_number: string | null
  id_document_url: string | null
  proof_of_address_url: string | null
  legal_business_name: string | null
  ein_tin: string | null
  irs_document_url: string | null
  business_registration_url: string | null
  business_proof_of_address_url: string | null
  payout_country: string | null
  account_holder_name: string | null
  payout_consent: boolean | null
  tos_accepted: boolean | null
  application_status: string | null
  submitted_at: string | null
  updated_at: string | null
}

type SellerVerification = {
  user_id: string
  application_status: string | null
  identity_status: string | null
  stripe_status: string | null
  email_verified: boolean | null
  phone_verified: boolean | null
  manual_review_required: boolean | null
  stripe_onboarding_complete: boolean | null
  approved_at: string | null
  rejected_reason: string | null
  updated_at: string | null
}

type SellerRow = SellerApplication & {
  verification: SellerVerification | null
}

export default function AdminSellersPage() {
  const supabase = useMemo(() => createClient(), [])
  const [rows, setRows] = useState<SellerRow[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [message, setMessage] = useState("")

  async function loadSellers() {
    try {
      setLoading(true)
      setMessage("")

      const { data: apps, error: appsError } = await supabase
        .from("seller_applications")
        .select("*")
        .order("submitted_at", { ascending: false })

      if (appsError) {
        console.error("Load seller applications error:", appsError)
        setMessage("Failed to load seller applications.")
        setRows([])
        return
      }

      const applicationRows = (apps || []) as SellerApplication[]
      const userIds = applicationRows.map((item) => item.user_id).filter(Boolean)

      let verificationMap = new Map<string, SellerVerification>()

      if (userIds.length > 0) {
        const { data: verifications, error: verificationError } = await supabase
          .from("seller_verification")
          .select("*")
          .in("user_id", userIds)

        if (verificationError) {
          console.error("Load seller verification error:", verificationError)
        } else {
          verificationMap = new Map(
            ((verifications || []) as SellerVerification[]).map((item) => [
              item.user_id,
              item,
            ])
          )
        }
      }

      const merged: SellerRow[] = applicationRows.map((app) => ({
        ...app,
        verification: verificationMap.get(app.user_id) || null,
      }))

      setRows(merged)
    } catch (error) {
      console.error("Admin sellers load crash:", error)
      setMessage("Something went wrong while loading sellers.")
      setRows([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSellers()
  }, [])

  async function approveSeller(row: SellerRow) {
    try {
      setActionLoadingId(row.user_id)
      setMessage("")

      const now = new Date().toISOString()

      const { error: appError } = await supabase
        .from("seller_applications")
        .update({
          application_status: "approved",
          updated_at: now,
        })
        .eq("user_id", row.user_id)

      if (appError) {
        console.error("Approve application error:", appError)
        setMessage("Could not approve seller application.")
        return
      }

      const { error: verificationError } = await supabase
        .from("seller_verification")
        .upsert(
          {
            user_id: row.user_id,
            application_status: "approved",
            identity_status: "verified",
            stripe_status: "approved",
            email_verified: true,
            phone_verified: true,
            manual_review_required: false,
            approved_at: now,
            rejected_reason: null,
            updated_at: now,
          },
          { onConflict: "user_id" }
        )

      if (verificationError) {
        console.error("Approve verification error:", verificationError)
        setMessage("Application approved, but verification update failed.")
        return
      }

      const { error: payoutError } = await supabase
        .from("seller_payouts")
        .upsert(
          {
            user_id: row.user_id,
            onboarding_complete:
              row.verification?.stripe_onboarding_complete ?? false,
            payouts_enabled: true,
            charges_enabled: true,
            updated_at: now,
          },
          { onConflict: "user_id" }
        )

      if (payoutError) {
        console.error("Approve payout error:", payoutError)
      }

      if (row.email) {
        await sendSellerApprovedEmail(row.email, row.full_name || undefined)
      }

      setMessage("Seller approved successfully.")
      await loadSellers()
    } catch (error) {
      console.error("Approve seller crash:", error)
      setMessage("Something went wrong while approving the seller.")
    } finally {
      setActionLoadingId(null)
    }
  }

  async function rejectSeller(row: SellerRow) {
    try {
      setActionLoadingId(row.user_id)
      setMessage("")

      const now = new Date().toISOString()

      const { error: appError } = await supabase
        .from("seller_applications")
        .update({
          application_status: "rejected",
          updated_at: now,
        })
        .eq("user_id", row.user_id)

      if (appError) {
        console.error("Reject application error:", appError)
        setMessage("Could not reject seller application.")
        return
      }

      const { error: verificationError } = await supabase
        .from("seller_verification")
        .upsert(
          {
            user_id: row.user_id,
            application_status: "rejected",
            identity_status: "rejected",
            stripe_status: "rejected",
            manual_review_required: false,
            rejected_reason: "Application rejected by admin review.",
            updated_at: now,
          },
          { onConflict: "user_id" }
        )

      if (verificationError) {
        console.error("Reject verification error:", verificationError)
        setMessage("Application rejected, but verification update failed.")
        return
      }

      const { error: payoutError } = await supabase
        .from("seller_payouts")
        .upsert(
          {
            user_id: row.user_id,
            onboarding_complete: false,
            payouts_enabled: false,
            charges_enabled: false,
            updated_at: now,
          },
          { onConflict: "user_id" }
        )

      if (payoutError) {
        console.error("Reject payout error:", payoutError)
      }

      if (row.email) {
        await sendSellerRejectedEmail(row.email, row.full_name || undefined)
      }

      setMessage("Seller rejected successfully.")
      await loadSellers()
    } catch (error) {
      console.error("Reject seller crash:", error)
      setMessage("Something went wrong while rejecting the seller.")
    } finally {
      setActionLoadingId(null)
    }
  }

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return rows

    return rows.filter((row) =>
      [
        row.full_name || "",
        row.email || "",
        row.phone || "",
        row.store_name || "",
        row.shop_handle || "",
        row.business_category || "",
        row.application_status || "",
        row.verification?.identity_status || "",
        row.verification?.stripe_status || "",
      ]
        .join(" ")
        .toLowerCase()
        .includes(q)
    )
  }, [rows, search])

  return (
    <div className="min-h-screen bg-white px-6 py-8 text-zinc-900">
      <div className="mx-auto max-w-7xl space-y-8">
        <section className="rounded-[2rem] border border-zinc-200 bg-zinc-50 p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-zinc-500">
                Admin
              </p>
              <h1 className="mt-3 text-4xl font-semibold text-zinc-950">
                Seller Applications
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-zinc-600">
                Review seller applications, verify readiness, approve trusted sellers,
                and reject applications that should not enter the marketplace.
              </p>
            </div>

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search sellers..."
              className="h-12 w-full max-w-sm rounded-2xl border border-zinc-200 bg-white px-4 text-sm outline-none transition focus:border-zinc-400"
            />
          </div>
        </section>

        {message ? (
          <div className="rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-700">
            {message}
          </div>
        ) : null}

        {loading ? (
          <div className="rounded-[2rem] border border-zinc-200 bg-white p-8 text-sm text-zinc-600">
            Loading seller applications...
          </div>
        ) : filteredRows.length === 0 ? (
          <div className="rounded-[2rem] border border-zinc-200 bg-white p-8 text-sm text-zinc-600">
            No seller applications found.
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredRows.map((row) => {
              const isPending =
                (row.application_status || "draft") === "submitted" ||
                (row.application_status || "draft") === "draft"

              const isApproved = row.application_status === "approved"
              const isRejected = row.application_status === "rejected"

              return (
                <div
                  key={row.user_id}
                  className="rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-sm"
                >
                  <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
                    <div className="space-y-5">
                      <div className="flex flex-wrap items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-800">
                          <User className="h-5 w-5" />
                        </div>

                        <div>
                          <h2 className="text-xl font-semibold text-zinc-950">
                            {row.full_name || "Unnamed Seller"}
                          </h2>
                          <p className="text-sm text-zinc-600">
                            {row.email || "No email"}
                          </p>
                        </div>

                        <StatusBadge
                          label={row.application_status || "draft"}
                          type={
                            isApproved
                              ? "approved"
                              : isRejected
                              ? "rejected"
                              : "pending"
                          }
                        />
                      </div>

                      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        <InfoCard
                          icon={<Store className="h-4 w-4" />}
                          label="Store"
                          value={row.store_name || "—"}
                          subvalue={row.shop_handle || "—"}
                        />

                        <InfoCard
                          icon={<Mail className="h-4 w-4" />}
                          label="Email"
                          value={row.email || "—"}
                          subvalue={row.phone || "—"}
                        />

                        <InfoCard
                          icon={<BadgeCheck className="h-4 w-4" />}
                          label="Business"
                          value={row.business_type || "—"}
                          subvalue={row.business_category || "—"}
                        />

                        <InfoCard
                          icon={<Clock3 className="h-4 w-4" />}
                          label="Submitted"
                          value={
                            row.submitted_at
                              ? new Date(row.submitted_at).toLocaleString()
                              : "—"
                          }
                          subvalue={row.product_type || "—"}
                        />

                        <InfoCard
                          icon={<CheckCircle2 className="h-4 w-4" />}
                          label="Identity"
                          value={row.verification?.identity_status || "pending"}
                          subvalue={
                            row.id_document_url ? "ID uploaded" : "ID missing"
                          }
                        />

                        <InfoCard
                          icon={<ShieldAlert className="h-4 w-4" />}
                          label="Payout"
                          value={row.verification?.stripe_status || "pending"}
                          subvalue={
                            row.verification?.stripe_onboarding_complete
                              ? "Stripe ready"
                              : "Stripe pending"
                          }
                        />
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="rounded-3xl border border-zinc-200 bg-zinc-50 p-4">
                          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
                            Seller Bio
                          </p>
                          <p className="mt-2 text-sm leading-6 text-zinc-700">
                            {row.bio || "No bio provided."}
                          </p>
                        </div>

                        <div className="rounded-3xl border border-zinc-200 bg-zinc-50 p-4">
                          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
                            Legal / Business
                          </p>
                          <div className="mt-2 space-y-1 text-sm text-zinc-700">
                            <p>
                              Legal Name:{" "}
                              <span className="font-medium">
                                {[row.legal_first_name, row.legal_last_name]
                                  .filter(Boolean)
                                  .join(" ") || "—"}
                              </span>
                            </p>
                            <p>
                              Business Name:{" "}
                              <span className="font-medium">
                                {row.legal_business_name || "—"}
                              </span>
                            </p>
                            <p>
                              EIN / TIN:{" "}
                              <span className="font-medium">
                                {row.ein_tin || "—"}
                              </span>
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
                        <DocLink
                          label="ID Document"
                          href={row.id_document_url}
                        />
                        <DocLink
                          label="Proof of Address"
                          href={row.proof_of_address_url}
                        />
                        <DocLink
                          label="IRS Document"
                          href={row.irs_document_url}
                        />
                        <DocLink
                          label="Business Registration"
                          href={row.business_registration_url}
                        />
                        <DocLink
                          label="Business Address Proof"
                          href={row.business_proof_of_address_url}
                        />
                      </div>
                    </div>

                    <div className="flex w-full flex-col gap-3 xl:w-64">
                      <button
                        type="button"
                        onClick={() => approveSeller(row)}
                        disabled={actionLoadingId === row.user_id}
                        className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-zinc-900 px-5 text-sm font-semibold text-white transition hover:scale-[1.01] disabled:opacity-60"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        {actionLoadingId === row.user_id
                          ? "Processing..."
                          : "Approve Seller"}
                      </button>

                      <button
                        type="button"
                        onClick={() => rejectSeller(row)}
                        disabled={actionLoadingId === row.user_id}
                        className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-5 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:opacity-60"
                      >
                        <XCircle className="h-4 w-4" />
                        {actionLoadingId === row.user_id
                          ? "Processing..."
                          : "Reject Seller"}
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

function StatusBadge({
  label,
  type,
}: {
  label: string
  type: "pending" | "approved" | "rejected"
}) {
  const styles =
    type === "approved"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : type === "rejected"
      ? "border-red-200 bg-red-50 text-red-700"
      : "border-amber-200 bg-amber-50 text-amber-700"

  return (
    <span
      className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${styles}`}
    >
      {label}
    </span>
  )
}

function InfoCard({
  icon,
  label,
  value,
  subvalue,
}: {
  icon: React.ReactNode
  label: string
  value: string
  subvalue?: string
}) {
  return (
    <div className="rounded-3xl border border-zinc-200 bg-zinc-50 p-4">
      <div className="mb-2 flex items-center gap-2 text-zinc-500">
        {icon}
        <p className="text-xs font-semibold uppercase tracking-[0.2em]">
          {label}
        </p>
      </div>
      <p className="text-sm font-semibold text-zinc-900">{value || "—"}</p>
      {subvalue ? (
        <p className="mt-1 text-xs text-zinc-600">{subvalue}</p>
      ) : null}
    </div>
  )
}

function DocLink({ label, href }: { label: string; href: string | null }) {
  return (
    <div className="rounded-3xl border border-zinc-200 bg-zinc-50 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
        {label}
      </p>
      {href ? (
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          className="mt-2 inline-block text-sm font-medium text-zinc-900 underline"
        >
          View document
        </a>
      ) : (
        <p className="mt-2 text-sm text-zinc-600">Missing</p>
      )}
    </div>
  )
}