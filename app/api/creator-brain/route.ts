import { NextResponse } from "next/server"
import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
})

export async function POST(req: Request) {
  try {
    const { niche, goal, platform, language } = await req.json()

    if (!niche || !goal || !platform) {
      return NextResponse.json(
        { error: "Missing required fields." },
        { status: 400 }
      )
    }

    const prompt = `
You are CreatorGoat's elite creator strategist.

User input:
- Niche: ${niche}
- Goal: ${goal}
- Platform: ${platform}
- Language: ${language}

Return everything in this language: ${language}

Return in this exact format:

HOOKS:
- 5 short viral hooks

VIDEO IDEAS:
- 5 short video ideas

CONTENT PILLARS:
- 3 short content pillars

GROWTH PLAN:
- 1 short practical growth plan

CTA:
- 5 short CTA examples

Rules:
- Keep everything short
- Make it premium, modern, and useful
- Make it social-media ready
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
    console.error("creator-brain error:", error)

    return NextResponse.json(
      { error: "Failed to generate strategy." },
      { status: 500 }
    )
  }
}