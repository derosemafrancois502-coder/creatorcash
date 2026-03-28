"use client"

import { useEffect, useRef, useState } from "react"
import { createClient } from "@/lib/supabase/client"

const languages = [
  "English",
  "French",
  "Spanish",
  "Portuguese",
  "Arabic",
  "Hindi",
  "Creole",
]

const luxuryVideos = [
  { src: "/hero-rolls.mp4" },
  { src: "/hero-lambo.mp4" },
  { src: "/hero-mercedes.mp4" },
  { src: "/hero-yacht.mp4" },
]

function extractSection(text: string, label: string) {
  const regex = new RegExp(`${label}:\\s*([\\s\\S]*?)(?:\\n[A-Z ]+?:|$)`, "i")
  const match = text.match(regex)
  return match ? match[1].trim() : ""
}

function extractScenes(text: string) {
  const match = text.match(/SCENES:\s*([\s\S]*?)(?:\n[A-Z ]+?:|$)/i)

  if (!match || !match[1]) return []

  return match[1]
    .split("\n")
    .map((line) => line.replace(/^\d+\.\s*/, "").trim())
    .filter(Boolean)
}

function HeroStatCard({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="rounded-3xl border border-yellow-500/20 bg-zinc-950/80 p-5 backdrop-blur-sm">
      <p className="text-sm text-zinc-500">{label}</p>
      <p className="mt-2 text-2xl font-bold text-yellow-400">{value}</p>
    </div>
  )
}

function LuxuryHeroVisual() {
  return (
    <div className="relative h-[440px] overflow-hidden rounded-[32px] border border-yellow-500/20 bg-black">
      <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 gap-2 p-2">
        {luxuryVideos.map((item) => (
          <div
            key={item.src}
            className="relative overflow-hidden rounded-[24px] border border-white/10 bg-zinc-900"
          >
            <video
              key={item.src}
              src={item.src}
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              className="h-full w-full object-cover"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
          </div>
        ))}
      </div>

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(250,204,21,0.12),transparent_35%)]" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-yellow-500/10 blur-3xl" />

      <div className="pointer-events-none absolute left-1/2 top-1/2 flex h-40 w-40 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-yellow-300/30 bg-[radial-gradient(circle_at_30%_30%,rgba(255,240,180,0.98),rgba(250,204,21,0.45),rgba(120,80,10,0.15))] shadow-[0_0_70px_rgba(250,204,21,0.32)]">
        <div className="text-center">
          <p className="text-5xl">🎥</p>
          <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-black/80">
            Studio Core
          </p>
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-5 left-5 right-5 rounded-3xl border border-yellow-500/20 bg-black/45 p-5 backdrop-blur-md">
        <p className="text-xs uppercase tracking-[0.22em] text-yellow-300/70">
          Video Intelligence Core
        </p>
        <p className="mt-2 text-sm leading-6 text-zinc-300">
          Premium luxury video engine for motivational reels, cinematic edits,
          exotic cars, yachts, high-status creator content, and speaker-style videos.
        </p>
      </div>
    </div>
  )
}

type ToolType = "luxury-video" | "cinematic-video"
type UserPlan = "starter" | "pro" | "founder" | "founder_elite" | "free"

type ProfileRow = {
  plan?: string | null
  videos_used?: number | null
  extra_video_credits?: number | null
  trial_expires_at?: string | null
}

function normalizePlan(plan?: string | null): UserPlan {
  const value = (plan || "").toLowerCase().trim()

  if (value === "starter" || value === "$9" || value === "9") return "starter"
  if (value === "pro" || value === "$19" || value === "19") return "pro"
  if (
    value === "founder" ||
    value === "founder_elite" ||
    value === "founder elite" ||
    value === "$29" ||
    value === "29"
  ) {
    return "founder_elite"
  }

  return "free"
}

function getPlanVideoLimit(plan: UserPlan) {
  if (plan === "starter") return 3
  if (plan === "pro") return 5
  if (plan === "founder" || plan === "founder_elite") return 10
  return 0
}

function getPlanDisplay(plan: UserPlan) {
  if (plan === "starter") return "$9 Starter"
  if (plan === "pro") return "$19 Pro"
  if (plan === "founder" || plan === "founder_elite") return "$29 Founder Elite"
  return "Free"
}

function hasTrialExpired(trialExpiresAt?: string | null) {
  if (!trialExpiresAt) return false
  return Date.now() > new Date(trialExpiresAt).getTime()
}

function getFallbackVideos(tool: ToolType) {
  if (tool === "cinematic-video") {
    return ["/hero-mercedes.mp4", "/hero-lambo.mp4", "/hero-rolls.mp4"]
  }
  return ["/hero-rolls.mp4", "/hero-yacht.mp4", "/hero-lambo.mp4"]
}

