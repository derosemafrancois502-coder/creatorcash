import Link from "next/link"
import { redirect } from "next/navigation"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import LogoutButton from "@/components/auth/LogoutButton"
import { supabaseAdmin } from "@/lib/supabase/admin"
import {
  checkModuleAccess,
  getPlanDisplay,
  getTrialCountdown,
} from "@/lib/access/guard"

type NavItem = {
  name: string
  href: string
  requiresFounder?: boolean
  alwaysFree?: boolean
  blockedWhenFree?: boolean
}

const navItems: NavItem[] = [
  { name: "🏠 Dashboard", href: "/dashboard", alwaysFree: true },

  { name: "📊 Analytics", href: "/dashboard/analytics", blockedWhenFree: true },

  { name: "🪝 Hooks", href: "/dashboard/hooks", blockedWhenFree: true },
  { name: "✍️ Captions", href: "/dashboard/captions", blockedWhenFree: true },
  { name: "🎬 Scripts", href: "/dashboard/scripts", blockedWhenFree: true },
  { name: "💬 Replies", href: "/dashboard/replies", blockedWhenFree: true },

  { name: "📝 Product Writer", href: "/dashboard/product-writer", blockedWhenFree: true },
  { name: "📈 Growth", href: "/dashboard/growth", blockedWhenFree: true },
  { name: "📧 Email", href: "/dashboard/email", blockedWhenFree: true },
  { name: "🎓 Course Builder", href: "/dashboard/course", blockedWhenFree: true },

  { name: "🎥 Video Studio", href: "/dashboard/video-studio", blockedWhenFree: true },

  { name: "🔗 Links", href: "/dashboard/links", blockedWhenFree: true },
  { name: "👥 Leads", href: "/dashboard/leads", blockedWhenFree: true },
  { name: "💬 Messages", href: "/dashboard/messages", blockedWhenFree: true },
  

  { name: "🧠 COS", href: "/dashboard/cos", requiresFounder: true, blockedWhenFree: true },

  { name: "🛍️ Marketplace", href: "/marketplace", alwaysFree: true },

  { name: "📅 Calendar", href: "/dashboard/calendar", alwaysFree: true },
  { name: "🌍 Translate", href: "/dashboard/translate", alwaysFree: true },

  { name: "💳 Billing", href: "/dashboard/billing", alwaysFree: true },
  { name: "⚙️ Settings", href: "/dashboard/settings", blockedWhenFree: true },
]

type ProfileRow = {
  plan?: string | null
  trial_expires_at?: string | null
  subscription_expires_at?: string | null
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set() {},
        remove() {},
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  let profile: ProfileRow | null = null

  const { data: profileData, error: profileError } = await supabaseAdmin
    .from("profiles")
    .select("plan, trial_expires_at, subscription_expires_at")
    .eq("id", user.id)
    .maybeSingle()

  if (profileError) {
    console.error("DASHBOARD LAYOUT PROFILE ERROR:", profileError)
  }

  if (profileData) {
    profile = profileData
  }

  const sidebarAccess = checkModuleAccess(profile || {}, {})
  const trial = getTrialCountdown(profile?.trial_expires_at || null)

  return (
    <div className="flex min-h-screen bg-black text-yellow-400">
      <aside className="flex w-72 shrink-0 flex-col justify-between border-r border-yellow-500/30 bg-black p-6">
        <div>
          <h1 className="mb-8 text-3xl font-bold tracking-tight text-yellow-400">
            CreatorGoat
          </h1>

          <div className="mb-6">
            <p className="text-xs uppercase tracking-[0.25em] text-yellow-500/60">
              Creator OS
            </p>
            <p className="mt-2 text-xs text-zinc-500">{user.email}</p>
          </div>

          <nav className="flex flex-col gap-2">
            {navItems.map((item) => {
              const itemAccess = checkModuleAccess(profile || {}, {
                alwaysFree: item.alwaysFree,
                founderOnly: item.requiresFounder,
                blockedWhenFree: item.blockedWhenFree,
              })

              if (!itemAccess.allowed) {
                return (
                  <Link
                    key={item.name}
                    href="/dashboard/billing"
                    className="rounded-xl border border-yellow-500/10 bg-zinc-950/60 px-4 py-3 text-sm font-medium text-yellow-300 transition hover:bg-yellow-400 hover:text-black"
                  >
                    {item.name} 🔒
                  </Link>
                )
              }

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className="rounded-xl px-4 py-3 text-sm font-medium text-yellow-300 transition hover:bg-yellow-400 hover:text-black"
                >
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-yellow-500/20 bg-zinc-950 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
              Active Plan
            </p>
            <p className="mt-2 text-lg font-bold text-yellow-400">
              {getPlanDisplay(profile?.plan)}
            </p>
            <p className="mt-1 text-sm text-zinc-400">
              {sidebarAccess.founderAccess
                ? "Full creator system active"
                : "Upgrade for premium tools"}
            </p>
          </div>

          {!sidebarAccess.founderAccess && (
            <div className="rounded-2xl border border-yellow-500/20 bg-zinc-950 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                Access Status
              </p>

              {sidebarAccess.normalizedPlan === "free" ? (
                trial.expired ? (
                  <p className="mt-2 text-sm font-semibold text-red-400">
                    Trial expired — Upgrade Now
                  </p>
                ) : (
                  <p className="mt-2 text-sm font-semibold text-yellow-400">
                    {trial.remainingMinutes}:
                    {trial.remainingSeconds.toString().padStart(2, "0")} left
                  </p>
                )
              ) : sidebarAccess.subscriptionExpired ? (
                <p className="mt-2 text-sm font-semibold text-red-400">
                  Plan expired — Renew Now
                </p>
              ) : (
                <p className="mt-2 text-sm font-semibold text-yellow-400">
                  Paid access active
                </p>
              )}

              <p className="mt-2 text-xs text-zinc-500">
                After free trial or subscription expiration, only Marketplace browse,
                Calendar, Translate, and Billing stay open.
              </p>

              <Link
                href="/dashboard/billing"
                className="mt-4 block rounded-xl bg-yellow-500 px-4 py-2 text-center text-sm font-semibold text-black transition hover:opacity-90"
              >
                Upgrade Now
              </Link>
            </div>
          )}

          <LogoutButton />
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-10">{children}</main>
    </div>
  )
}