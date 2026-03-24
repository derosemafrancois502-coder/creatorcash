"use client"

import { useEffect, useMemo, useState } from "react"

type MetricKey =
  | "emails"
  | "orders"
  | "products"
  | "leads"
  | "messages"
  | "events"
  | "creators"

type Metric = {
  key: MetricKey
  label: string
  table: string
  icon: string
  color: string
  value: number | null
}

type AnalyticsResponse = {
  success: boolean
  metrics: Metric[]
  hiddenMetrics: string[]
  lastUpdated?: string
  error?: string
}

const baseMetrics: Metric[] = [
  { key: "emails", label: "Emails", table: "emails", icon: "✉️", color: "cyan", value: 0 },
  { key: "orders", label: "Orders", table: "orders", icon: "🛒", color: "blue", value: 0 },
  { key: "products", label: "Products", table: "products", icon: "📦", color: "indigo", value: 0 },
  { key: "leads", label: "Leads", table: "leads", icon: "🎯", color: "sky", value: 0 },
  { key: "messages", label: "Messages", table: "messages", icon: "💬", color: "teal", value: 0 },
  { key: "events", label: "Events", table: "events", icon: "📅", color: "cyan", value: 0 },
  { key: "creators", label: "Creators", table: "profiles", icon: "👑", color: "blue", value: 0 },
]

function getColorClasses(color: string) {
  switch (color) {
    case "cyan":
      return {
        badge: "border-cyan-400/20 bg-cyan-500/10 text-cyan-200",
        iconWrap: "border-cyan-400/20 bg-cyan-500/10 text-cyan-200",
        glow: "shadow-[0_0_30px_rgba(34,211,238,0.10)]",
        chartBar: "bg-gradient-to-t from-cyan-700 via-cyan-500 to-cyan-300",
      }
    case "blue":
      return {
        badge: "border-blue-400/20 bg-blue-500/10 text-blue-200",
        iconWrap: "border-blue-400/20 bg-blue-500/10 text-blue-200",
        glow: "shadow-[0_0_30px_rgba(59,130,246,0.10)]",
        chartBar: "bg-gradient-to-t from-blue-700 via-blue-500 to-cyan-300",
      }
    case "indigo":
      return {
        badge: "border-indigo-400/20 bg-indigo-500/10 text-indigo-200",
        iconWrap: "border-indigo-400/20 bg-indigo-500/10 text-indigo-200",
        glow: "shadow-[0_0_30px_rgba(99,102,241,0.10)]",
        chartBar: "bg-gradient-to-t from-indigo-700 via-indigo-500 to-blue-300",
      }
    case "sky":
      return {
        badge: "border-sky-400/20 bg-sky-500/10 text-sky-200",
        iconWrap: "border-sky-400/20 bg-sky-500/10 text-sky-200",
        glow: "shadow-[0_0_30px_rgba(14,165,233,0.10)]",
        chartBar: "bg-gradient-to-t from-sky-700 via-sky-500 to-cyan-300",
      }
    case "teal":
      return {
        badge: "border-teal-400/20 bg-teal-500/10 text-teal-200",
        iconWrap: "border-teal-400/20 bg-teal-500/10 text-teal-200",
        glow: "shadow-[0_0_30px_rgba(20,184,166,0.10)]",
        chartBar: "bg-gradient-to-t from-teal-700 via-teal-500 to-cyan-300",
      }
    default:
      return {
        badge: "border-cyan-400/20 bg-cyan-500/10 text-cyan-200",
        iconWrap: "border-cyan-400/20 bg-cyan-500/10 text-cyan-200",
        glow: "shadow-[0_0_30px_rgba(34,211,238,0.10)]",
        chartBar: "bg-gradient-to-t from-cyan-700 via-cyan-500 to-cyan-300",
      }
  }
}

