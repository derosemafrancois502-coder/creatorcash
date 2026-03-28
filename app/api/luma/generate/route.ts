import { NextResponse } from "next/server"

const MAX_PROMPT_LENGTH = 4800

const languageInstructions: Record<string, string> = {
  English:
    "All visual storytelling should feel native to English-speaking premium social media audiences.",
  French:
    "All visual storytelling should feel native to French-speaking luxury audiences.",
  Spanish:
    "All visual storytelling should feel native to Spanish-speaking premium audiences.",
  Portuguese:
    "All visual storytelling should feel native to Portuguese-speaking premium audiences.",
  Arabic:
    "All visual storytelling should feel native to Arabic-speaking luxury audiences.",
  Hindi:
    "All visual storytelling should feel native to Hindi-speaking premium audiences.",
  Creole:
    "All visual storytelling should feel native to Haitian Creole-speaking premium social media audiences.",
}

type ProductImageInput = {
  name?: string
  type?: string
  size?: number
  dataUrl?: string
  url?: string
}

type GenerateBody = {
  topic?: string
  language?: string
  mode?: string
  subject?: string
  visualStyle?: string
  environment?: string
  mustInclude?: string
  avoidElements?: string
  cameraStyle?: string
  lightingStyle?: string
  imageUrls?: string[]
  productImages?: ProductImageInput[]
  photoLockMode?: string
  photoInstruction?: string
  primaryProductImageIndex?: number
  productName?: string
  productType?: string
  productBrand?: string
  packagingStyle?: string
  targetAudience?: string
  sellingAngle?: string
  calloutFeatures?: string[]
  blueprint?: string
  voiceScript?: string
  caption?: string
}

function cleanText(value?: string) {
  return typeof value === "string" ? value.trim() : ""
}

function isHttpUrl(value: string) {
  return /^https?:\/\//i.test(value)
}

function uniqueValidImageUrls(imageUrls?: string[]) {
  if (!Array.isArray(imageUrls)) return []

  const valid = imageUrls
    .map((url) => (typeof url === "string" ? url.trim() : ""))
    .filter(Boolean)
    .filter((url) => isHttpUrl(url))

  return [...new Set(valid)].slice(0, 5)
}

function normalizeProductImages(productImages?: ProductImageInput[]) {
  if (!Array.isArray(productImages)) return []

  return productImages
    .map((item) => cleanText(item?.url))
    .filter(Boolean)
    .filter((url) => isHttpUrl(url))
    .slice(0, 5)
}

function safeChunk(text?: string, max = 500) {
  const cleaned = cleanText(text)
  if (!cleaned) return ""
  return cleaned.slice(0, max)
}

function truncatePrompt(text: string, max = MAX_PROMPT_LENGTH) {
  if (text.length <= max) return text
  return text.slice(0, max)
}

