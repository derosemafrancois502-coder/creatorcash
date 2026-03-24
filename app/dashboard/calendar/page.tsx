"use client"

import { useEffect, useMemo, useState } from "react"
import { createClient } from "@/lib/supabase/client"

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
]

const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

type EventCategory = "holiday" | "content" | "business" | "payment" | "personal"

type CalendarEvent = {
  id: string
  title: string | null
  note: string | null
  event_time: string | null
  date_key: string | null
  category: EventCategory | null
  created_at: string | null
  user_id?: string | null
}

function buildMonthDays(year: number, month: number) {
  const firstDayOfMonth = new Date(year, month, 1)
  const lastDayOfMonth = new Date(year, month + 1, 0)

  const startDay = firstDayOfMonth.getDay()
  const daysInMonth = lastDayOfMonth.getDate()

  const days: (number | null)[] = []

  for (let i = 0; i < startDay; i++) {
    days.push(null)
  }

  for (let day = 1; day <= daysInMonth; day++) {
    days.push(day)
  }

  while (days.length % 7 !== 0) {
    days.push(null)
  }

  return days
}

function makeDateKey(year: number, month: number, day: number) {
  const mm = String(month + 1).padStart(2, "0")
  const dd = String(day).padStart(2, "0")
  return `${year}-${mm}-${dd}`
}

function getEventStyles(category?: EventCategory | null) {
  switch (category) {
    case "holiday":
      return "border-red-400/30 bg-red-500/15 text-red-200"
    case "content":
      return "border-sky-400/30 bg-sky-500/15 text-sky-200"
    case "business":
      return "border-yellow-400/30 bg-yellow-500/15 text-yellow-200"
    case "payment":
      return "border-emerald-400/30 bg-emerald-500/15 text-emerald-200"
    case "personal":
      return "border-zinc-500/30 bg-zinc-500/15 text-zinc-200"
    default:
      return "border-zinc-800 bg-zinc-900/80 text-zinc-200"
  }
}

const holidayMap: Record<string, string> = {
  "2026-01-01": "New Year's Day",
  "2026-01-19": "Martin Luther King Jr. Day",
  "2026-02-14": "Valentine's Day",
  "2026-02-16": "Presidents' Day",
  "2026-04-05": "Easter",
  "2026-05-10": "Mother's Day",
  "2026-05-25": "Memorial Day",
  "2026-06-19": "Juneteenth",
  "2026-06-21": "Father's Day",
  "2026-07-04": "Independence Day",
  "2026-09-07": "Labor Day",
  "2026-10-12": "Columbus Day",
  "2026-10-31": "Halloween",
  "2026-11-11": "Veterans Day",
  "2026-11-26": "Thanksgiving",
  "2026-12-24": "Christmas Eve",
  "2026-12-25": "Christmas Day",
  "2026-12-31": "New Year's Eve",
}

function getHolidayForDay(year: number, month: number, day: number) {
  const dateKey = makeDateKey(year, month, day)
  return holidayMap[dateKey] || null
}