function ModuleTab({
  metric,
  active,
  onClick,
}: {
  metric: Metric
  active: boolean
  onClick: () => void
}) {
  const styles = getColorClasses(metric.color)
  const hasData = (metric.value || 0) > 0

  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
        active
          ? `${styles.badge} scale-[1.02]`
          : hasData
            ? "border-white/10 bg-white/5 text-zinc-300 hover:border-cyan-400/20 hover:text-white"
            : "border-white/10 bg-white/[0.03] text-zinc-500 hover:text-zinc-300"
      }`}
    >
      <span className="mr-2">{metric.icon}</span>
      {metric.label} ({metric.value?.toLocaleString() || 0})
    </button>
  )
}

function StatCard({
  metric,
  active,
  onClick,
}: {
  metric: Metric
  active: boolean
  onClick: () => void
}) {
  const styles = getColorClasses(metric.color)
  const hasData = (metric.value || 0) > 0

  return (
    <div
      className={`rounded-3xl border p-5 ${
        active
          ? "border-cyan-400/30 bg-[linear-gradient(180deg,rgba(12,18,34,0.98),rgba(6,10,22,0.98))]"
          : "border-blue-500/20 bg-[linear-gradient(180deg,rgba(12,18,34,0.98),rgba(6,10,22,0.98))]"
      } ${styles.glow}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-zinc-400">{metric.label}</p>
          <h3 className="mt-3 text-3xl font-bold text-white">
            {metric.value?.toLocaleString() || 0}
          </h3>
          <p className="mt-2 text-sm text-zinc-500">
            {hasData ? `Real count from ${metric.table}` : "No data yet"}
          </p>
        </div>

        <div
          className={`flex h-12 w-12 items-center justify-center rounded-2xl border text-xl ${styles.iconWrap}`}
        >
          {metric.icon}
        </div>
      </div>

      <div className="mt-5">
        <button
          type="button"
          onClick={onClick}
          className={`inline-flex items-center rounded-xl border px-4 py-2 text-sm font-semibold transition hover:opacity-90 ${styles.badge}`}
        >
          View Real Count
        </button>
      </div>
    </div>
  )
}

