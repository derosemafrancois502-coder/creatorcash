import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      return NextResponse.json(
        { error: "Missing Supabase environment variables." },
        { status: 500 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

    const { data: applications, error: appsError } = await supabase
      .from("seller_applications")
      .select("user_id, store_name, shop_handle, bio, application_status")

    if (appsError) {
      return NextResponse.json({ error: appsError.message }, { status: 500 })
    }

    for (const app of applications ?? []) {
      const { data: verification, error: verError } = await supabase
        .from("seller_verification")
        .select("application_status, identity_status, stripe_onboarding_complete")
        .eq("user_id", app.user_id)
        .maybeSingle()

      if (verError) continue
      if (!verification) continue

      const isApproved =
        verification.application_status === "approved" &&
        verification.identity_status === "verified" &&
        verification.stripe_onboarding_complete === true

      const { data: existingShop } = await supabase
        .from("shops")
        .select("id, approved, status")
        .eq("user_id", app.user_id)
        .maybeSingle()

      const cleanStoreName =
        app.store_name?.trim() || "CreatorGoat Seller Store"

      const cleanSlug =
        app.shop_handle?.trim()?.toLowerCase().replace(/[^a-z0-9-]/g, "-") ||
        `shop-${app.user_id.slice(0, 8)}`

      if (isApproved) {
        if (!existingShop) {
          await supabase.from("shops").insert({
            user_id: app.user_id,
            store_name: cleanStoreName,
            slug: cleanSlug,
            bio: app.bio || null,
            approved: true,
            status: "approved",
          })
        } else if (!existingShop.approved || existingShop.status !== "approved") {
          await supabase
            .from("shops")
            .update({
              approved: true,
              status: "approved",
              store_name: cleanStoreName,
              slug: cleanSlug,
              bio: app.bio || null,
            })
            .eq("user_id", app.user_id)
        }
      } else {
        if (existingShop) {
          await supabase
            .from("shops")
            .update({
              approved: false,
              status: "draft",
              store_name: cleanStoreName,
              slug: cleanSlug,
              bio: app.bio || null,
            })
            .eq("user_id", app.user_id)
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: "Seller shop sync completed.",
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: "Something went wrong during seller shop sync." },
      { status: 500 }
    )
  }
}