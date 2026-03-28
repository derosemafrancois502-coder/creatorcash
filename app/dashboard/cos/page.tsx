"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  Brain,
  Flame,
  TrendingUp,
  Search,
  Clapperboard,
  History,
  Bot,
  CalendarDays,
  BarChart3,
  ShoppingBag,
  Users2,
  ArrowRight,
  GraduationCap,
} from "lucide-react"

const cosModules = [
  {
    title: "Creator Brain",
    description: "Your AI command center for ideas, brand strategy, and content direction.",
    href: "/dashboard/cos/creator-brain",
    icon: Brain,
  },
  {
    title: "AI Creator Copilot",
    description: "Get your next best move, what to post, how to grow, and what to avoid.",
    href: "/dashboard/cos/creator-copilot",
    icon: Bot,
  },
  {
    title: "Auto-Viral Video Engine",
    description: "Generate viral-style video concepts, hooks, captions, script, and CTA fast.",
    href: "/dashboard/cos/auto-viral",
    icon: Flame,
  },
  {
    title: "Trend Scanner",
    description: "Track what is moving now so creators can react early.",
    href: "/dashboard/cos/trend-scanner",
    icon: TrendingUp,
  },
  {
    title: "Viral Trend Radar",
    description: "Spot strong content momentum, hot angles, and emerging creator opportunities.",
    href: "/dashboard/cos/viral-trend-radar",
    icon: BarChart3,
  },
  {
    title: "Product Discovery Engine",
    description: "Find winning product angles and content opportunities.",
    href: "/dashboard/cos/product-discovery",
    icon: Search,
  },
  {
    title: "Video Cloning System",
    description: "Analyze winning video structure and recreate high-converting versions.",
    href: "/dashboard/cos/video-cloning",
    icon: Clapperboard,
  },
  {
    title: "AI Content Calendar",
    description: "Generate structured daily content plans with hooks, captions, and posting direction.",
    href: "/dashboard/cos/content-calendar",
    icon: CalendarDays,
  },
  {
    title: "Marketplace OS",
    description: "Control product strategy, creator selling flow, and monetization systems in one place.",
    href: "/dashboard/cos/marketplace-os",
    icon: ShoppingBag,
  },
  {
    title: "Affiliate Network",
    description: "Design creator-to-creator promotion systems and referral-driven growth loops.",
    href: "/dashboard/cos/affiliate-network",
    icon: Users2,
  },
  {
    title: "Learn",
    description: "Search real professional learning content, preview classes, and grow with structured technical education.",
    href: "/dashboard/cos/learn",
    icon: GraduationCap,
  },
  {
    title: "History",
    description: "View, copy, and manage saved AI outputs from your COS modules.",
    href: "/dashboard/history",
    icon: History,
  },
]

const luxuryVideos = [
  "/hero-rolls.mp4",
  "/hero-lambo.mp4",
  "/hero-mercedes.mp4",
  "/hero-yacht.mp4",
]

