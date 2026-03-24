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

    if (!niche || !platform || !goal || !postingFrequency || !contentStyle) {
      return NextResponse.json(
        { error: "Missing required fields." },
        { status: 400 }
      )
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

Your job:
Create a premium 7-day content calendar for a creator.

Return the output in this exact structure:

WEEKLY STRATEGY:
- A short strategy summary for the week

DAY 1:
Topic:
Hook:
Content Idea:
Caption Angle:
CTA:

DAY 2:
Topic:
Hook:
Content Idea:
Caption Angle:
CTA:

DAY 3:
Topic:
Hook:
Content Idea:
Caption Angle:
CTA:

DAY 4:
Topic:
Hook:
Content Idea:
Caption Angle:
CTA:

DAY 5:
Topic:
Hook:
Content Idea:
Caption Angle:
CTA:

DAY 6:
Topic:
Hook:
Content Idea:
Caption Angle:
CTA:

DAY 7:
Topic:
Hook:
Content Idea:
Caption Angle:
CTA:

BONUS CONTENT IDEAS:
- 5 extra ideas

BEST POSTING DIRECTION:
- A short final recommendation

Important:
- Be practical
- Be specific
- Make the content ideas different from each other
- Match the platform and goal
- Write everything in ${language}
`

    const response = await client.responses.create({
      model: "gpt-5.4",
      input: [
        {
          role: "system",
          content:
            "You are a premium creator strategist that builds high-converting weekly content calendars.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    })

    const result = response.output_text?.trim() || "No content calendar generated."

    return NextResponse.json({ result })
  } catch (error) {
    console.error("ai-content-calendar error:", error)
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 }
    )
  }
}