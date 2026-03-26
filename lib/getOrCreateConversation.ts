import { createClient } from "@/lib/supabase/client"

export async function getOrCreateConversation(orderId: number) {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error("Not authenticated")

  // 1. check si li egziste
  const { data: existing } = await supabase
    .from("conversations")
    .select("*")
    .eq("order_id", orderId)
    .single()

  if (existing) return existing.id

  // 2. jwenn order la pou buyer/seller
  const { data: order } = await supabase
    .from("orders")
    .select("id, user_id, seller_id")
    .eq("id", orderId)
    .single()

  if (!order) throw new Error("Order not found")

  // 3. kreye conversation
  const { data: newConv } = await supabase
    .from("conversations")
    .insert({
      order_id: orderId,
      buyer_id: order.user_id,
      seller_id: order.seller_id,
    })
    .select()
    .single()

  return newConv.id
}