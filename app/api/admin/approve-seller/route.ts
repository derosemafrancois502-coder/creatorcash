import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { userId } = await req.json()

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 })
    }

    // seller_applications
    await supabase
      .from("seller_applications")
      .update({
        application_status: "approved",
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId)

    // seller_verification
    await supabase
      .from("seller_verification")
      .update({
        application_status: "approved",
        identity_status: "verified",
        stripe_onboarding_complete: true,
        email_verified: true,
        phone_verified: true,
        manual_review_required: false,
        approved_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId)

    // seller_payouts (optional)
    await supabase
      .from("seller_payouts")
      .update({
        payouts_enabled: true,
        charges_enabled: true,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId)

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}