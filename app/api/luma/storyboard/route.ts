import { NextResponse } from "next/server"

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
    "All visual storytelling should feel native to Haitian Creole-speaking premium audiences.",
}

type ClipPlan = {
  index: number
  title: string
  prompt: string
}

function build12ScenePlan({
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
}): ClipPlan[] {
  const langRule =
    languageInstructions[language] || languageInstructions.English

  const resolvedSubject = subject?.trim() || topic
  const resolvedStyle =
    visualStyle?.trim() ||
    (mode === "product-video"
      ? "ultra realistic premium product commercial"
      : mode === "cinematic-video"
        ? "cinematic luxury storytelling"
        : "luxury motivational lifestyle reel")

  const resolvedEnvironment =
    environment?.trim() ||
    (mode === "product-video"
      ? "clean premium commercial set"
      : "luxury cinematic environment")

  const resolvedCamera =
    cameraStyle?.trim() ||
    "smooth motion, elegant framing, close-up shots, premium composition"

  const resolvedLighting =
    lightingStyle?.trim() ||
    "professional luxury lighting, rich highlights, clean shadows"

  const resolvedMustInclude =
    mustInclude?.trim() ||
    (mode === "product-video"
      ? "product clarity, premium packaging, realistic product shots"
      : mode === "cinematic-video"
        ? "dramatic mood, emotional visuals, elegant movement"
        : "ambition, success energy, elite atmosphere")

  const resolvedAvoid =
    avoidElements?.trim() ||
    "low quality, blurry visuals, text overlays, watermark, distorted faces, ugly hands, cluttered background, cheap styling, cartoon look"

  const sceneBeats = [
    "powerful opening establishing shot",
    "hero subject reveal with premium framing",
    "close-up detail shots with cinematic motion",
    "elegant side-angle movement and atmosphere",
    "luxury environment emphasis",
    "high-status beauty/product/lifestyle focus",
    "slow motion premium action moment",
    "dramatic emotional visual beat",
    "refined close-up with stronger visual intensity",
    "aspirational hero composition",
    "final premium brand-style payoff shot",
    "clean ending shot that feels complete and memorable",
  ]

  return sceneBeats.map((beat, index) => ({
    index: index + 1,
    title: `Scene ${index + 1}`,
    prompt: `
Create a vertical 9:16 ultra realistic cinematic video clip.

Main request:
${topic}

Language direction:
${langRule}

Scene objective:
${beat}

Main subject:
${resolvedSubject}

Visual style:
${resolvedStyle}

Environment:
${resolvedEnvironment}

Camera:
${resolvedCamera}

Lighting:
${resolvedLighting}

Must include:
${resolvedMustInclude}

Avoid:
${resolvedAvoid}

Important:
Stay faithful to the user's request.
Do not invent unrelated objects, outfits, people, locations, or props.
This is clip ${index + 1} of a 12-clip sequence for a 1-minute video.
The clip must feel visually consistent with the rest of the sequence.
Duration should feel like a premium 5-second scene.
    `.trim(),
  }))
}

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const topic = typeof body?.topic === "string" ? body.topic.trim() : ""
    const language =
      typeof body?.language === "string" ? body.language.trim() : "English"
    const mode =
      typeof body?.mode === "string" ? body.mode.trim() : "luxury-video"

    const subject =
      typeof body?.subject === "string" ? body.subject.trim() : ""
    const visualStyle =
      typeof body?.visualStyle === "string" ? body.visualStyle.trim() : ""
    const environment =
      typeof body?.environment === "string" ? body.environment.trim() : ""
    const mustInclude =
      typeof body?.mustInclude === "string" ? body.mustInclude.trim() : ""
    const avoidElements =
      typeof body?.avoidElements === "string" ? body.avoidElements.trim() : ""
    const cameraStyle =
      typeof body?.cameraStyle === "string" ? body.cameraStyle.trim() : ""
    const lightingStyle =
      typeof body?.lightingStyle === "string" ? body.lightingStyle.trim() : ""

    if (!topic) {
      return NextResponse.json(
        { error: "Topic is required." },
        { status: 400 }
      )
    }

    const apiKey = process.env.LUMA_API_KEY

    if (!apiKey) {
      return NextResponse.json(
        { error: "Missing LUMA_API_KEY in .env.local" },
        { status: 500 }
      )
    }

    const clips = build12ScenePlan({
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
    })

    const created: Array<{
      index: number
      title: string
      id?: string
      state?: string
      error?: string
      prompt: string
    }> = []

    for (const clip of clips) {
      try {
        const response = await fetch(
          "https://api.lumalabs.ai/dream-machine/v1/generations",
          {
            method: "POST",
            headers: {
              accept: "application/json",
              "content-type": "application/json",
              authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
              prompt: clip.prompt,
              model: "ray-2",
              resolution: "720p",
              duration: "5s",
              aspect_ratio: "9:16",
            }),
          }
        )

        const data = await response.json()

        if (!response.ok) {
          created.push({
            index: clip.index,
            title: clip.title,
            error: data?.message || data?.error || "Failed to create clip",
            prompt: clip.prompt,
          })
          continue
        }

        created.push({
          index: clip.index,
          title: clip.title,
          id: data?.id || data?.generation_id,
          state: data?.state || data?.status || "queued",
          prompt: clip.prompt,
        })
      } catch (error) {
        created.push({
          index: clip.index,
          title: clip.title,
          error: error instanceof Error ? error.message : "Unknown error",
          prompt: clip.prompt,
        })
      }
    }

    return NextResponse.json({
      success: true,
      totalClips: created.length,
      clips: created,
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to build 1-minute Luma storyboard pipeline.",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}