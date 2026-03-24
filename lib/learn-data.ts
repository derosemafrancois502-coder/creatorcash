export type LearnType =
  | "module"
  | "learningPath"
  | "course"
  | "certification"
  | "exam"

export type LearnItem = {
  id: string
  slug: string
  title: string
  summary: string
  type: LearnType | string
  level: string
  provider: string
  durationInMinutes: number
  locale: string
  url: string
  imageUrl?: string
  videoPreviewUrl?: string
  products: string[]
  roles: string[]
}

export type LearnApiResponse = {
  items: LearnItem[]
  source: string
}

export function formatDuration(minutes: number) {
  if (!minutes || minutes <= 0) return "Self-paced"

  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60

  if (hours > 0 && remainingMinutes > 0) {
    return `${hours}h ${remainingMinutes}m`
  }

  if (hours > 0) {
    return `${hours}h`
  }

  return `${minutes}m`
}

export function getLearnTypeLabel(type: string) {
  switch (type) {
    case "module":
      return "Module"
    case "learningPath":
      return "Learning Path"
    case "course":
      return "Course"
    case "certification":
      return "Certification"
    case "exam":
      return "Exam"
    default:
      return "Learning"
  }
}

export function getTypeBadgeColor(type: string) {
  switch (type) {
    case "module":
      return "border-cyan-400/30 bg-cyan-400/10 text-cyan-200"
    case "learningPath":
      return "border-blue-400/30 bg-blue-400/10 text-blue-200"
    case "course":
      return "border-violet-400/30 bg-violet-400/10 text-violet-200"
    case "certification":
      return "border-amber-400/30 bg-amber-400/10 text-amber-200"
    case "exam":
      return "border-rose-400/30 bg-rose-400/10 text-rose-200"
    default:
      return "border-white/20 bg-white/[0.06] text-zinc-200"
  }
}

export function getLevelBadgeColor(level: string) {
  const normalized = level.toLowerCase()

  if (normalized.includes("beginner")) {
    return "border-emerald-400/30 bg-emerald-400/10 text-emerald-200"
  }

  if (normalized.includes("intermediate")) {
    return "border-yellow-400/30 bg-yellow-400/10 text-yellow-200"
  }

  if (normalized.includes("advanced")) {
    return "border-red-400/30 bg-red-400/10 text-red-200"
  }

  return "border-white/20 bg-white/[0.06] text-zinc-200"
}

export function getFallbackLearnImage(_type?: string) {
  return ""
}

