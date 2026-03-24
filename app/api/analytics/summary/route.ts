import { NextResponse } from "next/server"
import { createClient, type SupabaseClient } from "@supabase/supabase-js"

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

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    throw new Error("Missing Supabase environment variables.")
  }

  return createClient(url, key)
}

async function getTableCount(supabase: SupabaseClient, table: string) {
  const { count, error } = await supabase
    .from(table)
    .select("*", { count: "exact", head: true })

  if (error) {
    return {
      value: null,
      error: error.message,
    }
  }

  return {
    value: count ?? 0,
    error: null,
  }
}

export async function GET() {
  try {
    const supabase = getSupabase()

    const results: MetricResult[] = await Promise.all(
      metricConfigs.map(async (metric) => {
        const result = await getTableCount(supabase, metric.table)

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