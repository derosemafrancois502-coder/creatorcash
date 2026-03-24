"use client"

import { useEffect, useRef, useState } from "react"
import { createClient } from "@/lib/supabase/client"

const PRODUCT_IMAGE_BUCKET = "product-images"

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
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              className="h-full w-full object-cover"
            >
              <source src={item.src} type="video/mp4" />
            </video>

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
          product promos, exotic cars, yachts, and high-status creator content.
        </p>
      </div>
    </div>
  )
}

type ToolType = "luxury-video" | "product-video" | "cinematic-video"

type ProductImageItem = {
  id: string
  file: File
  preview: string
}

type UploadedProductImage = {
  name: string
  type: string
  size: number
  url: string
}

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

function VideoPreviewFrame({
  caption,
  audioUrl,
  scenes,
  sceneVideos,
  activeTool,
  lumaVideoUrl,
}: {
  caption: string
  audioUrl: string
  scenes: string[]
  sceneVideos: string[]
  activeTool: ToolType
  lumaVideoUrl: string
}) {
  const fallbackVideos = luxuryVideos.map((item) => item.src)
  const previewVideos = sceneVideos.length > 0 ? sceneVideos : fallbackVideos
  const primaryVideo = previewVideos[0] || ""
  const previewLabel =
    activeTool === "product-video"
      ? "Product Video Preview"
      : activeTool === "cinematic-video"
        ? "Cinematic Video Preview"
        : "Luxury Motivational Preview"

  return (
    <div className="w-[360px] max-w-full overflow-hidden rounded-[24px] border border-yellow-500/20 bg-black">
      <div className="relative aspect-[9/16] bg-black">
        {lumaVideoUrl ? (
          <video
            controls
            playsInline
            className="h-full w-full object-cover"
          >
            <source src={lumaVideoUrl} type="video/mp4" />
          </video>
        ) : primaryVideo ? (
          <video
            autoPlay
            muted={!audioUrl}
            loop={!audioUrl}
            playsInline
            controls
            className="h-full w-full object-cover"
          >
            <source src={primaryVideo} type="video/mp4" />
          </video>
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-black text-center text-zinc-500">
            No preview media yet.
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
  const productFileRef = useRef<HTMLInputElement | null>(null)

  const [topic, setTopic] = useState("")
  const [language, setLanguage] = useState("English")
  const [result, setResult] = useState("")
  const [voiceScript, setVoiceScript] = useState("")
  const [caption, setCaption] = useState("")
  const [scenes, setScenes] = useState<string[]>([])
  const [sceneVideos, setSceneVideos] = useState<string[]>([])
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

  const [productImages, setProductImages] = useState<ProductImageItem[]>([])

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
      productImages.forEach((item) => {
        URL.revokeObjectURL(item.preview)
      })
    }
  }, [productImages])

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

  const resetStudioOutputs = () => {
    setResult("")
    setVoiceScript("")
    setCaption("")
    setScenes([])
    setSceneVideos([])
    setAudioUrl("")
    setLumaStatus("")
    setLumaVideoUrl("")
    setLumaGenerationId("")
  }

  const fetchSceneVideosFromScenes = async (sceneList: string[]) => {
    const videoResults: string[] = []

    for (const scene of sceneList) {
      try {
        const r = await fetch("/api/pexels", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ query: scene }),
        })

        const d = await r.json()

        if (d.clips?.length) {
          videoResults.push(d.clips[0])
        }
      } catch {
        // ignore
      }
    }

    setSceneVideos(videoResults)
  }

  const handleProductPhotoChange = (files: FileList | null) => {
    if (!files) return

    const picked = Array.from(files)
      .filter((file) => file.type.startsWith("image/"))
      .slice(0, 5)

    const nextItems = picked.map((file, index) => ({
      id: `${file.name}-${file.size}-${Date.now()}-${index}`,
      file,
      preview: URL.createObjectURL(file),
    }))

    setProductImages((prev) => {
      prev.forEach((item) => URL.revokeObjectURL(item.preview))
      return nextItems
    })
  }

  const removeProductImage = (id: string) => {
    setProductImages((prev) => {
      const target = prev.find((item) => item.id === id)
      if (target) URL.revokeObjectURL(target.preview)
      return prev.filter((item) => item.id !== id)
    })
  }

  const clearProductImages = () => {
    setProductImages((prev) => {
      prev.forEach((item) => URL.revokeObjectURL(item.preview))
      return []
    })

    if (productFileRef.current) {
      productFileRef.current.value = ""
    }
  }

  const uploadProductImagesToStorage = async (): Promise<UploadedProductImage[]> => {
    const uploaded: UploadedProductImage[] = []

    for (const item of productImages) {
      const ext = item.file.name.split(".").pop()?.toLowerCase() || "jpg"
      const safeBaseName = item.file.name
        .replace(/\.[^/.]+$/, "")
        .replace(/[^a-zA-Z0-9-_]/g, "-")
        .toLowerCase()

      const filePath = `video-studio/${Date.now()}-${Math.random()
        .toString(36)
        .slice(2)}-${safeBaseName}.${ext}`

      const { error: uploadError } = await supabase.storage
        .from(PRODUCT_IMAGE_BUCKET)
        .upload(filePath, item.file, {
          cacheControl: "3600",
          upsert: false,
          contentType: item.file.type || undefined,
        })

      if (uploadError) {
        throw new Error(uploadError.message || "Failed to upload product photo.")
      }

      const { data: publicUrlData } = supabase.storage
        .from(PRODUCT_IMAGE_BUCKET)
        .getPublicUrl(filePath)

      const publicUrl = publicUrlData?.publicUrl || ""

      if (!publicUrl) {
        throw new Error("Failed to create public URL for product photo.")
      }

      uploaded.push({
        name: item.file.name,
        type: item.file.type,
        size: item.file.size,
        url: publicUrl,
      })
    }

    return uploaded
  }

  const generateRegularVideo = async (tool: ToolType) => {
    try {
      if (!ensureVideoAccess()) return

      setLoading(true)
      resetStudioOutputs()
      setActiveTool(tool)

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

      await fetchSceneVideosFromScenes(extractedScenes)
      consumeLocalVideoUsage()
    } catch {
      setResult("Video generation failed.")
    } finally {
      setLoading(false)
    }
  }

  const generateProductVideo = async () => {
    try {
      if (!ensureVideoAccess()) return

      if (!topic.trim()) {
        setResult("Enter a topic first.")
        return
      }

      if (productImages.length === 0) {
        setResult("Upload at least 1 product photo for product video.")
        return
      }

      setLoading(true)
      resetStudioOutputs()
      setActiveTool("product-video")
      setLumaStatus("Uploading product photos...")

      const uploadedImages = await uploadProductImagesToStorage()
      const imageUrls = uploadedImages.map((img) => img.url).filter(Boolean)

      if (imageUrls.length === 0) {
        setResult("No public product image URL was created.")
        setLumaStatus("")
        return
      }

      const strictPhotoInstruction = [
        "Use the uploaded product photo as the primary visual truth.",
        "The exact same uploaded product must remain visible in the final video.",
        "Do not redesign the product.",
        "Do not replace the bottle, jar, tube, box, or container.",
        "Do not change the label, packaging colors, cap, pump, or shape.",
        "Preserve the real product identity from the uploaded photo.",
        "Animate the uploaded product with subtle premium motion only.",
        "The uploaded photo must clearly influence the final product video.",
      ].join(" ")

      const mergedMustInclude = [mustInclude, strictPhotoInstruction]
        .filter(Boolean)
        .join("\n\n")

      const mergedAvoid = [
        avoidElements,
        "Do not invent a different product. Do not replace the uploaded product. Do not change packaging.",
      ]
        .filter(Boolean)
        .join("\n\n")

      setLumaStatus("Generating product blueprint...")

      const res = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tool: "product-video",
          topic,
          platform: "TikTok",
          audience: "Creators",
          language,
          subject,
          visualStyle,
          environment,
          mustInclude: mergedMustInclude,
          avoidElements: mergedAvoid,
          cameraStyle,
          lightingStyle,
          imageUrls,
          photoLockMode: "strict",
          photoInstruction: strictPhotoInstruction,
          primaryProductImageIndex: 0,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setResult(data.error || "Error generating product video.")
        setLumaStatus("")
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

      await fetchSceneVideosFromScenes(extractedScenes)

      setLumaStatus("Sending product images to Luma...")

      const lumaRes = await fetch("/api/luma/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          topic,
          language,
          mode: "product-video",
          subject,
          visualStyle,
          environment,
          mustInclude: mergedMustInclude,
          avoidElements: mergedAvoid,
          cameraStyle,
          lightingStyle,
          blueprint: output,
          voiceScript: extractedVoice,
          caption: extractedCaption,
          imageUrls,
          photoLockMode: "strict",
          photoInstruction: strictPhotoInstruction,
          primaryProductImageIndex: 0,
        }),
      })

      const lumaData = await lumaRes.json()

      if (!lumaRes.ok) {
        setResult(
          lumaData?.error ||
            lumaData?.details?.message ||
            "Failed to start product video generation."
        )
        setLumaStatus("")
        return
      }

      const generation = lumaData?.generation || {}
      const generationId =
        lumaData?.generationId || generation?.id || generation?.generation_id || ""

      if (!generationId) {
        setResult("Luma generation id not found.")
        setLumaStatus("")
        return
      }

      setLumaGenerationId(generationId)
      setLumaStatus("Generation created. Waiting for product video...")

      let attempts = 0
      const maxAttempts = 24

      while (attempts < maxAttempts) {
        attempts += 1

        await new Promise((resolve) => setTimeout(resolve, 5000))

        const statusRes = await fetch(`/api/luma/status/${generationId}`, {
          method: "GET",
          cache: "no-store",
        })

        const statusData = await statusRes.json()

        if (!statusRes.ok) {
          setResult(statusData?.error || "Failed to check Luma status.")
          setLumaStatus("")
          return
        }

        const state =
          statusData?.state ||
          statusData?.generation?.state ||
          statusData?.generation?.status ||
          statusData?.generation?.generation_state ||
          "processing"

        const possibleVideoUrl =
          statusData?.videoUrl ||
          statusData?.generation?.assets?.video ||
          statusData?.generation?.assets?.video_url ||
          statusData?.generation?.video?.url ||
          statusData?.generation?.video_url ||
          statusData?.generation?.url ||
          ""

        setLumaStatus(`Luma status: ${state}`)

        if (
          state === "completed" ||
          state === "succeeded" ||
          state === "ready"
        ) {
          if (possibleVideoUrl) {
            setLumaVideoUrl(possibleVideoUrl)
            setLumaStatus("Product video ready.")
            consumeLocalVideoUsage()
            return
          }

          setLumaStatus("Luma completed, but no video URL was returned.")
          return
        }

        if (state === "failed" || state === "error") {
          setLumaStatus("Luma generation failed.")
          setResult(
            statusData?.failureReason ||
              statusData?.error ||
              "Luma generation failed."
          )
          return
        }
      }

      setLumaStatus("Still processing. Try again in a moment.")
    } catch (error) {
      setResult(
        error instanceof Error
          ? error.message
          : "Product video generation failed."
      )
      setLumaStatus("")
    } finally {
      setLoading(false)
      refreshUsage()
    }
  }

  const generateVideo = async (tool: ToolType) => {
    if (tool === "product-video") {
      await generateProductVideo()
      return
    }

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
      setAudioUrl("")

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
        activeTool === "product-video"
          ? "product-video"
          : activeTool === "cinematic-video"
            ? "cinematic-video"
            : "luxury-video"

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

      await fetchSceneVideosFromScenes(extractedScenes)

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
      setLumaStatus("Creating Luma generation...")
      setLumaVideoUrl("")
      setLumaGenerationId("")

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

      let attempts = 0
      const maxAttempts = 24

      while (attempts < maxAttempts) {
        attempts += 1

        await new Promise((resolve) => setTimeout(resolve, 5000))

        const statusRes = await fetch(`/api/luma/status/${generationId}`, {
          method: "GET",
          cache: "no-store",
        })

        const statusData = await statusRes.json()

        if (!statusRes.ok) {
          setResult(statusData?.error || "Failed to check Luma status.")
          setLumaStatus("")
          return
        }

        const state =
          statusData?.state ||
          statusData?.generation?.state ||
          statusData?.generation?.status ||
          statusData?.generation?.generation_state ||
          "processing"

        const possibleVideoUrl =
          statusData?.videoUrl ||
          statusData?.generation?.assets?.video ||
          statusData?.generation?.assets?.video_url ||
          statusData?.generation?.video?.url ||
          statusData?.generation?.video_url ||
          statusData?.generation?.url ||
          ""

        setLumaStatus(`Luma status: ${state}`)

        if (
          state === "completed" ||
          state === "succeeded" ||
          state === "ready"
        ) {
          if (possibleVideoUrl) {
            setLumaVideoUrl(possibleVideoUrl)
            setLumaStatus("Luma video ready.")
            consumeLocalVideoUsage()
            return
          }

          setLumaStatus("Luma says completed, but no video URL was returned.")
          return
        }

        if (state === "failed" || state === "error") {
          setLumaStatus("Luma generation failed.")
          setResult(
            statusData?.failureReason ||
              statusData?.error ||
              "Luma generation failed."
          )
          return
        }
      }

      setLumaStatus("Still processing. Try again in a moment.")
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
              Generate premium luxury, cinematic, and product videos with AI
              scripts, voice, preview, and download.
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
              placeholder="30 second luxury video cars yacht"
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
                placeholder="black and gold perfume bottle, elegant woman, premium body lotion"
                className="w-full rounded-2xl border border-zinc-700 bg-black px-4 py-3 text-white outline-none transition focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-zinc-400">Visual Style</label>
              <input
                value={visualStyle}
                onChange={(e) => setVisualStyle(e.target.value)}
                placeholder="ultra realistic luxury beauty ad, cinematic, premium, elegant"
                className="w-full rounded-2xl border border-zinc-700 bg-black px-4 py-3 text-white outline-none transition focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-zinc-400">Environment</label>
              <input
                value={environment}
                onChange={(e) => setEnvironment(e.target.value)}
                placeholder="luxury marble table, elegant bathroom, premium studio"
                className="w-full rounded-2xl border border-zinc-700 bg-black px-4 py-3 text-white outline-none transition focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-zinc-400">Must Include</label>
              <textarea
                value={mustInclude}
                onChange={(e) => setMustInclude(e.target.value)}
                placeholder="slow motion, close-up shots, glowing skin, product clarity"
                className="min-h-[90px] w-full rounded-2xl border border-zinc-700 bg-black px-4 py-3 text-white outline-none transition focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-zinc-400">Avoid</label>
              <textarea
                value={avoidElements}
                onChange={(e) => setAvoidElements(e.target.value)}
                placeholder="text overlays, clutter, bad hands, blurry visuals, cheap background"
                className="min-h-[90px] w-full rounded-2xl border border-zinc-700 bg-black px-4 py-3 text-white outline-none transition focus:border-cyan-400"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm text-zinc-400">Camera Style</label>
                <input
                  value={cameraStyle}
                  onChange={(e) => setCameraStyle(e.target.value)}
                  placeholder="smooth push-in, macro close-up, slow motion"
                  className="w-full rounded-2xl border border-zinc-700 bg-black px-4 py-3 text-white outline-none transition focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-zinc-400">Lighting</label>
                <input
                  value={lightingStyle}
                  onChange={(e) => setLightingStyle(e.target.value)}
                  placeholder="soft golden light, premium studio highlights"
                  className="w-full rounded-2xl border border-zinc-700 bg-black px-4 py-3 text-white outline-none transition focus:border-cyan-400"
                />
              </div>
            </div>
          </div>

          <div className="rounded-[24px] border border-yellow-500/20 bg-black/40 p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-yellow-300/70">
                  Product Photos
                </p>
                <h3 className="mt-2 text-xl font-bold text-yellow-400">
                  For Generate Product Video only
                </h3>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => productFileRef.current?.click()}
                  className="rounded-2xl bg-yellow-400 px-4 py-2 text-sm font-semibold text-black transition hover:opacity-90"
                >
                  Upload Product Photos
                </button>

                <button
                  type="button"
                  onClick={clearProductImages}
                  disabled={productImages.length === 0}
                  className="rounded-2xl border border-yellow-400 px-4 py-2 text-sm font-semibold text-yellow-400 transition hover:bg-yellow-400 hover:text-black disabled:opacity-50"
                >
                  Clear Photos
                </button>
              </div>
            </div>

            <input
              ref={productFileRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => handleProductPhotoChange(e.target.files)}
            />

            <p className="text-sm text-zinc-400">
              Upload up to 5 product photos. These photos are used only when you click
              <span className="font-semibold text-yellow-400"> Generate Product Video</span>.
            </p>

            {productImages.length > 0 ? (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
                {productImages.map((item, index) => (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-white/10 bg-zinc-900 p-2"
                  >
                    <div className="relative overflow-hidden rounded-xl bg-black">
                      <img
                        src={item.preview}
                        alt={`Product photo ${index + 1}`}
                        className="h-36 w-full object-cover"
                      />
                    </div>

                    <div className="mt-2 flex items-center justify-between gap-2">
                      <p className="truncate text-xs text-zinc-400">
                        {item.file.name}
                      </p>

                      <button
                        type="button"
                        onClick={() => removeProductImage(item.id)}
                        className="rounded-lg border border-red-500/30 px-2 py-1 text-[10px] font-semibold text-red-300 transition hover:bg-red-500/10"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-zinc-700 bg-zinc-950/60 p-5 text-sm text-zinc-500">
                No product photos uploaded yet.
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => generateVideo("luxury-video")}
              disabled={loading || autoEditLoading || !topic.trim() || usageLoading || userPlan === "free" || totalRemaining <= 0}
              className="rounded-2xl bg-yellow-400 px-6 py-3 font-semibold text-black transition hover:opacity-90 disabled:opacity-50"
            >
              {loading && activeTool === "luxury-video"
                ? "Generating..."
                : "Generate Motivational Video"}
            </button>

            <button
              onClick={() => generateVideo("product-video")}
              disabled={loading || autoEditLoading || !topic.trim() || usageLoading || userPlan === "free" || totalRemaining <= 0}
              className="rounded-2xl bg-yellow-400 px-6 py-3 font-semibold text-black transition hover:opacity-90 disabled:opacity-50"
            >
              {loading && activeTool === "product-video"
                ? "Generating..."
                : "Generate Product Video"}
            </button>

            <button
              onClick={() => generateVideo("cinematic-video")}
              disabled={loading || autoEditLoading || !topic.trim() || usageLoading || userPlan === "free" || totalRemaining <= 0}
              className="rounded-2xl border border-yellow-400 px-6 py-3 font-semibold text-yellow-400 transition hover:bg-yellow-400 hover:text-black disabled:opacity-50"
            >
              {loading && activeTool === "cinematic-video"
                ? "Generating..."
                : "Generate AI Cinematic Video"}
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
                (!lumaVideoUrl.trim() && sceneVideos.length === 0)
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
                (activeTool === "product-video"
                  ? "Luxury product video preview"
                  : "Luxury motivational preview")
              }
              audioUrl={audioUrl}
              scenes={scenes}
              sceneVideos={sceneVideos}
              activeTool={activeTool}
              lumaVideoUrl={lumaVideoUrl}
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
              controls
              playsInline
              className="w-full rounded-3xl border border-white/10 bg-black"
            >
              <source src={lumaVideoUrl} type="video/mp4" />
            </video>

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
                disabled={exportLoading || (!lumaVideoUrl.trim() && sceneVideos.length === 0)}
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