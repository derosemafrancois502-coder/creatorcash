"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { Menu, X } from "lucide-react"

type MobileSidebarDrawerProps = {
  children: React.ReactNode
}

export default function MobileSidebarDrawer({
  children,
}: MobileSidebarDrawerProps) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }

    return () => {
      document.body.style.overflow = ""
    }
  }, [open])

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-yellow-500/20 bg-zinc-950 text-yellow-400"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {open ? (
        <div className="fixed inset-0 z-[100] lg:hidden">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-black/75 backdrop-blur-sm"
            aria-label="Close menu overlay"
          />

          <div className="absolute left-0 top-0 h-full w-[92vw] max-w-sm border-r border-yellow-500/20 bg-black shadow-2xl">
            <div className="flex h-full flex-col">
              <div className="flex items-center justify-between border-b border-yellow-500/20 px-4 py-4">
                <div className="min-w-0">
                  <p className="truncate text-lg font-bold tracking-tight text-yellow-400">
                    CreatorGoat
                  </p>
                  <p className="text-[11px] uppercase tracking-[0.2em] text-yellow-500/60">
                    Creator OS
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="ml-3 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-yellow-500/20 bg-zinc-950 text-yellow-400"
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
                {children}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}