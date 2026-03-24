import { NextResponse } from "next/server"
import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
})

export async function POST(req: Request) {
  try {
    const { niche, platform, goal, tone, language } = await req.json()

    if (!niche || !platform || !goal || !tone) {
      return NextResponse.json(
        { error: "Missing required fields." },
        { status: 400 }
      )
    }

    const prompt = `
You are CreatorGoat's elite AI Creator Copilot.

User input:
- Niche: ${niche}
- Platform: ${platform}
- Goal: ${goal}
- Tone: ${tone}
- Language: ${language}

Return everything in this language: ${language}

Return in this exact format:

TODAY'S BEST MOVE:
- 1 short clear action for today

WHAT TO POST:
- 1 short content idea

HOOK:
- 3 short hook options

CAPTION:
- 2 short caption options

CTA:
- 3 short CTA options

GROWTH MOVE:
- 1 short growth action

MONETIZATION MOVE:
- 1 short monetization action

AVOID THIS:
- 1 short mistake to avoid

Rules:
- Keep everything short
- Make it premium, modern, strategic, and social-media ready
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
    console.error("creator-copilot error:", error)

    return NextResponse.json(
      { error: "Failed to generate copilot plan." },
      { status: 500 }
    )
  }
}