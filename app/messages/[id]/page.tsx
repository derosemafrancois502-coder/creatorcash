"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

export default function ChatPage() {
  const { id } = useParams()
  const supabase = createClient()

  const [messages, setMessages] = useState<any[]>([])
  const [text, setText] = useState("")

  useEffect(() => {
    loadMessages()
  }, [id])

  async function loadMessages() {
    const { data } = await supabase
      .from("conversation_messages")
      .select("*")
      .eq("conversation_id", id)
      .order("created_at", { ascending: true })

    setMessages(data || [])
  }

  async function sendMessage() {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!text.trim()) return

    await supabase.from("conversation_messages").insert({
      conversation_id: id,
      sender_id: user?.id,
      message: text,
    })

    setText("")
    loadMessages()
  }

  return (
    <div className="p-6 text-white">
      <div className="space-y-2">
        {messages.map((m) => (
          <div key={m.id} className="bg-zinc-800 p-2 rounded">
            {m.message}
          </div>
        ))}
      </div>

      <div className="mt-4 flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="flex-1 bg-black border p-2"
        />
        <button onClick={sendMessage} className="bg-yellow-500 px-4">
          Send
        </button>
      </div>
    </div>
  )
}