"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import {
  AlertTriangle,
  CheckCircle2,
  FileText,
  Loader2,
  Mail,
  RefreshCw,
  ShieldAlert,
  Store,
  XCircle,
  MessageSquare,
  Eye,
} from "lucide-react"

type Application = {
  user_id: string
  full_name: string
  email: string
  phone?: string | null
  store_name: string
  shop_handle?: string | null
  business_type: string
  application_status: string
  country?: string | null
  business_category?: string | null
  product_type?: string | null
  legal_first_name?: string | null
  legal_last_name?: string | null
  legal_business_name?: string | null
  ein_tin?: string | null
  id_document_url: string | null
  proof_of_address_url: string | null
  irs_document_url: string | null
  business_registration_url: string | null
  business_proof_of_address_url: string | null
  rejection_reason?: string | null
  admin_notes?: string | null
  submitted_at?: string | null
  updated_at?: string | null
}

type SupportTicket = {
  id: string
  user_id: string
  subject: string
  message: string
  status: string
  priority: string
  category: string
  application_status_snapshot: string | null
  attachment_url: string | null
  created_at: string
  updated_at: string
}

export default function AdminPage() {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])

  const [apps, setApps] = useState<Application[]>([])
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [actingUserId, setActingUserId] = useState<string | null>(null)

  useEffect(() => {
    void init()
  }, [])

  async function init() {
    try {
      setLoading(true)

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/marketplace")
        return
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle()

      if (profileError) {
        console.error(profileError)
        router.push("/marketplace")
        return
      }

      if (!profile || profile.role !== "admin") {
        router.push("/marketplace")
        return
      }

      await Promise.all([fetchApps(), fetchTickets()])
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  async function fetchApps() {
    const { data, error } = await supabase
      .from("seller_applications")
      .select("*")
      .order("updated_at", { ascending: false })

    if (error) {
      console.error(error)
      return
    }

    setApps((data ?? []) as Application[])
  }

  async function fetchTickets() {
    const { data, error } = await supabase
      .from("seller_support_tickets")
      .select("*")
      .order("updated_at", { ascending: false })

    if (error) {
      console.error(error)
      return
    }

    setTickets((data ?? []) as SupportTicket[])
  }

  async function refreshAll() {
    try {
      setRefreshing(true)
      await Promise.all([fetchApps(), fetchTickets()])
    } finally {
      setRefreshing(false)
    }
  }

  async function approve(userId: string) {
    try {
      setActingUserId(userId)

      const {
        data: { user: adminUser },
      } = await supabase.auth.getUser()

      await supabase
        .from("seller_applications")
        .update({
          application_status: "approved",
          rejection_reason: null,
          admin_notes: "Approved by admin",
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId)

      await supabase
        .from("seller_verification")
        .update({
          application_status: "approved",
          identity_status: "verified",
          rejection_reason: null,
          admin_notes: "Approved by admin",
          manual_review_required: false,
          reviewed_by: adminUser?.id ?? null,
          reviewed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId)

      const app = apps.find((item) => item.user_id === userId)

      await supabase.from("shops").upsert(
        {
          user_id: userId,
          store_name: app?.store_name || "CreatorGoat Seller Shop",
          slug:
            app?.shop_handle ||
            app?.store_name?.toLowerCase().replace(/\s+/g, "-") ||
            `shop-${userId.slice(0, 8)}`,
          approved: true,
          status: "approved",
        },
        { onConflict: "user_id" }
      )

      await fetchApps()
    } catch (error) {
      console.error(error)
      alert("Could not approve seller.")
    } finally {
      setActingUserId(null)
    }
  }

  async function reject(userId: string) {
    try {
      setActingUserId(userId)

      const reason = prompt("Enter rejection reason") || "Rejected by admin"

      const {
        data: { user: adminUser },
      } = await supabase.auth.getUser()

      await supabase
        .from("seller_applications")
        .update({
          application_status: "rejected",
          rejection_reason: reason,
          admin_notes: reason,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId)

      await supabase
        .from("seller_verification")
        .update({
          application_status: "rejected",
          identity_status: "rejected",
          rejection_reason: reason,
          admin_notes: reason,
          manual_review_required: true,
          reviewed_by: adminUser?.id ?? null,
          reviewed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId)

      await fetchApps()
    } catch (error) {
      console.error(error)
      alert("Could not reject seller.")
    } finally {
      setActingUserId(null)
    }
  }

  async function requestMoreInfo(userId: string) {
    try {
      setActingUserId(userId)

      const note =
        prompt("Enter what seller must provide") || "Additional information required"

      const {
        data: { user: adminUser },
      } = await supabase.auth.getUser()

      await supabase
        .from("seller_applications")
        .update({
          application_status: "more_info_required",
          admin_notes: note,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId)

      await supabase
        .from("seller_verification")
        .update({
          application_status: "more_info_required",
          admin_notes: note,
          manual_review_required: true,
          reviewed_by: adminUser?.id ?? null,
          reviewed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId)

      await fetchApps()
    } catch (error) {
      console.error(error)
      alert("Could not request more info.")
    } finally {
      setActingUserId(null)
    }
  }

  function getStatusTone(status?: string | null) {
    if (!status) return "bg-zinc-100 text-zinc-700"
    if (status === "approved") return "bg-emerald-100 text-emerald-700"
    if (status === "rejected") return "bg-red-100 text-red-700"
    if (status === "more_info_required") return "bg-amber-100 text-amber-800"
    if (status === "submitted") return "bg-blue-100 text-blue-700"
    return "bg-zinc-100 text-zinc-700"
  }

  function userTicketCount(userId: string) {
    return tickets.filter((ticket) => ticket.user_id === userId).length
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white px-6">
        <div className="rounded-[2rem] border border-zinc-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100">
            <Loader2 className="h-5 w-5 animate-spin text-zinc-700" />
          </div>
          <h2 className="text-lg font-semibold text-zinc-900">
            Loading admin dashboard...
          </h2>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-50 px-5 py-8 text-zinc-900 md:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-zinc-500">
              CreatorGoat
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-zinc-950">
              Admin Seller Review
            </h1>
            <p className="mt-2 text-sm text-zinc-600">
              Review seller applications, documents, rejection reasons, and support activity.
            </p>
          </div>

          <button
            onClick={refreshAll}
            disabled={refreshing}
            className="inline-flex items-center gap-2 rounded-2xl border border-zinc-200 bg-white px-5 py-3 text-sm font-medium text-zinc-800 transition hover:bg-zinc-50 disabled:opacity-60"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <AdminStat
            title="Applications"
            value={String(apps.length)}
            icon={<FileText className="h-5 w-5" />}
          />
          <AdminStat
            title="Submitted"
            value={String(apps.filter((a) => a.application_status === "submitted").length)}
            icon={<ShieldAlert className="h-5 w-5" />}
          />
          <AdminStat
            title="Approved"
            value={String(apps.filter((a) => a.application_status === "approved").length)}
            icon={<CheckCircle2 className="h-5 w-5" />}
          />
          <AdminStat
            title="Support Tickets"
            value={String(tickets.length)}
            icon={<MessageSquare className="h-5 w-5" />}
          />
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-zinc-950">
                  Seller Applications
                </h2>
                <p className="mt-1 text-sm text-zinc-500">
                  Approve, reject, or request more information.
                </p>
              </div>
            </div>

            <div className="space-y-5">
              {apps.length === 0 ? (
                <p className="text-sm text-zinc-500">No applications found.</p>
              ) : (
                apps.map((app) => {
                  const busy = actingUserId === app.user_id

                  return (
                    <div
                      key={app.user_id}
                      className="rounded-[1.5rem] border border-zinc-200 bg-white p-5"
                    >
                      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-lg font-semibold text-zinc-950">
                              {app.full_name}
                            </p>
                            <span
                              className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] ${getStatusTone(
                                app.application_status
                              )}`}
                            >
                              {app.application_status || "draft"}
                            </span>
                          </div>

                          <div className="mt-2 space-y-1 text-sm text-zinc-600">
                            <p>{app.email}</p>
                            <p>Store: {app.store_name || "—"}</p>
                            <p>Type: {app.business_type || "—"}</p>
                            <p>Category: {app.business_category || "—"}</p>
                            <p>Products: {app.product_type || "—"}</p>
                            <p>Support tickets: {userTicketCount(app.user_id)}</p>
                          </div>

                          {(app.rejection_reason || app.admin_notes) && (
                            <div className="mt-4 rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                              {app.rejection_reason ? (
                                <p className="text-sm text-red-700">
                                  <span className="font-semibold">Reason:</span>{" "}
                                  {app.rejection_reason}
                                </p>
                              ) : null}

                              {app.admin_notes ? (
                                <p className="mt-2 text-sm text-zinc-700">
                                  <span className="font-semibold">Admin notes:</span>{" "}
                                  {app.admin_notes}
                                </p>
                              ) : null}
                            </div>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => approve(app.user_id)}
                            disabled={busy}
                            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                          >
                            <CheckCircle2 className="h-4 w-4" />
                            Approve
                          </button>

                          <button
                            onClick={() => requestMoreInfo(app.user_id)}
                            disabled={busy}
                            className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2 text-sm font-semibold text-black disabled:opacity-60"
                          >
                            <AlertTriangle className="h-4 w-4" />
                            More Info
                          </button>

                          <button
                            onClick={() => reject(app.user_id)}
                            disabled={busy}
                            className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                          >
                            <XCircle className="h-4 w-4" />
                            Reject
                          </button>
                        </div>
                      </div>

                      <div className="mt-5 grid gap-3 text-sm md:grid-cols-2 xl:grid-cols-3">
                        {app.id_document_url ? (
                          <DocLink href={app.id_document_url} label="View ID" />
                        ) : null}
                        {app.proof_of_address_url ? (
                          <DocLink
                            href={app.proof_of_address_url}
                            label="View Proof of Address"
                          />
                        ) : null}
                        {app.irs_document_url ? (
                          <DocLink
                            href={app.irs_document_url}
                            label="View IRS EIN Letter"
                          />
                        ) : null}
                        {app.business_registration_url ? (
                          <DocLink
                            href={app.business_registration_url}
                            label="View Business Registration"
                          />
                        ) : null}
                        {app.business_proof_of_address_url ? (
                          <DocLink
                            href={app.business_proof_of_address_url}
                            label="View Business Address Proof"
                          />
                        ) : null}
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>

          <div className="rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-sm">
            <div className="mb-5">
              <h2 className="text-xl font-semibold text-zinc-950">
                Support Tickets
              </h2>
              <p className="mt-1 text-sm text-zinc-500">
                Quick view of seller messages to CreatorGoat team.
              </p>
            </div>

            <div className="space-y-4">
              {tickets.length === 0 ? (
                <p className="text-sm text-zinc-500">No tickets found.</p>
              ) : (
                tickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    className="rounded-[1.5rem] border border-zinc-200 bg-white p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-semibold text-zinc-950">
                          {ticket.subject}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-2 text-xs text-zinc-500">
                          <span>{ticket.category}</span>
                          <span>•</span>
                          <span>{ticket.priority}</span>
                          <span>•</span>
                          <span>{ticket.status}</span>
                        </div>

                        <p className="mt-3 line-clamp-3 text-sm text-zinc-600">
                          {ticket.message}
                        </p>

                        {ticket.attachment_url ? (
                          <a
                            href={ticket.attachment_url}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-zinc-900 underline"
                          >
                            <Eye className="h-4 w-4" />
                            View attachment
                          </a>
                        ) : null}
                      </div>

                      <div className="shrink-0 text-xs text-zinc-500">
                        {new Date(ticket.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function AdminStat({
  title,
  value,
  icon,
}: {
  title: string
  value: string
  icon: React.ReactNode
}) {
  return (
    <div className="rounded-[1.5rem] border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-900">
        {icon}
      </div>
      <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">{title}</p>
      <p className="mt-2 text-lg font-semibold text-zinc-950">{value}</p>
    </div>
  )
}

function DocLink({
  href,
  label,
}: {
  href: string
  label: string
}) {
  return (
    <a
      className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 font-medium text-zinc-800 transition hover:bg-zinc-100"
      href={href}
      target="_blank"
      rel="noreferrer"
    >
      <FileText className="h-4 w-4" />
      {label}
    </a>
  )
}