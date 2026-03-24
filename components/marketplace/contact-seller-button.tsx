"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { MessageSquare } from "lucide-react"

type Props = {
  productId: number
}

export default function ContactSellerButton({ productId }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleContactSeller() {
    try {
      setLoading(true)

      const res = await fetch("/api/marketplace/contact-seller", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId,
        }),
      })

      const data = await res.json()

      if (res.status === 401) {
        router.push("/login?next=/dashboard/support-messages")
        return
      }

      if (!res.ok) {
        alert(data?.error || "Could not open seller conversation.")
        return
      }

      router.push(`/dashboard/support-messages/${data.conversationId}`)
    } catch (error) {
      console.error(error)
      alert("Could not contact seller.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleContactSeller}
      disabled={loading}
      className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white px-5 text-sm font-semibold text-black transition hover:scale-[1.01] disabled:opacity-60 md:w-auto"
    >
      <MessageSquare className="h-4 w-4" />
      {loading ? "Opening..." : "Contact the Seller"}
    </button>
  )
}