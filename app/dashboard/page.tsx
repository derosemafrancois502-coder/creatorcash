import Link from "next/link"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { checkModuleAccess, getPlanDisplay } from "@/lib/access/guard"

type DashboardLinkItem = {
  title: string
  description: string
  href: string
  alwaysFree?: boolean
  blockedWhenFree?: boolean
  founderOnly?: boolean
}

const modules: DashboardLinkItem[] = [
  {
    title: "Hooks",
    description: "Generate viral hooks fast",
    href: "/dashboard/hooks",
    blockedWhenFree: true,
  },
  {
    title: "Captions",
    description: "Write captions that convert",
    href: "/dashboard/captions",
    blockedWhenFree: true,
  },
  {
    title: "Scripts",
    description: "Create short-form video scripts",
    href: "/dashboard/scripts",
    blockedWhenFree: true,
  },
  {
    title: "Replies",
    description: "Reply to comments with strategy",
    href: "/dashboard/replies",
    blockedWhenFree: true,
  },
  {
    title: "Product Writer",
    description: "Write product descriptions that sell",
    href: "/dashboard/product-writer",
    blockedWhenFree: true,
  },
  {
    title: "Growth",
    description: "Get growth ideas and content strategy",
    href: "/dashboard/growth",
    blockedWhenFree: true,
  },
  {
    title: "Email",
    description: "Write emails for sales and outreach",
    href: "/dashboard/email",
    blockedWhenFree: true,
  },
  {
    title: "Course Builder",
    description: "Turn knowledge into a sellable course",
    href: "/dashboard/course",
    blockedWhenFree: true,
  },
  {
    title: "Video Studio",
    description: "Generate luxury motivational and product videos",
    href: "/dashboard/video-studio",
    blockedWhenFree: true,
  },
]

const businessShortcuts: DashboardLinkItem[] = [
  {
    title: "Products",
    description: "Add, edit, and manage your store products",
    href: "/dashboard/products",
    blockedWhenFree: true,
  },
  {
    title: "Orders",
    description: "Track customer purchases and shipping updates",
    href: "/dashboard/orders",
    blockedWhenFree: true,
  },
  {
    title: "Discover Feed",
    description: "Open the TikTok-style shopping experience",
    href: "/discover",
    alwaysFree: true,
  },
  {
    title: "Cart",
    description: "Review cart items and continue checkout",
    href: "/cart",
    alwaysFree: true,
  },
  {
    title: "Leads CRM",
    description: "Capture, organize, and manage your leads",
    href: "/dashboard/leads",
    blockedWhenFree: true,
  },
  {
    title: "Messages",
    description: "Manage customer conversations and inbox flow",
    href: "/dashboard/messages",
    blockedWhenFree: true,
  },
  {
    title: "Links",
    description: "Manage your creator links page and destinations",
    href: "/dashboard/links",
    blockedWhenFree: true,
  },
  {
    title: "Settings",
    description: "Control your workspace, brand, and account preferences",
    href: "/dashboard/settings",
    blockedWhenFree: true,
  },
]

function HeroStat({
  label,
  value,
  subtext,
  href,
}: {
  label: string
  value: string
  subtext: string
  href?: string
}) {
  const content = (
    <>
      <p className="text-sm text-zinc-300">{label}</p>
      <h2 className="mt-3 text-4xl font-bold text-yellow-400">{value}</h2>
      <p className="mt-2 text-sm text-zinc-400">{subtext}</p>
      {href ? (
        <p className="mt-4 text-sm font-medium text-yellow-400">Open →</p>
      ) : null}
    </>
  )

  if (href) {
    return (
      <Link
        href={href}
        className="block rounded-[28px] border border-yellow-500/20 bg-black/30 p-5 backdrop-blur-md transition hover:border-yellow-400 hover:bg-black/40"
      >
        {content}
      </Link>
    )
  }

  return (
    <div className="rounded-[28px] border border-yellow-500/20 bg-black/30 p-5 backdrop-blur-md">
      {content}
    </div>
  )
}

