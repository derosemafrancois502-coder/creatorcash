import Link from "next/link"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import {
  checkModuleAccess,
  getPlanDisplay,
  getTrialCountdown,
} from "@/lib/access/guard"

type DashboardLinkItem = {
  title: string
  description: string
  href: string
  alwaysFree?: boolean
  blockedWhenFree?: boolean
  founderOnly?: boolean
  accent: string
  pill: string
}

const modules: DashboardLinkItem[] = [
  {
    title: "Hooks",
    description: "Generate viral hooks fast",
    href: "/dashboard/hooks",
    accent: "from-amber-500/25 via-yellow-400/10 to-transparent",
    pill: "Hook Engine",
  },
  {
    title: "Captions",
    description: "Write captions that convert",
    href: "/dashboard/captions",
    accent: "from-cyan-500/25 via-sky-400/10 to-transparent",
    pill: "Caption Flow",
  },
  {
    title: "Scripts",
    description: "Create short-form video scripts",
    href: "/dashboard/scripts",
    accent: "from-violet-500/25 via-fuchsia-400/10 to-transparent",
    pill: "Script Builder",
  },
  {
    title: "Replies",
    description: "Reply to comments with strategy",
    href: "/dashboard/replies",
    accent: "from-emerald-500/25 via-green-400/10 to-transparent",
    pill: "Reply Engine",
  },
  {
    title: "Product Writer",
    description: "Write product descriptions that sell",
    href: "/dashboard/product-writer",
    accent: "from-orange-500/25 via-amber-400/10 to-transparent",
    pill: "Sales Copy",
  },
  {
    title: "Growth",
    description: "Get growth ideas and content strategy",
    href: "/dashboard/growth",
    accent: "from-blue-500/25 via-indigo-400/10 to-transparent",
    pill: "Growth OS",
  },
  {
    title: "Email",
    description: "Write emails for sales and outreach",
    href: "/dashboard/email",
    accent: "from-pink-500/25 via-rose-400/10 to-transparent",
    pill: "Email Writer",
  },
  {
    title: "Course Builder",
    description: "Turn knowledge into a sellable course",
    href: "/dashboard/course",
    accent: "from-teal-500/25 via-cyan-400/10 to-transparent",
    pill: "Course Lab",
  },
  {
    title: "Video Studio",
    description: "Generate luxury motivational and product videos",
    href: "/dashboard/video-studio",
    blockedWhenFree: true,
    accent: "from-red-500/25 via-orange-400/10 to-transparent",
    pill: "Premium Video",
  },
]

const businessShortcuts: DashboardLinkItem[] = [
  {
    title: "Products",
    description: "Add, edit, and manage your store products",
    href: "/dashboard/products",
    blockedWhenFree: true,
    accent: "from-yellow-500/25 via-amber-400/10 to-transparent",
    pill: "Seller Side",
  },
  {
    title: "Orders",
    description: "Track customer purchases and shipping updates",
    href: "/dashboard/orders",
    blockedWhenFree: true,
    accent: "from-lime-500/25 via-emerald-400/10 to-transparent",
    pill: "Operations",
  },
  {
    title: "Discover Feed",
    description: "Open the TikTok-style shopping experience",
    href: "/discover",
    alwaysFree: true,
    accent: "from-fuchsia-500/25 via-pink-400/10 to-transparent",
    pill: "Shopping Feed",
  },
  {
    title: "Cart",
    description: "Review cart items and continue checkout",
    href: "/cart",
    alwaysFree: true,
    accent: "from-sky-500/25 via-cyan-400/10 to-transparent",
    pill: "Customer Flow",
  },
  {
    title: "Leads CRM",
    description: "Capture, organize, and manage your leads",
    href: "/dashboard/leads",
    accent: "from-green-500/25 via-emerald-400/10 to-transparent",
    pill: "CRM",
  },
  {
    title: "Messages",
    description: "Manage customer conversations and inbox flow",
    href: "/dashboard/messages",
    accent: "from-indigo-500/25 via-blue-400/10 to-transparent",
    pill: "Inbox",
  },
  {
    title: "Links",
    description: "Manage your creator links page and destinations",
    href: "/dashboard/links",
    accent: "from-purple-500/25 via-violet-400/10 to-transparent",
    pill: "Links Hub",
  },
  {
    title: "Settings",
    description: "Control your workspace, brand, and account preferences",
    href: "/dashboard/settings",
    blockedWhenFree: true,
    accent: "from-zinc-500/25 via-zinc-300/10 to-transparent",
    pill: "Workspace",
  },
]

function getAccess(
  profile: {
    plan?: string | null
    trial_expires_at?: string | null
    subscription_expires_at?: string | null
  } | null,
  item: DashboardLinkItem
) {
  return checkModuleAccess(profile || {}, {
    alwaysFree: item.alwaysFree,
    founderOnly: item.founderOnly,
    blockedWhenFree: item.blockedWhenFree,
  })
}

