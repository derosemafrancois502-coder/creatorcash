"use client"

import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import {
  ShieldCheck,
  Store,
  ShoppingBag,
  ArrowRight,
  Lock,
  BadgeCheck,
  Users,
  Sparkles,
  Truck,
  Wallet,
  Package,
  Search,
  Camera,
  Mic,
} from "lucide-react"

const marketplaceVideos = [
  "/videos/cg-marketplace-luxury.mp4",
  "/videos/cg-marketplace-products.mp4",
  "/videos/cg-marketplace-mobile.mp4",
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
        goToExploreWithSearch(transcript)
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

  return (
    <div className="relative min-h-screen overflow-hidden bg-white text-white">
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
            }`}
          >
            <source src={src} type="video/mp4" />
          </video>
        ))}

        <div className="absolute inset-0 bg-black/35" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-black/20 to-black/60" />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col">
        <header className="flex items-center justify-between px-6 py-5 md:px-10">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/25 bg-white/10 backdrop-blur-md">
              <Store className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.3em] text-white/70">
                CreatorGoat
              </p>
              <h1 className="text-lg font-semibold text-white">Marketplace</h1>
            </div>
          </Link>

          <div className="hidden items-center gap-3 md:flex">
            <Link
              href="/marketplace/explore"
              className="rounded-full border border-white/20 bg-white/10 px-5 py-2 text-sm font-medium text-white backdrop-blur-md transition hover:bg-white/20"
            >
              Explore
            </Link>
            <Link
              href="/marketplace/seller/apply"
              className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-black transition hover:scale-[1.02]"
            >
              Become a Seller
            </Link>
          </div>
        </header>

        <main className="flex flex-1 items-center justify-center px-5 pb-10 pt-4 md:px-10">
          <div className="grid w-full max-w-7xl items-center gap-8 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="max-w-3xl">
              <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-medium uppercase tracking-[0.25em] text-white/85 backdrop-blur-md">
                <ShieldCheck className="h-4 w-4" />
                Verified sellers only
              </p>

              <h2 className="max-w-3xl text-4xl font-semibold leading-tight text-white md:text-6xl">
                Discover.
                <br />
                Buy.
                <br />
                Build.
              </h2>

              <p className="mt-6 max-w-2xl text-base leading-7 text-white/85 md:text-lg">
                A premium creator marketplace for products, brands, and verified
                sellers. Secure checkout, curated discovery, and controlled
                seller onboarding built for trust, scale, and brand power.
              </p>

              <div className="mt-8 max-w-3xl">
                <div className="flex flex-col gap-3 sm:flex-row">
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/70" />
                    <input
                      type="text"
                      value={marketplaceSearch}
                      onChange={(e) => setMarketplaceSearch(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault()
                          goToExploreWithSearch()
                        }
                      }}
                      placeholder="Search products, categories, or stores..."
                      className="h-14 w-full rounded-2xl border border-white/20 bg-white/12 pl-11 pr-28 text-sm text-white placeholder:text-white/55 outline-none backdrop-blur-md transition focus:border-white/35"
                    />

                    <div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-2">
                      <button
                        type="button"
                        onClick={openCameraSearch}
                        className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-white transition hover:bg-white/20"
                        aria-label="Visual search"
                        title="Visual search"
                      >
                        <Camera className="h-4 w-4" />
                      </button>

                      <button
                        type="button"
                        onClick={startVoiceSearch}
                        className={`flex h-10 w-10 items-center justify-center rounded-xl border text-white transition ${
                          isListening
                            ? "border-red-300 bg-red-500/20"
                            : "border-white/20 bg-white/10 hover:bg-white/20"
                        }`}
                        aria-label="Voice search"
                        title={voiceSupported ? "Voice search" : "Voice search not supported"}
                      >
                        <Mic className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => goToExploreWithSearch()}
                    className="h-14 rounded-2xl bg-white px-6 text-sm font-semibold text-black transition hover:scale-[1.02]"
                  >
                    Search
                  </button>
                </div>

                {(imageSearchLabel || isListening || marketplaceSearch) && (
                  <div className="mt-3 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm text-white/85 backdrop-blur-md">
                    {isListening ? (
                      <p>Listening...</p>
                    ) : imageSearchLabel ? (
                      <p>
                        Visual search ready: <span className="font-semibold">{imageSearchLabel}</span>
                      </p>
                    ) : marketplaceSearch ? (
                      <p>
                        Search ready: <span className="font-semibold">{marketplaceSearch}</span>
                      </p>
                    ) : null}
                  </div>
                )}
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <div className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm text-white/90 backdrop-blur-md">
                  Premium marketplace access
                </div>
                <div className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm text-white/90 backdrop-blur-md">
                  Protected by identity verification
                </div>
                <div className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm text-white/90 backdrop-blur-md">
                  Secure seller onboarding
                </div>
              </div>

              <div className="mt-10 grid gap-4 md:grid-cols-2">
                <div className="rounded-[2rem] border border-white/15 bg-white/10 p-6 backdrop-blur-xl">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
                    <ShoppingBag className="h-6 w-6 text-white" />
                  </div>

                  <div className="mb-3 inline-flex rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-white/70">
                    Buyer Side
                  </div>

                  <h3 className="text-xl font-semibold text-white">Explore and buy</h3>
                  <p className="mt-3 text-sm leading-6 text-white/70">
                    Browse premium products, discover verified sellers, shop by
                    category, and complete checkout in a protected marketplace flow.
                  </p>

                  <div className="mt-5 flex flex-wrap gap-2 text-xs text-white/65">
                    <span className="rounded-full border border-white/10 px-3 py-1">
                      Product discovery
                    </span>
                    <span className="rounded-full border border-white/10 px-3 py-1">
                      Cart & checkout
                    </span>
                    <span className="rounded-full border border-white/10 px-3 py-1">
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

                <div className="rounded-[2rem] border border-yellow-400/25 bg-gradient-to-br from-yellow-500/15 via-white/10 to-white/5 p-6 backdrop-blur-xl">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-yellow-400/15">
                    <Store className="h-6 w-6 text-yellow-300" />
                  </div>

                  <div className="mb-3 inline-flex rounded-full border border-yellow-300/20 bg-yellow-400/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-yellow-200">
                    Seller Side
                  </div>

                  <h3 className="text-xl font-semibold text-white">
                    Build your shop and sell
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-white/75">
                    Apply as a seller, get verified, manage products, create your
                    storefront, handle shipping, and run your business from one seller dashboard.
                  </p>

                  <div className="mt-5 grid gap-2 sm:grid-cols-2">
                    <MiniFeature icon={<BadgeCheck className="h-4 w-4" />} label="Verification" />
                    <MiniFeature icon={<Package className="h-4 w-4" />} label="Products" />
                    <MiniFeature icon={<Truck className="h-4 w-4" />} label="Shipping" />
                    <MiniFeature icon={<Wallet className="h-4 w-4" />} label="Payout flow" />
                  </div>

                  <div className="mt-6 flex flex-wrap gap-3">
                    <Link
                      href="/marketplace/seller/apply"
                      className="inline-flex items-center gap-2 rounded-2xl bg-yellow-500 px-5 py-3 text-sm font-semibold text-black transition hover:scale-[1.01]"
                    >
                      Become a Seller
                    </Link>

                    <Link
                      href="/dashboard/seller"
                      className="inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
                    >
                      Seller Dashboard
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            <div className="mx-auto w-full max-w-md">
              <div className="rounded-[2rem] border border-white/20 bg-white/10 p-6 shadow-2xl backdrop-blur-2xl md:p-8">
                <div className="mb-6">
                  <p className="text-sm uppercase tracking-[0.25em] text-white/60">
                    Marketplace Access
                  </p>
                  <h3 className="mt-2 text-3xl font-semibold text-white">
                    Welcome back
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-white/70">
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
                      className="h-12 w-full rounded-2xl border border-white/20 bg-white/10 px-4 text-white placeholder:text-white/45 outline-none backdrop-blur-md transition focus:border-white/40"
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
                      className="h-12 w-full rounded-2xl border border-white/20 bg-white/10 px-4 text-white placeholder:text-white/45 outline-none backdrop-blur-md transition focus:border-white/40"
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
                    className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-white text-sm font-semibold text-black transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? "Signing In..." : "Sign In"}
                    {!loading && <ArrowRight className="h-4 w-4" />}
                  </button>

                  <div className="relative py-2">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-white/15" />
                    </div>
                    <div className="relative flex justify-center">
                      <span className="bg-transparent px-3 text-xs uppercase tracking-[0.25em] text-white/45">
                        or
                      </span>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <Link
                      href="/marketplace/explore"
                      className="flex h-12 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-sm font-medium text-white backdrop-blur-md transition hover:bg-white/15"
                    >
                      Buyer Side
                    </Link>

                    <Link
                      href="/marketplace/seller/apply"
                      className="flex h-12 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-sm font-medium text-white backdrop-blur-md transition hover:bg-white/15"
                    >
                      Seller Side
                    </Link>
                  </div>

                  <div className="rounded-[1.5rem] border border-white/15 bg-white/5 p-4">
                    <div className="flex items-start gap-3">
                      <Lock className="mt-0.5 h-4 w-4 text-white/70" />
                      <div>
                        <p className="text-sm font-semibold text-white">
                          Controlled seller access
                        </p>
                        <p className="mt-1 text-xs leading-5 text-white/60">
                          Verified seller onboarding is required before any shop can go live.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <GlassStat
                  icon={<BadgeCheck className="h-5 w-5 text-white" />}
                  title="Verified sellers"
                  text="Identity-first onboarding for trusted selling."
                />
                <GlassStat
                  icon={<ShoppingBag className="h-5 w-5 text-white" />}
                  title="Premium discovery"
                  text="Curated products and storefront-first experience."
                />
                <GlassStat
                  icon={<Users className="h-5 w-5 text-white" />}
                  title="Platform growth"
                  text="Buyer side and seller side built for scale."
                />
              </div>

              <div className="mt-4 rounded-[1.5rem] border border-white/15 bg-white/10 p-4 backdrop-blur-xl">
                <div className="flex items-start gap-3">
                  <Sparkles className="mt-0.5 h-5 w-5 text-yellow-300" />
                  <div>
                    <p className="text-sm font-semibold text-white">
                      Seller side now visible
                    </p>
                    <p className="mt-1 text-xs leading-5 text-white/65">
                      Buyers explore products. Sellers apply, verify, manage shop,
                      products, shipping, and marketplace operations.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

function MiniFeature({
  icon,
  label,
}: {
  icon: React.ReactNode
  label: string
}) {
  return (
    <div className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/75">
      {icon}
      <span>{label}</span>
    </div>
  )
}

function GlassStat({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode
  title: string
  text: string
}) {
  return (
    <div className="rounded-3xl border border-white/15 bg-white/10 p-4 backdrop-blur-xl">
      <div className="mb-3">{icon}</div>
      <h4 className="text-sm font-semibold text-white">{title}</h4>
      <p className="mt-1 text-xs leading-5 text-white/65">{text}</p>
    </div>
  )
}