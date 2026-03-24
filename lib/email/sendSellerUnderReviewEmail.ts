import { Resend } from "resend"

export async function sendSellerUnderReviewEmail(
  email: string,
  name?: string
) {
  try {
    const apiKey = process.env.RESEND_API_KEY

    if (!apiKey) {
      console.warn("Resend API key missing — email skipped")
      return
    }

    const resend = new Resend(apiKey)

    await resend.emails.send({
      from: "CreatorGoat <onboarding@creatorgoat.com>",
      to: email,
      subject: "Your application is under review",
      html: `
        <div style="font-family:Arial,Helvetica,sans-serif;padding:24px;background:#ffffff;color:#111827;">
          <h2 style="margin:0 0 16px 0;">CreatorGoat Marketplace</h2>
          <p style="margin:0 0 12px 0;">Hi ${name || "there"},</p>
          <p style="margin:0 0 12px 0;">
            Your seller application has been received and is currently under review.
          </p>
          <p style="margin:0 0 12px 0;">
            Our team is verifying your onboarding details, identity information, and seller readiness.
          </p>
          <p style="margin:0 0 12px 0;">
            You will receive another email once your application is approved or rejected.
          </p>
          <div style="margin-top:24px;">
            <a
              href="http://localhost:3000/marketplace/seller/pending"
              style="display:inline-block;background:#111111;color:#ffffff;padding:12px 18px;border-radius:10px;text-decoration:none;font-weight:600;"
            >
              View Application Status
            </a>
          </div>
          <p style="margin-top:24px;margin-bottom:0;">— CreatorGoat Team</p>
        </div>
      `,
    })
  } catch (error) {
    console.error("Under review email error:", error)
  }
}