function getLockedHref(
  profile: {
    plan?: string | null
    trial_expires_at?: string | null
    subscription_expires_at?: string | null
  } | null,
  item: DashboardLinkItem
) {
  const access = getAccess(profile, item)
  return access.allowed ? item.href : "/dashboard/billing"
}

function ModuleCard({
  item,
  href,
  allowed,
}: {
  item: DashboardLinkItem
  href: string
  allowed: boolean
}) {
  return (
    <div className="group relative overflow-hidden rounded-[30px] border border-yellow-500/20 bg-zinc-950 p-6 shadow-[0_0_30px_rgba(250,204,21,0.04)]">
      <div className={`absolute inset-0 bg-gradient-to-br ${item.accent}`} />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.08),transparent_28%)]" />
      <div className="relative z-10">
        <div className="mb-4 inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-300">
          {item.pill}
        </div>

        <h3 className="text-[2rem] font-bold leading-none text-white">
          {item.title}
        </h3>

        <p className="mt-3 min-h-[52px] text-sm leading-6 text-zinc-300">
          {item.description}
        </p>

        <Link
          href={href}
          className={`mt-6 block w-full rounded-2xl px-4 py-3 text-center text-sm font-semibold transition ${
            allowed
              ? "bg-yellow-400 text-black hover:opacity-90"
              : "border border-yellow-500/25 bg-black/30 text-yellow-300 hover:border-yellow-400"
          }`}
        >
          {allowed ? "Open Tool" : "Locked • Upgrade"}
        </Link>
      </div>
    </div>
  )
}

