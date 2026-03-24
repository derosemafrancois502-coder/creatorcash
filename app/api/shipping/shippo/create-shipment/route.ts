import { NextResponse } from "next/server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function POST() {
  return NextResponse.json(
    { error: "Shippo create shipment is not configured yet." },
    { status: 501 }
  )
}
