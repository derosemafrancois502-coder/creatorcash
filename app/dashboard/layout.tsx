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

function SidebarContent({
  navItems,
  profile,
  userEmail,
}: {
  navItems: NavItem[]
  profile: ProfileRow | null
  userEmail?: string | null
}) {
  const sidebarAccess = checkModuleAccess(profile || {}, {})
  const trial = getTrialCountdown(profile?.trial_expires_at || null)

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
          {navItems.map((item) => (
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
          <p className="text-yellow-400 font-bold">
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
  return (
    <div className="flex min-h-screen bg-black text-yellow-400">
      
      {/* DESKTOP SIDEBAR */}
      <aside className="hidden lg:flex w-72 p-6 border-r border-yellow-500/30">
        <SidebarContent
          navItems={navItems}
          profile={profile}
          userEmail={userEmail}
        />
      </aside>

      {/* MAIN */}
      <div className="flex-1 flex flex-col">

        {/* MOBILE HEADER */}
        <header className="lg:hidden flex items-center justify-between px-4 py-4 border-b border-yellow-500/20">
          <h1 className="text-yellow-400 font-bold">CreatorGoat</h1>

          {/* 🔥 IMPORTANT FIX */}
          <MobileSidebarDrawer navItems={navItems} />
        </header>

        <main className="p-4">{children}</main>
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

  if (data) profile = data

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