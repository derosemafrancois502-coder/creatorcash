export async function saveToHistory({
  module,
  title,
  input,
  output,
}: {
  module: string
  title?: string
  input?: any
  output: string
}) {
  try {
    const res = await fetch("/api/history/save", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        module,
        title,
        input,
        output,
      }),
    })

    if (!res.ok) {
      const data = await res.json().catch(() => null)
      console.error("saveToHistory failed:", data?.error || "Unknown error")
    }
  } catch (err) {
    console.error("saveToHistory error:", err)
  }
}