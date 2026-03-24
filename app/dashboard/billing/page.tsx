"use client"

import { useEffect, useMemo, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import {
  checkModuleAccess,
  getPlanDisplay,
  getTrialCountdown,
  type AccessProfile,
} from "@/lib/access/guard"

type PlanKey = "starter" | "pro" | "founder_elite"
type CreditPackKey = "5" | "10" | "25"

type ProfileRow = {
  id?: string | null
  plan?: string | null
  trial_expires_at?: string | null
  subscription_expires_at?: string | null
  extra_video_credits?: number | null
  videos_used?: number | null
}

export default function BillingPage() {
  const supabase = useMemo(() => createClient(), [])

  const [subscriptionLoading, setSubscriptionLoading] = useState<PlanKey | "">("")
  const [creditsLoading, setCreditsLoading] = useState<CreditPackKey | "">("")
  const [pageMessage, setPageMessage] = useState("")
  const [checkingSession, setCheckingSession] = useState(true)

  const [profile, setProfile] = useState<ProfileRow | null>(null)
  const [profileLoading, setProfileLoading] = useState(true)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)

    if (params.get("subscription") === "success") {
      setPageMessage("Subscription started successfully.")
    } else if (params.get("subscription") === "cancel") {
      setPageMessage("Subscription checkout cancelled.")
    } else if (params.get("credits") === "success") {
      setPageMessage("Credit purchase started successfully.")
    } else if (params.get("credits") === "cancel") {
      setPageMessage("Credit checkout cancelled.")
    }

    async function loadSessionAndProfile() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (!session?.user) {
          setPageMessage("Please log in first to upgrade or buy credits.")
          setProfile(null)
          return
        }

        const loadedProfile = await loadProfile()

        if (!loadedProfile) {
          setProfile(null)
          setPageMessage("Unable to load billing profile right now.")
          return
        }

        setProfile(loadedProfile)
      } catch (error) {
        console.log("BILLING PROFILE LOAD ERROR:", error)
        setProfile(null)
        setPageMessage("Unable to load billing profile right now.")
      } finally {
        setCheckingSession(false)
        setProfileLoading(false)
      }
    }

    loadSessionAndProfile()
  }, [supabase])

  async function getAccessToken() {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    return session?.access_token || ""
  }

  async function loadProfile(): Promise<ProfileRow | null> {
    const accessToken = await getAccessToken()

    if (!accessToken) {
      return null
    }

    const response = await fetch("/api/profile/billing", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    const rawText = await response.text()
    let data: any = null

    try {
      data = rawText ? JSON.parse(rawText) : null
    } catch {
      throw new Error("Billing profile route did not return valid JSON.")
    }

    if (!response.ok) {
      console.log("PROFILE API ERROR:", data)
      return null
    }

    return (data?.profile as ProfileRow) || null
  }

  async function refreshProfile() {
    try {
      setPageMessage("")

      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session?.user) {
        setPageMessage("Please log in first to refresh billing status.")
        return
      }

      const loadedProfile = await loadProfile()

      if (!loadedProfile) {
        setProfile(null)
        setPageMessage("Unable to refresh billing profile right now.")
        return
      }

      setProfile(loadedProfile)
    } catch (error) {
      console.log("REFRESH PROFILE ERROR:", error)
      setPageMessage("Unable to refresh billing profile right now.")
    }
  }

  async function startSubscription(plan: PlanKey) {
    try {
      setSubscriptionLoading(plan)
      setPageMessage("")

      const accessToken = await getAccessToken()

      if (!accessToken) {
        setPageMessage("Please log in first.")
        return
      }

      const response = await fetch("/api/stripe/subscription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ plan }),
      })

      const rawText = await response.text()
      let data: any = null

      try {
        data = rawText ? JSON.parse(rawText) : null
      } catch {
        throw new Error("Subscription route did not return valid JSON.")
      }

      if (!response.ok) {
        throw new Error(
          data?.error ||
            data?.details ||
            "Failed to start subscription checkout."
        )
      }

      if (!data?.url) {
        throw new Error("Stripe subscription checkout URL was not returned.")
      }

      window.location.href = data.url
    } catch (error) {
      setPageMessage(
        error instanceof Error
          ? error.message
          : "Failed to start subscription checkout."
      )
    } finally {
      setSubscriptionLoading("")
    }
  }

  async function buyCredits(creditPack: CreditPackKey) {
    try {
      setCreditsLoading(creditPack)
      setPageMessage("")

      const accessToken = await getAccessToken()

      if (!accessToken) {
        setPageMessage("Please log in first.")
        return
      }

      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ creditPack }),
      })

      const rawText = await response.text()
      let data: any = null

      try {
        data = rawText ? JSON.parse(rawText) : null
      } catch {
        throw new Error("Credits route did not return valid JSON.")
      }

      if (!response.ok) {
        throw new Error(
          data?.error ||
            data?.details ||
            "Failed to create Stripe credit checkout."
        )
      }

      if (!data?.url) {
        throw new Error("Stripe credit checkout URL was not returned.")
      }

      window.location.href = data.url
    } catch (error) {
      setPageMessage(
        error instanceof Error ? error.message : "Failed to buy credits."
      )
    } finally {
      setCreditsLoading("")
    }
  }

  const access = profile
    ? checkModuleAccess(profile as AccessProfile, {})
    : null

  const trial = profile
    ? getTrialCountdown(profile.trial_expires_at || null)
    : null

  const currentPlanLabel = useMemo(() => {
    if (profileLoading) return "..."
    if (!profile) return "Unavailable"
    return getPlanDisplay(profile.plan)
  }, [profileLoading, profile])

  const currentCredits = Number(profile?.extra_video_credits ?? 0)
  const currentVideosUsed = Number(profile?.videos_used ?? 0)
  const isFreePlan = access ? access.normalizedPlan === "free" : false

  const accessStatus = useMemo(() => {
    if (profileLoading) return "..."
    if (!profile || !access) return "Unavailable"

    if (access.normalizedPlan === "free") {
      return trial?.expired ? "Expired" : "Trial Active"
    }

    return access.subscriptionExpired ? "Expired" : "Active"
  }, [profileLoading, profile, access, trial])

  return (
    <div className="min-h-screen bg-black p-8 text-white">
      <div className="mx-auto max-w-6xl space-y-10">
        <div>
          <h1 className="text-4xl font-bold text-yellow-400">Billing & Plans</h1>
          <p className="mt-2 text-zinc-400">
            Choose your CreatorGoat plan and unlock features.
          </p>
        </div>

        {pageMessage ? (
          <div className="rounded-2xl border border-yellow-500/20 bg-zinc-950 p-4 text-sm text-zinc-300">
            {pageMessage}
          </div>
        ) : null}

        <div className="grid gap-6 md:grid-cols-4">
          <InfoCard label="Current Plan" value={currentPlanLabel} />
          <InfoCard label="Access Status" value={accessStatus} />
          <InfoCard
            label="Videos Used"
            value={profileLoading ? "..." : String(currentVideosUsed)}
          />
          <InfoCard
            label="Extra Credits"
            value={profileLoading ? "..." : String(currentCredits)}
          />
        </div>

        {!profileLoading && !profile ? (
          <div className="rounded-3xl border border-red-500/20 bg-zinc-950 p-6">
            <h2 className="text-2xl font-bold text-red-400">
              Billing Profile Unavailable
            </h2>

            <p className="mt-3 text-zinc-400">
              We could not load your billing profile right now.
            </p>

            <button
              onClick={refreshProfile}
              className="mt-4 rounded-xl bg-yellow-500 px-4 py-2 text-black"
            >
              Refresh Billing Status
            </button>
          </div>
        ) : isFreePlan && access && trial ? (
          <div className="rounded-3xl border border-yellow-500/20 bg-zinc-950 p-6">
            <h2 className="text-2xl font-bold text-yellow-400">Free Trial</h2>

            <p
              className={`mt-3 ${
                trial.expired ? "text-red-400" : "text-zinc-300"
              }`}
            >
              {trial.expired
                ? "Trial expired — Upgrade Now"
                : `${trial.remainingMinutes}:${trial.remainingSeconds
                    .toString()
                    .padStart(2, "0")} remaining`}
            </p>

            <p className="mt-3 text-sm text-zinc-500">
              After free trial or subscription expiration, only Calendar and
              Translate should stay open.
            </p>

            {trial.expired && (
              <button
                onClick={() => startSubscription("starter")}
                disabled={checkingSession || subscriptionLoading !== ""}
                className="mt-4 rounded-xl bg-yellow-500 px-4 py-2 text-black disabled:opacity-50"
              >
                {subscriptionLoading === "starter" ? "Loading..." : "Upgrade Now"}
              </button>
            )}
          </div>
        ) : profile && access ? (
          <div className="rounded-3xl border border-yellow-500/20 bg-zinc-950 p-6">
            <h2 className="text-2xl font-bold text-yellow-400">
              Active Subscription
            </h2>

            <p className="mt-3 text-green-400">
              Your {currentPlanLabel} plan is active.
            </p>

            <p className="mt-3 text-sm text-zinc-500">
              Premium tools, COS access, products access, and marketplace seller
              access follow your current paid plan.
            </p>
          </div>
        ) : null}

        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-3xl border border-yellow-500/20 bg-zinc-900 p-6">
            <h2 className="text-xl font-bold text-yellow-400">$9 Starter</h2>
            <p className="mt-2 text-zinc-400">3 videos / month</p>

            <ul className="mt-4 space-y-2 text-sm text-zinc-300">
              <li>✔ Hooks</li>
              <li>✔ Captions</li>
              <li>✔ Scripts</li>
              <li>✔ Replies</li>
              <li>✔ Product Writer</li>
              <li>❌ COS</li>
              <li>❌ Marketplace Seller Access</li>
            </ul>

            <button
              className="mt-6 w-full rounded-xl bg-yellow-500 py-2 text-black disabled:opacity-50"
              onClick={() => startSubscription("starter")}
              disabled={checkingSession || subscriptionLoading !== ""}
            >
              {subscriptionLoading === "starter" ? "Loading..." : "Choose Starter"}
            </button>
          </div>

          <div className="rounded-3xl border border-yellow-500/20 bg-zinc-900 p-6">
            <h2 className="text-xl font-bold text-yellow-400">$19 Pro</h2>
            <p className="mt-2 text-zinc-400">5 videos / month</p>

            <ul className="mt-4 space-y-2 text-sm text-zinc-300">
              <li>✔ All Starter</li>
              <li>✔ Growth</li>
              <li>✔ Email</li>
              <li>✔ Course Builder</li>
              <li>✔ Video Studio</li>
              <li>✔ Leads</li>
              <li>✔ Messages</li>
              <li>❌ COS</li>
              <li>❌ Marketplace Seller Access</li>
            </ul>

            <button
              className="mt-6 w-full rounded-xl bg-yellow-500 py-2 text-black disabled:opacity-50"
              onClick={() => startSubscription("pro")}
              disabled={checkingSession || subscriptionLoading !== ""}
            >
              {subscriptionLoading === "pro" ? "Loading..." : "Choose Pro"}
            </button>
          </div>

          <div className="rounded-3xl border border-yellow-400 bg-black p-6">
            <h2 className="text-xl font-bold text-yellow-400">
              $29 Founder Elite
            </h2>
            <p className="mt-2 text-zinc-400">10 videos / month</p>

            <ul className="mt-4 space-y-2 text-sm text-zinc-300">
              <li>✔ All Pro</li>
              <li>✔ COS Access</li>
              <li>✔ Marketplace Seller Access</li>
              <li>✔ Products Access</li>
              <li>✔ Full Creator System</li>
            </ul>

            <button
              className="mt-6 w-full rounded-xl bg-yellow-400 py-2 text-black disabled:opacity-50"
              onClick={() => startSubscription("founder_elite")}
              disabled={checkingSession || subscriptionLoading !== ""}
            >
              {subscriptionLoading === "founder_elite" ? "Loading..." : "Go Founder 🚀"}
            </button>
          </div>
        </div>

        <div className="rounded-3xl border border-yellow-500/20 bg-zinc-950 p-6">
          <h2 className="text-2xl font-bold text-yellow-400">
            Buy Extra Credits
          </h2>
          <p className="mt-2 text-sm text-zinc-400">
            If your included monthly videos finish, buy extra credits here.
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <button
              onClick={() => buyCredits("5")}
              disabled={checkingSession || creditsLoading !== ""}
              className="rounded-xl bg-yellow-500 p-4 text-black disabled:opacity-50"
            >
              {creditsLoading === "5" ? "Loading..." : "Buy 5 Credits ($9)"}
            </button>

            <button
              onClick={() => buyCredits("10")}
              disabled={checkingSession || creditsLoading !== ""}
              className="rounded-xl bg-yellow-500 p-4 text-black disabled:opacity-50"
            >
              {creditsLoading === "10" ? "Loading..." : "Buy 10 Credits ($15)"}
            </button>

            <button
              onClick={() => buyCredits("25")}
              disabled={checkingSession || creditsLoading !== ""}
              className="rounded-xl bg-yellow-500 p-4 text-black disabled:opacity-50"
            >
              {creditsLoading === "25" ? "Loading..." : "Buy 25 Credits ($29)"}
            </button>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={refreshProfile}
            className="rounded-xl border border-yellow-500/20 bg-zinc-950 px-4 py-2 text-sm text-yellow-300"
          >
            Refresh Billing Status
          </button>
        </div>
      </div>
    </div>
  )
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-yellow-500/20 bg-zinc-950 p-5">
      <p className="text-sm text-zinc-500">{label}</p>
      <p className="mt-2 text-2xl font-bold text-yellow-400">{value}</p>
    </div>
  )
}