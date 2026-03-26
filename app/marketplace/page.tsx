"use client"

import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import {
  ShieldCheck,
  Store,
  ArrowRight,
  Lock,
  BadgeCheck,
  Sparkles,
  Camera,
  Mic,
  Crown,
} from "lucide-react"

const marketplaceVideos = [
  "/videos/cg-marketplace-luxury.mp4",
  "/videos/cg-marketplace-products.mp4",
  "/videos/cg-marketplace-mobile.mp4",
]

const beautyGallery = [
  {
    title: "Premium product presentation",
    subtitle: "Clean premium shelf look",
    image:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Luxury skincare visual",
    subtitle: "Elegant beauty product mood",
    image:
      "https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Digital creator experience",
    subtitle: "Creator marketplace energy",
    image:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Fashion and clean premium look",
    subtitle: "Modern curated storefront feel",
    image:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1200&q=80",
  },
]

const premiumProductStrip = [
  {
    
  title: "Luxury tech setup",
  tag: "Trending",
  image:
    "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80",
},
  {
    title: "High-end watch style",
    tag: "Premium",
    image:
      "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Fragrance shelf mood",
    tag: "Popular",
    image:
      "https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Beauty product detail",
    tag: "Hot",
    image:
      "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Clean creator desk",
    tag: "Creator Pick",
    image:
      "https://images.unsplash.com/photo-1496171367470-9ed9a91ea931?auto=format&fit=crop&w=1200&q=80",
  },
]

const marketplaceFeatureCards = [
  {
    title: "Trending Products",
    text: "High-traffic marketplace items designed to catch attention fast.",
  },
  {
    title: "Flash Deals",
    text: "Limited-time premium offers and urgency-driven product moments.",
  },
  {
    title: "Verified Sellers",
    text: "Identity-first onboarding for trust, control, and strong buyer confidence.",
  },
  {
    title: "Picks for You",
    text: "Curated discovery built for beautiful browsing and stronger conversion.",
  },
]

declare global {
  interface Window {
    webkitSpeechRecognition?: any
    SpeechRecognition?: any
  }
}

