import { NextResponse } from "next/server"
import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
})

export async function POST(req: Request) {
  try {
    const { niche, product, platform, language } = await req.json()

    if (!niche || !product || !platform) {
      return NextResponse.json(
        { error: "Missing required fields." },
        { status: 400 }
      )
    }

    const prompt = `
You are CreatorGoat's viral video strategist.

User input:
- Niche: ${niche}
- Product: ${product}
- Platform: ${platform}
- Language: ${language}

Return everything in this language: ${language}

Return in this exact format:

VIDEO STRUCTURE:
- Hook
- Problem
- Story
- Solution
- CTA

SCRIPT:
- 1 short viral script for a short-form video

SHOT LIST:
- 5 short scenes for filming

CAPTION:
- 1 caption

HASHTAGS:
- 5 hashtags

Rules:
- Keep everything short
- Make it modern and social-media ready
- No intro
- No outro
- No long paragraphs
`

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [{ role: "user", content: prompt }],
    })

    return NextResponse.json({
      result: completion.choices[0]?.message?.content ?? "No result generated.",
    })
  } catch (error) {
    console.error("video-cloning error:", error)

    return NextResponse.json(
      { error: "Failed to generate video structure." },
      { status: 500 }
    )
  }
}