export default function COSPage() {
  const [activeVideo, setActiveVideo] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveVideo((prev) => (prev + 1) % luxuryVideos.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="space-y-8 bg-white">
      <section className="space-y-8">
        <div className="relative overflow-hidden rounded-[2rem] border border-yellow-300/50 bg-white shadow-[0_25px_80px_rgba(212,175,55,0.18)]">
          <div className="relative min-h-[360px] md:min-h-[440px] xl:min-h-[520px]">
            <div className="absolute inset-0">
              {luxuryVideos.map((videoSrc, index) => (
                <video
                  key={videoSrc}
                  autoPlay
                  muted
                  loop
                  playsInline
                  className={`absolute inset-0 h-full w-full object-cover transition-all duration-1000 ${
                    activeVideo === index ? "opacity-100 scale-100" : "opacity-0 scale-105"
                  }`}
                >
                  <source src={videoSrc} type="video/mp4" />
                </video>
              ))}

              <div className="absolute inset-0 bg-white/10" />
              <div className="absolute inset-0 bg-gradient-to-r from-white/15 via-black/25 to-white/10" />
              <div className="absolute inset-0 bg-gradient-to-t from-white/5 via-transparent to-white/10" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.35),transparent_22%),radial-gradient(circle_at_top_right,rgba(250,204,21,0.22),transparent_20%),radial-gradient(circle_at_bottom,rgba(255,255,255,0.20),transparent_24%)]" />
            </div>

            <div className="relative z-10 flex min-h-[360px] items-end p-5 md:min-h-[440px] md:p-8 xl:min-h-[520px] xl:p-10">
              <div className="w-full max-w-5xl rounded-[2rem] border border-yellow-300/40 bg-white/68 p-6 backdrop-blur-md shadow-[0_18px_45px_rgba(212,175,55,0.16)] md:p-8">
                <p className="text-sm uppercase tracking-[0.35em] text-yellow-700">
                  Creator Operating System
                </p>

                <h1 className="mt-3 text-5xl font-bold tracking-tight text-zinc-900 md:text-6xl xl:text-7xl">
                  COS
                </h1>

                <p className="mt-4 max-w-4xl text-base leading-7 text-zinc-700 md:text-lg">
                  The AI control center of CreatorGoat. One powerful system that holds
                  creator intelligence, viral strategy, product discovery, video systems,
                  content planning, monetization layers, learning, and saved history in one place.
                </p>

                <div className="mt-6 flex items-center gap-2">
                  {luxuryVideos.map((_, index) => (
                    <div
                      key={index}
                      className={`h-2.5 rounded-full transition-all duration-500 ${
                        activeVideo === index
                          ? "w-10 bg-yellow-500"
                          : "w-2.5 bg-zinc-400/60"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="mb-5">
            <h2 className="text-3xl font-bold text-zinc-900">COS Submodules</h2>
            <p className="mt-2 max-w-3xl text-zinc-600">
              Open the exact intelligence layer you need inside CreatorGoat:
              strategy, trends, content systems, product discovery, learning, and saved history.
            </p>
          </div>

          <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {cosModules.map((module) => {
              const Icon = module.icon

              return (
                <Link
                  key={module.title}
                  href={module.href}
                  className="group relative overflow-hidden rounded-[2rem] border border-yellow-300/50 bg-[linear-gradient(145deg,#fffdf7_0%,#fff4cf_38%,#fde68a_68%,#fffdf7_100%)] p-6 transition duration-300 hover:-translate-y-1 hover:border-yellow-500 hover:shadow-[0_18px_50px_rgba(212,175,55,0.22)]"
                >
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.95),transparent_24%),linear-gradient(135deg,transparent_0%,rgba(255,255,255,0.14)_35%,transparent_60%)]" />
                  <div className="absolute right-5 top-5 h-14 w-14 rotate-45 rounded-xl border border-white/60 bg-white/25 shadow-[0_0_25px_rgba(255,255,255,0.45)]" />
                  <div className="absolute bottom-6 left-6 h-4 w-4 rotate-45 rounded-sm bg-white/60 shadow-[0_0_18px_rgba(255,255,255,0.8)]" />
                  <div className="absolute right-8 bottom-8 h-3 w-3 rotate-45 rounded-sm bg-yellow-200/90 shadow-[0_0_16px_rgba(255,255,255,0.8)]" />

                  <div className="relative z-10">
                    <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-yellow-500/40 bg-white/70 text-yellow-700 shadow-[0_10px_25px_rgba(212,175,55,0.18)]">
                      <Icon className="h-7 w-7" />
                    </div>

                    <div className="space-y-3">
                      <h2 className="text-xl font-semibold text-zinc-900 group-hover:text-yellow-800">
                        {module.title}
                      </h2>

                      <p className="text-sm leading-6 text-zinc-700">
                        {module.description}
                      </p>

                      <div className="flex items-center gap-2 pt-2 text-sm font-semibold text-yellow-800">
                        Open module
                        <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </section>
        </div>
      </section>
    </div>
  )
}