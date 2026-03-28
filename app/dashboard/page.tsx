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

type LuxuryImageItem = {
  src: string
  title: string
  subtitle: string
}

type GlobalCountry = {
  flag: string
  name: string
  ring: 1 | 2
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

const luxuryImages: LuxuryImageItem[] = [
  {
    src: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1400&q=80",
    title: "Luxury Workspace",
    subtitle: "Premium digital execution environment",
  },
  {
    src: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1400&q=80",
    title: "High-End Technology",
    subtitle: "Modern systems built for scale",
  },
  {
    src: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1400&q=80",
    title: "Global Connected Vision",
    subtitle: "Creator tools designed for the world",
  },
]

const globalCountries: GlobalCountry[] = [
  { flag: "🇺🇸", name: "USA", ring: 1 },
  { flag: "🇨🇦", name: "Canada", ring: 1 },
  { flag: "🇲🇽", name: "Mexico", ring: 1 },
  { flag: "🇧🇷", name: "Brazil", ring: 1 },
  { flag: "🇦🇷", name: "Argentina", ring: 1 },
  { flag: "🇨🇴", name: "Colombia", ring: 1 },
  { flag: "🇵🇪", name: "Peru", ring: 1 },
  { flag: "🇨🇱", name: "Chile", ring: 1 },
  { flag: "🇩🇴", name: "Dominican Rep.", ring: 1 },
  { flag: "🇯🇲", name: "Jamaica", ring: 1 },
  { flag: "🇭🇹", name: "Haiti", ring: 1 },
  { flag: "🇬🇧", name: "UK", ring: 1 },
  { flag: "🇫🇷", name: "France", ring: 1 },
  { flag: "🇩🇪", name: "Germany", ring: 1 },
  { flag: "🇮🇹", name: "Italy", ring: 1 },
  { flag: "🇪🇸", name: "Spain", ring: 1 },
  { flag: "🇵🇹", name: "Portugal", ring: 1 },
  { flag: "🇳🇱", name: "Netherlands", ring: 1 },
  { flag: "🇧🇪", name: "Belgium", ring: 1 },
  { flag: "🇨🇭", name: "Switzerland", ring: 1 },
  { flag: "🇦🇹", name: "Austria", ring: 1 },
  { flag: "🇸🇪", name: "Sweden", ring: 1 },
  { flag: "🇳🇴", name: "Norway", ring: 1 },
  { flag: "🇩🇰", name: "Denmark", ring: 1 },
  { flag: "🇫🇮", name: "Finland", ring: 1 },
  { flag: "🇵🇱", name: "Poland", ring: 1 },
  { flag: "🇬🇷", name: "Greece", ring: 1 },
  { flag: "🇹🇷", name: "Turkey", ring: 1 },

  { flag: "🇺🇦", name: "Ukraine", ring: 2 },
  { flag: "🇷🇴", name: "Romania", ring: 2 },
  { flag: "🇮🇪", name: "Ireland", ring: 2 },
  { flag: "🇦🇪", name: "UAE", ring: 2 },
  { flag: "🇸🇦", name: "Saudi", ring: 2 },
  { flag: "🇶🇦", name: "Qatar", ring: 2 },
  { flag: "🇰🇼", name: "Kuwait", ring: 2 },
  { flag: "🇪🇬", name: "Egypt", ring: 2 },
  { flag: "🇲🇦", name: "Morocco", ring: 2 },
  { flag: "🇳🇬", name: "Nigeria", ring: 2 },
  { flag: "🇰🇪", name: "Kenya", ring: 2 },
  { flag: "🇿🇦", name: "South Africa", ring: 2 },
  { flag: "🇬🇭", name: "Ghana", ring: 2 },
  { flag: "🇪🇹", name: "Ethiopia", ring: 2 },
  { flag: "🇮🇳", name: "India", ring: 2 },
  { flag: "🇵🇰", name: "Pakistan", ring: 2 },
  { flag: "🇧🇩", name: "Bangladesh", ring: 2 },
  { flag: "🇨🇳", name: "China", ring: 2 },
  { flag: "🇯🇵", name: "Japan", ring: 2 },
  { flag: "🇰🇷", name: "South Korea", ring: 2 },
  { flag: "🇸🇬", name: "Singapore", ring: 2 },
  { flag: "🇲🇾", name: "Malaysia", ring: 2 },
  { flag: "🇹🇭", name: "Thailand", ring: 2 },
  { flag: "🇮🇩", name: "Indonesia", ring: 2 },
  { flag: "🇵🇭", name: "Philippines", ring: 2 },
  { flag: "🇻🇳", name: "Vietnam", ring: 2 },
  { flag: "🇦🇺", name: "Australia", ring: 2 },
  { flag: "🇳🇿", name: "New Zealand", ring: 2 },
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
        {href ? <p className="mt-4 text-sm font-medium text-yellow-400">Open →</p> : null}
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

function CountriesOrbit({
  countries,
  radius,
  size,
  duration,
  hideOnMobile = false,
}: {
  countries: GlobalCountry[]
  radius: number
  size: number
  duration: number
  hideOnMobile?: boolean
}) {
  return (
    <div
      className={`absolute left-1/2 top-1/2 rounded-full border border-cyan-300/10 ${
        hideOnMobile ? "hidden md:block" : ""
      }`}
      style={{
        width: size,
        height: size,
        transform: "translate(-50%, -50%)",
      }}
    >
      <div
        className="relative h-full w-full rounded-full"
        style={{
          animation: `spin ${duration}s linear infinite`,
        }}
      >
        {countries.map((country, index) => {
          const angle = (index / countries.length) * Math.PI * 2
          const x = Math.cos(angle) * radius
          const y = Math.sin(angle) * radius

          return (
            <div
              key={`${country.name}-${index}`}
              className="absolute rounded-full border border-white/10 bg-black/55 px-2.5 py-1 text-[10px] font-semibold text-white backdrop-blur-sm shadow-[0_0_14px_rgba(0,0,0,0.35)]"
              style={{
                left: `calc(50% + ${x}px)`,
                top: `calc(50% + ${y}px)`,
                transform: "translate(-50%, -50%)",
                animation: `spin ${duration}s linear infinite reverse`,
                whiteSpace: "nowrap",
              }}
            >
              {country.flag} {country.name}
            </div>
          )
        })}
      </div>
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

  const [{ count: leadsCount }, { count: eventsCount }] = await Promise.all([
    supabase
      .from("leads")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user?.id || ""),
    supabase
      .from("events")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user?.id || ""),
  ])

  const realLeadsCount = leadsCount ?? 0
  const realAiRunsCount = eventsCount ?? 0

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

  const ringOneCountries = globalCountries.filter((country) => country.ring === 1)
  const ringTwoCountries = globalCountries.filter((country) => country.ring === 2)

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
          <source src="/videos/public:videos:dashboard-hero.mp4" type="video/mp4" />
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
                Build content, capture leads, manage operations, and scale your creator business from one premium dashboard.
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
                      <p className="mt-2 text-3xl font-bold text-white">
                        {realAiRunsCount.toLocaleString()}
                      </p>
                      <p className="mt-2 text-xs font-medium text-yellow-400">Open →</p>
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
                      <p className="mt-2 text-3xl font-bold text-white">
                        {realLeadsCount.toLocaleString()}
                      </p>
                      <p className="mt-2 text-xs font-medium text-yellow-400">Open →</p>
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
              value={realAiRunsCount.toLocaleString()}
              subtext="Tracked inside your workspace"
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
              value={realLeadsCount.toLocaleString()}
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
                <p className="mt-2 text-sm text-zinc-400">Digital + physical products</p>
                <p className="mt-4 text-sm font-medium text-yellow-400">Open Marketplace →</p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      <section>
        <div className="mb-5">
          <h2 className="text-3xl font-bold text-white">AI Viral Content Engine</h2>
          <p className="mt-2 text-zinc-400">Your premium creator toolkit inside CreatorGoat.</p>
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
          <h2 className="text-3xl font-bold text-white">Business Shortcuts</h2>
          <p className="mt-2 text-zinc-400">
            Access your store operations, orders, shopping flow, and workspace controls fast.
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

      <section className="overflow-hidden rounded-[36px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] p-6 shadow-[0_0_60px_rgba(255,255,255,0.04)]">
        <div className="mb-6">
          <div className="inline-flex rounded-full border border-white/15 bg-white/5 px-4 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-zinc-300">
            Global Luxury Technology
          </div>
          <h2 className="mt-4 text-3xl font-bold text-white">
            Built with premium vision for a connected world
          </h2>
          <p className="mt-2 max-w-3xl text-zinc-400">
            CreatorGoat is not just a dashboard. It is a luxury technology system designed to help creators move with structure, scale, and worldwide reach.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {luxuryImages.map((image) => (
            <div
              key={image.title}
              className="group relative overflow-hidden rounded-[30px] border border-white/10 bg-white/5"
            >
              <img
                src={image.src}
                alt={image.title}
                className="h-[320px] w-full object-cover transition duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.18),transparent_28%)]" />
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <p className="text-xs uppercase tracking-[0.2em] text-zinc-300/80">
                  Luxury Technology
                </p>
                <h3 className="mt-2 text-2xl font-bold text-white">{image.title}</h3>
                <p className="mt-2 text-sm text-zinc-300">{image.subtitle}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 rounded-[36px] border border-cyan-400/15 bg-black/40 p-6 md:p-10">
          <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="flex justify-center">
              <div className="relative flex h-[420px] w-full max-w-[620px] items-center justify-center md:h-[620px]">
                <div className="absolute h-[240px] w-[240px] rounded-full border border-cyan-300/10 md:h-[520px] md:w-[520px]" />
                <div className="absolute h-[220px] w-[220px] rounded-full border border-cyan-300/10 md:h-[440px] md:w-[440px]" />
                <div className="absolute h-[190px] w-[190px] rounded-full border border-cyan-300/10 md:h-[350px] md:w-[350px]" />

                <CountriesOrbit
                  countries={ringOneCountries.slice(0, 12)}
                  radius={110}
                  size={240}
                  duration={36}
                  hideOnMobile={false}
                />

                <div className="hidden md:block">
                  <CountriesOrbit
                    countries={ringOneCountries}
                    radius={200}
                    size={430}
                    duration={48}
                  />
                </div>

                <div className="hidden md:block">
                  <CountriesOrbit
                    countries={ringTwoCountries}
                    radius={255}
                    size={560}
                    duration={70}
                  />
                </div>

                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative h-[170px] w-[170px] animate-[spin_24s_linear_infinite] rounded-full md:h-[290px] md:w-[290px]">
                    <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_35%_30%,rgba(255,255,255,0.45),rgba(56,189,248,0.22),rgba(8,15,30,0.96))] shadow-[0_0_90px_rgba(34,211,238,0.18)]" />
                    <div className="absolute inset-0 rounded-full border border-cyan-200/20" />
                    <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_center,transparent_52%,rgba(255,255,255,0.05)_53%,transparent_54%)]" />

                    <div className="absolute left-[18%] top-[18%] h-7 w-10 rounded-[45%] bg-cyan-200/18 blur-[1px] md:h-12 md:w-16" />
                    <div className="absolute right-[18%] top-[22%] h-6 w-10 rounded-[45%] bg-cyan-200/16 blur-[1px] md:h-10 md:w-16" />
                    <div className="absolute left-[16%] bottom-[24%] h-8 w-12 rounded-[45%] bg-cyan-200/14 blur-[1px] md:h-16 md:w-20" />
                    <div className="absolute right-[18%] bottom-[20%] h-8 w-10 rounded-[45%] bg-cyan-200/16 blur-[1px] md:h-14 md:w-16" />
                    <div className="absolute left-[40%] top-[8%] h-[82%] w-[1px] bg-cyan-200/20" />
                    <div className="absolute left-[58%] top-[10%] h-[78%] w-[1px] bg-cyan-200/12" />
                    <div className="absolute top-[28%] left-[10%] h-[1px] w-[80%] bg-cyan-200/16" />
                    <div className="absolute top-[48%] left-[8%] h-[1px] w-[84%] bg-cyan-200/14" />
                    <div className="absolute top-[68%] left-[12%] h-[1px] w-[76%] bg-cyan-200/12" />

                    <div className="absolute left-[12%] top-[18%] rounded-full border border-white/10 bg-black/40 px-2 py-0.5 text-[8px] font-semibold text-white md:px-2.5 md:py-1 md:text-[10px]">
                      🇺🇸 USA
                    </div>
                    <div className="absolute right-[6%] top-[22%] rounded-full border border-white/10 bg-black/40 px-2 py-0.5 text-[8px] font-semibold text-white md:px-2.5 md:py-1 md:text-[10px]">
                      🇫🇷 France
                    </div>
                    <div className="absolute left-[6%] bottom-[24%] rounded-full border border-white/10 bg-black/40 px-2 py-0.5 text-[8px] font-semibold text-white md:px-2.5 md:py-1 md:text-[10px]">
                      🇭🇹 Haiti
                    </div>
                    <div className="absolute right-[8%] bottom-[18%] rounded-full border border-white/10 bg-black/40 px-2 py-0.5 text-[8px] font-semibold text-white md:px-2.5 md:py-1 md:text-[10px]">
                      🇦🇪 UAE
                    </div>
                    <div className="absolute left-[34%] bottom-[8%] rounded-full border border-white/10 bg-black/40 px-2 py-0.5 text-[8px] font-semibold text-white md:px-2.5 md:py-1 md:text-[10px]">
                      🇯🇵 Japan
                    </div>
                    <div className="absolute left-[36%] top-[44%] rounded-full border border-white/10 bg-black/40 px-2 py-0.5 text-[8px] font-semibold text-white md:px-2.5 md:py-1 md:text-[10px]">
                      🇮🇳 India
                    </div>
                  </div>
                </div>

                <div className="absolute left-[18%] top-[22%] h-2 w-2 rounded-full bg-white shadow-[0_0_18px_rgba(255,255,255,0.9)] md:left-[12%] md:top-[18%] md:h-2.5 md:w-2.5" />
                <div className="absolute right-[18%] top-[22%] h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_18px_rgba(34,211,238,0.9)] md:right-[12%]" />
                <div className="absolute bottom-[20%] left-[20%] h-2 w-2 rounded-full bg-cyan-200 shadow-[0_0_18px_rgba(103,232,249,0.9)] md:left-[16%] md:h-2.5 md:w-2.5" />
                <div className="absolute bottom-[18%] right-[20%] h-2 w-2 rounded-full bg-white shadow-[0_0_18px_rgba(255,255,255,0.9)] md:right-[16%] md:h-2.5 md:w-2.5" />
                <div className="absolute top-[14%] left-[48%] h-2 w-2 rounded-full bg-cyan-100 shadow-[0_0_18px_rgba(207,250,254,0.9)] md:top-[10%] md:h-2.5 md:w-2.5" />
              </div>
            </div>

            <div>
              <div className="inline-flex rounded-full border border-cyan-400/15 bg-cyan-400/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200">
                Connected Worldwide
              </div>

              <h3 className="mt-4 text-4xl font-bold leading-tight text-white">
                One creator platform.
                <br />
                Global reach.
              </h3>

              <p className="mt-5 text-base leading-8 text-zinc-300">
                The CreatorGoat system is built with a worldwide mindset:
                premium tools, modern commerce, and strong creator operations
                designed to move across borders.
              </p>

              <div className="mt-8 space-y-3 text-sm leading-7 text-zinc-300">
                <p className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  CreatorGoat connects creators, products, and digital systems in one powerful workspace.
                </p>
                <p className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  It is built to help ideas move beyond one city, one market, or one audience.
                </p>
                <p className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  This platform is designed for creators who want luxury presence and global scale.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}