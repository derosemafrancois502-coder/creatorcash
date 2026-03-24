import {
  fallbackLearnItems,
  mapMicrosoftLearnItem,
  type LearnApiResponse,
  type LearnItem,
} from "@/lib/learn-data"

type MicrosoftLearnAccessTokenResponse = {
  token_type: string
  expires_in: number
  access_token: string
}

type SearchMicrosoftLearnOptions = {
  query?: string
  type?: string
  limit?: number
  locale?: string
}

type LearnItemWithExtras = LearnItem & {
  skills?: string[]
  provider?: string
  type?: string
  level?: string
  locale?: string
  products?: string[]
  roles?: string[]
}

const MICROSOFT_LEARN_BASE_URL =
  process.env.MICROSOFT_LEARN_BASE_URL || "https://learn.microsoft.com/api/v1"

const MICROSOFT_LEARN_API_VERSION =
  process.env.MICROSOFT_LEARN_API_VERSION || "2023-11-01-preview"

const MICROSOFT_LEARN_TENANT_ID = process.env.MICROSOFT_LEARN_TENANT_ID || ""
const MICROSOFT_LEARN_CLIENT_ID = process.env.MICROSOFT_LEARN_CLIENT_ID || ""
const MICROSOFT_LEARN_CLIENT_SECRET =
  process.env.MICROSOFT_LEARN_CLIENT_SECRET || ""

const MICROSOFT_LEARN_SCOPE =
  process.env.MICROSOFT_LEARN_SCOPE || "https://learn.microsoft.com/.default"

let cachedToken: { value: string; expiresAt: number } | null = null

function hasMicrosoftCredentials() {
  return Boolean(
    MICROSOFT_LEARN_TENANT_ID &&
      MICROSOFT_LEARN_CLIENT_ID &&
      MICROSOFT_LEARN_CLIENT_SECRET
  )
}

async function getMicrosoftLearnAccessToken() {
  if (!hasMicrosoftCredentials()) {
    throw new Error("Missing Microsoft Learn credentials in .env.local")
  }

  const now = Date.now()

  if (cachedToken && cachedToken.expiresAt > now + 60_000) {
    return cachedToken.value
  }

  const tokenUrl = `https://login.microsoftonline.com/${MICROSOFT_LEARN_TENANT_ID}/oauth2/v2.0/token`

  const body = new URLSearchParams({
    client_id: MICROSOFT_LEARN_CLIENT_ID,
    client_secret: MICROSOFT_LEARN_CLIENT_SECRET,
    scope: MICROSOFT_LEARN_SCOPE,
    grant_type: "client_credentials",
  })

  const res = await fetch(tokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
    cache: "no-store",
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Token request failed: ${res.status} ${text}`)
  }

  const data = (await res.json()) as MicrosoftLearnAccessTokenResponse

  cachedToken = {
    value: data.access_token,
    expiresAt: now + data.expires_in * 1000,
  }

  return data.access_token
}

function getEndpointByType(type?: string) {
  switch (type) {
    case "module":
      return "modules"
    case "learningPath":
      return "learningPaths"
    case "course":
      return "courses"
    case "certification":
      return "credentials"
    case "exam":
      return "exams"
    default:
      return "modules"
  }
}

function buildMicrosoftLearnUrl(options?: SearchMicrosoftLearnOptions) {
  const endpoint = getEndpointByType(options?.type)
  const url = new URL(`${MICROSOFT_LEARN_BASE_URL}/${endpoint}`)

  url.searchParams.set("api-version", MICROSOFT_LEARN_API_VERSION)
  url.searchParams.set("locale", options?.locale || "en-us")
  url.searchParams.set("top", String(options?.limit || 12))

  if (options?.query?.trim()) {
    url.searchParams.set("search", options.query.trim())
  }

  return url.toString()
}

function normalizeMicrosoftItems(data: unknown): unknown[] {
  if (Array.isArray(data)) return data

  if (
    data &&
    typeof data === "object" &&
    "value" in data &&
    Array.isArray((data as { value?: unknown[] }).value)
  ) {
    return (data as { value: unknown[] }).value
  }

  if (
    data &&
    typeof data === "object" &&
    "items" in data &&
    Array.isArray((data as { items?: unknown[] }).items)
  ) {
    return (data as { items: unknown[] }).items
  }

  if (
    data &&
    typeof data === "object" &&
    "results" in data &&
    Array.isArray((data as { results?: unknown[] }).results)
  ) {
    return (data as { results: unknown[] }).results
  }

  return []
}

function readStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : []
}

function applyLearnFilters(
  items: LearnItem[],
  options?: { query?: string; type?: string }
): LearnItem[] {
  const query = options?.query?.trim().toLowerCase() || ""
  const type = options?.type?.trim() || ""

  return items.filter((item) => {
    const safeItem = item as LearnItemWithExtras
    const matchesType = type ? safeItem.type === type : true

    const haystack = [
      safeItem.title,
      safeItem.summary,
      safeItem.provider,
      safeItem.type,
      safeItem.level,
      safeItem.locale,
      ...readStringArray(safeItem.products),
      ...readStringArray(safeItem.roles),
      ...readStringArray(safeItem.skills),
    ]
      .filter(
        (value): value is string =>
          typeof value === "string" && value.length > 0
      )
      .join(" ")
      .toLowerCase()

    const matchesQuery = query ? haystack.includes(query) : true

    return matchesType && matchesQuery
  })
}

export async function fetchMicrosoftLearnItems(
  options?: SearchMicrosoftLearnOptions
): Promise<LearnItem[]> {
  const token = await getMicrosoftLearnAccessToken()
  const url = buildMicrosoftLearnUrl(options)

  console.log("MICROSOFT LEARN URL:", url)

  const res = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
    cache: "no-store",
  })

  if (!res.ok) {
    const text = await res.text()
    console.error("MICROSOFT LEARN ERROR:", text)
    throw new Error(`Microsoft Learn fetch failed: ${res.status} ${text}`)
  }

  const data = await res.json()
  const rawItems = normalizeMicrosoftItems(data)

  console.log("MICROSOFT LEARN RAW COUNT:", rawItems.length)

  return rawItems.map((item) => mapMicrosoftLearnItem(item))
}

export async function getLearnCatalog(
  options?: SearchMicrosoftLearnOptions
): Promise<LearnApiResponse> {
  const query = options?.query?.trim() || ""
  const type = options?.type?.trim() || ""

  if (!hasMicrosoftCredentials()) {
    const fallback = applyLearnFilters(fallbackLearnItems, { query, type })

    return {
      items: fallback,
      source: "fallback",
    }
  }

  const liveItems = await fetchMicrosoftLearnItems({
    query,
    type,
    limit: options?.limit || 12,
    locale: options?.locale || "en-us",
  })

  const filtered = applyLearnFilters(liveItems, { query, type })

  return {
    items: filtered,
    source: "microsoft-learn",
  }
}

export async function getLearnItemBySlugFromSource(
  slug: string,
  options?: SearchMicrosoftLearnOptions
) {
  const catalog = await getLearnCatalog(options)
  return catalog.items.find((item) => item.slug === slug) || null
}