import { NextRequest, NextResponse } from "next/server"
import { exchangeTikTokAuthCode } from "@/lib/tiktok-shop"
import { supabaseAdmin } from "@/lib/supabase/admin"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)

    const code =
      searchParams.get("auth_code") ||
      searchParams.get("code") ||
      ""

    const shopIdFromQuery = searchParams.get("shop_id") || ""
    const appKey = searchParams.get("app_key") || ""

    if (!code) {
      return NextResponse.json(
        { error: "Missing TikTok authorization code." },
        { status: 400 }
      )
    }

    const tokenData = await exchangeTikTokAuthCode(code)

    const accessToken =
      tokenData?.data?.access_token ||
      tokenData?.access_token ||
      ""

    const refreshToken =
      tokenData?.data?.refresh_token ||
      tokenData?.refresh_token ||
      ""

    const accessTokenExpireIn =
      tokenData?.data?.access_token_expire_in ||
      tokenData?.access_token_expire_in ||
      null

    const refreshTokenExpireIn =
      tokenData?.data?.refresh_token_expire_in ||
      tokenData?.refresh_token_expire_in ||
      null

    const shopId =
      tokenData?.data?.shop_id ||
      tokenData?.data?.cipher ||
      shopIdFromQuery ||
      `shop-${Date.now()}`

    const shopName =
      tokenData?.data?.shop_name ||
      tokenData?.data?.shop_cipher ||
      null

    const sellerName =
      tokenData?.data?.seller_name ||
      null

    if (!accessToken) {
      return NextResponse.json(
        { error: "TikTok did not return an access token." },
        { status: 500 }
      )
    }

    const { error: upsertError } = await supabaseAdmin
      .from("tiktok_shop_connections")
      .upsert(
        {
          shop_id: shopId,
          shop_name: shopName,
          seller_name: sellerName,
          app_key: appKey || process.env.TIKTOK_SHOP_APP_KEY || null,
          access_token: accessToken,
          refresh_token: refreshToken || null,
          access_token_expire_in: accessTokenExpireIn,
          refresh_token_expire_in: refreshTokenExpireIn,
          raw_json: tokenData,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "shop_id",
        }
      )

    if (upsertError) {
      return NextResponse.json(
        {
          error: "TikTok connected but failed to save tokens.",
          details: upsertError.message,
        },
        { status: 500 }
      )
    }

    return NextResponse.redirect(
      new URL("/dashboard/cos/product-discovery?tiktok=connected", req.url)
    )
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "TikTok callback failed."

    return NextResponse.json({ error: message }, { status: 500 })
  }
}