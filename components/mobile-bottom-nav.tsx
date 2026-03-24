"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

const items = [
  { label: "Market", href: "/marketplace" },
  { label: "Discover", href: "/discover" },
  { label: "Saved", href: "/saved" },
  { label: "Cart", href: "/cart" },
]

export default function MobileBottomNav() {
  const pathname = usePathname()

  return (
    <div className="fixed bottom-4 left-1/2 z-50 w-[94%] max-w-md -translate-x-1/2 rounded-2xl border border-yellow-500/20 bg-zinc-950/95 p-2 shadow-2xl backdrop-blur md:hidden">
      <div className="grid grid-cols-4 gap-2">
        {items.map((item) => {
          const active = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-xl px-3 py-3 text-center text-xs font-medium transition ${
                active
                  ? "bg-yellow-500 text-black"
                  : "text-zinc-300 hover:bg-zinc-900"
              }`}
            >
              {item.label}
            </Link>
          )
        })}
      </div>
    </div>
  )
}