// app/forgot-username/page.tsx
"use client"

import Link from "next/link"
import Image from "next/image"
import { useState } from "react"
import { Mail, Sparkles, ArrowLeft } from "lucide-react"

export default function ForgotUsernamePage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [successMessage, setSuccessMessage] = useState("")

  async function handleRecoverUsername() {
    try {
      setLoading(true)
      setErrorMessage("")
      setSuccessMessage("")

      const response = await fetch("/api/auth/recover-username", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        setErrorMessage(data?.error || "Unable to process request.")
        return
      }

      setSuccessMessage(
        "If an account exists for this email, username recovery instructions have been sent."
      )
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

      <div className="absolute inset-0 bg-black/70" />
      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-black/80" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/25" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(250,204,21,0.16),transparent_30%)]" />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-6 py-10">
        <div className="w-full max-w-lg rounded-[32px] border border-yellow-500/20 bg-black/45 p-8 shadow-[0_0_60px_rgba(250,204,21,0.08)] backdrop-blur-xl">
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
              <p className="flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-yellow-300/70">
                <Sparkles className="h-3.5 w-3.5" />
                Account Recovery
              </p>
              <h1 className="mt-1 text-2xl font-bold text-yellow-400">
                Forgot username
              </h1>
            </div>
          </div>

          <div className="mb-6 rounded-2xl border border-yellow-500/15 bg-yellow-500/5 p-4 text-sm leading-6 text-zinc-300">
            Enter the email linked to your account. If it exists, we will send
            your username recovery instructions.
          </div>

          <div className="space-y-5">
            <div>
              <label className="mb-2 block text-sm text-zinc-400">Email</label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-500" />
                <input
                  className="w-full rounded-2xl border border-zinc-700 bg-black/70 px-12 py-3 text-white outline-none transition placeholder:text-zinc-500 focus:border-yellow-400"
                  placeholder="Enter your email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleRecoverUsername()
                  }}
                />
              </div>
            </div>

            {errorMessage ? (
              <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {errorMessage}
              </div>
            ) : null}

            {successMessage ? (
              <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
                {successMessage}
              </div>
            ) : null}

            <button
              className="w-full rounded-2xl bg-yellow-400 px-5 py-3 font-semibold text-black transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              onClick={handleRecoverUsername}
              disabled={loading || !email.trim()}
            >
              {loading ? "Checking account..." : "Recover username"}
            </button>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Link
                href="/login"
                className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/10"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to login
              </Link>

              <Link
                href="/forgot-password"
                className="flex items-center justify-center rounded-2xl border border-yellow-500/20 bg-yellow-500/10 px-4 py-3 text-sm font-medium text-yellow-300 transition hover:bg-yellow-500/15"
              >
                Forgot password?
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}