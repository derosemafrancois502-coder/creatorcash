"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import {
  ArrowLeft,
  LifeBuoy,
  MessageSquare,
  Paperclip,
  Send,
  ShieldAlert,
} from "lucide-react"

type Ticket = {
  id: string
  user_id: string
  subject: string
  message: string
  status: string
  priority: string
  category: string
  application_status_snapshot: string | null
  attachment_url: string | null
  created_at: string
  updated_at: string
}

type TicketMessage = {
  id: string
  ticket_id: string
  sender_role: string
  sender_user_id: string | null
  message: string
  attachment_url: string | null
  created_at: string
}

type Verification = {
  application_status: string | null
  identity_status: string | null
}

export default function SellerSupportPage() {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [replying, setReplying] = useState(false)

  const [userId, setUserId] = useState<string | null>(null)
  const [verification, setVerification] = useState<Verification | null>(null)

  const [tickets, setTickets] = useState<Ticket[]>([])
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null)
  const [messages, setMessages] = useState<TicketMessage[]>([])

  const [subject, setSubject] = useState("")
  const [category, setCategory] = useState("general")
  const [priority, setPriority] = useState("normal")
  const [message, setMessage] = useState("")
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null)

  const [replyMessage, setReplyMessage] = useState("")
  const [replyAttachment, setReplyAttachment] = useState<File | null>(null)

  useEffect(() => {
    async function init() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        const currentUser = session?.user || null

        if (!currentUser) {
          router.push("/marketplace")
          return
        }

        setUserId(currentUser.id)

        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", currentUser.id)
          .maybeSingle()

        if (profileError) {
          console.error(
            "Load support profile error:",
            profileError.message,
            profileError.details,
            profileError.hint
          )
          router.push("/marketplace")
          return
        }

        if (!profile || (profile.role !== "seller" && profile.role !== "admin")) {
          router.push("/marketplace")
          return
        }

        const { data: verificationData, error: verificationError } = await supabase
          .from("seller_verification")
          .select("application_status, identity_status")
          .eq("user_id", currentUser.id)
          .maybeSingle()

        if (verificationError) {
          console.error(
            "Load seller verification error:",
            verificationError.message,
            verificationError.details,
            verificationError.hint
          )
        } else if (verificationData) {
          setVerification(verificationData)
        }

        await loadTickets(currentUser.id)
      } catch (error) {
        console.error("Support init error:", error)
      } finally {
        setLoading(false)
      }
    }

    void init()
  }, [router, supabase])

  async function loadTickets(currentUserId: string) {
    const { data, error } = await supabase
      .from("seller_support_tickets")
      .select("*")
      .eq("user_id", currentUserId)
      .order("updated_at", { ascending: false })

    if (error) {
      console.error(
        "Load tickets error:",
        error.message,
        error.details,
        error.hint
      )
      alert(`Failed to load tickets. ${error.message}`)
      return
    }

    const nextTickets = (data ?? []) as Ticket[]
    setTickets(nextTickets)

    if (nextTickets.length === 0) {
      setSelectedTicketId(null)
      setMessages([])
      return
    }

    const nextSelectedId =
      selectedTicketId && nextTickets.some((ticket) => ticket.id === selectedTicketId)
        ? selectedTicketId
        : nextTickets[0].id

    setSelectedTicketId(nextSelectedId)
    await loadMessages(nextSelectedId)
  }

  async function loadMessages(ticketId: string) {
    const { data, error } = await supabase
      .from("seller_support_messages")
      .select("*")
      .eq("ticket_id", ticketId)
      .order("created_at", { ascending: true })

    if (error) {
      console.error(
        "Load ticket messages error:",
        error.message,
        error.details,
        error.hint
      )
      alert(`Failed to load ticket messages. ${error.message}`)
      return
    }

    setMessages((data ?? []) as TicketMessage[])
  }

  function safeFileName(name: string) {
    return name.replace(/[^a-zA-Z0-9._-]/g, "_")
  }

  async function uploadSupportFile(file: File, currentUserId: string) {
    const fileName = `${Date.now()}-${safeFileName(file.name)}`
    const path = `${currentUserId}/${fileName}`

    const { error } = await supabase.storage
      .from("support")
      .upload(path, file, { upsert: true })

    if (error) throw error

    const { data } = supabase.storage.from("support").getPublicUrl(path)
    return data.publicUrl
  }

  async function createTicket() {
    if (!userId) return

    if (!subject.trim() || !message.trim()) {
      alert("Please enter a subject and message.")
      return
    }

    try {
      setSubmitting(true)

      let attachmentUrl: string | null = null

      if (attachmentFile) {
        attachmentUrl = await uploadSupportFile(attachmentFile, userId)
      }

      const { data: ticketData, error: ticketError } = await supabase
        .from("seller_support_tickets")
        .insert({
          user_id: userId,
          subject: subject.trim(),
          message: message.trim(),
          status: "open",
          priority,
          category,
          application_status_snapshot: verification?.application_status || null,
          attachment_url: attachmentUrl,
        })
        .select()
        .single()

      if (ticketError) {
        console.error(
          "Create ticket error:",
          ticketError.message,
          ticketError.details,
          ticketError.hint
        )
        alert(ticketError.message)
        return
      }

      const { error: messageError } = await supabase
        .from("seller_support_messages")
        .insert({
          ticket_id: ticketData.id,
          sender_role: "seller",
          sender_user_id: userId,
          message: message.trim(),
          attachment_url: attachmentUrl,
        })

      if (messageError) {
        console.error(
          "Create ticket first message error:",
          messageError.message,
          messageError.details,
          messageError.hint
        )
        alert(messageError.message)
        return
      }

      setSubject("")
      setCategory("general")
      setPriority("normal")
      setMessage("")
      setAttachmentFile(null)

      await loadTickets(userId)
      setSelectedTicketId(ticketData.id)
      await loadMessages(ticketData.id)

      alert("Support ticket created.")
    } catch (error) {
      console.error("Create support ticket error:", error)
      alert("Could not create support ticket.")
    } finally {
      setSubmitting(false)
    }
  }

  async function sendReply() {
    if (!userId || !selectedTicketId) return

    if (!replyMessage.trim()) {
      alert("Please enter a message.")
      return
    }

    try {
      setReplying(true)

      let attachmentUrl: string | null = null

      if (replyAttachment) {
        attachmentUrl = await uploadSupportFile(replyAttachment, userId)
      }

      const { error } = await supabase
        .from("seller_support_messages")
        .insert({
          ticket_id: selectedTicketId,
          sender_role: "seller",
          sender_user_id: userId,
          message: replyMessage.trim(),
          attachment_url: attachmentUrl,
        })

      if (error) {
        console.error(
          "Send reply error:",
          error.message,
          error.details,
          error.hint
        )
        alert(error.message)
        return
      }

      const { error: updateTicketError } = await supabase
        .from("seller_support_tickets")
        .update({
          status: "in_review",
        })
        .eq("id", selectedTicketId)
        .eq("user_id", userId)

      if (updateTicketError) {
        console.error(
          "Update ticket after reply error:",
          updateTicketError.message,
          updateTicketError.details,
          updateTicketError.hint
        )
      }

      setReplyMessage("")
      setReplyAttachment(null)

      await loadTickets(userId)
      await loadMessages(selectedTicketId)
    } catch (error) {
      console.error("Reply support ticket error:", error)
      alert("Could not send reply.")
    } finally {
      setReplying(false)
    }
  }

  const selectedTicket =
    tickets.find((ticket) => ticket.id === selectedTicketId) || null

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white px-6">
        <div className="rounded-[2rem] border border-zinc-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 h-12 w-12 animate-pulse rounded-full bg-zinc-200" />
          <h2 className="text-lg font-semibold text-zinc-900">
            Loading support center...
          </h2>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white text-zinc-900">
      <div className="border-b border-zinc-200 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-8">
          <Link
            href="/marketplace/seller/pending"
            className="inline-flex items-center gap-2 text-sm font-medium text-zinc-700 transition hover:text-zinc-950"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Seller Status
          </Link>

          <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 px-4 py-2 text-sm text-zinc-700">
            <LifeBuoy className="h-4 w-4" />
            CreatorGoat Review Team
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-5 py-8 md:px-8">
        <div className="mb-8 grid gap-4 md:grid-cols-3">
          <StatusCard
            title="Application"
            value={verification?.application_status || "pending"}
          />
          <StatusCard
            title="Identity"
            value={verification?.identity_status || "pending"}
          />
          <StatusCard
            title="Support Tickets"
            value={String(tickets.length)}
          />
        </div>

        <div className="grid gap-8 lg:grid-cols-[380px_minmax(0,1fr)]">
          <div className="space-y-6">
            <div className="rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-zinc-100">
                  <ShieldAlert className="h-5 w-5 text-zinc-900" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-zinc-950">
                    Contact CreatorGoat Team
                  </h2>
                  <p className="text-sm text-zinc-600">
                    Open a support or appeal ticket.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <Input
                  label="Subject"
                  value={subject}
                  onChange={setSubject}
                  placeholder="Appeal rejection / Verification issue / Upload help"
                />

                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-800">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="h-12 w-full rounded-2xl border border-zinc-200 bg-white px-4 text-sm text-zinc-900 outline-none transition focus:border-zinc-400"
                  >
                    <option value="general">General</option>
                    <option value="appeal">Appeal</option>
                    <option value="verification">Verification</option>
                    <option value="payout">Payout</option>
                    <option value="documents">Documents</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-800">
                    Priority
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="h-12 w-full rounded-2xl border border-zinc-200 bg-white px-4 text-sm text-zinc-900 outline-none transition focus:border-zinc-400"
                  >
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-800">
                    Message
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={5}
                    placeholder="Explain your issue or appeal clearly..."
                    className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-zinc-400"
                  />
                </div>

                <label className="flex h-12 cursor-pointer items-center justify-center gap-2 rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 px-4 text-sm font-medium text-zinc-800 transition hover:bg-zinc-100">
                  <Paperclip className="h-4 w-4" />
                  {attachmentFile ? attachmentFile.name : "Attach file"}
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    className="hidden"
                    onChange={(e) => setAttachmentFile(e.target.files?.[0] || null)}
                  />
                </label>

                <button
                  onClick={createTicket}
                  disabled={submitting}
                  className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-zinc-900 text-sm font-semibold text-white transition hover:scale-[1.01] disabled:opacity-60"
                >
                  <Send className="h-4 w-4" />
                  {submitting ? "Sending..." : "Open Ticket"}
                </button>
              </div>
            </div>

            <div className="rounded-[2rem] border border-zinc-200 bg-zinc-50 p-5">
              <h3 className="text-sm font-semibold text-zinc-900">
                Your Tickets
              </h3>

              <div className="mt-4 space-y-3">
                {tickets.length === 0 ? (
                  <p className="text-sm text-zinc-500">No tickets yet.</p>
                ) : (
                  tickets.map((ticket) => (
                    <button
                      key={ticket.id}
                      onClick={async () => {
                        setSelectedTicketId(ticket.id)
                        await loadMessages(ticket.id)
                      }}
                      className={`w-full rounded-2xl border p-4 text-left transition ${
                        selectedTicketId === ticket.id
                          ? "border-zinc-900 bg-white"
                          : "border-zinc-200 bg-white hover:bg-zinc-50"
                      }`}
                    >
                      <p className="text-sm font-semibold text-zinc-900">
                        {ticket.subject}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2 text-xs text-zinc-500">
                        <span>{ticket.category}</span>
                        <span>•</span>
                        <span>{ticket.status}</span>
                        <span>•</span>
                        <span>{new Date(ticket.created_at).toLocaleDateString()}</span>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-sm">
            {!selectedTicket ? (
              <div className="flex h-full min-h-[420px] items-center justify-center text-center">
                <div>
                  <MessageSquare className="mx-auto h-10 w-10 text-zinc-300" />
                  <h3 className="mt-4 text-lg font-semibold text-zinc-900">
                    No ticket selected
                  </h3>
                  <p className="mt-2 text-sm text-zinc-500">
                    Open a ticket or select one from the left.
                  </p>
                </div>
              </div>
            ) : (
              <div>
                <div className="mb-6 border-b border-zinc-200 pb-4">
                  <h2 className="text-2xl font-semibold text-zinc-950">
                    {selectedTicket.subject}
                  </h2>
                  <div className="mt-2 flex flex-wrap gap-3 text-sm text-zinc-500">
                    <span>Status: {selectedTicket.status}</span>
                    <span>Category: {selectedTicket.category}</span>
                    <span>Priority: {selectedTicket.priority}</span>
                  </div>
                </div>

                <div className="space-y-4">
                  {messages.map((item) => (
                    <div
                      key={item.id}
                      className={`rounded-2xl p-4 ${
                        item.sender_role === "admin"
                          ? "bg-zinc-100"
                          : "bg-zinc-900 text-white"
                      }`}
                    >
                      <div className="mb-2 flex items-center justify-between text-xs">
                        <span className="font-semibold uppercase">
                          {item.sender_role === "admin"
                            ? "CreatorGoat Team"
                            : "Seller"}
                        </span>
                        <span
                          className={
                            item.sender_role === "admin"
                              ? "text-zinc-500"
                              : "text-white/70"
                          }
                        >
                          {new Date(item.created_at).toLocaleString()}
                        </span>
                      </div>

                      <p className="text-sm leading-6">{item.message}</p>

                      {item.attachment_url ? (
                        <a
                          href={item.attachment_url}
                          target="_blank"
                          rel="noreferrer"
                          className={`mt-3 inline-flex text-sm underline ${
                            item.sender_role === "admin"
                              ? "text-zinc-700"
                              : "text-white"
                          }`}
                        >
                          View attachment
                        </a>
                      ) : null}
                    </div>
                  ))}
                </div>

                <div className="mt-6 border-t border-zinc-200 pt-6">
                  <h3 className="mb-3 text-sm font-semibold text-zinc-900">
                    Reply to Team
                  </h3>

                  <textarea
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    rows={4}
                    placeholder="Write your reply..."
                    className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-zinc-400"
                  />

                  <label className="mt-3 flex h-12 cursor-pointer items-center justify-center gap-2 rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 px-4 text-sm font-medium text-zinc-800 transition hover:bg-zinc-100">
                    <Paperclip className="h-4 w-4" />
                    {replyAttachment ? replyAttachment.name : "Attach file"}
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      className="hidden"
                      onChange={(e) => setReplyAttachment(e.target.files?.[0] || null)}
                    />
                  </label>

                  <button
                    onClick={sendReply}
                    disabled={replying}
                    className="mt-4 inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-zinc-900 px-5 text-sm font-semibold text-white transition hover:scale-[1.01] disabled:opacity-60"
                  >
                    <Send className="h-4 w-4" />
                    {replying ? "Sending..." : "Send Reply"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function Input({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-zinc-800">
        {label}
      </label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-12 w-full rounded-2xl border border-zinc-200 bg-white px-4 text-sm text-zinc-900 outline-none transition focus:border-zinc-400"
      />
    </div>
  )
}

function StatusCard({
  title,
  value,
}: {
  title: string
  value: string
}) {
  return (
    <div className="rounded-[1.5rem] border border-zinc-200 bg-white p-5 shadow-sm">
      <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">
        {title}
      </p>
      <p className="mt-2 text-lg font-semibold capitalize text-zinc-950">
        {value}
      </p>
    </div>
  )
}