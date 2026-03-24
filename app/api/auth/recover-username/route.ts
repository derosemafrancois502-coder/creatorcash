// app/api/auth/recover-username/route.ts
import { NextResponse } from "next/server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const email = String(body?.email || "").trim().toLowerCase()

    if (!email) {
      return NextResponse.json(
        { error: "Email is required." },
        { status: 400 }
      )
    }

    // Placeholder secure response.
    // Later, when your profiles/users table email + username structure is ready,
    // this route can trigger resend/email service without changing UI logic.
    return NextResponse.json({
      success: true,
      message:
        "If an account exists for this email, username recovery instructions have been sent.",
    })
  } catch {
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    )
  }
}