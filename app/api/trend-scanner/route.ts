import { NextResponse } from "next/server"
import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
})

export async function POST(req: Request) {
  try {
    const { niche, platform, goal, language } = await req.json()

    if (!niche || !platform || !goal) {
      return NextResponse.json(
        { error: "Missing required fields." },
        { status: 400 }
      )
    }

    const prompt = `
You are CreatorGoat's elite trend strategist.

User input:
- Niche: ${niche}
- Platform: ${platform}
- Goal: ${goal}
- Language: ${language}

Return everything in this language: ${language}

Return in this exact format:

TRENDING ANGLES:
- 5 short trending content angles

VIRAL TOPICS:
- 5 short viral topic ideas

VIDEO IDEAS:
- 5 short short-form video ideas

GROWTH MOVE:
- 1 short practical growth move

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
    console.error("trend-scanner error:", error)

    return NextResponse.json(
      { error: "Failed to scan trends." },
      { status: 500 }
    )
  }
}