function getLockedHref(
  profile: {
    plan?: string | null
    trial_expires_at?: string | null
    subscription_expires_at?: string | null
  } | null,
  item: DashboardLinkItem
) {
  const access = checkModuleAccess(profile || {}, {
    alwaysFree: item.alwaysFree,
    founderOnly: item.founderOnly,
    blockedWhenFree: item.blockedWhenFree,
  })

  return access.allowed ? item.href : "/dashboard/billing"
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

  const videoStudioHref = getLockedHref(profile, {
    title: "Video Studio",
    description: "",
    href: "/dashboard/video-studio",
    blockedWhenFree: true,
  })

  const leadsHref = getLockedHref(profile, {
    title: "Leads",
    description: "",
    href: "/dashboard/leads",
    blockedWhenFree: true,
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
        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/45 to-black/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/15" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(250,204,21,0.18),transparent_28%)]" />

        <div className="relative z-10 flex min-h-[78vh] flex-col justify-between p-8 md:p-10 xl:p-12">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
            <div className="max-w-4xl">
              <div className="mb-4 inline-flex items-center rounded-full border border-yellow-500/20 bg-yellow-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-yellow-300 backdrop-blur-sm">
                CreatorGoat OS
              </div>

              <h1 className="max-w-4xl text-5xl font-bold leading-[0.95] tracking-tight text-yellow-400 sm:text-6xl xl:text-7xl">
                Welcome back,
                <br />
                Creator
              </h1>

              <p className="mt-5 max-w-3xl text-lg leading-8 text-zinc-200 sm:text-xl">
                Build content. Capture leads. Sell digital and physical
                products. Run your creator empire from one powerful dashboard.
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
                  Upgrade to Pro
                </Link>

                <Link
                  href={marketplaceHref}
                  className="rounded-2xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white backdrop-blur-sm transition hover:border-yellow-400/30 hover:bg-white/10"
                >
                  Open Marketplace
                </Link>
              </div>
            </div>

            <div className="w-full max-w-md rounded-[30px] border border-yellow-500/20 bg-black/30 p-6 backdrop-blur-md">
              <p className="text-xs uppercase tracking-[0.22em] text-yellow-300/70">
                Live Dashboard Status
              </p>

              <div className="mt-5 space-y-4">
                <Link
                  href={billingHref}
                  className="block rounded-2xl border border-yellow-500/15 bg-yellow-500/5 p-4 transition hover:border-yellow-400 hover:bg-yellow-500/10"
                >
                  <p className="text-sm text-zinc-400">Active Plan</p>
                  <p className="mt-2 text-3xl font-bold text-yellow-400">
                    {currentPlanLabel}
                  </p>
                  <p className="mt-1 text-sm text-zinc-500">
                    Premium creator tools
                  </p>
                </Link>

                <div className="grid grid-cols-2 gap-4">
                  <Link
                    href={videoStudioHref}
                    className="block rounded-2xl border border-yellow-500/15 bg-black/30 p-4 transition hover:border-yellow-400 hover:bg-black/40"
                  >
                    <p className="text-sm text-zinc-400">AI Runs</p>
                    <p className="mt-2 text-2xl font-bold text-yellow-400">
                      128
                    </p>
                  </Link>

                  <Link
                    href={leadsHref}
                    className="block rounded-2xl border border-yellow-500/15 bg-black/30 p-4 transition hover:border-yellow-400 hover:bg-black/40"
                  >
                    <p className="text-sm text-zinc-400">Leads</p>
                    <p className="mt-2 text-2xl font-bold text-yellow-400">
                      24
                    </p>
                  </Link>
                </div>

                <Link
                  href={marketplaceHref}
                  className="block rounded-2xl border border-yellow-500/15 bg-black/30 p-4 transition hover:border-yellow-400 hover:bg-black/40"
                >
                  <p className="text-sm text-zinc-400">Marketplace</p>
                  <p className="mt-2 text-3xl font-bold text-yellow-400">
                    Open
                  </p>
                  <p className="mt-1 text-sm text-zinc-500">
                    Digital + physical products
                  </p>
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
            />
            <HeroStat
              label="Active Plan"
              value={currentPlanLabel}
              subtext="Premium creator tools"
              href={billingHref}
            />
            <HeroStat
              label="Leads"
              value="24"
              subtext="Captured in your system"
              href={leadsHref}
            />
            <Link
              href={marketplaceHref}
              className="block rounded-[28px] border border-yellow-500/20 bg-black/30 p-5 backdrop-blur-md transition hover:border-yellow-400 hover:bg-black/40"
            >
              <p className="text-sm text-zinc-300">Marketplace</p>
              <h2 className="mt-3 text-4xl font-bold text-yellow-400">Open</h2>
              <p className="mt-2 text-sm text-zinc-400">
                Digital + physical products
              </p>
              <p className="mt-4 text-sm font-medium text-yellow-400">
                Open Marketplace →
              </p>
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
            const href = getLockedHref(profile, module)

            return (
              <div
                key={module.title}
                className="rounded-3xl border border-yellow-500/25 bg-zinc-950 p-6"
              >
                <h3 className="text-2xl font-bold text-yellow-400">
                  {module.title}
                </h3>

                <p className="mt-3 min-h-[52px] text-sm leading-6 text-zinc-400">
                  {module.description}
                </p>

                <Link
                  href={href}
                  className="mt-6 block w-full rounded-2xl bg-yellow-400 px-4 py-3 text-center text-sm font-semibold text-black transition hover:opacity-90"
                >
                  Open Tool
                </Link>
              </div>
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
            const href = getLockedHref(profile, item)

            return (
              <Link
                key={item.title}
                href={href}
                className="rounded-3xl border border-yellow-500/25 bg-zinc-950 p-6 transition hover:border-yellow-400 hover:bg-zinc-900"
              >
                <h3 className="text-2xl font-bold text-yellow-400">
                  {item.title}
                </h3>

                <p className="mt-3 min-h-[52px] text-sm leading-6 text-zinc-400">
                  {item.description}
                </p>

                <p className="mt-6 text-sm font-semibold text-yellow-400">
                  Open →
                </p>
              </Link>
            )
          })}
        </div>
      </section>
    </div>
  )
}