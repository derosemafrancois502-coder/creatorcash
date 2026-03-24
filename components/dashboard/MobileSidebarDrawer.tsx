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
        className="flex h-11 w-11 items-center justify-center rounded-xl border border-yellow-500/20 bg-zinc-950 text-yellow-400"
      >
        <Menu />
      </button>

      {open && (
        <div className="fixed inset-0 z-[999] lg:hidden">
          <div
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-black/70"
          />

          <div className="absolute left-0 top-0 h-full w-[85vw] max-w-sm bg-white text-black p-4 overflow-y-auto">
            
            <div className="flex justify-between items-center mb-6">
              <h1 className="font-bold text-lg">CreatorGoat</h1>
              <button onClick={() => setOpen(false)}>
                <X />
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
                  className="text-left px-4 py-3 rounded-xl hover:bg-zinc-100"
                >
                  {item.name}
                </button>
              ))}
            </div>

          </div>
        </div>
      )}
    </>
  )
}