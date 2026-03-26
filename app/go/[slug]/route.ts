import { supabaseAdmin } from "@/lib/supabase/admin"
import { NextResponse } from "next/server"

type RouteContext = {
  params: Promise<{
    slug: string
  }>
}

export async function GET(request: Request, context: RouteContext) {
  const homeUrl = new URL("/", request.url)

  try {
    const { slug } = await context.params
    const cleanSlug = slug?.trim()

    if (!cleanSlug) {
      return NextResponse.redirect(homeUrl)
    }

    const { data: link, error } = await supabaseAdmin
      .from("links")
      .select("id, user_id, title, slug, url, clicks, is_active")
      .eq("slug", cleanSlug)
      .single()

    if (error || !link) {
      console.error("Link not found:", error)
      return NextResponse.redirect(homeUrl)
    }

    if (link.is_active === false) {
      return NextResponse.redirect(homeUrl)
    }

    const nextClicks = Number(link.clicks ?? 0) + 1

    await supabaseAdmin
      .from("links")
      .update({ clicks: nextClicks })
      .eq("id", link.id)

    const { error: leadError } = await supabaseAdmin.from("leads").insert({
      user_id: link.user_id,
      link_id: link.id,
      link_title: link.title,
      link_url: link.url,
      link_slug: link.slug,
      source: "link_click",
    })

    if (leadError) {
      console.error("Lead insert error:", leadError)
    }

    let destination = String(link.url ?? "").trim()

    if (!destination) {
      return NextResponse.redirect(homeUrl)
    }

    if (
      !destination.startsWith("http://") &&
      !destination.startsWith("https://")
    ) {
      destination = `https://${destination}`
    }

    return NextResponse.redirect(destination)
  } catch (error) {
    console.error("GO ROUTE ERROR:", error)
    return NextResponse.redirect(homeUrl)
  }
}