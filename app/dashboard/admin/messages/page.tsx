"use client"

import { useEffect, useMemo, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import {
  MessageSquare,
  RefreshCw,
  Send,
  CheckCircle2,
  Clock3,
  AlertCircle,
} from "lucide-react"

type TicketStatus = "open" | "pending" | "resolved"

type MessageRow = {
  id: string
  thread_id: string
  sender_id: string
  receiver_id: string | null
  sender_role: string
  subject: string | null
  content: string
  created_at: string
  read_at: string | null
  ticket_status?: TicketStatus | null
}

type ThreadSummary = {
  thread_id: string
  user_id: string
  subject: string
  last_message: string
  last_created_at: string
  ticket_status: TicketStatus
}

const STATUS_OPTIONS: TicketStatus[] = ["open", "pending", "resolved"]

export default function AdminMessagesPage() {
  const supabase = useMemo(() => createClient(), [])
  const [adminId, setAdminId] = useState("")
  const [messages, setMessages] = useState<MessageRow[]>([])
  const [threads, setThreads] = useState<ThreadSummary[]>([])
  const [selectedThreadId, setSelectedThreadId] = useState("")
  const [reply, setReply] = useState("")
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [statusMessage, setStatusMessage] = useState("")
  const [filter, setFilter] = useState<"all" | TicketStatus>("all")
  const [updatingStatus, setUpdatingStatus] = useState(false)

  async function loadMessages(showRefresh = false) {
    try {
      if (showRefresh) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setAdminId("")
        setMessages([])
        setThreads([])
        setSelectedThreadId("")
        setStatusMessage("You must be logged in to view admin tickets.")
        return
      }

      setAdminId(user.id)

      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .order("created_at", { ascending: true })

      if (error) {
        console.error("Admin load messages error:", error)
        setMessages([])
        setThreads([])
        setSelectedThreadId("")
        setStatusMessage("Could not load tickets.")
        return
      }

      const rows = (data || []) as MessageRow[]
      setMessages(rows)

      const grouped = new Map<string, ThreadSummary>()

      rows.forEach((msg) => {
        const threadUserId =
          msg.sender_role === "user" ? msg.sender_id : msg.receiver_id || ""

        const existing = grouped.get(msg.thread_id)
        const status = (msg.ticket_status || existing?.ticket_status || "open") as TicketStatus

        if (!existing || new Date(msg.created_at) > new Date(existing.last_created_at)) {
          grouped.set(msg.thread_id, {
            thread_id: msg.thread_id,
            user_id: threadUserId,
            subject: msg.subject || existing?.subject || "Support",
            last_message: msg.content,
            last_created_at: msg.created_at,
            ticket_status: status,
          })
        }
      })

      const threadList = Array.from(grouped.values()).sort(
        (a, b) =>
          new Date(b.last_created_at).getTime() - new Date(a.last_created_at).getTime()
      )

      setThreads(threadList)

      if (threadList.length === 0) {
        setSelectedThreadId("")
        setStatusMessage("No support tickets yet.")
        return
      }

      const selectedStillExists = threadList.some(
        (thread) => thread.thread_id === selectedThreadId
      )

      if (!selectedThreadId || !selectedStillExists) {
        setSelectedThreadId(threadList[0].thread_id)
      }

      setStatusMessage("")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadMessages()
  }, [])

  const filteredThreads = useMemo(() => {
    if (filter === "all") return threads
    return threads.filter((thread) => thread.ticket_status === filter)
  }, [threads, filter])

  const selectedMessages = useMemo(() => {
    return messages.filter((m) => m.thread_id === selectedThreadId)
  }, [messages, selectedThreadId])

  const selectedThread = useMemo(() => {
    return threads.find((t) => t.thread_id === selectedThreadId) || null
  }, [threads, selectedThreadId])

  async function sendReply() {
    if (!reply.trim() || !selectedThread || !adminId) return

    try {
      setSending(true)
      setStatusMessage("")

      const { error } = await supabase.from("messages").insert({
        thread_id: selectedThread.thread_id,
        sender_id: adminId,
        receiver_id: selectedThread.user_id,
        sender_role: "admin",
        subject: selectedThread.subject,
        content: reply.trim(),
        ticket_status: selectedThread.ticket_status,
      })

      if (error) {
        console.error("Admin reply error:", error)
        setStatusMessage("Could not send reply.")
        return
      }

      setReply("")
      setStatusMessage("Reply sent successfully.")
      await loadMessages(true)
    } finally {
      setSending(false)
    }
  }

  async function updateTicketStatus(nextStatus: TicketStatus) {
    if (!selectedThread) return

    try {
      setUpdatingStatus(true)
      setStatusMessage("")

      const { error } = await supabase
        .from("messages")
        .update({ ticket_status: nextStatus })
        .eq("thread_id", selectedThread.thread_id)

      if (error) {
        console.error("Update ticket status error:", error)
        setStatusMessage("Could not update ticket status.")
        return
      }

      setStatusMessage(`Ticket marked as ${nextStatus}.`)
      await loadMessages(true)
    } finally {
      setUpdatingStatus(false)
    }
  }

  function handleReplyKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault()
      void sendReply()
    }
  }

  return (
    <div className="min-h-screen bg-white p-6 text-zinc-900">
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[340px_minmax(0,1fr)]">
        <aside className="rounded-3xl border border-zinc-200 bg-zinc-50 p-5">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Support Tickets</h1>
            <button
              onClick={() => loadMessages(true)}
              disabled={refreshing}
              className="rounded-xl border border-zinc-300 p-2 text-zinc-700 disabled:opacity-60"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            </button>
          </div>

          <div className="mt-4 grid grid-cols-4 gap-2">
            <FilterButton active={filter === "all"} onClick={() => setFilter("all")}>
              All
            </FilterButton>
            <FilterButton active={filter === "open"} onClick={() => setFilter("open")}>
              Open
            </FilterButton>
            <FilterButton active={filter === "pending"} onClick={() => setFilter("pending")}>
              Pending
            </FilterButton>
            <FilterButton active={filter === "resolved"} onClick={() => setFilter("resolved")}>
              Done
            </FilterButton>
          </div>

          <div className="mt-6 space-y-3">
            {filteredThreads.length === 0 ? (
              <div className="rounded-2xl border border-zinc-200 bg-white p-4 text-sm text-zinc-500">
                No tickets in this filter.
              </div>
            ) : (
              filteredThreads.map((thread) => (
                <button
                  key={thread.thread_id}
                  onClick={() => setSelectedThreadId(thread.thread_id)}
                  className={`w-full rounded-2xl border p-4 text-left transition ${
                    selectedThreadId === thread.thread_id
                      ? "border-zinc-900 bg-white"
                      : "border-zinc-200 bg-white hover:border-zinc-300"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-semibold">{thread.subject}</p>
                    <StatusBadge status={thread.ticket_status} />
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm text-zinc-600">
                    {thread.last_message}
                  </p>
                  <p className="mt-2 text-xs text-zinc-500">
                    User ID: {thread.user_id}
                  </p>
                </button>
              ))
            )}
          </div>
        </aside>

        <main className="rounded-3xl border border-zinc-200 bg-white p-6">
          {loading ? (
            <div className="flex min-h-[500px] items-center justify-center text-zinc-500">
              Loading tickets...
            </div>
          ) : !selectedThreadId ? (
            <div className="flex min-h-[500px] items-center justify-center text-zinc-500">
              <div className="text-center">
                <MessageSquare className="mx-auto h-10 w-10" />
                <p className="mt-3">{statusMessage || "No ticket selected."}</p>
              </div>
            </div>
          ) : (
            <div className="flex min-h-[500px] flex-col">
              <div className="mb-4 border-b border-zinc-200 pb-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-bold">{selectedThread?.subject}</h2>
                    <p className="text-sm text-zinc-600">
                      User ID: {selectedThread?.user_id}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {STATUS_OPTIONS.map((status) => (
                      <button
                        key={status}
                        onClick={() => updateTicketStatus(status)}
                        disabled={updatingStatus}
                        className={`rounded-xl px-3 py-2 text-sm font-medium ${
                          selectedThread?.ticket_status === status
                            ? "bg-zinc-900 text-white"
                            : "border border-zinc-300 bg-white text-zinc-800"
                        }`}
                      >
                        {formatStatus(status)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex-1 space-y-4 overflow-y-auto pr-1">
                {selectedMessages.length === 0 ? (
                  <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-500">
                    No messages in this ticket yet.
                  </div>
                ) : (
                  selectedMessages.map((msg) => {
                    const isAdmin = msg.sender_role === "admin"

                    return (
                      <div
                        key={msg.id}
                        className={`flex ${isAdmin ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                            isAdmin
                              ? "bg-zinc-900 text-white"
                              : "bg-zinc-100 text-zinc-900"
                          }`}
                        >
                          <p className="mb-1 text-xs opacity-70">
                            {isAdmin ? "Admin" : "User"}
                          </p>
                          <p className="whitespace-pre-wrap">{msg.content}</p>
                          <p className="mt-2 text-[11px] opacity-60">
                            {new Date(msg.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>

              <div className="mt-6 border-t border-zinc-200 pt-4">
                {statusMessage ? (
                  <p className="mb-3 text-sm text-zinc-600">{statusMessage}</p>
                ) : null}

                <div className="flex gap-3">
                  <textarea
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    onKeyDown={handleReplyKeyDown}
                    placeholder="Write admin reply..."
                    className="min-h-[80px] flex-1 rounded-2xl border border-zinc-300 bg-white p-3 outline-none"
                  />
                  <button
                    onClick={sendReply}
                    disabled={sending || !reply.trim()}
                    className="rounded-2xl bg-zinc-900 px-5 py-3 font-semibold text-white disabled:opacity-60"
                  >
                    {sending ? "..." : <Send className="h-5 w-5" />}
                  </button>
                </div>

                <p className="mt-2 text-xs text-zinc-500">
                  Press Ctrl + Enter to send reply.
                </p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

function formatStatus(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

function FilterButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-xl px-3 py-2 text-sm font-medium ${
        active
          ? "bg-zinc-900 text-white"
          : "border border-zinc-300 bg-white text-zinc-800"
      }`}
    >
      {children}
    </button>
  )
}

function StatusBadge({ status }: { status: TicketStatus }) {
  const map = {
    open: {
      icon: AlertCircle,
      className: "bg-red-50 text-red-700 border border-red-200",
    },
    pending: {
      icon: Clock3,
      className: "bg-amber-50 text-amber-700 border border-amber-200",
    },
    resolved: {
      icon: CheckCircle2,
      className: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    },
  }

  const Icon = map[status].icon

  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${map[status].className}`}>
      <Icon className="h-3.5 w-3.5" />
      {formatStatus(status)}
    </span>
  )
}