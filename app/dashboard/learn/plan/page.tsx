"use client"

import Link from "next/link"
import {
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  FolderHeart,
  Goal,
  PlayCircle,
  Sparkles,
  Target,
  Trophy,
} from "lucide-react"

const weeklyPlan = [
  {
    day: "Monday",
    focus: "Linux Fundamentals",
    goal: "Finish terminal basics + file navigation",
    duration: "45 min",
    status: "today",
  },
  {
    day: "Tuesday",
    focus: "Networking Basics",
    goal: "Study IP addressing + subnet basics",
    duration: "45 min",
    status: "upcoming",
  },
  {
    day: "Wednesday",
    focus: "Cloud Computing",
    goal: "Understand IaaS, PaaS, SaaS",
    duration: "45 min",
    status: "upcoming",
  },
  {
    day: "Thursday",
    focus: "Cybersecurity Foundations",
    goal: "Review threat types + identity basics",
    duration: "45 min",
    status: "upcoming",
  },
  {
    day: "Friday",
    focus: "AI for Productivity",
    goal: "Apply AI workflows to creator/business work",
    duration: "30 min",
    status: "upcoming",
  },
]

const milestones = [
  {
    title: "Finish Linux Fundamentals",
    description: "Complete command line, permissions, and filesystem core lessons.",
    progress: 72,
  },
  {
    title: "Start Networking Path",
    description: "Build stronger infrastructure and troubleshooting foundations.",
    progress: 20,
  },
  {
    title: "Save 10 high-value courses",
    description: "Create a serious learning vault for long-term growth.",
    progress: 60,
  },
]

