import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("authorization")
    const bearerToken = authHeader?.startsWith("Bearer ")
      ? authHeader.replace("Bearer ", "").trim()
      : ""

    if (!bearerToken) {
      return NextResponse.json(
        { error: "Missing authorization token." },
        { status: 401 }
      )
    }

    const {
      data: { user },
      error: userError,
    } = await supabaseAdmin.auth.getUser(bearerToken)

    if (userError) {
      console.error("BILLING PROFILE AUTH ERROR:", userError)
      return NextResponse.json(
        {
          error: "Unauthorized user.",
          details: userError.message,
        },
        { status: 401 }
      )
    }

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized user." },
        { status: 401 }
      )
    }

    const selectFields =
      "id, plan, trial_expires_at, subscription_expires_at, extra_video_credits, videos_used"

    const byId = await supabaseAdmin
      .from("profiles")
      .select(selectFields)
      .eq("id", user.id)
      .maybeSingle()

    if (byId.error) {
      console.error("BILLING PROFILE BY ID ERROR:", byId.error)
    }

    if (byId.data) {
      return NextResponse.json({
        success: true,
        profile: byId.data,
      })
    }

    const byUserId = await supabaseAdmin
      .from("profiles")
      .select(
        "id, user_id, plan, trial_expires_at, subscription_expires_at, extra_video_credits, videos_used"
      )
      .eq("user_id", user.id)
      .maybeSingle()

    if (byUserId.error) {
      console.error("BILLING PROFILE BY USER_ID ERROR:", byUserId.error)
    }

    if (byUserId.data) {
      return NextResponse.json({
        success: true,
        profile: byUserId.data,
      })
    }

    return NextResponse.json(
      {
        error: "Billing profile not found.",
        userId: user.id,
      },
      { status: 404 }
    )
  } catch (error) {
    console.error("BILLING PROFILE API ERROR:", error)

    return NextResponse.json(
      {
        error: "Unexpected billing profile error.",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}