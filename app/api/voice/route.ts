import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return Response.json(
        { error: "Missing OPENAI_API_KEY in .env.local" },
        { status: 500 }
      )
    }

    const body = await req.json()
    const { script, voice } = body

    if (!script || !script.trim()) {
      return Response.json({ error: "Missing script." }, { status: 400 })
    }

    const speech = await openai.audio.speech.create({
      model: "gpt-4o-mini-tts",
      voice: voice || "alloy",
      input: script.trim(),
      response_format: "mp3",
    })

    const audioBuffer = Buffer.from(await speech.arrayBuffer())

    return new Response(audioBuffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Disposition": 'inline; filename="creatorgoat-voice.mp3"',
      },
    })
  } catch (error: any) {
    console.error("Voice API error:", error)

    return Response.json(
      { error: error?.message || "Failed to generate voice." },
      { status: 500 }
    )
  }
}