function VideoPreviewFrame({
  caption,
  audioUrl,
  scenes,
  activeTool,
  lumaVideoUrl,
  lumaStatus,
  previewVideoUrl,
}: {
  caption: string
  audioUrl: string
  scenes: string[]
  activeTool: ToolType
  lumaVideoUrl: string
  lumaStatus: string
  previewVideoUrl: string
}) {
  const previewLabel =
    activeTool === "cinematic-video"
      ? "Motivational Speaker Preview"
      : "Luxury Video Preview"

  const isLumaWorking =
    !!lumaStatus &&
    !lumaVideoUrl &&
    (lumaStatus.toLowerCase().includes("creating") ||
      lumaStatus.toLowerCase().includes("waiting") ||
      lumaStatus.toLowerCase().includes("dreaming") ||
      lumaStatus.toLowerCase().includes("processing") ||
      lumaStatus.toLowerCase().includes("rendering") ||
      lumaStatus.toLowerCase().includes("still processing"))

  const videoToShow = lumaVideoUrl || previewVideoUrl

  return (
    <div className="w-[360px] max-w-full overflow-hidden rounded-[24px] border border-yellow-500/20 bg-black">
      <div className="relative aspect-[9/16] bg-black">
        {videoToShow ? (
          <div className="relative h-full w-full">
            <video
              key={videoToShow}
              src={videoToShow}
              autoPlay
              muted={!audioUrl || !lumaVideoUrl}
              loop={!audioUrl || !lumaVideoUrl}
              playsInline
              controls
              preload="auto"
              className="h-full w-full object-cover"
            />

            {isLumaWorking ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/45 text-center text-zinc-400">
                <div className="mb-4 h-14 w-14 animate-spin rounded-full border-2 border-yellow-400/30 border-t-yellow-400" />
                <p className="text-sm font-medium text-yellow-300">
                  Generating luxury video...
                </p>
                <p className="mt-2 max-w-[220px] text-xs leading-5 text-zinc-500">
                  Luma is working on your video now. It will appear here automatically when ready.
                </p>
              </div>
            ) : null}
          </div>
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-black text-center text-zinc-500">
            Video preview will appear here.
          </div>
        )}

        <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent p-4">
          <div className="mb-2 inline-flex rounded-full border border-white/10 bg-black/40 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-yellow-300/80">
            {previewLabel}
          </div>

          <p className="text-sm font-medium leading-6 text-white">
            {caption || "Video caption preview will appear here."}
          </p>

          {scenes.length > 0 ? (
            <p className="mt-2 text-xs text-zinc-300">
              {scenes.length} scene{scenes.length > 1 ? "s" : ""} generated
            </p>
          ) : null}
        </div>
      </div>

      {audioUrl ? (
        <div className="border-t border-white/10 bg-zinc-950 p-3">
          <p className="mb-2 text-xs uppercase tracking-[0.18em] text-zinc-500">
            AI Voice Preview
          </p>
          <audio controls className="w-full">
            <source src={audioUrl} type="audio/mpeg" />
          </audio>
        </div>
      ) : null}
    </div>
  )
}

