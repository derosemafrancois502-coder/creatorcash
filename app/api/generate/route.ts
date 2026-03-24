import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

function buildLanguageInstruction(language: string) {
  return `
IMPORTANT LANGUAGE RULE:
- Write the entire response in ${language}.
- Do not write in English unless the selected language is English.
- Match the tone naturally for native speakers of ${language}.
- Keep the output fluent, natural, and culturally appropriate for ${language}.
`
}

function buildPrompt(
  tool: string,
  topic: string,
  platform: string,
  audience: string,
  language: string
) {
  const languageInstruction = buildLanguageInstruction(language)

  if (tool === "hooks") {
    return `You are a viral content strategist.

${languageInstruction}

Generate 10 viral hooks.

Topic: ${topic}
Platform: ${platform}
Audience: ${audience}

Rules:
- Each hook must be 6 to 12 words maximum
- Do not exceed 12 words under any circumstance
- Strong emotional impact
- Create curiosity
- Sound like a bold statement
- Designed for short-form video (${platform})
- Avoid generic hooks
- Make them contrarian, bold, and attention-grabbing
- If a hook is too long, rewrite it shorter
- Return as a numbered list only`
  }

  if (tool === "captions") {
    return `You are a premium content strategist.

${languageInstruction}

Generate 6 high-converting ${platform} captions.

Topic: ${topic}
Audience: ${audience}

Rules:
- Strong opening line
- Clear, engaging, and creator-friendly
- Optimized for short-form content
- No hashtags unless truly necessary
- Make them feel natural and premium
- Return as a numbered list only`
  }

  if (tool === "scripts") {
    return `You are a short-form video strategist.

${languageInstruction}

Generate 4 short-form video scripts for ${platform}.

Topic: ${topic}
Audience: ${audience}

Rules:
- Start with a strong hook
- Keep each script concise
- Make each script easy to record
- Optimized for short-form content
- Return as a numbered list only`
  }

  if (tool === "replies") {
    return `You are a creator engagement strategist.

${languageInstruction}

Generate 10 smart replies for comments on ${platform}.

Topic: ${topic}
Audience: ${audience}

Rules:
- Short
- Natural
- Strong
- Human-sounding
- Good for creator engagement
- Return as a numbered list only`
  }

  if (tool === "product-writer") {
    return `You are a premium ecommerce copywriter.

${languageInstruction}

Generate 5 product descriptions for ${platform} content promotion.

Product or topic: ${topic}
Audience: ${audience}

Rules:
- Focus on benefits first
- Make the copy premium and persuasive
- Suitable for digital or physical products
- Clear and easy to use
- Return as a numbered list only`
  }

  if (tool === "growth") {
    return `You are a creator growth strategist.

${languageInstruction}

Generate 8 growth ideas for this creator.

Topic: ${topic}
Platform: ${platform}
Audience: ${audience}

Rules:
- Actionable
- Focused on audience growth and content performance
- Suitable for creators
- Clear and practical
- Return as a numbered list only`
  }

  if (tool === "email") {
    return `You are a professional creator business copywriter.

${languageInstruction}

Generate 5 email drafts.

Topic: ${topic}
Audience: ${audience}

Rules:
- Clear subject line idea implied in each draft
- Professional but modern tone
- Good for outreach, sales, or creator business use
- Concise and usable
- Return as a numbered list only`
  }

  if (tool === "course") {
    return `You are a premium digital product strategist.

${languageInstruction}

Create 1 complete mini course blueprint.

Course topic: ${topic}
Platform: ${platform}
Audience: ${audience}

Return in exactly this format:

COURSE TITLE:
...

BIG PROMISE:
...

TARGET AUDIENCE:
...

MODULES:
1. Module title - short description
2. Module title - short description
3. Module title - short description
4. Module title - short description
5. Module title - short description

LESSONS:
1. Lesson idea
2. Lesson idea
3. Lesson idea
4. Lesson idea
5. Lesson idea
6. Lesson idea
7. Lesson idea
8. Lesson idea

OFFER IDEA:
...

Rules:
- Make it practical and easy to sell
- Clear transformation
- Creator-friendly
- Premium but simple
- Focus on a mini course a creator can realistically create
- Avoid fluff`
  }

  if (tool === "viral-pack") {
    return `You are a premium viral content strategist.

${languageInstruction}

Create a complete viral content pack.

Topic: ${topic}
Platform: ${platform}
Audience: ${audience}

Return in exactly this format:

HOOKS:
1. ...
2. ...
3. ...
4. ...
5. ...

CAPTIONS:
1. ...
2. ...
3. ...

SCRIPTS:
1. ...
2. ...

REPLIES:
1. ...
2. ...
3. ...
4. ...
5. ...

Make everything clear, viral, usable, and creator-focused.`
  }

  if (tool === "luxury-video") {
    return `You are a luxury motivational video strategist.

${languageInstruction}

Create a short cinematic motivational video concept.

Topic: ${topic}
Audience: ${audience}
Platform: ${platform}

Return exactly in this format:

HOOK:
...

SCRIPT:
...

VOICEOVER:
...

SCENES:
1. Scene description
2. Scene description
3. Scene description
4. Scene description

CAPTION:
...

CTA:
...

Make it powerful, cinematic, and optimized for short-form video.
Keep scenes visually simple and searchable for stock or AI video generation.`
  }

  if (tool === "product-video") {
    return `You are a product marketing video strategist.

${languageInstruction}

Create a short product promo video.

Product: ${topic}
Audience: ${audience}
Platform: ${platform}

Return exactly in this format:

HOOK:
...

SCRIPT:
...

SCENES:
1. Scene
2. Scene
3. Scene

BENEFITS:
1. ...
2. ...
3. ...

CAPTION:
...

CTA:
...

Make it feel like a short-form ad ready for TikTok or Reels.
Keep scenes visually simple and searchable for stock or AI video generation.`
  }

  if (tool === "cinematic-video") {
    return `You are a cinematic AI video director.

${languageInstruction}

Create a cinematic luxury short-form video concept.

Topic: ${topic}
Platform: ${platform}
Audience: ${audience}

Return exactly in this format:

HOOK:
...

SCRIPT:
...

VOICEOVER:
...

SCENES:
1. Scene description
2. Scene description
3. Scene description
4. Scene description

STYLE:
ultra cinematic
luxury aesthetic
vertical video
high contrast lighting
expensive lifestyle visuals

CAPTION:
...

CTA:
...

Make it feel like a high-end luxury TikTok edit.
Keep each scene visually clear enough to match with stock footage or future AI video generation.`
  }

  return `${languageInstruction}

Generate 5 useful content ideas about ${topic} for ${platform} targeting ${audience}.
Return as a numbered list only.`
}

export async function POST(req: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return Response.json(
        { error: "Missing OPENAI_API_KEY in .env.local" },
        { status: 500 }
      )
    }

    const body = await req.json()
    const { tool, topic, platform, audience, language } = body

    if (!topic || !topic.trim()) {
      return Response.json({ error: "Missing topic." }, { status: 400 })
    }

    const selectedTool = tool || "hooks"
    const selectedPlatform = platform || "TikTok"
    const selectedAudience = audience || "Entrepreneurs"
    const selectedLanguage = language || "English"

    const prompt = buildPrompt(
      selectedTool,
      topic.trim(),
      selectedPlatform,
      selectedAudience,
      selectedLanguage
    )

    const response = await openai.responses.create({
      model: "gpt-5-mini",
      input: prompt,
    })

    return Response.json({
      result: response.output_text || "No content generated.",
    })
  } catch (error: any) {
    console.error("OpenAI API error:", error)

    return Response.json(
      { error: error?.message || "Failed to generate content." },
      { status: 500 }
    )
  }
}