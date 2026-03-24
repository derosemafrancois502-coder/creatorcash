// components/dashboard/MobileSidebarDrawer.tsx
"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { Menu, X } from "lucide-react"

type NavItem = {
  name: string
  href: string
  requiresFounder?: boolean
  alwaysFree?: boolean
  blockedWhenFree?: boolean
}

type ProfileRow = {
  plan?: string | null
  trial_expires_at?: string | null
  subscription_expires_at?: string | null
}

type MobileSidebarDrawerProps = {
  navItems: NavItem[]
  profile: ProfileRow | null
  userEmail?: string | null
  renderSidebarContent: (args: {
    navItems: NavItem[]
    profile: ProfileRow | null
    userEmail?: string | null
    mobile?: boolean
    onNavigate?: () => void
  }) => React.ReactNode
}

export default function MobileSidebarDrawer({
  navItems,
  profile,
  userEmail,
  renderSidebarContent,
}: MobileSidebarDrawerProps) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex h-11 w-11 items-center justify-center rounded-xl border border-yellow-500/20 bg-zinc-950 text-yellow-400"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            aria-label="Close menu overlay"
          />

          <div className="absolute left-0 top-0 h-full w-[88vw] max-w-sm border-r border-yellow-500/20 bg-black p-4 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-lg font-bold tracking-tight text-yellow-400">
                  CreatorGoat
                </p>
                <p className="text-[11px] uppercase tracking-[0.2em] text-yellow-500/60">
                  Creator OS
                </p>
              </div>

              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-yellow-500/20 bg-zinc-950 text-yellow-400"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {renderSidebarContent({
              navItems,
              profile,
              userEmail,
              mobile: true,
              onNavigate: () => setOpen(false),
            })}
          </div>
        </div>
      ) : null}
    </>
  )
}