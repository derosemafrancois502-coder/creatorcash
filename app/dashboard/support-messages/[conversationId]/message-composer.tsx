"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Send } from "lucide-react"

type Props = {
  conversationId: string
}

export default function MessageComposer({ conversationId }: Props) {
  const router = useRouter()
  const supabase = createClient()

  const [body, setBody] = useState("")
  const [sending, setSending] = useState(false)

  async function handleSend(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    const trimmed = body.trim()
    if (!trimmed) return

    try {
      setSending(true)

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/login?next=/dashboard/support-messages")
        return
      }

      const { error } = await supabase
        .from("marketplace_messages")
        .insert({
          conversation_id: conversationId,
          sender_user_id: user.id,
          body: trimmed,
        })

      if (error) {
        alert(error.message)
        return
      }

      setBody("")
      router.refresh()
    } catch (error) {
      console.error(error)
      alert("Could not send message.")
    } finally {
      setSending(false)
    }
  }

  return (
    <form
      onSubmit={handleSend}
      className="rounded-3xl border border-white/10 bg-white/5 p-4"
    >
      <label className="mb-3 block text-sm font-medium text-white/70">
        Write a message
      </label>

      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={4}
        placeholder="Ask the seller about this product..."
        className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none placeholder:text-white/30"
      />

      <div className="mt-4 flex justify-end">
        <button
          type="submit"
          disabled={sending}
          className="inline-flex h-11 items-center gap-2 rounded-2xl bg-white px-5 text-sm font-semibold text-black transition hover:scale-[1.01] disabled:opacity-60"
        >
          <Send className="h-4 w-4" />
          {sending ? "Sending..." : "Send Message"}
        </button>
      </div>
    </form>
  )
}