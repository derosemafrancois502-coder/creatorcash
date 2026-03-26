"use client"

import { useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { Menu, X } from "lucide-react"

type NavItem = {
  name: string
  href: string
}

export default function MobileSidebarDrawer({
  navItems,
}: {
  navItems: NavItem[]
}) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : ""
    return () => {
      document.body.style.overflow = ""
    }
  }, [open])

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex h-11 w-11 items-center justify-center rounded-xl border border-yellow-500/20 bg-zinc-950 text-yellow-400 shadow-[0_0_20px_rgba(250,204,21,0.08)]"
      >
        <Menu className="h-5 w-5" />
      </button>

      {open && (
        <div className="fixed inset-0 z-[999] lg:hidden">
          <div
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-black/75 backdrop-blur-sm"
          />

          <div className="absolute left-0 top-0 h-full w-[82%] max-w-[340px] overflow-y-auto border-r border-yellow-500/20 bg-black p-5 text-white shadow-2xl">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h1 className="text-lg font-bold text-yellow-400">
                  CreatorGoat
                </h1>
                <p className="mt-1 text-xs uppercase tracking-[0.18em] text-yellow-300/60">
                  Creator OS
                </p>
              </div>

              <button
                onClick={() => setOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-yellow-500/20 bg-zinc-950 text-yellow-400"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex flex-col gap-2">
              {navItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => {
                    router.push(item.href)
                    setOpen(false)
                  }}
                  className="rounded-2xl border border-yellow-500/10 bg-zinc-950/80 px-4 py-3 text-left text-sm font-medium text-yellow-300 transition hover:border-yellow-400/30 hover:bg-yellow-400 hover:text-black"
                >
                  {item.name}
                </button>
              ))}
            </div>

            <div className="mt-8 rounded-2xl border border-yellow-500/15 bg-zinc-950 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">
                Quick Access
              </p>
              <button
                onClick={() => {
                  router.push("/dashboard/billing")
                  setOpen(false)
                }}
                className="mt-4 w-full rounded-xl bg-yellow-400 py-3 text-sm font-semibold text-black transition hover:opacity-90"
              >
                Upgrade Plan 🚀
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}