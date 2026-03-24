import { NextResponse } from "next/server"
import OpenAI from "openai"

export const dynamic = "force-dynamic"
export const revalidate = 0

export async function POST(req: Request) {
  try {
    const apiKey = process.env.OPENAI_API_KEY

    if (!apiKey) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY is missing." },
        { status: 500 }
      )
    }

    const openai = new OpenAI({
      apiKey,
    })

    const { niche, product, goal, platform, tone, language } = await req.json()

    if (!niche || !product || !goal || !platform || !tone) {
      return NextResponse.json(
        { error: "Missing required fields." },
        { status: 400 }
      )
    }

    const prompt = `
You are CreatorGoat's elite viral strategist.

User input:
- Niche: ${niche}
- Product: ${product}
- Goal: ${goal}
- Platform: ${platform}
- Tone: ${tone}
- Language: ${language}

Return everything in this language: ${language}

Return in this exact format:

HOOKS:
- 5 short hooks

CAPTIONS:
- 3 short captions

SCRIPT:
- 1 short high-converting short-form script

CTA:
- 3 short CTA examples

Rules:
- Keep everything punchy
- Keep it social-media ready
- Make it modern and premium
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
    console.error("auto-viral error:", error)

    return NextResponse.json(
      { error: "Failed to generate viral pack." },
      { status: 500 }
    )
  }
}