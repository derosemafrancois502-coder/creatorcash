"use client"

import { useMemo, useState } from "react"
import {
  BadgeDollarSign,
  BarChart3,
  Flame,
  LayoutGrid,
  Search,
  ShoppingBag,
  Sparkles,
  Star,
  TrendingUp,
} from "lucide-react"

const filters = [
  "Trending",
  "Low Competition",
  "High Demand",
  "Beauty",
  "Fashion",
  "Tech",
  "Home",
  "Digital",
]

const products = [
  {
    id: 1,
    name: "Hydrating Collagen Body Milk",
    category: "Beauty",
    description: "Luxury daily body care with glow-focused hydration appeal.",
    price: "$24.99",
    estimatedSales: "3.2K/mo",
    rating: "4.8",
    reviews: "1,248",
    trendScore: "92",
    competition: "Low",
    badge: "Hot",
    whyHot:
      "High repeat-purchase potential with strong skincare demand.",
    contentAngle:
      "Show glow-up routine, texture demo, and daily luxury care angle.",
    image: "/products/body-milk.jpg",
  },
  {
    id: 2,
    name: "Chebe Shampoo & Conditioner Set",
    category: "Beauty",
    description: "Strong haircare positioning with transformation-style content.",
    price: "$45.90",
    estimatedSales: "2.1K/mo",
    rating: "4.7",
    reviews: "932",
    trendScore: "89",
    competition: "Medium",
    badge: "Rising",
    whyHot:
      "Hair growth and restoration content performs strongly on short-form platforms.",
    contentAngle:
      "Use before/after wash day clips, hair journey storytelling, and premium routine framing.",
    image: "/products/chebe-set.jpg",
  },
  {
    id: 3,
    name: "Portable Ice Face Roller",
    category: "Beauty",
    description: "Fast visual skincare tool with strong demo-based content potential.",
    price: "$14.99",
    estimatedSales: "4.7K/mo",
    rating: "4.6",
    reviews: "2,014",
    trendScore: "90",
    competition: "Low",
    badge: "Low Competition",
    whyHot:
      "Easy to demonstrate, highly visual, and tied to beauty/self-care content demand.",
    contentAngle:
      "Morning face routine, de-puffing transformation, and luxury self-care aesthetic.",
    image: "/products/face-roller.jpg",
  },
  {
    id: 4,
    name: "Minimalist LED Desk Lamp",
    category: "Home",
    description: "Premium workspace product with creator and productivity appeal.",
    price: "$39.99",
    estimatedSales: "1.6K/mo",
    rating: "4.8",
    reviews: "687",
    trendScore: "84",
    competition: "Low",
    badge: "Best Margin",
    whyHot:
      "Strong crossover between workspace setup, productivity, and luxury desk content.",
    contentAngle:
      "Desk transformation, clean setup videos, and productivity night routine hooks.",
    image: "/products/desk-lamp.jpg",
  },
  {
    id: 5,
    name: "Creator Hook Pack Template Bundle",
    category: "Digital",
    description: "Digital creator tool with fast fulfillment and strong margin profile.",
    price: "$19.00",
    estimatedSales: "2.9K/mo",
    rating: "4.9",
    reviews: "514",
    trendScore: "88",
    competition: "Medium",
    badge: "Hot",
    whyHot:
      "Digital products are easy to deliver and fit perfectly with creator monetization audiences.",
    contentAngle:
      "Show how creators can save time, get views faster, and monetize with better hooks.",
    image: "/products/hook-pack.jpg",
  },
  {
    id: 6,
    name: "MagSafe Travel Power Bank",
    category: "Tech",
    description: "Useful lifestyle tech product with strong everyday content potential.",
    price: "$34.99",
    estimatedSales: "3.8K/mo",
    rating: "4.7",
    reviews: "1,109",
    trendScore: "91",
    competition: "Medium",
    badge: "Rising",
    whyHot:
      "Tech utility + portability creates broad audience appeal and frequent demo opportunities.",
    contentAngle:
      "Day-in-the-life carry setup, travel essentials, and phone battery emergency hooks.",
    image: "/products/power-bank.jpg",
  },
]

