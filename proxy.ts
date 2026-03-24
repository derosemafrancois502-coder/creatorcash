import { NextResponse, type NextRequest } from "next/server"
import { createServerClient } from "@supabase/ssr"

export async function proxy(request: NextRequest) {
  let response = NextResponse.next()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: Record<string, any>) {
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: Record<string, any>) {
          response.cookies.set({ name, value: "", ...options })
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname

  const isAuthPage = pathname === "/login" || pathname === "/signup"
  const isDashboardPage = pathname.startsWith("/dashboard")
  const isSellerPage = pathname.startsWith("/dashboard/seller")
  const isAdminPage = pathname.startsWith("/dashboard/admin")

  // 1) Original logic: block dashboard if not logged in
  if (!user && isDashboardPage) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // 2) Original logic: block auth pages if already logged in
  if (user && isAuthPage) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  // 3) Only add role checks if user is logged in and on protected role pages
  if (user && (isSellerPage || isAdminPage)) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle()

    const role = profile?.role || null

    // seller pages: seller or admin only
    if (isSellerPage && role !== "seller" && role !== "admin") {
      return NextResponse.redirect(new URL("/marketplace", request.url))
    }

    // admin pages: admin only
    if (isAdminPage && role !== "admin") {
      return NextResponse.redirect(new URL("/marketplace", request.url))
    }
  }

  return response
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/signup"],
}
