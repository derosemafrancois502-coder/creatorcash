import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("authorization")
    const bearerToken =
      authHeader?.startsWith("Bearer ")
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

    const { data: byIdData, error: byIdError } = await supabaseAdmin
      .from("profiles")
      .select(selectFields)
      .eq("id", user.id)
      .maybeSingle()

    if (byIdError) {
      console.error("BILLING PROFILE BY ID ERROR:", byIdError)
    }

    if (byIdData) {
      return NextResponse.json({
        success: true,
        profile: byIdData,
      })
    }

    const { data: byUserIdData, error: byUserIdError } = await supabaseAdmin
      .from("profiles")
      .select(
        "id, user_id, plan, trial_expires_at, subscription_expires_at, extra_video_credits, videos_used"
      )
      .eq("user_id", user.id)
      .maybeSingle()

    if (byUserIdError) {
      console.error("BILLING PROFILE BY USER_ID ERROR:", byUserIdError)
    }

    if (byUserIdData) {
      return NextResponse.json({
        success: true,
        profile: {
          id: byUserIdData.id ?? byUserIdData.user_id ?? user.id,
          plan: byUserIdData.plan ?? "free",
          trial_expires_at: byUserIdData.trial_expires_at ?? null,
          subscription_expires_at: byUserIdData.subscription_expires_at ?? null,
          extra_video_credits: byUserIdData.extra_video_credits ?? 0,
          videos_used: byUserIdData.videos_used ?? 0,
        },
      })
    }

    return NextResponse.json({
      success: true,
      profile: {
        id: user.id,
        plan: "free",
        trial_expires_at: null,
        subscription_expires_at: null,
        extra_video_credits: 0,
        videos_used: 0,
      },
    })
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