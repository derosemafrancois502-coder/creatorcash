import Link from "next/link"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { ArrowRight, MessageSquare } from "lucide-react"

type ConversationRow = {
  id: string
  product_id: number
  buyer_user_id: string
  seller_user_id: string
  created_at: string
  updated_at: string
}

type ProductRow = {
  id: number
  name: string
  image_url: string | null
}

export default async function SupportMessagesPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login?next=/dashboard/support-messages")
  }

  const { data: conversations, error } = await supabase
    .from("marketplace_conversations")
    .select("id, product_id, buyer_user_id, seller_user_id, created_at, updated_at")
    .or(`buyer_user_id.eq.${user.id},seller_user_id.eq.${user.id}`)
    .order("updated_at", { ascending: false })

  if (error) {
    return (
      <div className="min-h-screen bg-black px-6 py-10 text-white">
        <div className="mx-auto max-w-5xl rounded-3xl border border-red-500/20 bg-red-500/10 p-6">
          <h1 className="text-2xl font-bold">Customer Messages</h1>
          <p className="mt-3 text-sm text-red-200/80">{error.message}</p>
        </div>
      </div>
    )
  }

  const rows = (conversations ?? []) as ConversationRow[]
  const productIds = [...new Set(rows.map((row) => row.product_id))]

  const productMap = new Map<number, ProductRow>()

  if (productIds.length > 0) {
    const { data: products } = await supabase
      .from("products")
      .select("id, name, image_url")
      .in("id", productIds)

    for (const product of (products ?? []) as ProductRow[]) {
      productMap.set(product.id, product)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="border-b border-white/10 bg-black/50 backdrop-blur-xl">
        <div className="mx-auto max-w-6xl px-6 py-6">
          <h1 className="text-3xl font-bold">Customer Messages</h1>
          <p className="mt-2 text-sm text-white/60">
            Product-based conversations between customers and sellers.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-8">
        {rows.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-10 text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-white/10">
              <MessageSquare className="h-7 w-7 text-white/70" />
            </div>
            <h2 className="text-2xl font-semibold">No conversations yet</h2>
            <p className="mt-3 text-sm text-white/60">
              When a customer clicks Contact the Seller from a product page, the conversation will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {rows.map((row) => {
              const product = productMap.get(row.product_id)

              return (
                <Link
                  key={row.id}
                  href={`/dashboard/support-messages/${row.id}`}
                  className="block rounded-3xl border border-white/10 bg-white/5 p-5 transition hover:bg-white/10"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-xs uppercase tracking-[0.18em] text-white/40">
                        Product Conversation
                      </p>
                      <h3 className="mt-2 truncate text-lg font-semibold">
                        {product?.name || `Product #${row.product_id}`}
                      </h3>
                      <p className="mt-2 text-sm text-white/55">
                        Open chat for this product.
                      </p>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-white/70">
                      Open
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}