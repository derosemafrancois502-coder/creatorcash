import { NextResponse } from "next/server"
import OpenAI from "openai"

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const { niche, platform, goal, language } = body

    if (!niche || !platform || !goal) {
      return NextResponse.json(
        { error: "Missing fields" },
        { status: 400 }
      )
    }

    const prompt = `
You are a VIRAL TREND RADAR AI inside a creator operating system.

Inputs:
- Niche: ${niche}
- Platform: ${platform}
- Goal: ${goal}
- Language: ${language}

Return structured output:

TREND HEAT:
(score 1–100 + explanation)

RISING TRENDS:
(5 trends)

VIRAL ANGLES:
(5 angles)

WHAT IS WORKING NOW:
(Short explanation)

BEST MOVE RIGHT NOW:
(1 powerful move)

HOOK IDEAS:
(3 hooks)

CTA IDEAS:
(3 CTA)

Keep it sharp, practical, and premium.
Write in ${language}.
`

    const response = await client.responses.create({
      model: "gpt-5.4",
      input: prompt,
    })

    return NextResponse.json({
      result: response.output_text,
    })
  } catch (err) {
    console.error(err)
    return NextResponse.json(
      { error: "Error generating radar" },
      { status: 500 }
    )
  }
}