import { NextRequest, NextResponse } from "next/server"

const savedProducts: any[] = []

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const item = {
      id: body?.id || crypto.randomUUID(),
      name: body?.name || "Untitled Product",
      category: body?.category || "General",
      price: body?.price || "unavailable",
      image: body?.image || "",
      productUrl: body?.productUrl || "#",
      addedAt: new Date().toISOString(),
    }

    savedProducts.unshift(item)

    return NextResponse.json(
      {
        success: true,
        message: "Product added to marketplace list.",
        item,
      },
      { status: 200 }
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to add product"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ items: savedProducts }, { status: 200 })
}