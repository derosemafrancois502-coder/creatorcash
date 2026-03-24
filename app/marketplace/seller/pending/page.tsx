"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  CheckCircle2,
  Clock3,
  FileCheck2,
  Lock,
  ShieldCheck,
  Store,
  Wallet,
  LifeBuoy,
  AlertTriangle,
  RefreshCw,
  Upload,
  XCircle,
} from "lucide-react"

type PendingData = {
  application_status?: string | null
  identity_status?: string | null
  stripe_status?: string | null
  stripe_onboarding_complete?: boolean | null
  email_verified?: boolean | null
  phone_verified?: boolean | null
  manual_review_required?: boolean | null
  approved_at?: string | null
  rejection_reason?: string | null
  admin_notes?: string | null
}

type ApplicationData = {
  store_name?: string | null
  business_type?: string | null
}

export default function SellerPendingPage() {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])

  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [fullName, setFullName] = useState("")
  const [storeName, setStoreName] = useState("")
  const [businessType, setBusinessType] = useState("")
  const [verification, setVerification] = useState<PendingData | null>(null)

  useEffect(() => {
    void loadData()
  }, [router, supabase])

  async function loadData() {
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
        .select("full_name, role")
        .eq("id", user.id)
        .maybeSingle()

      if (profileError) {
        console.error(
          "Load seller pending profile error:",
          profileError.message,
          profileError.details,
          profileError.hint
        )
      }

      if (profile?.full_name) {
        setFullName(profile.full_name)
      }

      const { data: application, error: applicationError } = await supabase
        .from("seller_applications")
        .select("store_name, business_type")
        .eq("user_id", user.id)
        .maybeSingle()

      if (applicationError) {
        console.error(
          "Load seller application error:",
          applicationError.message,
          applicationError.details,
          applicationError.hint
        )
      }

      if (application?.store_name) {
        setStoreName(application.store_name)
      }

      if (application?.business_type) {
        setBusinessType(application.business_type)
      }

      const { data: verificationData, error: verificationError } = await supabase
        .from("seller_verification")
        .select(
          "application_status, identity_status, stripe_status, stripe_onboarding_complete, email_verified, phone_verified, manual_review_required, approved_at, rejection_reason, admin_notes"
        )
        .eq("user_id", user.id)
        .maybeSingle()

      if (verificationError) {
        console.error(
          "Load seller verification error:",
          verificationError.message,
          verificationError.details,
          verificationError.hint
        )
      }

      setVerification(verificationData ?? null)

      const isApproved =
        verificationData?.application_status === "approved" &&
        verificationData?.identity_status === "verified" &&
        verificationData?.stripe_onboarding_complete === true

      if (isApproved) {
        router.push("/marketplace/seller")
        return
      }
    } catch (error) {
      console.error("Load seller pending page error:", error)
    } finally {
      setLoading(false)
    }
  }

  async function refreshStatus() {
    try {
      setRefreshing(true)
      await loadData()
    } finally {
      setRefreshing(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white px-6">
        <div className="rounded-[2rem] border border-zinc-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 h-12 w-12 animate-pulse rounded-full bg-zinc-200" />
          <h2 className="text-lg font-semibold text-zinc-900">
            Loading seller status...
          </h2>
          <p className="mt-2 text-sm text-zinc-600">
            Checking your onboarding progress.
          </p>
        </div>
      </div>
    )
  }

  const applicationStatus = verification?.application_status ?? "submitted"
  const identityStatus = verification?.identity_status ?? "identity_pending"
  const stripeStatus = verification?.stripe_status ?? "stripe_pending"
  const stripeComplete = verification?.stripe_onboarding_complete ?? false
  const emailVerified = verification?.email_verified ?? false
  const phoneVerified = verification?.phone_verified ?? false
  const rejectionReason = verification?.rejection_reason ?? ""
  const adminNotes = verification?.admin_notes ?? ""

  const isRejected = applicationStatus === "rejected"
  const isMoreInfoRequired = applicationStatus === "more_info_required"

  const progressChecks = [
    {
      label: "Application submitted",
      description: "Your seller application is in the onboarding pipeline.",
      done:
        applicationStatus === "submitted" ||
        applicationStatus === "under_review" ||
        applicationStatus === "approved" ||
        applicationStatus === "more_info_required",
      icon: FileCheck2,
    },
    {
      label: "Identity verification",
      description: "Government ID and legal identity review.",
      done: identityStatus === "verified",
      icon: ShieldCheck,
    },
    {
      label: "Payout onboarding",
      description: "Stripe Connect and tax/payout setup.",
      done: stripeComplete || stripeStatus === "complete",
      icon: Wallet,
    },
    {
      label: "Final marketplace approval",
      description: "CreatorGoat review before live selling access.",
      done: applicationStatus === "approved",
      icon: BadgeCheck,
    },
  ]

  const isApproved =
    applicationStatus === "approved" &&
    identityStatus === "verified" &&
    stripeComplete === true

  const topActionHref = isApproved
    ? "/marketplace/seller"
    : "/marketplace/seller/apply"

  const topActionLabel = isApproved ? "Open Seller Dashboard" : "Resume Application"

  return (
    <div className="min-h-screen bg-white text-zinc-900">
      <div className="border-b border-zinc-200 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-8">
          <Link
            href="/marketplace"
            className="text-sm font-medium text-zinc-700 transition hover:text-zinc-950"
          >
            Marketplace
          </Link>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={refreshStatus}
              disabled={refreshing}
              className="inline-flex items-center gap-2 rounded-full border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-800 transition hover:bg-zinc-50 disabled:opacity-60"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </button>

            <Link
              href={topActionHref}
              className="inline-flex items-center gap-2 rounded-full border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-800 transition hover:bg-zinc-50"
            >
              {topActionLabel}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-5 py-8 md:px-8 md:py-10">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <main className="space-y-6">
            <div className="overflow-hidden rounded-[2rem] border border-zinc-200 bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-800 p-8 text-white shadow-sm md:p-10">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/80">
                {isRejected ? (
                  <XCircle className="h-3.5 w-3.5" />
                ) : isMoreInfoRequired ? (
                  <AlertTriangle className="h-3.5 w-3.5" />
                ) : isApproved ? (
                  <BadgeCheck className="h-3.5 w-3.5" />
                ) : (
                  <Clock3 className="h-3.5 w-3.5" />
                )}
                {isRejected
                  ? "Application Rejected"
                  : isMoreInfoRequired
                  ? "More Information Required"
                  : isApproved
                  ? "Seller Approved"
                  : "Verification Pending"}
              </div>

              <h1 className="mt-5 text-3xl font-semibold md:text-5xl">
                {isRejected
                  ? "Your seller application was not approved"
                  : isMoreInfoRequired
                  ? "Your seller account needs more information"
                  : isApproved
                  ? "Your seller account is approved"
                  : "Your seller account is under review"}
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-white/75 md:text-base">
                {fullName ? `${fullName}, ` : ""}
                {isRejected
                  ? "your CreatorGoat seller onboarding could not be approved at this time. Review the reason below, update your documents, and contact the CreatorGoat team if you want to appeal."
                  : isMoreInfoRequired
                  ? "your application needs more information before approval. Review the notes below, re-upload the requested documents, and contact the CreatorGoat team if needed."
                  : isApproved
                  ? "your CreatorGoat seller onboarding is complete. You can now open your seller dashboard and continue to your live seller workflow."
                  : "your CreatorGoat seller onboarding has been received. You can finish any remaining steps while our system and review process complete identity, payout, and marketplace approval checks."}
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                <StatCard
                  title="Store"
                  value={storeName || "Pending setup"}
                  icon={Store}
                />
                <StatCard
                  title="Application"
                  value={formatStatus(applicationStatus)}
                  icon={FileCheck2}
                />
                <StatCard
                  title="Identity"
                  value={formatStatus(identityStatus)}
                  icon={ShieldCheck}
                />
              </div>
            </div>

            {(isRejected || isMoreInfoRequired) && (
              <div
                className={`rounded-[2rem] border p-6 shadow-sm md:p-8 ${
                  isRejected
                    ? "border-red-200 bg-red-50"
                    : "border-amber-200 bg-amber-50"
                }`}
              >
                <div className="flex items-start gap-3">
                  {isRejected ? (
                    <XCircle className="mt-0.5 h-5 w-5 text-red-700" />
                  ) : (
                    <AlertTriangle className="mt-0.5 h-5 w-5 text-amber-700" />
                  )}

                  <div className="flex-1">
                    <h2
                      className={`text-lg font-semibold ${
                        isRejected ? "text-red-900" : "text-amber-900"
                      }`}
                    >
                      {isRejected ? "Review outcome" : "More information requested"}
                    </h2>

                    {rejectionReason ? (
                      <p
                        className={`mt-2 text-sm leading-6 ${
                          isRejected ? "text-red-800" : "text-amber-800"
                        }`}
                      >
                        <span className="font-semibold">Reason:</span> {rejectionReason}
                      </p>
                    ) : null}

                    {adminNotes ? (
                      <p
                        className={`mt-2 text-sm leading-6 ${
                          isRejected ? "text-red-800" : "text-amber-800"
                        }`}
                      >
                        <span className="font-semibold">Admin notes:</span> {adminNotes}
                      </p>
                    ) : null}

                    <div className="mt-5 flex flex-wrap gap-3">
                      <Link
                        href="/marketplace/seller/apply"
                        className={`inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold ${
                          isRejected
                            ? "bg-red-600 text-white"
                            : "bg-amber-500 text-black"
                        }`}
                      >
                        <Upload className="h-4 w-4" />
                        Resume & Re-upload Documents
                      </Link>

                      <Link
                        href="/marketplace/seller/support"
                        className="inline-flex items-center gap-2 rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-sm font-semibold text-zinc-900"
                      >
                        <LifeBuoy className="h-4 w-4" />
                        Contact CreatorGoat Team
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-sm md:p-8">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-zinc-950">
                  Seller onboarding progress
                </h2>
                <p className="mt-2 text-sm leading-6 text-zinc-600">
                  You will only be able to publish products and receive payouts
                  after all required checkpoints are complete.
                </p>
              </div>

              <div className="space-y-4">
                {progressChecks.map((item) => {
                  const Icon = item.icon

                  return (
                    <div
                      key={item.label}
                      className="flex items-start gap-4 rounded-3xl border border-zinc-200 bg-zinc-50 p-5"
                    >
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
                          item.done
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-zinc-200 text-zinc-700"
                        }`}
                      >
                        {item.done ? (
                          <CheckCircle2 className="h-5 w-5" />
                        ) : (
                          <Icon className="h-5 w-5" />
                        )}
                      </div>

                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-3">
                          <h3 className="text-sm font-semibold text-zinc-900">
                            {item.label}
                          </h3>
                          <span
                            className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.15em] ${
                              item.done
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-zinc-200 text-zinc-700"
                            }`}
                          >
                            {item.done ? "Complete" : "Pending"}
                          </span>
                        </div>
                        <p className="mt-2 text-sm leading-6 text-zinc-600">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-sm md:p-8">
              <div className="mb-5">
                <h2 className="text-xl font-semibold text-zinc-950">
                  Hard-blocked seller actions
                </h2>
                <p className="mt-2 text-sm leading-6 text-zinc-600">
                  Until your account is approved, CreatorGoat must block selling
                  actions to reduce fraud, fake stores, and payout risk.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {[
                  "Publish products",
                  "Receive payouts",
                  "Appear in marketplace search",
                  "Message buyers as an active seller",
                  "Create discount offers",
                  "Go live as a verified shop",
                ].map((item) => (
                  <div
                    key={item}
                    className="rounded-3xl border border-zinc-200 bg-zinc-50 p-4"
                  >
                    <div className="flex items-start gap-3">
                      <Lock className="mt-0.5 h-4 w-4 text-zinc-700" />
                      <p className="text-sm font-medium text-zinc-900">{item}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-3xl border border-amber-200 bg-amber-50 p-5">
                <p className="text-sm font-medium text-amber-900">
                  Block message for publish action:
                </p>
                <p className="mt-2 text-sm leading-6 text-amber-800">
                  Your seller account must be fully verified before products can
                  go live.
                </p>
              </div>
            </div>
          </main>

          <aside className="space-y-6">
            <div className="rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-zinc-950">
                Current status
              </h2>

              <div className="mt-5 space-y-4">
                <StatusRow
                  label="Application Status"
                  value={formatStatus(applicationStatus)}
                />
                <StatusRow
                  label="Identity Status"
                  value={formatStatus(identityStatus)}
                />
                <StatusRow
                  label="Stripe Status"
                  value={formatStatus(stripeStatus)}
                />
                <StatusRow
                  label="Email Verified"
                  value={emailVerified ? "Verified" : "Pending"}
                />
                <StatusRow
                  label="Phone Verified"
                  value={phoneVerified ? "Verified" : "Pending"}
                />
                <StatusRow
                  label="Business Type"
                  value={formatStatus(businessType || "seller")}
                />
              </div>

              <div className="mt-6 space-y-3">
                <Link
                  href={topActionHref}
                  className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-zinc-900 text-sm font-semibold text-white transition hover:scale-[1.01]"
                >
                  {topActionLabel}
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <Link
                  href="/marketplace/seller/support"
                  className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-zinc-200 bg-white text-sm font-semibold text-zinc-900 transition hover:bg-zinc-50"
                >
                  <LifeBuoy className="h-4 w-4" />
                  Open Support Center
                </Link>
              </div>
            </div>

            <div className="rounded-[2rem] border border-zinc-200 bg-zinc-50 p-6">
              <h2 className="text-lg font-semibold text-zinc-950">
                CreatorGoat review notes
              </h2>
              <p className="mt-2 text-sm leading-6 text-zinc-600">
                High-quality marketplaces do not approve sellers instantly. This
                review flow protects buyers, reduces chargebacks, and keeps the
                platform premium.
              </p>

              <div className="mt-5 space-y-3">
                <TrustRow
                  icon={ShieldCheck}
                  text="Identity-first seller verification"
                />
                <TrustRow icon={Wallet} text="Controlled payout onboarding" />
                <TrustRow
                  icon={Building2}
                  text="Manual review for flagged sellers"
                />
                <TrustRow icon={BadgeCheck} text="Approved sellers only go live" />
              </div>

              <div className="mt-6 rounded-3xl border border-zinc-200 bg-white p-4">
                <div className="flex items-start gap-3">
                  <LifeBuoy className="mt-0.5 h-5 w-5 text-zinc-700" />
                  <div>
                    <p className="text-sm font-semibold text-zinc-900">
                      Need help?
                    </p>
                    <p className="mt-1 text-sm leading-6 text-zinc-600">
                      Contact CreatorGoat Review Team if you need to explain your
                      situation, submit more files, or appeal a rejection.
                    </p>
                    <Link
                      href="/marketplace/seller/support"
                      className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-zinc-900 underline"
                    >
                      Contact Team
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}

function formatStatus(value?: string | null) {
  if (!value) return "Pending"
  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

function StatCard({
  title,
  value,
  icon: Icon,
}: {
  title: string
  value: string
  icon: React.ComponentType<{ className?: string }>
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/10 p-4 backdrop-blur-xl">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10">
        <Icon className="h-5 w-5 text-white" />
      </div>
      <p className="text-xs uppercase tracking-[0.15em] text-white/60">
        {title}
      </p>
      <p className="mt-2 text-sm font-semibold text-white">{value}</p>
    </div>
  )
}

function StatusRow({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-zinc-100 pb-3 text-sm last:border-b-0 last:pb-0">
      <span className="text-zinc-500">{label}</span>
      <span className="text-right font-medium text-zinc-900">{value}</span>
    </div>
  )
}

function TrustRow({
  icon: Icon,
  text,
}: {
  icon: React.ComponentType<{ className?: string }>
  text: string
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white">
        <Icon className="h-5 w-5 text-zinc-900" />
      </div>
      <p className="pt-2 text-sm font-medium text-zinc-800">{text}</p>
    </div>
  )
}