export const fallbackLearnCatalog: LearnItem[] = [
  {
    id: "module-azure-1",
    slug: "azure-fundamentals-module",
    title: "Azure Fundamentals Module",
    summary:
      "Learn core cloud concepts, Azure services, pricing, governance, and foundational Microsoft Azure knowledge.",
    type: "module",
    level: "Beginner",
    provider: "Microsoft Learn",
    durationInMinutes: 45,
    locale: "en-us",
    url: "https://learn.microsoft.com/",
    imageUrl: "",
    videoPreviewUrl: "",
    products: ["Azure"],
    roles: ["Administrator"],
  },
  {
    id: "learning-path-azure-1",
    slug: "azure-learning-path",
    title: "Azure Learning Path",
    summary:
      "A structured learning path to build your Azure foundation step by step with guided content progression.",
    type: "learningPath",
    level: "Beginner",
    provider: "Microsoft Learn",
    durationInMinutes: 180,
    locale: "en-us",
    url: "https://learn.microsoft.com/",
    imageUrl: "",
    videoPreviewUrl: "",
    products: ["Azure"],
    roles: ["Developer"],
  },
  {
    id: "course-azure-1",
    slug: "azure-course",
    title: "Azure Course",
    summary:
      "A full course experience for Azure learners focused on practical cloud skills, services, and deployment understanding.",
    type: "course",
    level: "Intermediate",
    provider: "Microsoft Learn",
    durationInMinutes: 240,
    locale: "en-us",
    url: "https://learn.microsoft.com/",
    imageUrl: "",
    videoPreviewUrl: "",
    products: ["Azure"],
    roles: ["Solution Architect"],
  },
  {
    id: "cert-azure-1",
    slug: "azure-certification",
    title: "Azure Certification Prep",
    summary:
      "Certification-focused learning content for Azure preparation with structured study direction and exam-aligned topics.",
    type: "certification",
    level: "Intermediate",
    provider: "Microsoft Learn",
    durationInMinutes: 300,
    locale: "en-us",
    url: "https://learn.microsoft.com/",
    imageUrl: "",
    videoPreviewUrl: "",
    products: ["Azure"],
    roles: ["Administrator"],
  },
  {
    id: "exam-azure-1",
    slug: "azure-exam-prep",
    title: "Azure Exam Prep",
    summary:
      "Prepare for Azure exam objectives with focused review content, practice structure, and guided technical reinforcement.",
    type: "exam",
    level: "Advanced",
    provider: "Microsoft Learn",
    durationInMinutes: 120,
    locale: "en-us",
    url: "https://learn.microsoft.com/",
    imageUrl: "",
    videoPreviewUrl: "",
    products: ["Azure"],
    roles: ["Engineer"],
  },
  {
    id: "module-linux-1",
    slug: "linux-basics-module",
    title: "Linux Basics Module",
    summary:
      "Build Linux terminal confidence with command line basics, navigation, permissions, files, and system fundamentals.",
    type: "module",
    level: "Beginner",
    provider: "Microsoft Learn",
    durationInMinutes: 50,
    locale: "en-us",
    url: "https://learn.microsoft.com/",
    imageUrl: "",
    videoPreviewUrl: "",
    products: ["Linux"],
    roles: ["Administrator"],
  },
  {
    id: "learning-path-security-1",
    slug: "cybersecurity-learning-path",
    title: "Cybersecurity Learning Path",
    summary:
      "Structured learning path covering security foundations, identity, protection principles, and operational awareness.",
    type: "learningPath",
    level: "Intermediate",
    provider: "Microsoft Learn",
    durationInMinutes: 220,
    locale: "en-us",
    url: "https://learn.microsoft.com/",
    imageUrl: "",
    videoPreviewUrl: "",
    products: ["Security"],
    roles: ["Security Engineer"],
  },
  {
    id: "course-ai-1",
    slug: "ai-foundations-course",
    title: "AI Foundations Course",
    summary:
      "Understand core AI concepts, workloads, responsible AI principles, and modern technical use cases.",
    type: "course",
    level: "Beginner",
    provider: "Microsoft Learn",
    durationInMinutes: 160,
    locale: "en-us",
    url: "https://learn.microsoft.com/",
    imageUrl: "",
    videoPreviewUrl: "",
    products: ["AI"],
    roles: ["Developer"],
  },
]

export function searchFallbackLearnCatalog(params?: {
  q?: string
  type?: string
  limit?: number
}): LearnItem[] {
  const query = (params?.q || "").trim().toLowerCase()
  const type = (params?.type || "").trim().toLowerCase()
  const limit = params?.limit ?? 24

  let results = fallbackLearnCatalog.filter((item) => {
    const typeMatch = !type || item.type.toLowerCase() === type

    const haystack = [
      item.title,
      item.summary,
      item.type,
      item.level,
      item.provider,
      item.locale,
      ...item.products,
      ...item.roles,
    ]
      .join(" ")
      .toLowerCase()

    const queryMatch = !query || haystack.includes(query)

    return typeMatch && queryMatch
  })

  if (query) {
    results = results.sort((a, b) => {
      const aScore =
        (a.title.toLowerCase().includes(query) ? 3 : 0) +
        (a.summary.toLowerCase().includes(query) ? 2 : 0) +
        (a.products.join(" ").toLowerCase().includes(query) ? 1 : 0)

      const bScore =
        (b.title.toLowerCase().includes(query) ? 3 : 0) +
        (b.summary.toLowerCase().includes(query) ? 2 : 0) +
        (b.products.join(" ").toLowerCase().includes(query) ? 1 : 0)

      return bScore - aScore
    })
  }

  return results.slice(0, limit)
}