"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import {
  checkModuleAccess,
  getPlanDisplay,
  getTrialCountdown,
  type AccessProfile,
} from "@/lib/access/guard"

type ProfileRow = {
  id?: string | null
  plan?: string | null
  trial_expires_at?: string | null
  subscription_expires_at?: string | null
  extra_video_credits?: number | null
  videos_used?: number | null
}

export default function Sidebar() {
  const supabase = useMemo(() => createClient(), [])
  const [profile, setProfile] = useState<ProfileRow | null>(null)
  const [profileLoading, setProfileLoading] = useState(true)

  useEffect(() => {
    async function loadProfile() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (!session?.access_token) {
          setProfile(null)
          return
        }

        const res = await fetch("/api/profile/billing", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        })

        const rawText = await res.text()
        let data: any = null

        try {
          data = rawText ? JSON.parse(rawText) : null
        } catch {
          data = null
        }

        if (res.ok && data?.profile) {
          setProfile(data.profile as ProfileRow)
          return
        }

        setProfile(null)
      } catch (error) {
        console.log("SIDEBAR PROFILE LOAD ERROR:", error)
        setProfile(null)
      } finally {
        setProfileLoading(false)
      }
    }

    loadProfile()
  }, [supabase])

  const access = useMemo(() => {
    if (!profile) return null
    return checkModuleAccess(profile as AccessProfile, {})
  }, [profile])

  const trial = useMemo(() => {
    if (!profile) return null
    return getTrialCountdown(profile.trial_expires_at || null)
  }, [profile])

  const planLabel = useMemo(() => {
    if (profileLoading) return "Loading..."
    if (!profile) return "Unavailable"
    return getPlanDisplay(profile.plan)
  }, [profileLoading, profile])

  const descriptionText = useMemo(() => {
    if (profileLoading) return "Checking your plan..."
    if (!profile) return "We could not load your billing profile."
    if (!access) return "We could not verify your access."
    return access.normalizedPlan === "free"
      ? "Upgrade for premium tools"
      : "Your premium access is active."
  }, [profileLoading, profile, access])

  const statusText = useMemo(() => {
    if (profileLoading) return "Loading..."
    if (!profile) return "Unable to load plan"
    if (!access || !trial) return "Unable to verify access"

    if (access.normalizedPlan === "free") {
      return trial.expired
        ? "Trial expired — Upgrade Now."
        : `${trial.remainingMinutes}:${trial.remainingSeconds
            .toString()
            .padStart(2, "0")} remaining`
    }

    return access.subscriptionExpired ? "Plan expired — Renew now." : "Active"
  }, [profileLoading, profile, access, trial])

  const statusColor = useMemo(() => {
    if (profileLoading || !profile) return "text-zinc-400"
    if (!access || !trial) return "text-zinc-400"

    if (
      access.normalizedPlan === "free" &&
      (trial.expired || access.subscriptionExpired)
    ) {
      return "text-red-400"
    }

    if (access.subscriptionExpired) {
      return "text-red-400"
    }

    return "text-green-400"
  }, [profileLoading, profile, access, trial])

  return (
    <div className="w-[250px] min-h-screen bg-black border-r border-yellow-500/20 p-4 text-white">
      <h1 className="text-xl font-bold text-yellow-400 mb-6">CreatorGoat</h1>

      <div className="space-y-3">
        <Link href="/dashboard" className="block">
          Dashboard
        </Link>
        <Link href="/dashboard/billing" className="block">
          Billing
        </Link>
        <Link href="/dashboard/marketplace" className="block">
          Marketplace
        </Link>
      </div>

      <div className="mt-8 rounded-2xl border border-yellow-500/20 bg-zinc-950 p-4">
        <p className="text-[11px] uppercase tracking-[0.3em] text-zinc-500">
          Active Plan
        </p>

        <p className="mt-2 text-2xl font-bold text-yellow-400">{planLabel}</p>

        <p className="mt-2 text-sm text-zinc-400">{descriptionText}</p>

        <p className={`mt-3 text-sm ${statusColor}`}>{statusText}</p>

        <p className="mt-2 text-xs text-zinc-500">
          After free trial or subscription expiration, only Marketplace browse,
          Calendar, Translate, and Billing stay open.
        </p>

        {!profileLoading &&
          profile &&
          access &&
          access.normalizedPlan === "free" && (
            <button className="mt-4 w-full rounded-xl bg-yellow-500 px-4 py-2 font-semibold text-black">
              Upgrade Now
            </button>
          )}
      </div>

      <button className="mt-6 text-sm text-red-400">Logout</button>
    </div>
  )
}