function ShortcutCard({
  item,
  href,
  allowed,
}: {
  item: DashboardLinkItem
  href: string
  allowed: boolean
}) {
  return (
    <Link
      href={href}
      className="group relative overflow-hidden rounded-[30px] border border-yellow-500/20 bg-zinc-950 p-6 transition hover:border-yellow-400"
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${item.accent}`} />
      <div className="absolute inset-0 bg-black/20" />
      <div className="relative z-10">
        <div className="mb-4 inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-300">
          {item.pill}
        </div>

        <h3 className="text-2xl font-bold text-white">{item.title}</h3>

        <p className="mt-3 min-h-[52px] text-sm leading-6 text-zinc-300">
          {item.description}
        </p>

        <p
          className={`mt-6 text-sm font-semibold ${
            allowed ? "text-yellow-400" : "text-yellow-300"
          }`}
        >
          {allowed ? "Open →" : "Locked • Upgrade →"}
        </p>
      </div>
    </Link>
  )
}

function HeroStat({
  label,
  value,
  subtext,
  href,
  accent,
}: {
  label: string
  value: string
  subtext: string
  href?: string
  accent: string
}) {
  const content = (
    <>
      <div className={`absolute inset-0 bg-gradient-to-br ${accent}`} />
      <div className="absolute inset-0 bg-black/25" />
      <div className="relative z-10">
        <p className="text-sm text-zinc-300">{label}</p>
        <h2 className="mt-3 text-4xl font-bold text-white">{value}</h2>
        <p className="mt-2 text-sm text-zinc-400">{subtext}</p>
        {href ? (
          <p className="mt-4 text-sm font-medium text-yellow-400">Open →</p>
        ) : null}
      </div>
    </>
  )

  if (href) {
    return (
      <Link
        href={href}
        className="relative block overflow-hidden rounded-[28px] border border-yellow-500/20 bg-black/30 p-5 backdrop-blur-md transition hover:border-yellow-400 hover:bg-black/40"
      >
        {content}
      </Link>
    )
  }

  return (
    <div className="relative overflow-hidden rounded-[28px] border border-yellow-500/20 bg-black/30 p-5 backdrop-blur-md">
      {content}
    </div>
  )
}

export default async function DashboardPage() {
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

  const userEmail = user?.email || "creator@creatorgoat.com"

  const { data: profile } = await supabase
    .from("profiles")
    .select("plan, trial_expires_at, subscription_expires_at")
    .eq("id", user?.id || "")
    .maybeSingle()

  const billingHref = "/dashboard/billing"
  const marketplaceHref = "/marketplace"
  const currentPlanLabel = getPlanDisplay(profile?.plan)
  const trial = getTrialCountdown(profile?.trial_expires_at || null)

  const dashboardAccess = checkModuleAccess(profile || {})

  const isPaidPlan =
    profile?.plan === "starter" ||
    profile?.plan === "pro" ||
    profile?.plan === "founder" ||
    profile?.plan === "founder_elite"

  const videoStudioHref = getLockedHref(profile, {
    title: "Video Studio",
    description: "",
    href: "/dashboard/video-studio",
    blockedWhenFree: true,
    accent: "",
    pill: "",
  })

  const leadsHref = getLockedHref(profile, {
    title: "Leads",
    description: "",
    href: "/dashboard/leads",
    accent: "",
    pill: "",
  })

  return (
    <div className="w-full space-y-10">
      <section className="relative min-h-[78vh] overflow-hidden rounded-[36px] border border-yellow-500/20 bg-black shadow-[0_0_60px_rgba(250,204,21,0.08)]">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 h-full w-full object-cover"
        >
          <source
            src="/videos/public:videos:dashboard-hero.mp4"
            type="video/mp4"
          />
        </video>

        <div className="absolute inset-0 bg-black/45" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/55 to-black/45" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/10" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(250,204,21,0.18),transparent_28%)]" />

        <div className="relative z-10 flex min-h-[78vh] flex-col justify-between p-8 md:p-10 xl:p-12">
          <div className="flex flex-col gap-8 xl:flex-row xl:items-start xl:justify-between">
            <div className="max-w-4xl">
              <div className="mb-4 inline-flex items-center rounded-full border border-yellow-500/20 bg-yellow-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-yellow-300 backdrop-blur-sm">
                CreatorGoat OS
              </div>

              <h1 className="max-w-4xl text-5xl font-bold leading-[0.95] tracking-tight text-white sm:text-6xl xl:text-7xl">
                Discover your
                <br />
                creator command center
              </h1>

              <p className="mt-5 max-w-3xl text-lg leading-8 text-zinc-200 sm:text-xl">
                Build content, capture leads, manage operations, and scale your
                creator business from one premium dashboard.
              </p>

              <p className="mt-3 text-sm text-zinc-400">{userEmail}</p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href={billingHref}
                  className="rounded-2xl border border-yellow-400 px-5 py-3 text-sm font-semibold text-yellow-400 transition hover:bg-yellow-400 hover:text-black"
                >
                  See Plans
                </Link>

                <Link
                  href={billingHref}
                  className="rounded-2xl bg-yellow-400 px-5 py-3 text-sm font-semibold text-black transition hover:opacity-90"
                >
                  Upgrade Now
                </Link>

                <Link
                  href={marketplaceHref}
                  className="rounded-2xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white backdrop-blur-sm transition hover:border-yellow-400/30 hover:bg-white/10"
                >
                  Open Marketplace
                </Link>
              </div>
            </div>

            <div className="relative w-full max-w-md overflow-hidden rounded-[32px] border border-yellow-500/20 bg-black/35 p-6 backdrop-blur-xl shadow-[0_0_45px_rgba(250,204,21,0.08)]">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(250,204,21,0.16),transparent_36%)]" />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),transparent_28%)]" />

              <div className="relative z-10">
                <div className="flex items-center justify-between">
                  <p className="text-xs uppercase tracking-[0.28em] text-yellow-300/65">
                    Creator Status
                  </p>

                  <span className="rounded-full border border-yellow-500/20 bg-yellow-500/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-yellow-300">
                    Live
                  </span>
                </div>

                <div className="mt-5 rounded-[24px] border border-yellow-500/15 bg-yellow-500/5 p-5">
                  <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">
                    Active Plan
                  </p>

                  <div className="mt-3 flex items-start justify-between gap-3">
                    <div>
                      <h2 className="text-3xl font-bold leading-tight text-yellow-400">
                        {currentPlanLabel}
                      </h2>
                      <p className="mt-2 text-sm text-zinc-400">
                        {dashboardAccess.allowed
                          ? "Premium creator tools available"
                          : "Upgrade to unlock full platform power"}
                      </p>
                    </div>

                    <span className="rounded-full bg-yellow-400 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-black">
                      Premium
                    </span>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-4">
                  <Link
                    href={videoStudioHref}
                    className="group relative overflow-hidden rounded-[22px] border border-yellow-500/15 bg-black/30 p-4 transition hover:border-yellow-400 hover:bg-black/40"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-500/15 via-yellow-400/5 to-transparent" />
                    <div className="relative z-10">
                      <p className="text-[11px] uppercase tracking-[0.16em] text-zinc-500">
                        AI Runs
                      </p>
                      <p className="mt-2 text-3xl font-bold text-white">128</p>
                      <p className="mt-2 text-xs font-medium text-yellow-400">
                        Open →
                      </p>
                    </div>
                  </Link>

                  <Link
                    href={leadsHref}
                    className="group relative overflow-hidden rounded-[22px] border border-yellow-500/15 bg-black/30 p-4 transition hover:border-yellow-400 hover:bg-black/40"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/15 via-green-400/5 to-transparent" />
                    <div className="relative z-10">
                      <p className="text-[11px] uppercase tracking-[0.16em] text-zinc-500">
                        Leads
                      </p>
                      <p className="mt-2 text-3xl font-bold text-white">24</p>
                      <p className="mt-2 text-xs font-medium text-yellow-400">
                        Open →
                      </p>
                    </div>
                  </Link>
                </div>

                <div className="mt-4 rounded-[24px] border border-yellow-500/15 bg-black/30 p-5">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">
                        {isPaidPlan ? "Subscription Status" : "Trial Status"}
                      </p>
                      <p className="mt-2 text-2xl font-bold text-white">
                        {isPaidPlan
                          ? "Active"
                          : trial.expired
                          ? "Expired"
                          : `${trial.remainingMinutes}:${trial.remainingSeconds
                              .toString()
                              .padStart(2, "0")} left`}
                      </p>
                    </div>

                    <span
                      className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] ${
                        isPaidPlan
                          ? "border border-green-500/20 bg-green-500/15 text-green-400"
                          : trial.expired
                          ? "border border-red-500/20 bg-red-500/15 text-red-400"
                          : "border border-green-500/20 bg-green-500/15 text-green-400"
                      }`}
                    >
                      {isPaidPlan ? "Premium Active" : trial.expired ? "Locked" : "Active"}
                    </span>
                  </div>

                  <p className="mt-3 text-sm text-zinc-500">
                    {isPaidPlan
                      ? "Your paid plan is active and creator tools are unlocked."
                      : "Free users keep Calendar + Translate access."}
                  </p>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <Link
                    href="/dashboard/calendar"
                    className="rounded-2xl border border-yellow-500/20 bg-black/20 px-4 py-3 text-center text-sm font-semibold text-yellow-300 transition hover:border-yellow-400"
                  >
                    Calendar
                  </Link>

                  <Link
                    href="/dashboard/translate"
                    className="rounded-2xl border border-yellow-500/20 bg-black/20 px-4 py-3 text-center text-sm font-semibold text-yellow-300 transition hover:border-yellow-400"
                  >
                    Translate
                  </Link>
                </div>

                <Link
                  href={billingHref}
                  className="mt-5 block w-full rounded-2xl bg-yellow-400 px-5 py-3 text-center text-sm font-semibold text-black transition hover:opacity-90"
                >
                  Upgrade Now 🚀
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
            <HeroStat
              label="AI Generations"
              value="128"
              subtext="Used this month"
              href={videoStudioHref}
              accent="from-orange-500/25 via-yellow-400/10 to-transparent"
            />
            <HeroStat
              label="Active Plan"
              value={currentPlanLabel}
              subtext="Premium creator tools"
              href={billingHref}
              accent="from-yellow-500/25 via-amber-400/10 to-transparent"
            />
            <HeroStat
              label="Leads"
              value="24"
              subtext="Captured in your system"
              href={leadsHref}
              accent="from-emerald-500/25 via-green-400/10 to-transparent"
            />
            <Link
              href={marketplaceHref}
              className="relative block overflow-hidden rounded-[28px] border border-yellow-500/20 bg-black/30 p-5 backdrop-blur-md transition hover:border-yellow-400 hover:bg-black/40"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-500/25 via-pink-400/10 to-transparent" />
              <div className="absolute inset-0 bg-black/20" />
              <div className="relative z-10">
                <p className="text-sm text-zinc-300">Marketplace</p>
                <h2 className="mt-3 text-4xl font-bold text-white">Open</h2>
                <p className="mt-2 text-sm text-zinc-400">
                  Digital + physical products
                </p>
                <p className="mt-4 text-sm font-medium text-yellow-400">
                  Open Marketplace →
                </p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      <section>
        <div className="mb-5">
          <h2 className="text-3xl font-bold text-white">
            AI Viral Content Engine
          </h2>
          <p className="mt-2 text-zinc-400">
            Your premium creator toolkit inside CreatorGoat.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
          {modules.map((module) => {
            const access = getAccess(profile, module)
            const href = getLockedHref(profile, module)

            return (
              <ModuleCard
                key={module.title}
                item={module}
                href={href}
                allowed={access.allowed}
              />
            )
          })}
        </div>
      </section>

      <section>
        <div className="mb-5">
          <h2 className="text-3xl font-bold text-white">
            Business Shortcuts
          </h2>
          <p className="mt-2 text-zinc-400">
            Access your store operations, orders, shopping flow, and workspace
            controls fast.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
          {businessShortcuts.map((item) => {
            const access = getAccess(profile, item)
            const href = getLockedHref(profile, item)

            return (
              <ShortcutCard
                key={item.title}
                item={item}
                href={href}
                allowed={access.allowed}
              />
            )
          })}
        </div>
      </section>
    </div>
  )
}