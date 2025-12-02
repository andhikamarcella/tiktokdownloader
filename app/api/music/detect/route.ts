import { NextResponse } from "next/server"

export const runtime = "edge"

type DetectRequest = { url?: string; audioUrl?: string }

async function handleAudD(audioUrl: string) {
  if (!process.env.AUDD_API_KEY) return null
  const params = new URLSearchParams({ api_token: process.env.AUDD_API_KEY, url: audioUrl, return: "apple_music,spotify" })
  return fetch("https://api.audd.io/?" + params.toString(), { method: "POST" })
    .then((res) => res.json())
    .catch(() => null)
}

async function handleYouTubeSearch(query: string) {
  if (!process.env.YOUTUBE_API_KEY) return null
  const params = new URLSearchParams({ part: "snippet", q: query, key: process.env.YOUTUBE_API_KEY, maxResults: "3", type: "video" })
  return fetch("https://www.googleapis.com/youtube/v3/search?" + params.toString())
    .then((res) => res.json())
    .catch(() => null)
}

async function handleACRPlaceholder(audioUrl: string) {
  if (!process.env.ACR_ACCESS_KEY || !process.env.ACR_ACCESS_SECRET || !process.env.ACR_HOST) return null
  return {
    host: process.env.ACR_HOST,
    note: `Send ${audioUrl} to your ACRCloud bucket with provided keys.`
  }
}

export async function POST(request: Request) {
  const { url, audioUrl }: DetectRequest = await request.json()
  if (!url && !audioUrl) return NextResponse.json({ error: "Missing audio source" }, { status: 400 })

  const source = audioUrl || url || ""
  const fingerprint = { hash: `local-${btoa(source).slice(0, 12)}`, confidence: 0.42 }

  const [audd, youtube, acr] = await Promise.all([
    source ? handleAudD(source) : Promise.resolve(null),
    source ? handleYouTubeSearch(source) : Promise.resolve(null),
    source ? handleACRPlaceholder(source) : Promise.resolve(null)
  ])

  return NextResponse.json({ fingerprint, audd, youtube, acr })
}
