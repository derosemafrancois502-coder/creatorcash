"use client"

import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Eye, EyeOff, ArrowRight } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

export default function Signup() {
  const router = useRouter()
  const supabase = createClient()

  const [fullName, setFullName] = useState("")
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  async function handleSignup() {
    try {
      setLoading(true)
      setErrorMessage("")

      if (password !== confirmPassword) {
        setErrorMessage("Passwords do not match")
        return
      }

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            username: username,
          },
        },
      })

      if (error) {
        setErrorMessage(error.message)
        return
      }

      router.push("/login")
    } catch {
      setErrorMessage("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-white">

      {/* VIDEO */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 h-full w-full object-cover brightness-105 contrast-105 saturate-110"
      >
        <source src="/videos/login-hero.mp4" type="video/mp4" />
      </video>

      {/* SAME OVERLAY AS LOGIN */}
      <div className="absolute inset-0 bg-black/50" />
      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/55 to-black/70" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-6">

        <div className="w-full max-w-md rounded-[32px] border border-yellow-500/20 bg-black/45 p-8 backdrop-blur-xl shadow-[0_0_60px_rgba(250,204,21,0.08)]">

          {/* HEADER */}
          <div className="mb-6 flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-yellow-500/20 bg-yellow-500/10">
              <Image
                src="/videos/CreatorGoat_logo_1024%20(1).png"
                width={36}
                height={36}
                alt="logo"
              />
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-yellow-300/70">
                CreatorGoat
              </p>
              <h2 className="text-2xl font-bold text-yellow-400">
                Create account
              </h2>
            </div>
          </div>

          <div className="space-y-4">

            <input
              placeholder="Full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full rounded-xl border border-zinc-700 bg-black/70 px-4 py-3 text-white focus:border-yellow-400 outline-none"
            />

            <input
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-xl border border-zinc-700 bg-black/70 px-4 py-3 text-white focus:border-yellow-400 outline-none"
            />

            <input
              placeholder="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-zinc-700 bg-black/70 px-4 py-3 text-white focus:border-yellow-400 outline-none"
            />

            <div className="relative">
              <input
                placeholder="Password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-zinc-700 bg-black/70 px-4 py-3 pr-12 text-white focus:border-yellow-400 outline-none"
              />
              <button
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <div className="relative">
              <input
                placeholder="Confirm password"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-xl border border-zinc-700 bg-black/70 px-4 py-3 pr-12 text-white focus:border-yellow-400 outline-none"
              />
              <button
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400"
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {errorMessage && (
              <div className="text-red-400 text-sm">{errorMessage}</div>
            )}

            <button
              onClick={handleSignup}
              disabled={loading}
              className="w-full rounded-xl bg-yellow-400 py-3 font-semibold text-black hover:opacity-90"
            >
              {loading ? "Creating..." : "Create Account"}
            </button>

            <div className="text-center text-sm text-zinc-400">
              Already have an account?{" "}
              <Link href="/login" className="text-yellow-300 inline-flex items-center gap-1">
                Sign in <ArrowRight size={14} />
              </Link>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}