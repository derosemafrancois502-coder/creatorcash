"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  checkModuleAccess,
  getPlanDisplay,
  getTrialCountdown,
  type AccessProfile,
} from "@/lib/access/guard"

type ProfileRow = {
  plan?: string | null
  trial_expires_at?: string | null
  subscription_expires_at?: string | null
}

function getRouteOptions(pathname: string) {
  // toujou free
  if (
    pathname === "/dashboard/calendar" ||
    pathname.startsWith("/dashboard/calendar/") ||
    pathname === "/dashboard/translate" ||
    pathname.startsWith("/dashboard/translate/") ||
    pathname === "/dashboard/billing" ||
    pathname.startsWith("/dashboard/billing/")
  ) {
    return {
      alwaysFree: true,
      founderOnly: false,
      blockedWhenFree: false,
      title: "",
    }
  }

  // founder only
  if (
    pathname === "/dashboard/cos" ||
    pathname.startsWith("/dashboard/cos/")
  ) {
    return {
      alwaysFree: false,
      founderOnly: true,
      blockedWhenFree: true,
      title: "Founder Elite Required",
    }
  }

  // free pa dwe gen video menm pandan trial
  if (
    pathname === "/dashboard/video-studio" ||
    pathname.startsWith("/dashboard/video-studio/")
  ) {
    return {
      alwaysFree: false,
      founderOnly: false,
      blockedWhenFree: true,
      title: "Access Locked",
    }
  }

  // seller / premium side pandan free
  if (
    pathname === "/dashboard/seller" ||
    pathname.startsWith("/dashboard/seller/") ||
    pathname === "/dashboard/products" ||
    pathname.startsWith("/dashboard/products/") ||
    pathname === "/dashboard/marketplace-seller" ||
    pathname.startsWith("/dashboard/marketplace-seller/")
  ) {
    return {
      alwaysFree: false,
      founderOnly: false,
      blockedWhenFree: true,
      title: "Access Locked",
    }
  }

  // tout lòt dashboard modules yo:
  // trial active = allowed
  // trial expired = blocked by guard.ts
  return {
    alwaysFree: false,
    founderOnly: false,
    blockedWhenFree: false,
    title: "Access Locked",
  }
}

export default function DashboardRouteGuard({
  children,
  profile,
}: {
  children: React.ReactNode
  profile: ProfileRow | null
}) {
  const pathname = usePathname()

  if (!pathname) {
    return <>{children}</>
  }

  if (!pathname.startsWith("/dashboard")) {
    return <>{children}</>
  }

  const routeOptions = getRouteOptions(pathname)

  const access = checkModuleAccess((profile || {}) as AccessProfile, {
    alwaysFree: routeOptions.alwaysFree,
    founderOnly: routeOptions.founderOnly,
    blockedWhenFree: routeOptions.blockedWhenFree,
  })

  if (access.allowed) {
    return <>{children}</>
  }

  const trial = getTrialCountdown(profile?.trial_expires_at || null)
  const planLabel = getPlanDisplay(profile?.plan)

  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-3xl items-center justify-center">
      <div className="w-full rounded-3xl border border-yellow-500/20 bg-zinc-950 p-8 text-center">
        <h2 className="text-3xl font-bold text-yellow-400">
          {routeOptions.title}
        </h2>

        <p className="mt-4 text-zinc-300">
          {access.reason || "You do not have access to this module right now."}
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-yellow-500/20 bg-black/20 p-4">
            <p className="text-xs text-zinc-500">Current Plan</p>
            <p className="mt-2 font-bold text-yellow-400">{planLabel}</p>
          </div>

          <div className="rounded-2xl border border-yellow-500/20 bg-black/20 p-4">
            <p className="text-xs text-zinc-500">Trial Status</p>
            <p className="mt-2 font-bold text-yellow-400">
              {trial.expired
                ? "Expired"
                : `${trial.remainingMinutes}:${trial.remainingSeconds
                    .toString()
                    .padStart(2, "0")} left`}
            </p>
          </div>

          <div className="rounded-2xl border border-yellow-500/20 bg-black/20 p-4">
            <p className="text-xs text-zinc-500">Free Modules</p>
            <p className="mt-2 font-bold text-yellow-400">
              Calendar + Translate
            </p>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/dashboard/calendar"
            className="rounded-xl border border-yellow-500/30 px-5 py-3 font-semibold text-yellow-300"
          >
            Open Calendar
          </Link>

          <Link
            href="/dashboard/translate"
            className="rounded-xl border border-yellow-500/30 px-5 py-3 font-semibold text-yellow-300"
          >
            Open Translate
          </Link>

          <Link
            href="/dashboard/billing"
            className="rounded-xl bg-yellow-500 px-5 py-3 font-semibold text-black"
          >
            Upgrade Now
          </Link>
        </div>
      </div>
    </div>
  )
}