function buildPrompt({
  topic,
  language,
  mode,
  subject,
  visualStyle,
  environment,
  mustInclude,
  avoidElements,
  cameraStyle,
  lightingStyle,
  resolvedImageSources,
  productName,
  productType,
  productBrand,
  packagingStyle,
  targetAudience,
  sellingAngle,
  calloutFeatures,
  photoInstruction,
  blueprint,
  voiceScript,
  caption,
}: {
  topic: string
  language: string
  mode: string
  subject?: string
  visualStyle?: string
  environment?: string
  mustInclude?: string
  avoidElements?: string
  cameraStyle?: string
  lightingStyle?: string
  resolvedImageSources?: string[]
  productName?: string
  productType?: string
  productBrand?: string
  packagingStyle?: string
  targetAudience?: string
  sellingAngle?: string
  calloutFeatures?: string[]
  photoInstruction?: string
  blueprint?: string
  voiceScript?: string
  caption?: string
}) {
  const langRule =
    languageInstructions[language] || languageInstructions.English

  const featuresText =
    Array.isArray(calloutFeatures) && calloutFeatures.length > 0
      ? calloutFeatures
          .map((item) => (typeof item === "string" ? item.trim() : ""))
          .filter(Boolean)
          .join(", ")
      : ""

  const resolvedSubject = subject || topic

  const resolvedStyle =
    visualStyle ||
    (mode === "cinematic-video"
      ? "ultra realistic cinematic motivational speaker, luxury stage presence, expensive suit, emotional storytelling, premium lighting"
      : "ultra realistic luxury lifestyle, wealth, exotic locations, cinematic success, elegant premium visuals")

  const resolvedEnvironment =
    environment ||
    (mode === "cinematic-video"
      ? "premium stage, luxury hall, spotlight environment, elegant indoor cinematic scene"
      : "luxury mansion, exotic destination, private jet runway, yacht deck, premium lifestyle environment")

  const resolvedCamera =
    cameraStyle ||
    "smooth cinematic camera movement, premium close-ups, slow motion, elegant framing"

  const resolvedLighting =
    lightingStyle ||
    "professional luxury lighting, glossy highlights, premium contrast, elegant shadows"

  const imageInstruction =
    resolvedImageSources && resolvedImageSources.length > 0
      ? [
          "Use the uploaded reference image as visual inspiration.",
          "Keep the same visual identity, luxury feeling, and key subject direction from the uploaded image.",
          cleanText(photoInstruction),
        ]
          .filter(Boolean)
          .join(" ")
      : ""

  const importantMustInclude = [
    safeChunk(mustInclude, 700),
    productName ? `product name: ${productName}` : "",
    productType ? `product type: ${productType}` : "",
    productBrand ? `brand feeling: ${productBrand}` : "",
    packagingStyle ? `packaging style: ${packagingStyle}` : "",
    targetAudience ? `target audience: ${targetAudience}` : "",
    sellingAngle ? `selling angle: ${sellingAngle}` : "",
    featuresText ? `key features: ${featuresText}` : "",
    imageInstruction,
  ]
    .filter(Boolean)
    .join(", ")

  const importantAvoid = [
    safeChunk(avoidElements, 700),
    "low quality, blurry visuals, cluttered background, broken anatomy, ugly framing, cheap visuals, weak luxury feeling, messy composition, random text overlays",
  ]
    .filter(Boolean)
    .join(", ")

  const blueprintBlock = safeChunk(blueprint, 900)
  const voiceBlock = safeChunk(voiceScript, 500)
  const captionBlock = safeChunk(caption, 300)

  const prompt = `
Create a highly accurate vertical 9:16 cinematic video.

User request:
${safeChunk(topic, 500)}

Language direction:
${langRule}

Video mode:
${mode === "cinematic-video" ? "motivational speaker cinematic video" : "luxury lifestyle cinematic video"}

Main subject:
${safeChunk(resolvedSubject, 300)}

Visual style:
${safeChunk(resolvedStyle, 250)}

Environment:
${safeChunk(resolvedEnvironment, 250)}

Camera:
${safeChunk(resolvedCamera, 250)}

Lighting:
${safeChunk(resolvedLighting, 250)}

Must include:
${importantMustInclude || "premium visuals, elegant motion, cinematic polish"}

Avoid:
${importantAvoid}

${
  resolvedImageSources && resolvedImageSources.length > 0
    ? `Reference image rule:
Use the uploaded image as frame0 visual inspiration and preserve the same premium subject direction where appropriate.
Do not ignore the reference image.
`
    : ""
}

${blueprintBlock ? `Creative blueprint:\n${blueprintBlock}\n` : ""}
${voiceBlock ? `Voiceover direction:\n${voiceBlock}\n` : ""}
${captionBlock ? `Caption direction:\n${captionBlock}\n` : ""}

General quality:
Ultra realistic, premium, cinematic, polished, elegant, luxury, social-media ready.
  `.trim()

  return truncatePrompt(prompt)
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as GenerateBody

    const topic = cleanText(body?.topic)
    const language = cleanText(body?.language) || "English"
    const rawMode = cleanText(body?.mode) || "luxury-video"
    const mode = rawMode === "cinematic-video" ? "cinematic-video" : "luxury-video"

    const subject = cleanText(body?.subject)
    const visualStyle = cleanText(body?.visualStyle)
    const environment = cleanText(body?.environment)
    const mustInclude = cleanText(body?.mustInclude)
    const avoidElements = cleanText(body?.avoidElements)
    const cameraStyle = cleanText(body?.cameraStyle)
    const lightingStyle = cleanText(body?.lightingStyle)

    const productName = cleanText(body?.productName)
    const productType = cleanText(body?.productType)
    const productBrand = cleanText(body?.productBrand)
    const packagingStyle = cleanText(body?.packagingStyle)
    const targetAudience = cleanText(body?.targetAudience)
    const sellingAngle = cleanText(body?.sellingAngle)
    const photoInstruction = cleanText(body?.photoInstruction)
    const blueprint = cleanText(body?.blueprint)
    const voiceScript = cleanText(body?.voiceScript)
    const caption = cleanText(body?.caption)

    const calloutFeatures = Array.isArray(body?.calloutFeatures)
      ? body.calloutFeatures
          .map((item) => (typeof item === "string" ? item.trim() : ""))
          .filter(Boolean)
          .slice(0, 12)
      : []

    const directImageUrls = uniqueValidImageUrls(body?.imageUrls)
    const productImageSources = normalizeProductImages(body?.productImages)

    const resolvedImageSources =
      directImageUrls.length > 0 ? directImageUrls : productImageSources

    console.log("🔥 IMAGE URLS:", resolvedImageSources)

    if (!topic) {
      return NextResponse.json(
        { error: "Topic is required." },
        { status: 400 }
      )
    }

    const apiKey = process.env.LUMA_API_KEY || process.env.LUMAAI_API_KEY

    if (!apiKey) {
      return NextResponse.json(
        { error: "Missing LUMA_API_KEY or LUMAAI_API_KEY in .env.local" },
        { status: 500 }
      )
    }

    const prompt = buildPrompt({
      topic,
      language,
      mode,
      subject,
      visualStyle,
      environment,
      mustInclude,
      avoidElements,
      cameraStyle,
      lightingStyle,
      resolvedImageSources,
      productName,
      productType,
      productBrand,
      packagingStyle,
      targetAudience,
      sellingAngle,
      calloutFeatures,
      photoInstruction,
      blueprint,
      voiceScript,
      caption,
    })

    const lumaPayload: {
      prompt: string
      model: string
      resolution: string
      duration: string
      aspect_ratio: string
      keyframes?: {
        frame0: {
          type: "image"
          url: string
        }
      }
    } = {
      prompt,
      model: "ray-2",
      resolution: "720p",
      duration: "5s",
      aspect_ratio: "9:16",
    }

    if (resolvedImageSources.length > 0) {
      const primaryIndexRaw =
        typeof body?.primaryProductImageIndex === "number"
          ? body.primaryProductImageIndex
          : 0

      const primaryIndex =
        primaryIndexRaw >= 0 && primaryIndexRaw < resolvedImageSources.length
          ? primaryIndexRaw
          : 0

      const primaryImage =
        resolvedImageSources[primaryIndex] || resolvedImageSources[0]

      console.log("🔥 PRIMARY IMAGE:", primaryImage)

      if (primaryImage && isHttpUrl(primaryImage)) {
        lumaPayload.keyframes = {
          frame0: {
            type: "image",
            url: primaryImage,
          },
        }
      }
    }

    console.log("🚀 LUMA PAYLOAD:", JSON.stringify(lumaPayload, null, 2))

    const response = await fetch(
      "https://api.lumalabs.ai/dream-machine/v1/generations",
      {
        method: "POST",
        headers: {
          accept: "application/json",
          "content-type": "application/json",
          authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(lumaPayload),
      }
    )

    const data = await response.json().catch(() => null)

    if (!response.ok) {
      console.log("❌ LUMA ERROR:", data)

      return NextResponse.json(
        {
          error:
            data?.message ||
            data?.error ||
            "Failed to create Luma generation.",
          details: data,
          payloadSent: lumaPayload,
        },
        { status: response.status }
      )
    }

    return NextResponse.json({
      success: true,
      mode,
      generation: data,
      generationId: data?.id || data?.generation_id || "",
      promptUsed: prompt,
      imageCount: resolvedImageSources.length,
      imageUrlsUsed: resolvedImageSources,
      keyframesUsed: lumaPayload.keyframes || null,
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: "Something went wrong while creating the Luma generation.",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}