export default function MarketplacePage() {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])

  const [videoIndex, setVideoIndex] = useState(0)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const [marketplaceSearch, setMarketplaceSearch] = useState("")
  const [isListening, setIsListening] = useState(false)
  const [voiceSupported, setVoiceSupported] = useState(false)
  const [imageSearchLabel, setImageSearchLabel] = useState("")
  const [myShopLoading, setMyShopLoading] = useState(false)

  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const recognitionRef = useRef<any>(null)

  useEffect(() => {
    const interval = setInterval(() => {
      setVideoIndex((prev) => (prev + 1) % marketplaceVideos.length)
    }, 7000)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const SpeechRecognition =
      typeof window !== "undefined"
        ? window.SpeechRecognition || window.webkitSpeechRecognition
        : null

    setVoiceSupported(Boolean(SpeechRecognition))

    if (!SpeechRecognition) return

    const recognition = new SpeechRecognition()
    recognition.lang = "en-US"
    recognition.continuous = false
    recognition.interimResults = false

    recognition.onstart = () => {
      setIsListening(true)
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognition.onerror = () => {
      setIsListening(false)
      alert("Voice search is not available right now.")
    }

    recognition.onresult = (event: any) => {
      const transcript = event?.results?.[0]?.[0]?.transcript || ""
      if (transcript) {
        setMarketplaceSearch(transcript)
      }
    }

    recognitionRef.current = recognition

    return () => {
      try {
        recognition.stop()
      } catch {}
    }
  }, [])

  async function handleSignIn() {
    if (!email || !password) {
      alert("Please enter your email and password.")
      return
    }

    try {
      setLoading(true)

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        alert(error.message)
        return
      }

      if (marketplaceSearch.trim()) {
        router.push(
          `/marketplace/explore?q=${encodeURIComponent(marketplaceSearch.trim())}`
        )
        return
      }

      router.push("/marketplace/explore")
    } catch (error) {
      console.error(error)
      alert("Something went wrong while signing in.")
    } finally {
      setLoading(false)
    }
  }

  function goToExploreWithSearch(value?: string) {
    const keyword = (value ?? marketplaceSearch).trim()

    if (!keyword) {
      router.push("/marketplace/explore")
      return
    }

    router.push(`/marketplace/explore?q=${encodeURIComponent(keyword)}`)
  }

  function openCameraSearch() {
    fileInputRef.current?.click()
  }

  function extractSearchTermsFromFilename(filename: string) {
    return filename
      .replace(/\.[^/.]+$/, "")
      .replace(/[-_]+/g, " ")
      .replace(/\s+/g, " ")
      .trim()
  }

  function handleImageSearchUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    const nextSearch = extractSearchTermsFromFilename(file.name) || file.name
    setImageSearchLabel(file.name)
    setMarketplaceSearch(nextSearch)
    router.push(`/marketplace/explore?q=${encodeURIComponent(nextSearch)}`)
  }

  function startVoiceSearch() {
    if (!recognitionRef.current) {
      alert("Voice search is not supported in this browser.")
      return
    }

    try {
      recognitionRef.current.start()
    } catch {
      alert("Voice search is already running.")
    }
  }

  async function handleMyShopAccess() {
    try {
      setMyShopLoading(true)

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/marketplace/seller/apply")
        return
      }

      router.push("/dashboard/seller")
    } catch (error) {
      console.error(error)
      router.push("/marketplace/seller/apply")
    } finally {
      setMyShopLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050505] text-white">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleImageSearchUpload}
      />

      <div className="absolute inset-0">
        {marketplaceVideos.map((src, index) => (
          <video
            key={src}
            autoPlay
            muted
            loop
            playsInline
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${
              index === videoIndex ? "opacity-100" : "opacity-0"
            } brightness-[0.88] contrast-[1.08] saturate-[1.08]`}
          >
            <source src={src} type="video/mp4" />
          </video>
        ))}

        <div className="absolute inset-0 bg-black/42" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/22 via-black/38 to-[#050505]/92" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,215,0,0.10),transparent_26%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.04),transparent_22%)]" />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col">
        <header className="border-b border-white/10 bg-black/12 backdrop-blur-xl">
          <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 md:px-6 lg:px-8">
            <Link href="/" className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-yellow-400/20 bg-white/10 shadow-[0_0_35px_rgba(255,215,0,0.08)] backdrop-blur-xl">
                <Store className="h-5 w-5 text-yellow-300" />
              </div>

              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.34em] text-white/60">
                  CreatorGoat
                </p>
                <h1 className="text-base font-semibold text-white md:text-lg">
                  Marketplace
                </h1>
              </div>
            </Link>

            <div className="flex items-center gap-2 md:gap-3">
              <Link
                href="/marketplace/explore"
                className="rounded-2xl border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/15"
              >
                Explore
              </Link>

              <Link
                href="/marketplace/seller/apply"
                className="rounded-2xl bg-white px-5 py-2 text-sm font-semibold text-black transition hover:scale-[1.02]"
              >
                Become a Seller
              </Link>
            </div>
          </div>
        </header>

        <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-8 px-4 pb-14 pt-6 md:px-6 lg:px-8">
          {imageSearchLabel && (
            <div className="rounded-3xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white/85 backdrop-blur-xl">
              Visual search ready:{" "}
              <span className="font-semibold text-white">{imageSearchLabel}</span>
            </div>
          )}

          {isListening && (
            <div className="rounded-3xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white/85 backdrop-blur-xl">
              Listening...
            </div>
          )}

          {marketplaceSearch && !isListening && !imageSearchLabel && (
            <div className="rounded-3xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white/85 backdrop-blur-xl">
              Search ready for Explore:{" "}
              <span className="font-semibold text-white">{marketplaceSearch}</span>
            </div>
          )}

          <section className="grid min-h-[90vh] items-center gap-6 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/8 p-6 shadow-[0_20px_80px_rgba(0,0,0,0.28)] backdrop-blur-xl md:p-8">
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-2 rounded-full border border-yellow-300/20 bg-yellow-400/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-yellow-200">
                  <Crown className="h-3.5 w-3.5" />
                  Verified Sellers Only
                </span>
              </div>

              <h2 className="mt-6 max-w-4xl text-4xl font-semibold leading-tight text-white md:text-6xl">
                Discover.
                <br />
                Buy.
                <br />
                Build.
              </h2>

              <p className="mt-5 max-w-3xl text-sm leading-7 text-white/78 md:text-base">
                A premium creator marketplace for products, brands, and verified
                sellers. Secure checkout, curated discovery, and controlled seller
                onboarding built for trust, scale, and brand power.
              </p>

              <div className="mt-8 max-w-3xl">
                <div className="flex flex-col gap-3 md:flex-row">
                  <div className="flex flex-1 items-center gap-2 rounded-[1.5rem] border border-white/10 bg-[#090909]/72 p-2 backdrop-blur-xl">
                    <input
                      value={marketplaceSearch}
                      onChange={(e) => setMarketplaceSearch(e.target.value)}
                      placeholder="Search products, categories, or stores..."
                      className="h-12 flex-1 bg-transparent px-3 text-sm text-white placeholder:text-white/40 outline-none"
                    />

                    <button
                      type="button"
                      onClick={openCameraSearch}
                      className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-yellow-500 text-black transition hover:scale-[1.02]"
                    >
                      <Camera className="h-4 w-4" />
                    </button>

                    <button
                      type="button"
                      onClick={startVoiceSearch}
                      className={`flex h-12 w-12 items-center justify-center rounded-2xl border transition ${
                        isListening
                          ? "border-red-300 bg-red-500/20 text-white"
                          : "border-white/10 bg-yellow-500 text-black hover:scale-[1.02]"
                      }`}
                      disabled={!voiceSupported}
                    >
                      <Mic className="h-4 w-4" />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => goToExploreWithSearch()}
                    className="h-16 rounded-[1.5rem] bg-yellow-500 px-8 text-sm font-semibold text-black transition hover:scale-[1.01] md:h-auto"
                  >
                    Search
                  </button>
                </div>

                <div className="mt-3 flex flex-wrap gap-2 text-xs text-white/72">
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                    Premium marketplace access
                  </span>
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                    Protected by identity verification
                  </span>
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                    Secure seller onboarding
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-white/8 p-6 backdrop-blur-xl md:p-8">
              <div className="mb-6">
                <p className="text-xs uppercase tracking-[0.28em] text-white/50">
                  Marketplace Access
                </p>
                <h3 className="mt-2 text-3xl font-semibold text-white">Welcome back</h3>
                <p className="mt-2 text-sm leading-6 text-white/68">
                  Sign in to continue shopping and explore the marketplace.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-white/85">
                    Email
                  </label>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 w-full rounded-2xl border border-white/15 bg-white/10 px-4 text-white placeholder:text-white/40 outline-none backdrop-blur-md transition focus:border-yellow-300/30"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-white/85">
                    Password
                  </label>
                  <input
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12 w-full rounded-2xl border border-white/15 bg-white/10 px-4 text-white placeholder:text-white/40 outline-none backdrop-blur-md transition focus:border-yellow-300/30"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        handleSignIn()
                      }
                    }}
                  />
                </div>

                <button
                  onClick={handleSignIn}
                  disabled={loading}
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-yellow-500 text-sm font-semibold text-black transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? "Signing In..." : "Sign In"}
                  {!loading && <ArrowRight className="h-4 w-4" />}
                </button>

                <div className="grid gap-3 sm:grid-cols-2">
                  <Link
                    href="/marketplace/explore"
                    className="flex h-12 items-center justify-center rounded-2xl border border-white/15 bg-white/10 text-sm font-medium text-white backdrop-blur-md transition hover:bg-white/15"
                  >
                    Buyer Side
                  </Link>

                  <button
                    type="button"
                    onClick={handleMyShopAccess}
                    className="flex h-12 items-center justify-center rounded-2xl border border-white/15 bg-white/10 text-sm font-medium text-white backdrop-blur-md transition hover:bg-white/15"
                  >
                    {myShopLoading ? "Loading..." : "Seller Side"}
                  </button>
                </div>

                <div className="rounded-[1.5rem] border border-yellow-300/15 bg-yellow-400/10 p-4">
                  <div className="flex items-start gap-3">
                    <Lock className="mt-0.5 h-4 w-4 text-yellow-200" />
                    <div>
                      <p className="text-sm font-semibold text-white">
                        Controlled seller access
                      </p>
                      <p className="mt-1 text-xs leading-5 text-white/65">
                        Verified seller onboarding is required before any shop can go live.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="mt-16 rounded-[2rem] border border-white/10 bg-white/10 p-5 backdrop-blur-xl md:p-6">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-white/50">
                  Featured Visual Products
                </p>
                <h3 className="mt-2 text-2xl font-semibold text-white">
                  Beautiful marketplace products
                </h3>
                <p className="mt-2 text-sm text-white/60">
                  Decorative premium product visuals placed under the hero so the top video stays clean.
                </p>
              </div>

              <button
                type="button"
                onClick={() => router.push("/marketplace/explore")}
                className="inline-flex items-center gap-2 text-sm font-semibold text-white/85 transition hover:text-white"
              >
                Discover products
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
              {premiumProductStrip.map((item) => (
                <article
                  key={item.title}
                  className="overflow-hidden rounded-[1.8rem] border border-white/10 bg-[#0c0c0c]/70 backdrop-blur-xl"
                >
                  <div className="relative aspect-[4/5] overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
                    <div className="absolute left-3 top-3 rounded-full border border-white/10 bg-black/45 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white backdrop-blur-md">
                      {item.tag}
                    </div>
                    <div className="absolute inset-x-0 bottom-0 p-4">
                      <h4 className="text-sm font-semibold text-white">{item.title}</h4>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="mt-20 grid gap-4 md:grid-cols-3">
            <TrustCard
              icon={<ShieldCheck className="h-5 w-5 text-yellow-300" />}
              title="Verified sellers"
              text="Identity-first onboarding for trusted selling."
            />
            <TrustCard
              icon={<BadgeCheck className="h-5 w-5 text-yellow-300" />}
              title="Premium discovery"
              text="Curated products and storefront-first experience."
            />
            <TrustCard
              icon={<Sparkles className="h-5 w-5 text-yellow-300" />}
              title="Platform growth"
              text="Buyer side and seller side built for scale."
            />
          </section>

          <section className="mt-20 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {marketplaceFeatureCards.map((card) => (
              <div
                key={card.title}
                className="rounded-[1.8rem] border border-white/10 bg-white/10 p-5 backdrop-blur-xl"
              >
                <p className="text-sm font-semibold text-white">{card.title}</p>
                <p className="mt-2 text-sm leading-6 text-white/62">{card.text}</p>
              </div>
            ))}
          </section>

          <section className="mt-20 rounded-[2rem] border border-white/10 bg-white/10 p-5 backdrop-blur-xl md:p-6">
            <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-white/50">
                  Visual Showcase
                </p>
                <h3 className="mt-2 text-2xl font-semibold text-white">
                  Premium marketplace atmosphere
                </h3>
                <p className="mt-2 text-sm text-white/60">
                  Decorative visuals only. No fake prices. No fake clicks.
                </p>
              </div>

              <button
                type="button"
                onClick={() => router.push("/marketplace/explore")}
                className="inline-flex items-center gap-2 text-sm font-semibold text-white/85 transition hover:text-white"
              >
                Go to Explore
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {beautyGallery.map((item) => (
                <article
                  key={item.title}
                  className="overflow-hidden rounded-[1.8rem] border border-white/10 bg-[#0c0c0c]/70 backdrop-blur-xl"
                >
                  <div className="relative aspect-[1/1] overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                    <div className="absolute left-3 top-3 rounded-full border border-white/10 bg-black/40 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white backdrop-blur-md">
                      Showcase
                    </div>
                  </div>

                  <div className="p-4">
                    <h4 className="text-base font-semibold text-white">{item.title}</h4>
                    <p className="mt-1 text-xs text-white/45">{item.subtitle}</p>
                    <p className="mt-2 text-sm text-white/55">
                      Marketplace visual presentation
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="mt-20 grid gap-4 lg:grid-cols-2">
            <div className="rounded-[2rem] border border-white/10 bg-white/10 p-6 backdrop-blur-xl">
              <div className="mb-4 inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white/65">
                Buyer Side
              </div>

              <h3 className="text-2xl font-semibold text-white">
                Explore and buy
              </h3>
              <p className="mt-3 text-sm leading-7 text-white/65">
                Browse premium products, discover verified sellers, shop by
                category, and complete checkout in a protected marketplace flow.
              </p>

              <div className="mt-4 flex flex-wrap gap-2 text-xs text-white/65">
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                  Product discovery
                </span>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                  Cart & checkout
                </span>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                  Tracking
                </span>
              </div>

              <Link
                href="/marketplace/explore"
                className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-black transition hover:scale-[1.01]"
              >
                Explore Marketplace
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="rounded-[2rem] border border-yellow-400/20 bg-gradient-to-br from-yellow-500/10 via-white/10 to-white/5 p-6 backdrop-blur-xl">
              <div className="mb-4 inline-flex rounded-full border border-yellow-300/20 bg-yellow-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-yellow-200">
                Seller Side
              </div>

              <h3 className="text-2xl font-semibold text-white">
                Build your shop and sell
              </h3>
              <p className="mt-3 text-sm leading-7 text-white/70">
                Apply as a seller, get verified, manage products, create your
                storefront, handle shipping, and run your business from one seller dashboard.
              </p>

              <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-white/70">
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-2">
                  Verification
                </span>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-2">
                  Products
                </span>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-2">
                  Shipping
                </span>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-2">
                  Payout flow
                </span>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/marketplace/seller/apply"
                  className="inline-flex items-center gap-2 rounded-2xl bg-yellow-500 px-5 py-3 text-sm font-semibold text-black transition hover:scale-[1.01]"
                >
                  Become a Seller
                </Link>

                <button
                  type="button"
                  onClick={handleMyShopAccess}
                  className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
                >
                  {myShopLoading ? "Loading..." : "Seller Dashboard"}
                </button>
              </div>
            </div>
          </section>

          <section className="mt-20 rounded-[1.8rem] border border-white/10 bg-white/10 p-4 backdrop-blur-xl">
            <div className="flex items-start gap-3">
              <Sparkles className="mt-0.5 h-5 w-5 text-yellow-300" />
              <div>
                <p className="text-sm font-semibold text-white">
                  Seller side now visible
                </p>
                <p className="mt-1 text-xs leading-6 text-white/65">
                  Buyers explore products. Sellers apply, verify, manage shop,
                  products, shipping, and marketplace operations.
                </p>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}

function TrustCard({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode
  title: string
  text: string
}) {
  return (
    <div className="rounded-[1.8rem] border border-white/10 bg-white/10 p-5 backdrop-blur-xl">
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-black/20">
        {icon}
      </div>
      <h4 className="text-base font-semibold text-white">{title}</h4>
      <p className="mt-2 text-sm leading-6 text-white/65">{text}</p>
    </div>
  )
}