import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const name = String(body?.name || "This product")
    const category = String(body?.category || "product")
    const whyHot = String(body?.whyHot || "")
    const angle = String(body?.contentAngle || "")

    const ad = {
      headline: `${name} — premium ${category.toLowerCase()} with strong demand`,
      hook: `If you're looking for a cleaner way to position a ${category.toLowerCase()} product, start here.`,
      body: `${name} stands out because ${whyHot.toLowerCase()} ${angle}`,
      cta: `Test ${name} with premium content today.`,
    }

    return NextResponse.json(ad, { status: 200 })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to generate product ad"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}