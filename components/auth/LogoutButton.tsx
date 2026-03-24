"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { LogOut } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

export default function LogoutButton() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)

  async function handleLogout() {
    try {
      setLoading(true)
      await supabase.auth.signOut()
      router.push("/login")
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className="inline-flex items-center gap-2 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-300 transition hover:bg-red-500/15 disabled:opacity-50"
    >
      <LogOut className="h-4 w-4" />
      {loading ? "Logging out..." : "Logout"}
    </button>
  )
}