function FilterPill({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full border px-4 py-2 text-sm transition ${
        active
          ? "border-cyan-400/40 bg-cyan-400/15 text-cyan-200 shadow-[0_0_24px_rgba(34,211,238,0.14)]"
          : "border-white/10 bg-white/[0.04] text-zinc-300 hover:border-white/20 hover:bg-white/[0.08]"
      }`}
    >
      {label}
    </button>
  )
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-5 backdrop-blur-xl transition hover:-translate-y-0.5 hover:border-cyan-400/20">
      <div className="mb-4 flex items-center justify-between">
        <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-3 text-cyan-300">
          {icon}
        </div>
      </div>

      <p className="text-sm text-zinc-400">{label}</p>
      <h3 className="mt-1 text-3xl font-semibold tracking-tight text-white">
        {value}
      </h3>
    </div>
  )
}

function Metric({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
      <p className="text-[11px] uppercase tracking-wide text-zinc-500">{label}</p>
      <p className="mt-1 text-sm font-medium text-white">{value}</p>
    </div>
  )
}

function ProductCard({
  product,
}: {
  product: (typeof products)[number]
}) {
  return (
    <div className="overflow-hidden rounded-[30px] border border-white/10 bg-gradient-to-b from-white/[0.05] to-white/[0.02] backdrop-blur-xl transition-all hover:-translate-y-1 hover:border-cyan-400/20 hover:shadow-[0_18px_60px_rgba(0,0,0,0.35)]">
      <div className="relative h-56 w-full overflow-hidden bg-[#0a1020]">
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover transition duration-500 hover:scale-[1.03]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />

        <div className="absolute left-4 top-4">
          <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs text-cyan-200 backdrop-blur-md">
            {product.badge}
          </span>
        </div>
      </div>

      <div className="space-y-5 p-5">
        <div>
          <div className="mb-2 text-sm text-zinc-400">{product.category}</div>
          <h3 className="text-xl font-semibold text-white">{product.name}</h3>
          <p className="mt-2 text-sm leading-6 text-zinc-400">
            {product.description}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          <Metric label="Price" value={product.price} />
          <Metric label="Estimated Sales" value={product.estimatedSales} />
          <Metric label="Rating" value={product.rating} />
          <Metric label="Reviews" value={product.reviews} />
          <Metric label="Trend Score" value={product.trendScore} />
          <Metric label="Competition" value={product.competition} />
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <p className="text-sm font-medium text-white">Why it’s hot</p>
          <p className="mt-2 text-sm leading-6 text-zinc-400">
            {product.whyHot}
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <p className="text-sm font-medium text-white">Content angle</p>
          <p className="mt-2 text-sm leading-6 text-zinc-400">
            {product.contentAngle}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button className="rounded-2xl bg-cyan-400 px-4 py-3 text-sm font-medium text-black transition hover:scale-[1.02]">
            Generate Hooks
          </button>
          <button className="rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm text-white transition hover:bg-white/[0.08]">
            Write Caption
          </button>
          <button className="rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm text-white transition hover:bg-white/[0.08]">
            Create Product Ad
          </button>
          <button className="rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm text-white transition hover:bg-white/[0.08]">
            Add to Marketplace
          </button>
        </div>
      </div>
    </div>
  )
}

export default function ProductDiscoveryEnginePage() {
  const [search, setSearch] = useState("")
  const [activeFilter, setActiveFilter] = useState("Trending")

  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase()

    return products.filter((product) => {
      const haystack = [
        product.name,
        product.category,
        product.description,
        product.badge,
        product.whyHot,
        product.contentAngle,
      ]
        .join(" ")
        .toLowerCase()

      const matchesSearch = !q || haystack.includes(q)

      const matchesFilter =
        activeFilter === "Trending"
          ? true
          : activeFilter === "Low Competition"
          ? product.competition.toLowerCase() === "low"
          : activeFilter === "High Demand"
          ? Number(product.trendScore) >= 88
          : product.category.toLowerCase() === activeFilter.toLowerCase()

      return matchesSearch && matchesFilter
    })
  }, [search, activeFilter])

  const winningCount = filteredProducts.length
  const avgTrendScore =
    filteredProducts.length > 0
      ? Math.round(
          filteredProducts.reduce(
            (sum, product) => sum + Number(product.trendScore),
            0
          ) / filteredProducts.length
        )
      : 0
  const lowCompetitionCount = filteredProducts.filter(
    (product) => product.competition === "Low"
  ).length

  return (
    <div className="min-h-screen bg-[#050816] text-white">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-6 md:px-6 xl:px-8">
        <section className="relative overflow-hidden rounded-[34px] border border-white/10">
          <div className="absolute inset-0">
            <video
              src="/cg-productfinder-hero.mp4"
              className="h-full w-full object-cover"
              autoPlay
              muted
              loop
              playsInline
            />
            <div className="absolute inset-0 bg-black/65" />
          </div>

          <div className="relative z-10 px-6 py-10 md:px-8 md:py-12 xl:px-10 xl:py-14">
            <div className="mx-auto flex max-w-5xl flex-col items-center space-y-6 text-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-200">
                <Sparkles className="h-4 w-4" />
                COS Intelligence Module
              </div>

              <div className="space-y-3">
                <h1 className="text-4xl font-semibold tracking-tight md:text-5xl xl:text-6xl">
                  Product Discovery Engine
                </h1>
                <p className="mx-auto max-w-3xl text-sm leading-7 text-zinc-200 md:text-base">
                  Discover winning products, analyze market demand, and create
                  content that sells.
                </p>
              </div>

              <div className="flex w-full max-w-3xl flex-col gap-3 md:flex-row">
                <div className="relative flex-1">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search products, niches, or angles..."
                    className="h-14 w-full rounded-full border border-white/10 bg-white/[0.08] pl-12 pr-4 text-sm text-white outline-none backdrop-blur-xl placeholder:text-zinc-400 focus:border-cyan-400/30"
                  />
                </div>

                <button className="inline-flex h-14 items-center justify-center rounded-full bg-cyan-400 px-6 text-sm font-semibold text-black transition hover:scale-[1.02]">
                  Find Products
                </button>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
                {filters.map((filter) => (
                  <FilterPill
                    key={filter}
                    label={filter}
                    active={activeFilter === filter}
                    onClick={() => setActiveFilter(filter)}
                  />
                ))}
              </div>

              <div className="grid w-full gap-4 pt-3 md:grid-cols-3">
                <StatCard
                  icon={<ShoppingBag className="h-5 w-5" />}
                  label="Winning Products"
                  value={String(winningCount)}
                />
                <StatCard
                  icon={<TrendingUp className="h-5 w-5" />}
                  label="Avg Trend Score"
                  value={`${avgTrendScore}`}
                />
                <StatCard
                  icon={<BarChart3 className="h-5 w-5" />}
                  label="Low Competition Finds"
                  value={String(lowCompetitionCount)}
                />
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-5">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-zinc-300">
              <LayoutGrid className="h-4 w-4" />
              Winning Products
            </div>

            <h2 className="text-3xl font-semibold tracking-tight">
              Winning Products
            </h2>
            <p className="max-w-3xl text-sm leading-7 text-zinc-400 md:text-base">
              Explore high-potential products with strong content and sales
              opportunities.
            </p>
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="rounded-[28px] border border-dashed border-white/10 bg-white/[0.02] p-10 text-center">
              <Flame className="mx-auto mb-4 h-10 w-10 text-zinc-500" />
              <h3 className="text-xl font-semibold text-white">
                No products found
              </h3>
              <p className="mt-2 text-sm text-zinc-400">
                Try another keyword or switch filters to discover more product
                opportunities.
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}