"use client"

import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Eye, EyeOff, ArrowRight, Sparkles, Shield, Zap } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

export default function Login() {
  const router = useRouter()
  const supabase = createClient()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  async function handleLogin() {
    try {
      setLoading(true)
      setErrorMessage("")

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setErrorMessage(error.message)
        return
      }

      router.push("/dashboard")
    } catch {
      setErrorMessage("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-white">
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 h-full w-full object-cover"
      >
        <source src="/videos/login-hero.mp4" type="video/mp4" />
      </video>

      <div className="absolute inset-0 bg-black/60" />
      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/55 to-black/70" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/25" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(250,204,21,0.16),transparent_30%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(250,204,21,0.10),transparent_25%)]" />

      <div className="relative z-10 grid min-h-screen grid-cols-1 items-center gap-10 px-6 py-10 lg:grid-cols-[1.1fr_0.9fr] lg:px-12 xl:px-16">
        <div className="max-w-3xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-yellow-500/20 bg-yellow-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.24em] text-yellow-300 backdrop-blur-sm">
            <Sparkles className="h-3.5 w-3.5" />
            CreatorGoat OS
          </div>

          <h1 className="text-5xl font-bold leading-[0.95] tracking-tight text-yellow-400 sm:text-6xl xl:text-7xl">
            Enter your
            <br />
            creator empire
          </h1>

          <p className="mt-5 max-w-2xl text-lg leading-8 text-zinc-200 sm:text-xl">
            Log in to access your AI tools, marketplace, leads, messages,
            creator workflows, and premium business system built to help you
            create, sell, and scale.
          </p>

          <div className="mt-8 flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full border border-yellow-400/20 bg-black/30 backdrop-blur-md">
              <Image
                src="/videos/CreatorGoat_logo_1024%20(1).png"
                width={34}
                height={34}
                alt="CreatorGoat logo"
                className="object-contain"
              />
            </div>

            <div>
              <p className="text-sm uppercase tracking-[0.22em] text-yellow-300/70">
                Premium Access
              </p>
              <p className="mt-1 text-sm text-zinc-300">
                AI tools, marketplace, CRM, analytics, and creator workflows.
              </p>
            </div>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-yellow-500/10 text-yellow-300">
                <Zap className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-semibold text-white">AI Power</h3>
              <p className="mt-2 text-sm leading-6 text-zinc-400">
                Hooks, captions, scripts, replies, and smart creator tools.
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-yellow-500/10 text-yellow-300">
                <Shield className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-semibold text-white">Secure System</h3>
              <p className="mt-2 text-sm leading-6 text-zinc-400">
                Safe login, premium access, and protected creator dashboard.
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-yellow-500/10 text-yellow-300">
                <ArrowRight className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-semibold text-white">Scale Faster</h3>
              <p className="mt-2 text-sm leading-6 text-zinc-400">
                One operating system to build, sell, manage, and grow.
              </p>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <div className="rounded-full border border-yellow-500/20 bg-black/30 px-4 py-2 text-xs uppercase tracking-[0.18em] text-yellow-300/80 backdrop-blur-md">
              AI Viral Tools
            </div>
            <div className="rounded-full border border-yellow-500/20 bg-black/30 px-4 py-2 text-xs uppercase tracking-[0.18em] text-yellow-300/80 backdrop-blur-md">
              Creator Marketplace
            </div>
            <div className="rounded-full border border-yellow-500/20 bg-black/30 px-4 py-2 text-xs uppercase tracking-[0.18em] text-yellow-300/80 backdrop-blur-md">
              Leads CRM
            </div>
            <div className="rounded-full border border-yellow-500/20 bg-black/30 px-4 py-2 text-xs uppercase tracking-[0.18em] text-yellow-300/80 backdrop-blur-md">
              Premium Analytics
            </div>
          </div>
        </div>

        <div className="mx-auto w-full max-w-md rounded-[32px] border border-yellow-500/20 bg-black/45 p-8 shadow-[0_0_60px_rgba(250,204,21,0.08)] backdrop-blur-xl">
          <div className="mb-6 flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-yellow-500/20 bg-yellow-500/10">
              <Image
                src="/videos/CreatorGoat_logo_1024%20(1).png"
                width={40}
                height={40}
                alt="CreatorGoat logo"
                className="object-contain"
              />
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-yellow-300/70">
                CreatorGoat Login
              </p>
              <h2 className="mt-1 text-2xl font-bold text-yellow-400">
                Sign in
              </h2>
            </div>
          </div>

          <div className="mb-6 rounded-2xl border border-yellow-500/15 bg-yellow-500/5 p-4 text-sm text-zinc-300">
            Secure access to your AI creator tools, marketplace system, and
            business dashboard.
          </div>

          <div className="space-y-5">
            <div>
              <label className="mb-2 block text-sm text-zinc-400">Email</label>
              <input
                className="w-full rounded-2xl border border-zinc-700 bg-black/70 px-4 py-3 text-white outline-none transition placeholder:text-zinc-500 focus:border-yellow-400"
                placeholder="Enter your email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="block text-sm text-zinc-400">Password</label>
                <Link
                  href="/forgot-password"
                  className="text-sm text-yellow-300 transition hover:text-yellow-200"
                >
                  Forgot password?
                </Link>
              </div>

              <div className="relative">
                <input
                  className="w-full rounded-2xl border border-zinc-700 bg-black/70 px-4 py-3 pr-12 text-white outline-none transition placeholder:text-zinc-500 focus:border-yellow-400"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleLogin()
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 transition hover:text-yellow-300"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {errorMessage ? (
              <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {errorMessage}
              </div>
            ) : null}

            <button
              className="w-full rounded-2xl bg-yellow-400 px-5 py-3 font-semibold text-black transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              onClick={handleLogin}
              disabled={loading || !email.trim() || !password.trim()}
            >
              {loading ? "Logging in..." : "Sign In"}
            </button>

            <div className="grid grid-cols-2 gap-3">
              <Link
                href="/signup"
                className="flex items-center justify-center rounded-2xl border border-yellow-500/20 bg-yellow-500/10 px-4 py-3 text-sm font-medium text-yellow-300 transition hover:bg-yellow-500/15"
              >
                Create account
              </Link>

              <Link
                href="/"
                className="flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/10"
              >
                Back home
              </Link>
            </div>

            <div className="pt-2 text-center text-sm text-zinc-400">
              New here?{" "}
              <Link
                href="/signup"
                className="font-medium text-yellow-300 transition hover:text-yellow-200"
              >
                Sign up and start building
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}