function ActiveMetricBar({
  metric,
  allMetrics,
}: {
  metric: Metric
  allMetrics: Metric[]
}) {
  const styles = getColorClasses(metric.color)
  const metricValue = metric.value || 0
  const maxValue = Math.max(...allMetrics.map((item) => item.value || 0), 1)
  const percent = metricValue > 0 ? Math.max((metricValue / maxValue) * 100, 8) : 8

  return (
    <div className="rounded-[30px] border border-blue-500/20 bg-[linear-gradient(180deg,rgba(10,15,28,0.98),rgba(6,10,20,0.98))] p-6 shadow-[0_0_40px_rgba(59,130,246,0.06)]">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.18em] text-cyan-300/70">
            Real Module View
          </p>
          <h2 className="mt-2 text-2xl font-bold text-white">
            {metric.label} Total Records
          </h2>
          <p className="mt-2 text-sm text-zinc-400">
            This bar is based on the real database count for the selected module.
          </p>
        </div>

        <div className={`rounded-full border px-4 py-2 text-sm font-semibold ${styles.badge}`}>
          {metric.icon} {metric.label}
        </div>
      </div>

      <div className="rounded-2xl border border-white/5 bg-black/20 p-4">
        <div className="mb-4 flex items-end justify-between">
          <div>
            <p className="text-sm text-zinc-500">Table</p>
            <p className="mt-1 font-semibold text-white">{metric.table}</p>
          </div>

          <div className="text-right">
            <p className="text-sm text-zinc-500">Count</p>
            <p className="mt-1 text-3xl font-bold text-white">
              {metricValue.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="flex h-[260px] items-end">
          <div className="w-full rounded-3xl bg-white/5 p-3">
            <div className="flex h-[210px] items-end">
              <div
                className={`w-full rounded-t-3xl ${styles.chartBar} shadow-[0_0_30px_rgba(59,130,246,0.18)]`}
                style={{ height: `${percent}%` }}
              />
            </div>

            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm font-semibold text-white">{metric.label}</p>
              <p className="text-sm text-zinc-400">{metricValue.toLocaleString()} records</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function RealCountsComparison({
  metrics,
}: {
  metrics: Metric[]
}) {
  const maxValue = Math.max(...metrics.map((item) => item.value || 0), 1)

  return (
    <div className="rounded-[30px] border border-blue-500/20 bg-[linear-gradient(180deg,rgba(10,15,28,0.98),rgba(6,10,20,0.98))] p-6 shadow-[0_0_40px_rgba(59,130,246,0.06)]">
      <div className="mb-6">
        <p className="text-sm uppercase tracking-[0.18em] text-cyan-300/70">
          Real Comparison
        </p>
        <h2 className="mt-2 text-2xl font-bold text-white">
          All Module Counts
        </h2>
        <p className="mt-2 text-sm text-zinc-400">
          Every bar below is based on real counts loaded from your database.
        </p>
      </div>

      <div className="rounded-2xl border border-white/5 bg-black/20 p-4">
        <div className="flex h-[320px] items-end gap-3">
          {metrics.map((item) => {
            const styles = getColorClasses(item.color)
            const value = item.value || 0
            const percent = value > 0 ? Math.max((value / maxValue) * 100, 8) : 8

            return (
              <div key={item.key} className="flex flex-1 flex-col items-center gap-3">
                <div className="flex h-[250px] w-full items-end">
                  <div
                    className={`w-full rounded-t-2xl ${styles.chartBar} shadow-[0_0_30px_rgba(59,130,246,0.18)]`}
                    style={{ height: `${percent}%` }}
                  />
                </div>

                <div className="text-center">
                  <p className="text-sm font-semibold text-white">{value}</p>
                  <p className="text-xs text-zinc-400">{item.label}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default function AnalyticsPage() {
  const [metrics, setMetrics] = useState<Metric[]>(baseMetrics)
  const [hiddenMetrics, setHiddenMetrics] = useState<string[]>([])
  const [lastUpdated, setLastUpdated] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [activeMetric, setActiveMetric] = useState<MetricKey>("emails")

  useEffect(() => {
    let active = true

    async function loadAnalytics() {
      try {
        setLoading(true)
        setError("")

        const res = await fetch("/api/analytics/summary", {
          method: "GET",
          cache: "no-store",
        })

        const data: AnalyticsResponse = await res.json()

        if (!res.ok || !data.success) {
          throw new Error(data.error || "Failed to load analytics.")
        }

        if (!active) return

        const liveMetrics = data.metrics || []

        const mergedMetrics = baseMetrics.map((baseMetric) => {
          const liveMetric = liveMetrics.find((item) => item.key === baseMetric.key)
          return liveMetric
            ? {
                ...baseMetric,
                ...liveMetric,
                value: liveMetric.value ?? 0,
              }
            : baseMetric
        })

        setMetrics(mergedMetrics)
        setHiddenMetrics(data.hiddenMetrics || [])
        setLastUpdated(data.lastUpdated || "")
      } catch (err) {
        if (!active) return
        setError(err instanceof Error ? err.message : "Failed to load analytics.")
      } finally {
        if (active) setLoading(false)
      }
    }

    loadAnalytics()

    return () => {
      active = false
    }
  }, [])

  const totalVisibleCount = useMemo(() => {
    return metrics.reduce((sum, metric) => sum + (metric.value || 0), 0)
  }, [metrics])

  const metricsWithDataCount = useMemo(() => {
    return metrics.filter((metric) => (metric.value || 0) > 0).length
  }, [metrics])

  const activeMetricObject =
    metrics.find((metric) => metric.key === activeMetric) || metrics[0]

  return (
    <div className="min-h-screen bg-black px-6 py-8 text-white">
      <div className="mx-auto max-w-7xl space-y-8">
        <section className="relative overflow-hidden rounded-[32px] border border-blue-500/20 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.18),transparent_32%),linear-gradient(180deg,rgba(8,12,24,0.98),rgba(5,8,18,0.98))] p-8 shadow-[0_0_50px_rgba(59,130,246,0.08)]">
          <div className="absolute left-[-80px] top-[-80px] h-72 w-72 rounded-full bg-blue-500/10 blur-3xl" />
          <div className="absolute right-[-100px] bottom-[-100px] h-80 w-80 rounded-full bg-cyan-500/10 blur-3xl" />

          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-4 inline-flex items-center rounded-full border border-blue-400/20 bg-blue-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300">
                CreatorGoat Analytics
              </div>

              <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
                Dynamic Analytics Command Center
              </h1>

              <p className="mt-4 max-w-3xl text-base leading-7 text-zinc-400">
                Real analytics only. No fake daily charts. Everything below is based on live module counts from your database.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-cyan-400/15 bg-cyan-500/10 px-5 py-4">
                <p className="text-xs uppercase tracking-[0.18em] text-cyan-200/70">
                  Modules With Data
                </p>
                <p className="mt-2 text-2xl font-bold text-white">
                  {metricsWithDataCount}
                </p>
                <p className="mt-1 text-sm text-cyan-100/70">
                  Live modules found
                </p>
              </div>

              <div className="rounded-2xl border border-blue-400/15 bg-blue-500/10 px-5 py-4">
                <p className="text-xs uppercase tracking-[0.18em] text-blue-200/70">
                  Total Count
                </p>
                <p className="mt-2 text-2xl font-bold text-white">
                  {totalVisibleCount.toLocaleString()}
                </p>
                <p className="mt-1 text-sm text-blue-100/70">
                  Sum of all module counts
                </p>
              </div>
            </div>
          </div>
        </section>

        {loading && (
          <section className="rounded-3xl border border-blue-500/20 bg-[linear-gradient(180deg,rgba(12,18,34,0.98),rgba(6,10,22,0.98))] p-6 text-zinc-300">
            Loading live analytics...
          </section>
        )}

        {!loading && error && (
          <section className="rounded-3xl border border-red-500/20 bg-red-500/5 p-6 text-red-300">
            {error}
          </section>
        )}

        {!loading && !error && (
          <section className="rounded-3xl border border-blue-500/20 bg-[linear-gradient(180deg,rgba(12,18,34,0.98),rgba(6,10,22,0.98))] p-5 shadow-[0_0_35px_rgba(59,130,246,0.05)]">
            <div className="mb-4">
              <p className="text-sm uppercase tracking-[0.18em] text-cyan-300/70">
                Quick Module Switch
              </p>
              <h2 className="mt-2 text-2xl font-bold text-white">
                Change module without leaving this page
              </h2>
            </div>

            <div className="flex flex-wrap gap-3">
              {metrics.map((metric) => (
                <ModuleTab
                  key={metric.key}
                  metric={metric}
                  active={activeMetricObject?.key === metric.key}
                  onClick={() => setActiveMetric(metric.key)}
                />
              ))}
            </div>
          </section>
        )}

        {!loading && !error && (
          <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {metrics.map((metric) => (
              <StatCard
                key={metric.key}
                metric={metric}
                active={activeMetricObject?.key === metric.key}
                onClick={() => setActiveMetric(metric.key)}
              />
            ))}
          </section>
        )}

        {!loading && !error && activeMetricObject && (
          <ActiveMetricBar metric={activeMetricObject} allMetrics={metrics} />
        )}

        {!loading && !error && (
          <RealCountsComparison metrics={metrics} />
        )}

        {!loading && !error && (
          <section className="grid gap-8 xl:grid-cols-[1.15fr_0.85fr]">
            <div className="rounded-[30px] border border-blue-500/20 bg-[linear-gradient(180deg,rgba(10,15,28,0.98),rgba(6,10,20,0.98))] p-6 shadow-[0_0_40px_rgba(59,130,246,0.06)]">
              <div className="mb-6">
                <p className="text-sm uppercase tracking-[0.18em] text-cyan-300/70">
                  Live Visibility Logic
                </p>
                <h2 className="mt-2 text-2xl font-bold text-white">
                  Hidden Modules
                </h2>
              </div>

              {hiddenMetrics.length === 0 ? (
                <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-emerald-300">
                  All tracked modules currently have data.
                </div>
              ) : (
                <div className="flex flex-wrap gap-3">
                  {hiddenMetrics.map((item) => (
                    <div
                      key={item}
                      className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-zinc-300"
                    >
                      {item}
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm leading-7 text-zinc-400">
                  Modules with 0 records still appear so you can inspect them, but only live database counts are used in the charts above.
                </p>
              </div>
            </div>

            <div className="rounded-[30px] border border-blue-500/20 bg-[linear-gradient(180deg,rgba(10,15,28,0.98),rgba(6,10,20,0.98))] p-6 shadow-[0_0_40px_rgba(59,130,246,0.06)]">
              <div className="mb-6">
                <p className="text-sm uppercase tracking-[0.18em] text-cyan-300/70">
                  System Status
                </p>
                <h2 className="mt-2 text-2xl font-bold text-white">
                  Analytics Engine
                </h2>
              </div>

              <div className="space-y-4">
                <div className="rounded-2xl border border-cyan-400/15 bg-cyan-500/10 p-4">
                  <p className="text-sm text-cyan-100/80">Total cards</p>
                  <p className="mt-2 text-2xl font-bold text-white">
                    {metrics.length}
                  </p>
                </div>

                <div className="rounded-2xl border border-blue-400/15 bg-blue-500/10 p-4">
                  <p className="text-sm text-blue-100/80">Current module</p>
                  <p className="mt-2 text-2xl font-bold text-white">
                    {activeMetricObject.label}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-sm text-zinc-400">Last updated</p>
                  <p className="mt-2 text-base font-bold text-white">
                    {lastUpdated
                      ? new Date(lastUpdated).toLocaleString()
                      : "No timestamp"}
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  )
}