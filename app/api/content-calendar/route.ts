import { NextResponse } from "next/server"
import OpenAI from "openai"

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const niche = typeof body?.niche === "string" ? body.niche.trim() : ""
    const platform =
      typeof body?.platform === "string" ? body.platform.trim() : ""
    const goal = typeof body?.goal === "string" ? body.goal.trim() : ""
    const postingFrequency =
      typeof body?.postingFrequency === "string"
        ? body.postingFrequency.trim()
        : ""
    const contentStyle =
      typeof body?.contentStyle === "string"
        ? body.contentStyle.trim()
        : ""
    const language =
      typeof body?.language === "string" ? body.language.trim() : "English"
    const mode = body?.mode === "30-day" ? "30-day" : "7-day"

    if (!niche || !platform || !goal || !postingFrequency || !contentStyle) {
      return NextResponse.json(
        { error: "Missing required fields." },
        { status: 400 }
      )
    }

    const daysCount = mode === "30-day" ? 30 : 7

    let dayBlocks = ""
    for (let i = 1; i <= daysCount; i++) {
      dayBlocks += `
DAY ${i}:
Topic:
Hook:
Content Idea:
Caption Angle:
CTA:
`
    }

    const prompt = `
You are an elite AI Content Calendar engine inside a creator operating system.

Inputs:
- Niche: ${niche}
- Platform: ${platform}
- Goal: ${goal}
- Posting Frequency: ${postingFrequency}
- Content Style: ${contentStyle}
- Language: ${language}
- Mode: ${mode}

Create a premium ${daysCount}-day content calendar.

Return the output in this exact structure:

WEEKLY STRATEGY:
- A short strategy summary

${dayBlocks}

BONUS CONTENT IDEAS:
- 5 extra ideas

BEST POSTING DIRECTION:
- A short final recommendation

Rules:
- Be specific
- Make each day different
- Match the platform and goal
- Keep hooks strong
- Keep content ideas practical
- Write everything in ${language}
`

    const response = await client.responses.create({
      model: "gpt-5.4",
      input: [
        {
          role: "system",
          content:
            "You are a premium creator strategist that builds high-converting structured content calendars.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    })

    const result =
      response.output_text?.trim() || "No content calendar generated."

    return NextResponse.json({ result })
  } catch (error) {
    console.error("content-calendar error:", error)
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 }
    )
  }
}