import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { ArrowLeft } from "lucide-react"
import MessageComposer from "./message-composer"

type Props = {
  params: Promise<{
    conversationId: string
  }>
}

type ConversationRow = {
  id: string
  product_id: number
  buyer_user_id: string
  seller_user_id: string
  created_at: string
  updated_at: string
}

type MessageRow = {
  id: string
  conversation_id: string
  sender_user_id: string
  body: string
  created_at: string
  read_at: string | null
}

type ProductRow = {
  id: number
  name: string
  image_url: string | null
  user_id: string
}

export default async function SupportConversationPage({ params }: Props) {
  const { conversationId } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login?next=/dashboard/support-messages")
  }

  const { data: conversation, error: conversationError } = await supabase
    .from("marketplace_conversations")
    .select("id, product_id, buyer_user_id, seller_user_id, created_at, updated_at")
    .eq("id", conversationId)
    .maybeSingle()

  if (conversationError) {
    return (
      <div className="min-h-screen bg-black p-6 text-white">
        <div className="mx-auto max-w-5xl rounded-3xl border border-red-500/20 bg-red-500/10 p-6">
          <p>{conversationError.message}</p>
        </div>
      </div>
    )
  }

  if (!conversation) {
    notFound()
  }

  const conv = conversation as ConversationRow

  if (conv.buyer_user_id !== user.id && conv.seller_user_id !== user.id) {
    redirect("/dashboard/support-messages")
  }

  const { data: product } = await supabase
    .from("products")
    .select("id, name, image_url, user_id")
    .eq("id", conv.product_id)
    .maybeSingle()

  const { data: messages } = await supabase
    .from("marketplace_messages")
    .select("id, conversation_id, sender_user_id, body, created_at, read_at")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true })

  const productRow = product as ProductRow | null
  const messageRows = (messages ?? []) as MessageRow[]
  const isBuyer = conv.buyer_user_id === user.id

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="border-b border-white/10 bg-black/60 backdrop-blur-xl">
        <div className="mx-auto max-w-5xl px-6 py-5">
          <Link
            href="/dashboard/support-messages"
            className="inline-flex items-center gap-2 text-sm text-white/70 transition hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Customer Messages
          </Link>

          <div className="mt-4">
            <p className="text-xs uppercase tracking-[0.18em] text-white/40">
              Product Conversation
            </p>
            <h1 className="mt-2 text-2xl font-bold">
              {productRow?.name || `Product #${conv.product_id}`}
            </h1>
            <p className="mt-2 text-sm text-white/55">
              {isBuyer
                ? "You are chatting with the seller for this product."
                : "You are chatting with the customer about this product."}
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto flex max-w-5xl flex-col gap-6 px-6 py-8">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
          <div className="flex flex-col gap-2">
            <p className="text-sm text-white/50">Product</p>
            <p className="text-lg font-semibold">
              {productRow?.name || `Product #${conv.product_id}`}
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
          <div className="space-y-4">
            {messageRows.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/10 bg-black/20 p-6 text-sm text-white/50">
                No messages yet. Start the conversation below.
              </div>
            ) : (
              messageRows.map((message) => {
                const own = message.sender_user_id === user.id

                return (
                  <div
                    key={message.id}
                    className={`flex ${own ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-3xl px-4 py-3 text-sm leading-6 ${
                        own
                          ? "bg-white text-black"
                          : "border border-white/10 bg-black/30 text-white"
                      }`}
                    >
                      <p>{message.body}</p>
                      <p
                        className={`mt-2 text-[11px] ${
                          own ? "text-black/60" : "text-white/40"
                        }`}
                      >
                        {new Date(message.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        <MessageComposer conversationId={conversationId} />
      </div>
    </div>
  )
}