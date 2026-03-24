export async function POST(req: Request) {
  const body = await req.json()
  const { query } = body

  const res = await fetch(
    `https://api.pexels.com/videos/search?query=${query}&per_page=5`,
    {
      headers: {
        Authorization: process.env.PEXELS_API_KEY || "",
      },
    }
  )

  const data = await res.json()

  const videos = data.videos?.map((v: any) => v.video_files[0].link)

  return Response.json({
    videos,
  })
}