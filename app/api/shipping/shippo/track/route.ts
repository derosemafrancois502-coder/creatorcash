import { NextResponse } from "next/server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET() {
  return NextResponse.json(
    { error: "Shippo tracking is not configured yet." },
    { status: 501 }
  )
}

export async function POST() {
  return NextResponse.json(
    { error: "Shippo tracking is not configured yet." },
    { status: 501 }
  )
}
