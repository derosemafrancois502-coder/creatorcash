import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const name = String(body?.name || "This product")
    const category = String(body?.category || "product")
    const angle = String(body?.contentAngle || "premium content")

    const hooks = [
      `This ${category.toLowerCase()} product is getting attention for a reason.`,
      `Nobody talks enough about how ${name} can change your daily routine.`,
      `Low competition. Strong angle. ${name} is a serious opportunity.`,
      `If you sell in ${category.toLowerCase()}, this content angle is worth testing.`,
      `${name} has the kind of visual appeal that performs on short-form video.`,
      `This is how I would position ${name} to make people stop scrolling.`,
      `Strong product. Clear demand. Better content angle.`,
      `Here’s why ${name} can outperform crowded products with the right execution.`,
      `This ${category.toLowerCase()} product has real content potential.`,
      `Use ${angle.toLowerCase()} and make the offer feel premium.`,
    ]

    return NextResponse.json({ hooks }, { status: 200 })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to generate hooks"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}