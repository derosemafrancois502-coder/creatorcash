import { NextResponse } from "next/server"
import { createServerClient, type CookieOptions } from "@supabase/ssr"
import { cookies } from "next/headers"

type MetricKey =
  | "emails"
  | "orders"
  | "products"
  | "leads"
  | "messages"
  | "events"
  | "creators"

type MetricConfig = {
  key: MetricKey
  label: string
  table: string
  icon: string
  color: string
}

type MetricResult = MetricConfig & {
  value: number | null
  error?: string | null
}

const metricConfigs: MetricConfig[] = [
  {
    key: "emails",
    label: "Emails",
    table: "emails",
    icon: "✉️",
    color: "cyan",
  },
  {
    key: "orders",
    label: "Orders",
    table: "orders",
    icon: "🛒",
    color: "blue",
  },
  {
    key: "products",
    label: "Products",
    table: "products",
    icon: "📦",
    color: "indigo",
  },
  {
    key: "leads",
    label: "Leads",
    table: "leads",
    icon: "🎯",
    color: "sky",
  },
  {
    key: "messages",
    label: "Messages",
    table: "messages",
    icon: "💬",
    color: "teal",
  },
  {
    key: "events",
    label: "Events",
    table: "events",
    icon: "📅",
    color: "cyan",
  },
  {
    key: "creators",
    label: "Creators",
    table: "profiles",
    icon: "👑",
    color: "blue",
  },
]

async function getSupabase() {
  const cookieStore = await cookies()

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !anonKey) {
    throw new Error("Missing Supabase environment variables.")
  }

  return createServerClient(url, anonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
      set(_name: string, _value: string, _options: CookieOptions) {
        // no-op in route handler GET
      },
      remove(_name: string, _options: CookieOptions) {
        // no-op in route handler GET
      },
    },
  })
}

async function getTableCount(
  supabase: Awaited<ReturnType<typeof getSupabase>>,
  metric: MetricConfig,
  userId: string
) {
  if (metric.key === "emails") {
    const { count, error } = await supabase
      .from("emails")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)

    return {
      value: count ?? 0,
      error: error?.message ?? null,
    }
  }

  if (metric.key === "orders") {
    const { count, error } = await supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .or(
        `user_id.eq.${userId},buyer_id.eq.${userId},seller_id.eq.${userId},seller_user_id.eq.${userId}`
      )

    return {
      value: count ?? 0,
      error: error?.message ?? null,
    }
  }

  if (metric.key === "products") {
    const { count, error } = await supabase
      .from("products")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)

    return {
      value: count ?? 0,
      error: error?.message ?? null,
    }
  }

  if (metric.key === "leads") {
    const { count, error } = await supabase
      .from("leads")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)

    return {
      value: count ?? 0,
      error: error?.message ?? null,
    }
  }

  if (metric.key === "messages") {
    const { count, error } = await supabase
      .from("messages")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)

    return {
      value: count ?? 0,
      error: error?.message ?? null,
    }
  }

  if (metric.key === "events") {
    const { count, error } = await supabase
      .from("events")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)

    return {
      value: count ?? 0,
      error: error?.message ?? null,
    }
  }

  if (metric.key === "creators") {
    const { count, error } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("id", userId)

    return {
      value: count ?? 0,
      error: error?.message ?? null,
    }
  }

  return {
    value: 0,
    error: null,
  }
}

export async function GET() {
  try {
    const supabase = await getSupabase()

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError) {
      throw new Error(userError.message)
    }

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          metrics: [],
          hiddenMetrics: [],
          error: "Unauthorized",
        },
        { status: 401 }
      )
    }

    const results: MetricResult[] = await Promise.all(
      metricConfigs.map(async (metric) => {
        const result = await getTableCount(supabase, metric, user.id)

        return {
          ...metric,
          value: result.value,
          error: result.error,
        }
      })
    )

    const visibleMetrics = results.filter(
      (metric) => typeof metric.value === "number" && metric.value > 0
    )

    const hiddenMetrics = results
      .filter((metric) => metric.value === 0 || metric.value === null)
      .map((metric) => metric.key)

    return NextResponse.json({
      success: true,
      metrics: visibleMetrics,
      hiddenMetrics,
      debug: results,
      lastUpdated: new Date().toISOString(),
    })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load analytics."

    return NextResponse.json(
      {
        success: false,
        metrics: [],
        hiddenMetrics: [],
        error: message,
      },
      { status: 500 }
    )
  }
}