export default function CalendarPage() {
  const supabase = useMemo(() => createClient(), [])
  const [today] = useState(() => new Date())

  const [selectedYear, setSelectedYear] = useState(today.getFullYear())
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth())
  const [selectedDay, setSelectedDay] = useState<number | null>(today.getDate())

  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)

  const [title, setTitle] = useState("")
  const [eventTime, setEventTime] = useState("")
  const [note, setNote] = useState("")
  const [category, setCategory] = useState<EventCategory>("business")

  async function getCurrentUserId() {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    return session?.user?.id || null
  }

  async function loadEvents() {
    setLoading(true)

    const userId = await getCurrentUserId()

    if (!userId) {
      alert("You must be logged in.")
      setLoading(false)
      return
    }

    const { data, error } = await supabase
      .from("events")
      .select("id, title, note, event_time, date_key, category, created_at, user_id")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Load events error:", error.message, error.details, error.hint)
      alert(`Failed to load events. ${error.message}`)
      setLoading(false)
      return
    }

    setEvents((data as CalendarEvent[]) || [])
    setLoading(false)
  }

  useEffect(() => {
    loadEvents()
  }, [])

  const years = useMemo(() => {
    const currentYear = today.getFullYear()
    const list: number[] = []
    for (let y = currentYear - 5; y <= currentYear + 5; y++) {
      list.push(y)
    }
    return list
  }, [today])

  function goToPreviousYear() {
    setSelectedYear((prev) => prev - 1)
  }

  function goToNextYear() {
    setSelectedYear((prev) => prev + 1)
  }

  function goToToday() {
    setSelectedYear(today.getFullYear())
    setSelectedMonth(today.getMonth())
    setSelectedDay(today.getDate())
  }

  function openDay(day: number) {
    setSelectedDay(day)
    setTitle("")
    setEventTime("")
    setNote("")
    setCategory("business")
  }

  async function addEvent(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    if (!selectedDay) return

    if (!title.trim()) {
      alert("Event title is required.")
      return
    }

    const userId = await getCurrentUserId()

    if (!userId) {
      alert("You must be logged in.")
      return
    }

    const date_key = makeDateKey(selectedYear, selectedMonth, selectedDay)

    const payload = {
      title: title.trim(),
      note: note.trim() || null,
      event_time: eventTime.trim() || null,
      date_key,
      category,
      created_at: new Date().toISOString(),
      user_id: userId,
    }

    const { error } = await supabase.from("events").insert([payload])

    if (error) {
      console.error("Add event error:", error.message, error.details, error.hint)
      alert(`Failed to save event. ${error.message}`)
      return
    }

    setTitle("")
    setEventTime("")
    setNote("")
    setCategory("business")

    await loadEvents()
  }

  async function deleteEvent(id: string) {
    const confirmed = window.confirm("Delete this event?")
    if (!confirmed) return

    const userId = await getCurrentUserId()

    if (!userId) {
      alert("You must be logged in.")
      return
    }

    const { error } = await supabase
      .from("events")
      .delete()
      .eq("id", id)
      .eq("user_id", userId)

    if (error) {
      console.error("Delete event error:", error.message, error.details, error.hint)
      alert(`Failed to delete event. ${error.message}`)
      return
    }

    await loadEvents()
  }

  const selectedDateKey =
    selectedDay !== null
      ? makeDateKey(selectedYear, selectedMonth, selectedDay)
      : null

  const selectedDayEvents = selectedDateKey
    ? events.filter((event) => event.date_key === selectedDateKey)
    : []

  function getEventsForDay(day: number) {
    const dateKey = makeDateKey(selectedYear, selectedMonth, day)
    return events.filter((event) => event.date_key === dateKey)
  }

  const stats = useMemo(() => {
    const total = events.length
    const business = events.filter((event) => event.category === "business").length
    const content = events.filter((event) => event.category === "content").length
    const payment = events.filter((event) => event.category === "payment").length
    const personal = events.filter((event) => event.category === "personal").length

    return { total, business, content, payment, personal }
  }, [events])

  return (
    <div className="min-h-screen bg-black px-6 py-8 text-white">
      <div className="mx-auto max-w-7xl space-y-8">
        <section className="rounded-3xl border border-yellow-500/20 bg-zinc-950 p-8 shadow-[0_0_40px_rgba(250,204,21,0.06)]">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center rounded-full border border-yellow-500/20 bg-yellow-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-yellow-300">
                CreatorGoat Calendar
              </div>

              <h1 className="text-4xl font-bold tracking-tight text-yellow-400">
                Calendar
              </h1>
              <p className="mt-2 text-zinc-400">
                Full year overview with holidays, events, planning, and premium monthly focus.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={goToToday}
                className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 px-4 py-2 text-sm font-medium text-yellow-300 transition hover:bg-yellow-500/20"
              >
                Today
              </button>

              <button
                onClick={goToPreviousYear}
                className="rounded-xl border border-zinc-700 px-4 py-2 text-sm font-medium text-white transition hover:border-yellow-400 hover:text-yellow-400"
              >
                Previous Year
              </button>

              <button
                onClick={goToNextYear}
                className="rounded-xl border border-zinc-700 px-4 py-2 text-sm font-medium text-white transition hover:border-yellow-400 hover:text-yellow-400"
              >
                Next Year
              </button>

              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="rounded-xl border border-zinc-700 bg-black px-4 py-2 text-sm text-white outline-none transition focus:border-yellow-400"
              >
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <div className="rounded-3xl border border-yellow-500/20 bg-zinc-950 p-5">
            <p className="text-sm text-zinc-500">Total Events</p>
            <p className="mt-2 text-3xl font-bold text-yellow-400">{stats.total}</p>
          </div>
          <div className="rounded-3xl border border-yellow-500/20 bg-zinc-950 p-5">
            <p className="text-sm text-zinc-500">Business</p>
            <p className="mt-2 text-3xl font-bold text-yellow-400">{stats.business}</p>
          </div>
          <div className="rounded-3xl border border-yellow-500/20 bg-zinc-950 p-5">
            <p className="text-sm text-zinc-500">Content</p>
            <p className="mt-2 text-3xl font-bold text-yellow-400">{stats.content}</p>
          </div>
          <div className="rounded-3xl border border-yellow-500/20 bg-zinc-950 p-5">
            <p className="text-sm text-zinc-500">Payments</p>
            <p className="mt-2 text-3xl font-bold text-yellow-400">{stats.payment}</p>
          </div>
          <div className="rounded-3xl border border-yellow-500/20 bg-zinc-950 p-5">
            <p className="text-sm text-zinc-500">Personal</p>
            <p className="mt-2 text-3xl font-bold text-yellow-400">{stats.personal}</p>
          </div>
        </section>

        <section className="rounded-3xl border border-yellow-500/20 bg-zinc-950 p-6 shadow-[0_0_40px_rgba(250,204,21,0.04)]">
          <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-3xl font-bold text-yellow-400">{selectedYear}</h2>
              <p className="mt-1 text-sm text-zinc-400">Full year calendar view</p>
            </div>

            <div className="rounded-full border border-zinc-800 bg-black/30 px-4 py-2 text-sm text-zinc-400">
              Selected:{" "}
              <span className="font-semibold text-yellow-400">
                {monthNames[selectedMonth]}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            {monthNames.map((monthName, monthIndex) => {
              const days = buildMonthDays(selectedYear, monthIndex)

              return (
                <button
                  key={monthName}
                  type="button"
                  onClick={() => setSelectedMonth(monthIndex)}
                  className={`rounded-2xl border p-4 text-left transition ${
                    selectedMonth === monthIndex
                      ? "border-yellow-400 bg-gradient-to-br from-yellow-500/15 to-yellow-400/5 shadow-[0_0_24px_rgba(250,204,21,0.08)]"
                      : "border-zinc-800 bg-black/20 hover:border-yellow-500/40"
                  }`}
                >
                  <div className="mb-3 flex items-center justify-between">
                    <h3
                      className={`text-xl font-semibold ${
                        selectedMonth === monthIndex ? "text-yellow-400" : "text-white"
                      }`}
                    >
                      {monthName}
                    </h3>

                    <span className="rounded-md bg-zinc-900 px-2 py-1 text-xs text-zinc-500">
                      {selectedYear}
                    </span>
                  </div>

                  <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-medium text-zinc-500">
                    {dayNames.map((day) => (
                      <div key={day}>{day[0]}</div>
                    ))}
                  </div>

                  <div className="mt-2 grid grid-cols-7 gap-1">
                    {days.slice(0, 14).map((day, index) => {
                      const isToday =
                        day &&
                        today.getDate() === day &&
                        today.getMonth() === monthIndex &&
                        today.getFullYear() === selectedYear

                      const previewEvents = day
                        ? events.filter(
                            (event) =>
                              event.date_key ===
                              makeDateKey(selectedYear, monthIndex, day)
                          )
                        : []

                      const holidayName = day
                        ? getHolidayForDay(selectedYear, monthIndex, day)
                        : null

                      return (
                        <div
                          key={index}
                          className={`relative flex h-9 items-center justify-center rounded text-xs ${
                            day
                              ? isToday
                                ? "bg-yellow-400/20 font-semibold text-yellow-300"
                                : holidayName
                                  ? "bg-red-500/10 font-semibold text-red-200"
                                  : "text-zinc-300"
                              : "text-transparent"
                          }`}
                        >
                          {day || "."}

                          {day && holidayName && (
                            <span className="absolute bottom-1 h-1.5 w-1.5 rounded-full bg-red-400" />
                          )}

                          {day && !holidayName && previewEvents.length > 0 && (
                            <span className="absolute bottom-1 h-1.5 w-1.5 rounded-full bg-fuchsia-400" />
                          )}
                        </div>
                      )
                    })}
                  </div>
                </button>
              )
            })}
          </div>
        </section>

        <section className="grid gap-8 xl:grid-cols-[1.5fr_0.9fr]">
          <div className="rounded-3xl border border-yellow-500/20 bg-zinc-950 p-6 shadow-[0_0_40px_rgba(250,204,21,0.04)]">
            <div className="mb-6 text-center">
              <div className="mb-3 inline-flex items-center rounded-full border border-yellow-500/20 bg-yellow-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-yellow-300">
                Monthly Focus
              </div>

              <h2 className="text-4xl font-bold text-yellow-400">
                {monthNames[selectedMonth]} {selectedYear}
              </h2>
              <p className="mt-2 text-sm text-zinc-400">
                Detailed month view with holidays and saved events
              </p>
            </div>

            <div className="grid grid-cols-7 gap-3 text-center text-sm font-semibold text-zinc-500">
              {dayNames.map((day) => (
                <div key={day}>{day}</div>
              ))}
            </div>

            <div className="mt-4 grid grid-cols-7 gap-3">
              {buildMonthDays(selectedYear, selectedMonth).map((day, index) => {
                const isToday =
                  day &&
                  today.getDate() === day &&
                  today.getMonth() === selectedMonth &&
                  today.getFullYear() === selectedYear

                const isSelected = day && selectedDay === day
                const dayEvents = day ? getEventsForDay(day) : []
                const holidayName = day
                  ? getHolidayForDay(selectedYear, selectedMonth, day)
                  : null

                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => day && openDay(day)}
                    className={`min-h-[150px] rounded-2xl border p-3 text-left transition ${
                      day
                        ? isSelected
                          ? "border-yellow-400 bg-yellow-400/10 shadow-[0_0_18px_rgba(250,204,21,0.08)]"
                          : isToday
                            ? "border-yellow-400 bg-gradient-to-br from-yellow-500/12 to-yellow-400/5 text-yellow-300"
                            : holidayName
                              ? "border-red-400/30 bg-red-500/[0.06] text-white"
                              : "border-zinc-800 bg-black/20 text-white hover:border-zinc-700"
                        : "border-transparent bg-transparent"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-h-[22px]">
                        {holidayName ? (
                          <span className="inline-flex rounded-full border border-red-400/30 bg-red-500/15 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-red-200">
                            Holiday
                          </span>
                        ) : dayEvents.length > 0 ? (
                          <span className="inline-flex rounded-full border border-fuchsia-400/20 bg-fuchsia-500/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-fuchsia-200">
                            {dayEvents.length} event{dayEvents.length > 1 ? "s" : ""}
                          </span>
                        ) : null}
                      </div>

                      {day ? (
                        isToday ? (
                          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-yellow-400 text-lg font-bold text-black shadow-md">
                            {day}
                          </span>
                        ) : holidayName ? (
                          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-red-600 text-lg font-bold text-white shadow-sm">
                            {day}
                          </span>
                        ) : (
                          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-800 text-lg font-bold text-white shadow-sm">
                            {day}
                          </span>
                        )
                      ) : null}
                    </div>

                    {isToday && (
                      <div className="mt-3">
                        <span className="inline-flex rounded-full border border-yellow-500/30 bg-yellow-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-yellow-300">
                          Today
                        </span>
                      </div>
                    )}

                    {(holidayName || dayEvents.length > 0) && (
                      <div className="mt-3 space-y-2">
                        {holidayName && (
                          <div className="rounded-full border border-red-400/30 bg-red-500/15 px-3 py-1 text-[11px] text-red-200">
                            🎉 {holidayName}
                          </div>
                        )}

                        {dayEvents.slice(0, 3).map((event) => (
                          <div
                            key={event.id}
                            className={`rounded-full border px-3 py-1 text-[11px] ${getEventStyles(
                              event.category
                            )}`}
                          >
                            <div className="truncate font-medium">
                              {event.event_time
                                ? `${event.event_time} • ${event.title || "Untitled Event"}`
                                : event.title || "Untitled Event"}
                            </div>
                          </div>
                        ))}

                        {dayEvents.length > 3 && (
                          <div className="pl-1 text-xs text-zinc-500">
                            +{dayEvents.length - 3} more
                          </div>
                        )}
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="rounded-3xl border border-yellow-500/20 bg-zinc-950 p-6 shadow-[0_0_40px_rgba(250,204,21,0.04)]">
            <h2 className="text-2xl font-bold text-yellow-400">Day Planner</h2>
            <p className="mt-2 text-sm text-zinc-400">
              Click a day and add what you need to do.
            </p>

            <div className="mt-6 rounded-2xl border border-zinc-800 bg-black/20 p-4">
              <p className="text-sm text-zinc-500">Selected Day</p>
              <p className="mt-2 text-xl font-bold text-white">
                {selectedDay
                  ? `${monthNames[selectedMonth]} ${selectedDay}, ${selectedYear}`
                  : "No day selected"}
              </p>
              {selectedDay && getHolidayForDay(selectedYear, selectedMonth, selectedDay) && (
                <p className="mt-2 text-sm font-medium text-red-300">
                  🎉 {getHolidayForDay(selectedYear, selectedMonth, selectedDay)}
                </p>
              )}
            </div>

            <form onSubmit={addEvent} className="mt-6 space-y-4">
              <input
                type="text"
                placeholder="Event title (Doctor appointment)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-xl border border-zinc-700 bg-zinc-900 p-3 text-white outline-none transition focus:border-yellow-400"
              />

              <input
                type="text"
                placeholder="Time (2:00 PM)"
                value={eventTime}
                onChange={(e) => setEventTime(e.target.value)}
                className="w-full rounded-xl border border-zinc-700 bg-zinc-900 p-3 text-white outline-none transition focus:border-yellow-400"
              />

              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as EventCategory)}
                className="w-full rounded-xl border border-zinc-700 bg-zinc-900 p-3 text-white outline-none transition focus:border-yellow-400"
              >
                <option value="business">Business</option>
                <option value="content">Content</option>
                <option value="payment">Payment</option>
                <option value="personal">Personal</option>
                <option value="holiday">Holiday</option>
              </select>

              <textarea
                placeholder="Note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="min-h-[120px] w-full rounded-xl border border-zinc-700 bg-zinc-900 p-3 text-white outline-none transition focus:border-yellow-400"
              />

              <button
                type="submit"
                disabled={!selectedDay}
                className="w-full rounded-xl bg-yellow-500 px-5 py-3 font-semibold text-black transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Add Event
              </button>
            </form>

            <div className="mt-8">
              <h3 className="text-lg font-semibold text-yellow-400">Events</h3>

              <div className="mt-4 space-y-3">
                {loading ? (
                  <div className="rounded-2xl border border-zinc-800 bg-black/20 p-4 text-sm text-zinc-500">
                    Loading events...
                  </div>
                ) : selectedDayEvents.length === 0 &&
                  !(
                    selectedDay &&
                    getHolidayForDay(selectedYear, selectedMonth, selectedDay)
                  ) ? (
                  <div className="rounded-2xl border border-zinc-800 bg-black/20 p-4 text-sm text-zinc-500">
                    No events for this day.
                  </div>
                ) : (
                  <>
                    {selectedDay &&
                      getHolidayForDay(selectedYear, selectedMonth, selectedDay) && (
                        <div className="rounded-2xl border border-red-400/30 bg-red-500/15 p-4 text-red-200">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-sm font-semibold">Holiday</p>
                              <h4 className="mt-1 text-base font-bold">
                                🎉 {getHolidayForDay(selectedYear, selectedMonth, selectedDay)}
                              </h4>
                              <p className="mt-2 text-sm opacity-90">
                                This day is marked automatically as a holiday.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                    {selectedDayEvents.map((event) => (
                      <div
                        key={event.id}
                        className={`rounded-2xl border p-4 ${getEventStyles(
                          event.category
                        )}`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold">
                              {event.event_time || "No time"}
                            </p>

                            <h4 className="mt-1 text-base font-bold">
                              {event.title || "Untitled Event"}
                            </h4>

                            <p className="mt-2 text-sm opacity-90">
                              {event.note || "No note"}
                            </p>

                            <p className="mt-3 text-[11px] uppercase tracking-[0.14em] opacity-70">
                              {event.category || "general"}
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() => deleteEvent(event.id)}
                            className="rounded-xl border border-red-500/30 px-3 py-2 text-sm font-medium text-red-300"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>

            <div className="mt-8 rounded-2xl border border-yellow-500/20 bg-yellow-500/5 p-4 text-sm text-zinc-300">
              Calendar events are stored in Supabase, and holidays are marked automatically.
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}