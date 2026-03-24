import { Resend } from "resend"

export async function sendSellerRejectedEmail(
  email: string,
  name?: string
) {
  try {
    const apiKey = process.env.RESEND_API_KEY

    if (!apiKey) {
      console.warn("Resend API key missing — rejected email skipped")
      return
    }

    const resend = new Resend(apiKey)

    await resend.emails.send({
      from: "CreatorGoat <onboarding@creatorgoat.com>",
      to: email,
      subject: "Your seller application was not approved",
      html: `
        <div style="font-family:Arial,Helvetica,sans-serif;padding:24px;background:#ffffff;color:#111827;">
          <h2 style="margin:0 0 16px 0;">CreatorGoat Marketplace</h2>
          <p style="margin:0 0 12px 0;">Hi ${name || "there"},</p>
          <p style="margin:0 0 12px 0;">
            Thank you for applying to become a seller on CreatorGoat.
          </p>
          <p style="margin:0 0 12px 0;">
            At this time, your seller application was not approved.
          </p>
          <p style="margin:0 0 12px 0;">
            You may review your information and apply again later if needed.
          </p>
          <div style="margin-top:24px;">
            <a
              href="http://localhost:3000/marketplace"
              style="display:inline-block;background:#111111;color:#ffffff;padding:12px 18px;border-radius:10px;text-decoration:none;font-weight:600;"
            >
              Go to Marketplace
            </a>
          </div>
          <p style="margin-top:24px;margin-bottom:0;">— CreatorGoat Team</p>
        </div>
      `,
    })
  } catch (error) {
    console.error("Rejected email error:", error)
  }
}