export default function VideoStudioPage() {
  const supabase = createClient()
  const lumaPollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const [topic, setTopic] = useState("")
  const [language, setLanguage] = useState("English")
  const [result, setResult] = useState("")
  const [voiceScript, setVoiceScript] = useState("")
  const [caption, setCaption] = useState("")
  const [scenes, setScenes] = useState<string[]>([])
  const [sceneVideos, setSceneVideos] = useState<string[]>([])
  const [previewVideoUrl, setPreviewVideoUrl] = useState("")
  const [activeTool, setActiveTool] = useState<ToolType>("luxury-video")
  const [audioUrl, setAudioUrl] = useState("")
  const [loading, setLoading] = useState(false)
  const [voiceLoading, setVoiceLoading] = useState(false)
  const [exportLoading, setExportLoading] = useState(false)
  const [autoEditLoading, setAutoEditLoading] = useState(false)

  const [lumaLoading, setLumaLoading] = useState(false)
  const [lumaStatus, setLumaStatus] = useState("")
  const [lumaVideoUrl, setLumaVideoUrl] = useState("")
  const [lumaGenerationId, setLumaGenerationId] = useState("")

  const [subject, setSubject] = useState("")
  const [visualStyle, setVisualStyle] = useState("")
  const [environment, setEnvironment] = useState("")
  const [mustInclude, setMustInclude] = useState("")
  const [avoidElements, setAvoidElements] = useState("")
  const [cameraStyle, setCameraStyle] = useState("")
  const [lightingStyle, setLightingStyle] = useState("")

  const [userPlan, setUserPlan] = useState<UserPlan>("free")
  const [videosUsed, setVideosUsed] = useState(0)
  const [extraVideoCredits, setExtraVideoCredits] = useState(0)
  const [usageLoading, setUsageLoading] = useState(true)
  const [usageMessage, setUsageMessage] = useState("")
  const [trialExpired, setTrialExpired] = useState(false)

  const planVideoLimit = getPlanVideoLimit(userPlan)
  const planVideosRemaining = Math.max(planVideoLimit - videosUsed, 0)
  const totalRemaining = planVideosRemaining + extraVideoCredits

  useEffect(() => {
    return () => {
      if (lumaPollRef.current) {
        clearInterval(lumaPollRef.current)
      }
      if (audioUrl.startsWith("blob:")) {
        URL.revokeObjectURL(audioUrl)
      }
    }
  }, [audioUrl])

  useEffect(() => {
    let cancelled = false

    const loadUsage = async () => {
      try {
        setUsageLoading(true)

        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          if (!cancelled) {
            setUserPlan("free")
            setVideosUsed(0)
            setExtraVideoCredits(0)
            setTrialExpired(false)
          }
          return
        }

        const { data, error } = await supabase
          .from("profiles")
          .select("plan, videos_used, extra_video_credits, trial_expires_at")
          .eq("id", user.id)
          .single()

        if (error) {
          if (!cancelled) {
            setUsageMessage("Unable to load video usage right now.")
          }
          return
        }

        const profile = (data || {}) as ProfileRow

        if (!cancelled) {
          setUserPlan(normalizePlan(profile.plan))
          setVideosUsed(profile.videos_used ?? 0)
          setExtraVideoCredits(profile.extra_video_credits ?? 0)
          setTrialExpired(hasTrialExpired(profile.trial_expires_at))
        }
      } catch {
        if (!cancelled) {
          setUsageMessage("Unable to load video usage right now.")
        }
      } finally {
        if (!cancelled) {
          setUsageLoading(false)
        }
      }
    }

    loadUsage()

    return () => {
      cancelled = true
    }
  }, [supabase])

  const refreshUsage = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      const { data } = await supabase
        .from("profiles")
        .select("plan, videos_used, extra_video_credits, trial_expires_at")
        .eq("id", user.id)
        .single()

      const profile = (data || {}) as ProfileRow

      setUserPlan(normalizePlan(profile.plan))
      setVideosUsed(profile.videos_used ?? 0)
      setExtraVideoCredits(profile.extra_video_credits ?? 0)
      setTrialExpired(hasTrialExpired(profile.trial_expires_at))
    } catch {
      // ignore refresh errors
    }
  }

  const consumeLocalVideoUsage = () => {
    if (planVideosRemaining > 0) {
      setVideosUsed((prev) => prev + 1)
      return
    }

    if (extraVideoCredits > 0) {
      setExtraVideoCredits((prev) => Math.max(prev - 1, 0))
    }
  }

  const ensureVideoAccess = () => {
    if (usageLoading) {
      setResult("Loading your video plan access...")
      return false
    }

    if (userPlan === "free") {
      setResult("Free trial users cannot generate videos. Upgrade Now.")
      return false
    }

    if (planVideosRemaining > 0) {
      return true
    }

    if (extraVideoCredits > 0) {
      return true
    }

    setResult(
      `Your ${getPlanDisplay(userPlan)} video limit is finished. Buy more credits to keep generating videos.`
    )
    return false
  }

  const clearAudioPreview = () => {
    if (audioUrl.startsWith("blob:")) {
      URL.revokeObjectURL(audioUrl)
    }
    setAudioUrl("")
  }

  const seedImmediatePreview = (tool: ToolType) => {
    const fallback = getFallbackVideos(tool)
    setActiveTool(tool)
    setLumaVideoUrl("")
    setLumaStatus("")
    setPreviewVideoUrl(fallback[0] || "")
    setSceneVideos(fallback)
  }

  const resetStudioOutputs = () => {
    setResult("")
    setVoiceScript("")
    setCaption("")
    setScenes([])
    setSceneVideos([])
    setPreviewVideoUrl("")
    clearAudioPreview()
    setLumaStatus("")
    setLumaVideoUrl("")
    setLumaGenerationId("")
    if (lumaPollRef.current) {
      clearInterval(lumaPollRef.current)
      lumaPollRef.current = null
    }
  }

  const fetchPreviewVideos = async (
    queryCandidates: string[],
    fallbackQuery?: string
  ) => {
    const cleanedQueries = [
      ...queryCandidates.map((item) => item.trim()).filter(Boolean),
      fallbackQuery?.trim() || "",
    ].filter(Boolean)

    const uniqueQueries = [...new Set(cleanedQueries)]
    const videoResults: string[] = []

    for (const query of uniqueQueries) {
      if (videoResults.length >= 4) break

      try {
        const r = await fetch("/api/pexels", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ query }),
        })

        const d = await r.json()

        if (Array.isArray(d.clips) && d.clips.length) {
          for (const clip of d.clips) {
            if (
              typeof clip === "string" &&
              clip.trim() &&
              !videoResults.includes(clip)
            ) {
              videoResults.push(clip)
              if (videoResults.length >= 4) break
            }
          }
        }
      } catch {
        // ignore preview fetch errors
      }
    }

    if (videoResults.length > 0) {
      setSceneVideos(videoResults)
      setPreviewVideoUrl(videoResults[0])
    }
  }

  const fetchSceneVideosFromScenes = async (
    sceneList: string[],
    fallbackQuery?: string
  ) => {
    await fetchPreviewVideos(sceneList, fallbackQuery)
  }

  const pollGeneration = (id: string) => {
    if (lumaPollRef.current) {
      clearInterval(lumaPollRef.current)
    }

    setLumaStatus("Luma status: dreaming")

    let attempts = 0
    const maxAttempts = 60

    lumaPollRef.current = setInterval(async () => {
      try {
        attempts += 1

        const res = await fetch(`/api/luma/status/${id}`, {
          method: "GET",
          cache: "no-store",
        })

        const data = await res.json()

        if (!res.ok) {
          if (lumaPollRef.current) {
            clearInterval(lumaPollRef.current)
            lumaPollRef.current = null
          }
          setLumaStatus("")
          setResult(data?.error || "Failed to check Luma status.")
          return
        }

        const state =
          data?.state ||
          data?.status ||
          data?.generation?.state ||
          data?.generation?.status ||
          data?.generation?.generation_state ||
          "processing"

        const possibleVideoUrl =
          data?.videoUrl ||
          data?.generation?.assets?.video ||
          data?.generation?.assets?.video_url ||
          data?.generation?.video?.url ||
          data?.generation?.video_url ||
          data?.generation?.url ||
          ""

        setLumaStatus(`Luma status: ${state}`)

        if (
          state === "completed" ||
          state === "succeeded" ||
          state === "ready"
        ) {
          if (possibleVideoUrl) {
            setLumaVideoUrl(possibleVideoUrl)
            setPreviewVideoUrl(possibleVideoUrl)
            setLumaStatus("Luma video ready.")
            consumeLocalVideoUsage()

            if (lumaPollRef.current) {
              clearInterval(lumaPollRef.current)
              lumaPollRef.current = null
            }
            return
          }

          setLumaStatus("Luma completed, but no video URL was returned.")
          if (lumaPollRef.current) {
            clearInterval(lumaPollRef.current)
            lumaPollRef.current = null
          }
          return
        }

        if (state === "failed" || state === "error" || state === "canceled") {
          setLumaStatus("Luma generation failed.")
          setResult(
            data?.failureReason ||
              data?.error ||
              "Luma generation failed."
          )

          if (lumaPollRef.current) {
            clearInterval(lumaPollRef.current)
            lumaPollRef.current = null
          }
          return
        }

        if (attempts >= maxAttempts) {
          setLumaStatus("Still processing. Try again in a moment.")
          if (lumaPollRef.current) {
            clearInterval(lumaPollRef.current)
            lumaPollRef.current = null
          }
        }
      } catch {
        if (lumaPollRef.current) {
          clearInterval(lumaPollRef.current)
          lumaPollRef.current = null
        }
        setLumaStatus("")
        setResult("Polling Luma status failed.")
      }
    }, 7000)
  }

  const generateRegularVideo = async (tool: ToolType) => {
    try {
      if (!ensureVideoAccess()) return

      setLoading(true)
      resetStudioOutputs()
      seedImmediatePreview(tool)

      const res = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tool,
          topic,
          platform: "TikTok",
          audience: "Creators",
          language,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setResult(data.error || "Error generating video.")
        return
      }

      const output = (data.result || "").replace(/\*\*/g, "")
      setResult(output)

      const extractedVoice =
        extractSection(output, "VOICEOVER") || extractSection(output, "SCRIPT")
      const extractedCaption = extractSection(output, "CAPTION")
      const extractedScenes = extractScenes(output)

      setVoiceScript(extractedVoice)
      setCaption(extractedCaption)
      setScenes(extractedScenes)

      const previewQueries =
        extractedScenes.length > 0
          ? extractedScenes
          : [
              topic,
              subject,
              visualStyle,
              environment,
              tool === "cinematic-video"
                ? "motivational speaker luxury stage"
                : "luxury lifestyle premium cinematic",
            ]

      await fetchSceneVideosFromScenes(previewQueries, topic)
      consumeLocalVideoUsage()
    } catch {
      setResult("Video generation failed.")
    } finally {
      setLoading(false)
    }
  }

  const generateVideo = async (tool: ToolType) => {
    await generateRegularVideo(tool)
    refreshUsage()
  }

  const generateVoice = async () => {
    try {
      if (!voiceScript.trim()) {
        setResult("No VOICEOVER or SCRIPT found in the generated blueprint.")
        return
      }

      setVoiceLoading(true)
      clearAudioPreview()

      const res = await fetch("/api/voice", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          script: voiceScript,
          voice: "alloy",
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => null)
        setResult(data?.error || "Failed to generate voice.")
        return
      }

      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      setAudioUrl(url)
    } catch {
      setResult("Failed to generate voice.")
    } finally {
      setVoiceLoading(false)
    }
  }

  const copyBlueprint = async () => {
    try {
      if (!result.trim()) return
      await navigator.clipboard.writeText(result)
    } catch {
      setResult("Failed to copy blueprint.")
    }
  }

  const exportVideo = async () => {
    try {
      setExportLoading(true)
      setResult("")

      let videoUrl = ""
      let filename = "creatorgoat-video.mp4"

      if (lumaVideoUrl.trim()) {
        videoUrl = lumaVideoUrl.trim()
        filename = "creatorgoat-luma-video.mp4"
      } else if (previewVideoUrl.trim()) {
        videoUrl = previewVideoUrl.trim()
        filename = "creatorgoat-preview-video.mp4"
      } else if (sceneVideos.length > 0 && sceneVideos[0]?.trim()) {
        videoUrl = sceneVideos[0].trim()
        filename = "creatorgoat-preview-video.mp4"
      }

      if (!videoUrl) {
        setResult("No video available to download.")
        return
      }

      const response = await fetch("/api/download-video", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          videoUrl,
          filename,
        }),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => null)
        setResult(data?.error || "Failed to download video.")
        return
      }

      const blob = await response.blob()
      const fileUrl = window.URL.createObjectURL(blob)

      const a = document.createElement("a")
      a.href = fileUrl
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)

      setTimeout(() => {
        window.URL.revokeObjectURL(fileUrl)
      }, 1000)
    } catch (error) {
      setResult(error instanceof Error ? error.message : "Download failed.")
    } finally {
      setExportLoading(false)
    }
  }

  const autoEditVideo = async () => {
    try {
      if (!ensureVideoAccess()) return

      if (!topic.trim()) {
        setResult("Enter a topic first.")
        return
      }

      setAutoEditLoading(true)
      resetStudioOutputs()

      const toolToUse =
        activeTool === "cinematic-video"
          ? "cinematic-video"
          : "luxury-video"

      seedImmediatePreview(toolToUse)

      const res = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tool: toolToUse,
          topic,
          platform: "TikTok",
          audience: "Creators",
          language,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setResult(data.error || "Error generating video.")
        return
      }

      const output = (data.result || "").replace(/\*\*/g, "")
      setResult(output)

      const extractedVoice =
        extractSection(output, "VOICEOVER") || extractSection(output, "SCRIPT")
      const extractedCaption = extractSection(output, "CAPTION")
      const extractedScenes = extractScenes(output)

      setVoiceScript(extractedVoice)
      setCaption(extractedCaption)
      setScenes(extractedScenes)

      const previewQueries =
        extractedScenes.length > 0
          ? extractedScenes
          : [
              topic,
              subject,
              visualStyle,
              environment,
              toolToUse === "cinematic-video"
                ? "motivational speaker luxury stage"
                : "luxury lifestyle premium cinematic",
            ]

      await fetchSceneVideosFromScenes(previewQueries, topic)

      if (extractedVoice.trim()) {
        const voiceRes = await fetch("/api/voice", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            script: extractedVoice,
            voice: "alloy",
          }),
        })

        if (voiceRes.ok) {
          const voiceBlob = await voiceRes.blob()
          const voiceObjectUrl = URL.createObjectURL(voiceBlob)
          setAudioUrl(voiceObjectUrl)
        }
      }

      consumeLocalVideoUsage()
    } catch {
      setResult("AI auto edit failed.")
    } finally {
      setAutoEditLoading(false)
      refreshUsage()
    }
  }

  const generateLumaVideo = async () => {
    try {
      if (!ensureVideoAccess()) return

      if (!topic.trim()) {
        setResult("Enter a topic first.")
        return
      }

      setLumaLoading(true)
      setLumaVideoUrl("")
      setLumaGenerationId("")
      seedImmediatePreview(activeTool)
      setLumaStatus("Creating Luma generation...")

      if (lumaPollRef.current) {
        clearInterval(lumaPollRef.current)
        lumaPollRef.current = null
      }

      if (sceneVideos.length === 0) {
        await fetchPreviewVideos(
          [
            topic,
            subject,
            visualStyle,
            environment,
            activeTool === "cinematic-video"
              ? "motivational speaker luxury stage"
              : "luxury lifestyle premium cinematic",
          ],
          topic
        )
      }

      const res = await fetch("/api/luma/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          topic,
          language,
          mode: activeTool,
          subject,
          visualStyle,
          environment,
          mustInclude,
          avoidElements,
          cameraStyle,
          lightingStyle,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setResult(data?.error || "Failed to start Luma video generation.")
        setLumaStatus("")
        return
      }

      const generation = data?.generation || {}
      const generationId =
        data?.generationId || generation?.id || generation?.generation_id || ""

      if (!generationId) {
        setResult("Luma generation id not found.")
        setLumaStatus("")
        return
      }

      setLumaGenerationId(generationId)
      setLumaStatus("Generation created. Waiting for Luma video...")
      pollGeneration(generationId)
    } catch {
      setResult("Luma video generation failed.")
      setLumaStatus("")
    } finally {
      setLumaLoading(false)
      refreshUsage()
    }
  }

  const shortCaption =
    caption.length > 110 ? `${caption.slice(0, 110)}...` : caption

  return (
    <div className="w-full space-y-8">
      <section className="rounded-[32px] border border-yellow-500/20 bg-[radial-gradient(circle_at_top_left,rgba(250,204,21,0.14),transparent_28%),linear-gradient(180deg,rgba(24,24,24,0.98),rgba(10,10,10,0.98))] p-8">
        <div className="grid gap-8 xl:grid-cols-[1.15fr_0.85fr] xl:items-center">
          <div>
            <div className="mb-4 inline-flex items-center rounded-full border border-yellow-500/20 bg-yellow-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-yellow-300">
              CreatorGoat Video Studio
            </div>

            <h1 className="text-4xl font-bold tracking-tight text-yellow-400 sm:text-5xl">
              Video Studio
            </h1>

            <p className="mt-4 max-w-2xl text-base leading-7 text-zinc-400">
              Generate premium luxury and motivational speaker videos with AI
              scripts, voice, preview, Luma AI, and download.
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-4">
              <HeroStatCard label="Plan" value={usageLoading ? "..." : getPlanDisplay(userPlan)} />
              <HeroStatCard label="Included Left" value={usageLoading ? "..." : `${planVideosRemaining}`} />
              <HeroStatCard label="Credits" value={usageLoading ? "..." : `${extraVideoCredits}`} />
              <HeroStatCard label="Total Left" value={usageLoading ? "..." : `${totalRemaining}`} />
            </div>

            {usageMessage ? (
              <p className="mt-4 text-sm text-red-300">{usageMessage}</p>
            ) : null}

            {userPlan === "free" ? (
              <div className="mt-4 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">
                Free trial users cannot generate videos. Upgrade Now.
              </div>
            ) : !usageLoading && totalRemaining <= 0 ? (
              <div className="mt-4 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">
                Your {getPlanDisplay(userPlan)} video limit is finished. Buy more credits to keep generating videos.
              </div>
            ) : null}
          </div>

          <LuxuryHeroVisual />
        </div>
      </section>

      <section className="rounded-[30px] border border-yellow-500/20 bg-zinc-950 p-6 shadow-[0_0_40px_rgba(250,204,21,0.05)]">
        <div className="mb-6">
          <p className="text-xs uppercase tracking-[0.22em] text-yellow-300/70">
            Studio Controls
          </p>
          <h2 className="mt-2 text-2xl font-bold text-yellow-400">
            Build your video
          </h2>
        </div>

        <div className="space-y-5">
          <div>
            <label className="mb-2 block text-sm text-zinc-400">Video Topic</label>
            <input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="luxury mindset speech with private jet and black car"
              className="w-full rounded-2xl border border-zinc-700 bg-black px-4 py-3 text-white outline-none transition focus:border-yellow-400"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-zinc-400">Language</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full rounded-2xl border border-zinc-700 bg-black px-4 py-3 text-white outline-none transition focus:border-yellow-400"
            >
              {languages.map((lang) => (
                <option key={lang} value={lang}>
                  🌍 {lang}
                </option>
              ))}
            </select>
          </div>

          <div className="rounded-[24px] border border-cyan-500/20 bg-black/40 p-5 space-y-4">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-cyan-300/70">
                Luma Prompt Builder
              </p>
              <h3 className="mt-2 text-xl font-bold text-cyan-400">
                Make Luma more accurate
              </h3>
            </div>

            <div>
              <label className="mb-2 block text-sm text-zinc-400">Main Subject</label>
              <input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="luxury speaker, black suit, exotic car, elegant stage"
                className="w-full rounded-2xl border border-zinc-700 bg-black px-4 py-3 text-white outline-none transition focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-zinc-400">Visual Style</label>
              <input
                value={visualStyle}
                onChange={(e) => setVisualStyle(e.target.value)}
                placeholder="ultra realistic luxury cinematic, premium, elegant, high-status"
                className="w-full rounded-2xl border border-zinc-700 bg-black px-4 py-3 text-white outline-none transition focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-zinc-400">Environment</label>
              <input
                value={environment}
                onChange={(e) => setEnvironment(e.target.value)}
                placeholder="luxury mansion, premium stage, private jet runway, yacht deck"
                className="w-full rounded-2xl border border-zinc-700 bg-black px-4 py-3 text-white outline-none transition focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-zinc-400">Must Include</label>
              <textarea
                value={mustInclude}
                onChange={(e) => setMustInclude(e.target.value)}
                placeholder="slow motion, confident speech, elegant movement, luxury details"
                className="min-h-[90px] w-full rounded-2xl border border-zinc-700 bg-black px-4 py-3 text-white outline-none transition focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-zinc-400">Avoid</label>
              <textarea
                value={avoidElements}
                onChange={(e) => setAvoidElements(e.target.value)}
                placeholder="cheap visuals, messy background, blurry faces, bad hands"
                className="min-h-[90px] w-full rounded-2xl border border-zinc-700 bg-black px-4 py-3 text-white outline-none transition focus:border-cyan-400"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm text-zinc-400">Camera Style</label>
                <input
                  value={cameraStyle}
                  onChange={(e) => setCameraStyle(e.target.value)}
                  placeholder="smooth push-in, slow motion, cinematic close-up"
                  className="w-full rounded-2xl border border-zinc-700 bg-black px-4 py-3 text-white outline-none transition focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-zinc-400">Lighting</label>
                <input
                  value={lightingStyle}
                  onChange={(e) => setLightingStyle(e.target.value)}
                  placeholder="soft golden light, premium highlights, luxury glow"
                  className="w-full rounded-2xl border border-zinc-700 bg-black px-4 py-3 text-white outline-none transition focus:border-cyan-400"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => generateVideo("luxury-video")}
              disabled={loading || autoEditLoading || !topic.trim() || usageLoading || userPlan === "free" || totalRemaining <= 0}
              className="rounded-2xl bg-yellow-400 px-6 py-3 font-semibold text-black transition hover:opacity-90 disabled:opacity-50"
            >
              {loading && activeTool === "luxury-video"
                ? "Generating..."
                : "Generate Luxury Video"}
            </button>

            <button
              onClick={() => generateVideo("cinematic-video")}
              disabled={loading || autoEditLoading || !topic.trim() || usageLoading || userPlan === "free" || totalRemaining <= 0}
              className="rounded-2xl border border-yellow-400 px-6 py-3 font-semibold text-yellow-400 transition hover:bg-yellow-400 hover:text-black disabled:opacity-50"
            >
              {loading && activeTool === "cinematic-video"
                ? "Generating..."
                : "Generate Motivational Speaker Video"}
            </button>

            <button
              onClick={generateVoice}
              disabled={voiceLoading || autoEditLoading || !voiceScript.trim()}
              className="rounded-2xl border border-yellow-400 px-6 py-3 font-semibold text-yellow-400 transition hover:bg-yellow-400 hover:text-black disabled:opacity-50"
            >
              {voiceLoading ? "Generating Voice..." : "Generate AI Voice"}
            </button>

            <button
              onClick={copyBlueprint}
              disabled={!result.trim()}
              className="rounded-2xl border border-yellow-400 px-6 py-3 font-semibold text-yellow-400 transition hover:bg-yellow-400 hover:text-black disabled:opacity-50"
            >
              Copy Blueprint
            </button>

            <button
              onClick={exportVideo}
              disabled={
                exportLoading ||
                autoEditLoading ||
                (!lumaVideoUrl.trim() && !previewVideoUrl.trim() && sceneVideos.length === 0)
              }
              className="rounded-2xl bg-yellow-400 px-6 py-3 font-semibold text-black transition hover:opacity-90 disabled:opacity-50"
            >
              {exportLoading ? "Downloading..." : "Download Final Video"}
            </button>

            <button
              onClick={autoEditVideo}
              disabled={autoEditLoading || loading || !topic.trim() || usageLoading || userPlan === "free" || totalRemaining <= 0}
              className="rounded-2xl bg-purple-500 px-6 py-3 font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
            >
              {autoEditLoading ? "Auto Editing..." : "AI Auto Edit Video"}
            </button>

            <button
              onClick={generateLumaVideo}
              disabled={lumaLoading || loading || autoEditLoading || !topic.trim() || usageLoading || userPlan === "free" || totalRemaining <= 0}
              className="rounded-2xl bg-cyan-500 px-6 py-3 font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
            >
              {lumaLoading ? "Generating Luma Video..." : "Generate with Luma AI"}
            </button>
          </div>

          {lumaStatus && <p className="text-sm text-cyan-300">{lumaStatus}</p>}

          {lumaGenerationId && (
            <p className="break-all text-xs text-zinc-500">
              Generation ID: {lumaGenerationId}
            </p>
          )}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-[30px] border border-yellow-500/20 bg-zinc-950 p-6 shadow-[0_0_40px_rgba(250,204,21,0.05)]">
          <h2 className="text-2xl font-bold text-yellow-400">Video Blueprint</h2>

          <pre className="mt-4 whitespace-pre-wrap text-sm leading-7 text-zinc-300">
            {result || "Video idea will appear here."}
          </pre>
        </div>

        <div className="rounded-[30px] border border-yellow-500/20 bg-zinc-950 p-6 shadow-[0_0_40px_rgba(250,204,21,0.05)]">
          <h2 className="text-2xl font-bold text-yellow-400">Video Preview</h2>

          <div className="mt-4">
            <VideoPreviewFrame
              caption={
                shortCaption ||
                (activeTool === "cinematic-video"
                  ? "Motivational speaker video preview"
                  : "Luxury video preview")
              }
              audioUrl={audioUrl}
              scenes={scenes}
              activeTool={activeTool}
              lumaVideoUrl={lumaVideoUrl}
              lumaStatus={lumaStatus}
              previewVideoUrl={previewVideoUrl}
            />
          </div>
        </div>
      </section>

      <section className="rounded-[30px] border border-cyan-500/20 bg-zinc-950 p-6 shadow-[0_0_40px_rgba(34,211,238,0.05)]">
        <h2 className="text-2xl font-bold text-cyan-400">Luma AI Video</h2>

        {!lumaVideoUrl ? (
          <p className="mt-4 text-sm leading-7 text-zinc-300">
            Luma generated video will appear here after processing.
          </p>
        ) : (
          <div className="mt-4 space-y-4">
            <video
              key={lumaVideoUrl}
              src={lumaVideoUrl}
              controls
              playsInline
              className="w-full rounded-3xl border border-white/10 bg-black"
            />

            <div className="flex flex-wrap gap-3">
              <a
                href={lumaVideoUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-block rounded-2xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
              >
                Open Luma Video
              </a>

              <button
                onClick={exportVideo}
                disabled={exportLoading || (!lumaVideoUrl.trim() && !previewVideoUrl.trim() && sceneVideos.length === 0)}
                className="rounded-2xl bg-yellow-400 px-4 py-2 text-sm font-semibold text-black transition hover:opacity-90 disabled:opacity-50"
              >
                {exportLoading ? "Downloading..." : "Download MP4"}
              </button>
            </div>
          </div>
        )}
      </section>

      <section className="rounded-[30px] border border-yellow-500/20 bg-zinc-950 p-6 shadow-[0_0_40px_rgba(250,204,21,0.05)]">
        <h2 className="text-2xl font-bold text-yellow-400">AI Voice</h2>

        <pre className="mt-4 whitespace-pre-wrap text-sm leading-7 text-zinc-300">
          {voiceScript ||
            "VOICEOVER or SCRIPT section will appear here after video generation."}
        </pre>

        {audioUrl && (
          <div className="mt-4 space-y-4">
            <audio controls className="w-full">
              <source src={audioUrl} type="audio/mpeg" />
            </audio>

            <a
              href={audioUrl}
              download="creatorgoat-voice.mp3"
              className="inline-block rounded-2xl bg-yellow-400 px-4 py-2 text-sm font-semibold text-black transition hover:opacity-90"
            >
              Download Voice MP3
            </a>
          </div>
        )}
      </section>
    </div>
  )
}