export async function POST(req: Request) {
  try {
    const { query } = await req.json()

    if (!process.env.PEXELS_API_KEY) {
      return Response.json({ clips: [] })
    }

    const res = await fetch(
      `https://api.pexels.com/videos/search?query=${encodeURIComponent(
        query
      )}&orientation=portrait&size=medium&per_page=8`,
      {
        headers: {
          Authorization: process.env.PEXELS_API_KEY,
        },
      }
    )

    const data = await res.json()

    const clips =
      data.videos?.map((video: any) => {
        const files = video.video_files || []

        const bestFile =
          files.find(
            (f: any) =>
              f.quality === "hd" &&
              f.width >= 720 &&
              f.link
          ) ||
          files.find((f: any) => f.quality === "sd" && f.link) ||
          files[0]

        return bestFile?.link
      }).filter(Boolean) || []

    return Response.json({ clips })
  } catch (err) {
    console.error("Pexels error:", err)
    return Response.json({ clips: [] })
  }
}