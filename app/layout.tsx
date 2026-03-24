import "./globals.css"

export const metadata = {
  title: "CreatorGoat",
  description: "AI tools for creators",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-black text-yellow-400">
        {children}
      </body>
    </html>
  )
}