export default function LearningPlanPage() {
  return (
    <div className="min-h-screen w-full bg-[#050816] text-white">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-6 md:px-6 xl:px-8">
        <section className="relative overflow-hidden rounded-[34px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.14),transparent_28%),radial-gradient(circle_at_top_right,rgba(59,130,246,0.14),transparent_22%),linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] p-6 md:p-8 xl:p-10">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:38px_38px] opacity-20" />

          <div className="relative z-10 grid gap-8 xl:grid-cols-[1.3fr_0.7fr] xl:items-end">
            <div className="space-y-5">
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-200">
                <Goal className="h-4 w-4" />
                Structured Growth System
              </div>

              <div>
                <h1 className="text-4xl font-semibold tracking-tight md:text-5xl xl:text-6xl">
                  My Learning Plan
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-zinc-300 md:text-base">
                  Turn random learning into a real system. Focus by week, track
                  milestones, and compound your technical growth with intention.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  href="/dashboard/learn"
                  className="inline-flex items-center gap-2 rounded-2xl bg-cyan-400 px-5 py-3 text-sm font-semibold text-black transition hover:scale-[1.02]"
                >
                  Back to Learn
                  <ChevronRight className="h-4 w-4" />
                </Link>

                <Link
                  href="/dashboard/learn/saved"
                  className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-3 text-sm text-white transition hover:bg-white/[0.08]"
                >
                  Open Saved Courses
                  <FolderHeart className="h-4 w-4" />
                </Link>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
              <div className="rounded-3xl border border-white/10 bg-black/20 p-5 backdrop-blur-md">
                <p className="text-sm text-zinc-400">Weekly Focus</p>
                <h3 className="mt-2 text-xl font-semibold">Linux + Networking</h3>
                <p className="mt-2 text-sm text-zinc-400">
                  Build the core stack first, then expand into cloud and security.
                </p>
              </div>

              <div className="rounded-3xl border border-white/10 bg-black/20 p-5 backdrop-blur-md">
                <p className="text-sm text-zinc-400">Target</p>
                <h3 className="mt-2 text-xl font-semibold">
                  30–45 min per day
                </h3>
                <p className="mt-2 text-sm text-zinc-400">
                  Small daily progress beats random heavy sessions.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
            <div className="mb-4 flex items-center justify-between">
              <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-3 text-cyan-300">
                <CalendarDays className="h-5 w-5" />
              </div>
            </div>
            <p className="text-sm text-zinc-400">Plan Days</p>
            <h3 className="mt-1 text-3xl font-semibold">5</h3>
            <p className="text-xs text-zinc-500">Structured weekday focus</p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
            <div className="mb-4 flex items-center justify-between">
              <div className="rounded-2xl border border-green-400/20 bg-green-400/10 p-3 text-green-300">
                <CheckCircle2 className="h-5 w-5" />
              </div>
            </div>
            <p className="text-sm text-zinc-400">Completed</p>
            <h3 className="mt-1 text-3xl font-semibold">12</h3>
            <p className="text-xs text-zinc-500">Lessons already done</p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
            <div className="mb-4 flex items-center justify-between">
              <div className="rounded-2xl border border-yellow-400/20 bg-yellow-400/10 p-3 text-yellow-300">
                <Target className="h-5 w-5" />
              </div>
            </div>
            <p className="text-sm text-zinc-400">Milestones</p>
            <h3 className="mt-1 text-3xl font-semibold">3</h3>
            <p className="text-xs text-zinc-500">Main goals in motion</p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
            <div className="mb-4 flex items-center justify-between">
              <div className="rounded-2xl border border-pink-400/20 bg-pink-400/10 p-3 text-pink-300">
                <Trophy className="h-5 w-5" />
              </div>
            </div>
            <p className="text-sm text-zinc-400">Consistency</p>
            <h3 className="mt-1 text-3xl font-semibold">12d</h3>
            <p className="text-xs text-zinc-500">Current learning streak</p>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[30px] border border-white/10 bg-white/[0.03] p-5 md:p-6">
            <div className="mb-5">
              <h2 className="text-2xl font-semibold tracking-tight">
                Weekly Learning Schedule
              </h2>
              <p className="mt-1 text-sm text-zinc-400">
                A premium structure to keep your progress intentional.
              </p>
            </div>

            <div className="space-y-4">
              {weeklyPlan.map((item) => (
                <div
                  key={item.day}
                  className={`rounded-[24px] border p-4 transition ${
                    item.status === "today"
                      ? "border-cyan-400/30 bg-cyan-400/10"
                      : "border-white/10 bg-white/[0.03]"
                  }`}
                >
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="mb-2 flex items-center gap-2">
                        <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-zinc-300">
                          {item.day}
                        </span>
                        {item.status === "today" && (
                          <span className="rounded-full border border-cyan-400/20 bg-cyan-400/15 px-3 py-1 text-xs text-cyan-200">
                            Today
                          </span>
                        )}
                      </div>

                      <h3 className="text-lg font-semibold">{item.focus}</h3>
                      <p className="mt-1 text-sm text-zinc-400">{item.goal}</p>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-zinc-300">
                      <span className="inline-flex items-center gap-2">
                        <Clock3 className="h-4 w-4" />
                        {item.duration}
                      </span>
                    </div>
                  </div>

                  <button className="inline-flex items-center gap-2 rounded-2xl bg-cyan-400 px-4 py-2 text-sm font-medium text-black">
                    <PlayCircle className="h-4 w-4" />
                    Start Focus Session
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-[30px] border border-white/10 bg-white/[0.03] p-5 md:p-6">
              <div className="mb-5">
                <h2 className="text-2xl font-semibold tracking-tight">
                  Milestones
                </h2>
                <p className="mt-1 text-sm text-zinc-400">
                  Clear targets keep your momentum measurable.
                </p>
              </div>

              <div className="space-y-4">
                {milestones.map((item) => (
                  <div
                    key={item.title}
                    className="rounded-[24px] border border-white/10 bg-white/[0.03] p-4"
                  >
                    <h3 className="text-lg font-semibold">{item.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-zinc-400">
                      {item.description}
                    </p>

                    <div className="mt-4">
                      <div className="mb-2 flex items-center justify-between text-xs text-zinc-500">
                        <span>Progress</span>
                        <span>{item.progress}%</span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500"
                          style={{ width: `${item.progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(34,211,238,0.08),rgba(255,255,255,0.03))] p-5 md:p-6">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-200">
                <Sparkles className="h-4 w-4" />
                CEO Reminder
              </div>

              <h2 className="text-2xl font-semibold tracking-tight">
                Learn with structure, not emotion
              </h2>
              <p className="mt-3 text-sm leading-7 text-zinc-300">
                Don’t study randomly. Build a stack. Linux strengthens systems
                thinking, networking strengthens infrastructure logic, cloud
                expands deployment thinking, and security protects the whole
                system.
              </p>

              <div className="mt-5">
                <button className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm text-white transition hover:bg-white/[0.08]">
                  Update Learning Plan
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}