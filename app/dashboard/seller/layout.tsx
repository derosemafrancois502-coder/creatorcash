"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

export default function SellerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    async function checkAccess() {
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser()

        if (userError || !user) {
          router.replace("/marketplace")
          return
        }

        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .maybeSingle()

        if (profileError) {
          console.error("Seller layout profile error:", profileError)
          router.replace("/marketplace")
          return
        }

        if (!profile || (profile.role !== "seller" && profile.role !== "admin")) {
          router.replace("/marketplace")
          return
        }

        if (isMounted) {
          setLoading(false)
        }
      } catch (error) {
        console.error("Seller layout access error:", error)
        router.replace("/marketplace")
      }
    }

    void checkAccess()

    return () => {
      isMounted = false
    }
  }, [router, supabase])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-white">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-pulse rounded-full bg-white/10" />
          <p className="text-sm text-white/80">Checking seller access...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}