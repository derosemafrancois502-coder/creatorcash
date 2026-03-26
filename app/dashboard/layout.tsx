import Link from "next/link"
import { redirect } from "next/navigation"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import LogoutButton from "@/components/auth/LogoutButton"
import MobileSidebarDrawer from "@/components/dashboard/MobileSidebarDrawer"
import DashboardRouteGuard from "@/components/dashboard/DashboardRouteGuard"
import { supabaseAdmin } from "@/lib/supabase/admin"
import {
  checkModuleAccess,
  getPlanDisplay,
} from "@/lib/access/guard"

type NavItem = {
  name: string
  href: string
  requiresFounder?: boolean
  alwaysFree?: boolean
  blockedWhenFree?: boolean
}

const navItems: NavItem[] = [
  { name: "🏠 Dashboard", href: "/dashboard" },

  { name: "📊 Analytics", href: "/dashboard/analytics" },

  { name: "🪝 Hooks", href: "/dashboard/hooks" },
  { name: "✍️ Captions", href: "/dashboard/captions" },
  { name: "🎬 Scripts", href: "/dashboard/scripts" },
  { name: "💬 Replies", href: "/dashboard/replies" },

  { name: "📝 Product Writer", href: "/dashboard/product-writer" },
  { name: "📈 Growth", href: "/dashboard/growth" },
  { name: "📧 Email", href: "/dashboard/email" },
  { name: "🎓 Course Builder", href: "/dashboard/course" },

  // free user pa dwe gen video menm pandan trial
  { name: "🎥 Video Studio", href: "/dashboard/video-studio", blockedWhenFree: true },

  { name: "🔗 Links", href: "/dashboard/links" },
  { name: "👥 Leads", href: "/dashboard/leads" },
  { name: "💬 Messages", href: "/dashboard/messages" },

  // founder / premium side
  { name: "🧠 COS", href: "/dashboard/cos", requiresFounder: true },

  // marketplace browse ka rete deyò
  { name: "🛍️ Marketplace", href: "/marketplace", alwaysFree: true },

  { name: "📅 Calendar", href: "/dashboard/calendar", alwaysFree: true },
  { name: "🌍 Translate", href: "/dashboard/translate", alwaysFree: true },

  { name: "💳 Billing", href: "/dashboard/billing", alwaysFree: true },

  // free user pa dwe antre settings pandan trial si se sa ou vle
  { name: "⚙️ Settings", href: "/dashboard/settings", blockedWhenFree: true },
]

type ProfileRow = {
  plan?: string | null
  trial_expires_at?: string | null
  subscription_expires_at?: string | null
}

function SidebarContent({
  navItems,
  profile,
  userEmail,
}: {
  navItems: NavItem[]
  profile: ProfileRow | null
  userEmail?: string | null
}) {
  const visibleNavItems = navItems.filter((item) => {
    const access = checkModuleAccess(profile || {}, {
      alwaysFree: item.alwaysFree,
      founderOnly: item.requiresFounder,
      blockedWhenFree: item.blockedWhenFree,
    })

    return access.allowed
  })

  return (
    <div className="flex h-full flex-col justify-between">
      <div>
        <h1 className="mb-8 text-3xl font-bold text-yellow-400">
          CreatorGoat
        </h1>

        <div className="mb-6">
          <p className="text-xs text-yellow-500/60">Creator OS</p>
          <p className="text-xs text-zinc-500">{userEmail}</p>
        </div>

        <nav className="flex flex-col gap-2">
          {visibleNavItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="rounded-xl px-4 py-3 text-yellow-300 hover:bg-yellow-400 hover:text-black"
            >
              {item.name}
            </Link>
          ))}
        </nav>
      </div>

      <div className="space-y-4">
        <div className="rounded-xl border border-yellow-500/20 p-4">
          <p className="text-xs text-zinc-500">Plan</p>
          <p className="font-bold text-yellow-400">
            {getPlanDisplay(profile?.plan)}
          </p>
        </div>

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
  const visibleNavItems = navItems.filter((item) => {
    const access = checkModuleAccess(profile || {}, {
      alwaysFree: item.alwaysFree,
      founderOnly: item.requiresFounder,
      blockedWhenFree: item.blockedWhenFree,
    })

    return access.allowed
  })

  return (
    <div className="flex min-h-screen bg-black text-yellow-400">
      <aside className="hidden w-72 border-r border-yellow-500/30 p-6 lg:flex">
        <SidebarContent
          navItems={visibleNavItems}
          profile={profile}
          userEmail={userEmail}
        />
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-yellow-500/20 px-4 py-4 lg:hidden">
          <h1 className="font-bold text-yellow-400">CreatorGoat</h1>
          <MobileSidebarDrawer navItems={visibleNavItems} />
        </header>

        <main className="p-4">
          <DashboardRouteGuard profile={profile}>
            {children}
          </DashboardRouteGuard>
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

  const { data } = await supabaseAdmin
    .from("profiles")
    .select("plan, trial_expires_at, subscription_expires_at")
    .eq("id", user.id)
    .maybeSingle()

  if (data) {
    profile = data
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