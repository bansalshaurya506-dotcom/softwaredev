import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const topic = new URL(request.url).searchParams.get("topic")?.trim() || ""
  if (!topic || topic.length > 100) return NextResponse.json({ error: "Enter a short learning topic." }, { status: 400 })
  if (!process.env.YOUTUBE_API_KEY) return NextResponse.json({ configured: false, videos: [] })
  const url = new URL("https://www.googleapis.com/youtube/v3/search")
  url.searchParams.set("key", process.env.YOUTUBE_API_KEY)
  url.searchParams.set("part", "snippet")
  url.searchParams.set("q", topic + " tutorial")
  url.searchParams.set("type", "video")
  url.searchParams.set("safeSearch", "strict")
  url.searchParams.set("maxResults", "4")
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(10000), next: { revalidate: 600 } })
    if (!res.ok) throw new Error("YouTube lookup failed")
    const json = await res.json()
    const videos = (json.items || []).filter((item: { id?: { videoId?: string } }) => item.id?.videoId).map((item: { id: { videoId: string }; snippet: { title: string; channelTitle: string } }) => ({
      id: item.id.videoId,
      title: item.snippet.title,
      channel: item.snippet.channelTitle,
      url: "https://www.youtube.com/watch?v=" + encodeURIComponent(item.id.videoId),
    }))
    return NextResponse.json({ configured: true, videos })
  } catch {
    return NextResponse.json({ error: "Could not retrieve videos right now. Try YouTube search instead." }, { status: 502 })
  }
}
