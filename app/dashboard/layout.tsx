import Link from "next/link"
import { redirect } from "next/navigation"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import LogoutButton from "@/components/auth/LogoutButton"
import MobileSidebarDrawer from "@/components/dashboard/MobileSidebarDrawer"
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

type SidebarContentProps = {
  navItems: NavItem[]
  profile: ProfileRow | null
  userEmail?: string | null
  onNavigate?: () => void
  mobile?: boolean
}

function SidebarContent({
  navItems,
  profile,
  userEmail,
  onNavigate,
  mobile = false,
}: SidebarContentProps) {
  const sidebarAccess = checkModuleAccess(profile || {}, {})
  const trial = getTrialCountdown(profile?.trial_expires_at || null)

  const wrapperClass = mobile
    ? "flex h-full flex-col justify-between text-black"
    : "flex h-full flex-col justify-between"

  const titleClass = mobile
    ? "mb-6 text-2xl font-bold tracking-tight text-black"
    : "mb-8 text-3xl font-bold tracking-tight text-yellow-400"

  const osLabelClass = mobile
    ? "text-xs uppercase tracking-[0.25em] text-zinc-500"
    : "text-xs uppercase tracking-[0.25em] text-yellow-500/60"

  const emailClass = "mt-2 break-all text-xs text-zinc-500"

  const navClass = mobile
    ? "flex flex-col gap-1.5 pb-6"
    : "flex flex-col gap-2 pb-6"

  const lockedLinkClass = mobile
    ? "block w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm font-medium leading-6 text-black transition hover:bg-zinc-100"
    : "block w-full rounded-xl border border-yellow-500/10 bg-zinc-950/60 px-4 py-3 text-sm font-medium leading-6 text-yellow-300 transition hover:bg-yellow-400 hover:text-black"

  const linkClass = mobile
    ? "block w-full rounded-2xl px-4 py-3 text-sm font-medium leading-6 text-black transition hover:bg-zinc-100"
    : "block w-full rounded-xl px-4 py-3 text-sm font-medium leading-6 text-yellow-300 transition hover:bg-yellow-400 hover:text-black"

  const cardClass = mobile
    ? "rounded-2xl border border-zinc-200 bg-zinc-50 p-4"
    : "rounded-2xl border border-yellow-500/20 bg-zinc-950 p-4"

  const smallLabelClass = "text-xs uppercase tracking-[0.2em] text-zinc-500"

  const planTextClass = mobile
    ? "mt-2 text-lg font-bold text-black"
    : "mt-2 text-lg font-bold text-yellow-400"

  const secondaryTextClass = mobile
    ? "mt-1 text-sm text-zinc-600"
    : "mt-1 text-sm text-zinc-400"

  const statusTextClass = "mt-2 text-xs leading-5 text-zinc-500"

  const primaryButtonClass = mobile
    ? "mt-4 block rounded-2xl bg-black px-4 py-2 text-center text-sm font-semibold text-white transition hover:opacity-90"
    : "mt-4 block rounded-xl bg-yellow-500 px-4 py-2 text-center text-sm font-semibold text-black transition hover:opacity-90"

  return (
    <div className={wrapperClass}>
      <div>
        <h1 className={titleClass}>CreatorGoat</h1>

        <div className="mb-6">
          <p className={osLabelClass}>Creator OS</p>
          <p className={emailClass}>{userEmail}</p>
        </div>

        <nav className={navClass}>
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
                  onClick={onNavigate}
                  className={lockedLinkClass}
                >
                  {item.name} 🔒
                </Link>
              )
            }

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onNavigate}
                className={linkClass}
              >
                {item.name}
              </Link>
            )
          })}
        </nav>
      </div>

      <div className="space-y-4">
        <div className={cardClass}>
          <p className={smallLabelClass}>Active Plan</p>
          <p className={planTextClass}>{getPlanDisplay(profile?.plan)}</p>
          <p className={secondaryTextClass}>
            {sidebarAccess.founderAccess
              ? "Full creator system active"
              : "Upgrade for premium tools"}
          </p>
        </div>

        {!sidebarAccess.founderAccess && (
          <div className={cardClass}>
            <p className={smallLabelClass}>Access Status</p>

            {sidebarAccess.normalizedPlan === "free" ? (
              trial.expired ? (
                <p className="mt-2 text-sm font-semibold text-red-500">
                  Trial expired — Upgrade Now
                </p>
              ) : (
                <p
                  className={
                    mobile
                      ? "mt-2 text-sm font-semibold text-black"
                      : "mt-2 text-sm font-semibold text-yellow-400"
                  }
                >
                  {trial.remainingMinutes}:
                  {trial.remainingSeconds.toString().padStart(2, "0")} left
                </p>
              )
            ) : sidebarAccess.subscriptionExpired ? (
              <p className="mt-2 text-sm font-semibold text-red-500">
                Plan expired — Renew Now
              </p>
            ) : (
              <p
                className={
                  mobile
                    ? "mt-2 text-sm font-semibold text-black"
                    : "mt-2 text-sm font-semibold text-yellow-400"
                }
              >
                Paid access active
              </p>
            )}

            <p className={statusTextClass}>
              After free trial or subscription expiration, only Marketplace browse,
              Calendar, Translate, and Billing stay open.
            </p>

            <Link
              href="/dashboard/billing"
              onClick={onNavigate}
              className={primaryButtonClass}
            >
              Upgrade Now
            </Link>
          </div>
        )}

        <LogoutButton />
      </div>
    </div>
  )
}

function MobileDashboardShell({
  children,
  navItems,
  profile,
  userEmail,
}: {
  children: React.ReactNode
  navItems: NavItem[]
  profile: ProfileRow | null
  userEmail?: string | null
}) {
  return (
    <div className="flex min-h-screen bg-black text-yellow-400">
      <aside className="hidden w-72 shrink-0 border-r border-yellow-500/30 bg-black p-6 lg:flex lg:flex-col lg:justify-between">
        <SidebarContent
          navItems={navItems}
          profile={profile}
          userEmail={userEmail}
        />
      </aside>

      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 border-b border-yellow-500/20 bg-black/90 backdrop-blur lg:hidden">
          <div className="flex items-center justify-between px-4 py-4">
            <div className="min-w-0">
              <p className="truncate text-lg font-bold tracking-tight text-yellow-400">
                CreatorGoat
              </p>
              <p className="text-[11px] uppercase tracking-[0.2em] text-yellow-500/60">
                Creator OS
              </p>
            </div>

            <MobileSidebarDrawer>
              <SidebarContent
                navItems={navItems}
                profile={profile}
                userEmail={userEmail}
                mobile
              />
            </MobileSidebarDrawer>
          </div>
        </header>

        <main className="min-w-0 flex-1 overflow-y-auto p-4 sm:p-6 lg:p-10">
          {children}
        </main>
      </div>
    </div>
  )
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

  return (
    <MobileDashboardShell
      navItems={navItems}
      profile={profile}
      userEmail={user.email}
    >
      {children}
    </MobileDashboardShell>
  )
}