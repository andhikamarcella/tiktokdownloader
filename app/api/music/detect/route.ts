import { NextResponse } from "next/server";

export const runtime = "edge";

type DetectRequest = { url?: string; audioUrl?: string };

type DetectionMatch =
  | { provider: "audd"; data: unknown }
  | { provider: "acr"; data: unknown }
  | { provider: "youtube"; data: unknown }
  | { provider: "none"; data: null };

async function handleAudD(audioUrl: string) {
  if (!process.env.AUDD_API_KEY) return null;
  const params = new URLSearchParams({ api_token: process.env.AUDD_API_KEY, url: audioUrl, return: "apple_music,spotify" });
  const res = await fetch("https://api.audd.io/?" + params.toString(), { method: "POST" }).catch(() => null);
  if (!res || !res.ok) return null;
  return res.json().catch(() => null);
}

async function handleYouTubeSearch(query: string) {
  if (!process.env.YOUTUBE_API_KEY) return null;
  const params = new URLSearchParams({ part: "snippet", q: query, key: process.env.YOUTUBE_API_KEY, maxResults: "3", type: "video" });
  const res = await fetch("https://www.googleapis.com/youtube/v3/search?" + params.toString()).catch(() => null);
  if (!res || !res.ok) return null;
  return res.json().catch(() => null);
}

async function handleACRPlaceholder(audioUrl: string) {
  if (!process.env.ACR_ACCESS_KEY || !process.env.ACR_ACCESS_SECRET || !process.env.ACR_HOST) return null;
  return {
    host: process.env.ACR_HOST,
    note: `Send ${audioUrl} to your ACRCloud bucket with provided keys.`,
  };
}

export async function POST(request: Request) {
  const { url, audioUrl }: DetectRequest = await request.json();
  if (!url && !audioUrl) return NextResponse.json({ error: "Missing audio source" }, { status: 400 });

  const source = audioUrl || url || "";
  const fingerprint = { hash: `local-${btoa(source).slice(0, 12)}`, confidence: 0.42 };

  let match: DetectionMatch = { provider: "none", data: null };
  const audd = await handleAudD(source);
  if (audd?.result) {
    match = { provider: "audd", data: audd.result };
  } else {
    const acr = await handleACRPlaceholder(source);
    if (acr) {
      match = { provider: "acr", data: acr };
    } else {
      const youtube = await handleYouTubeSearch(source);
      if (youtube?.items?.length) {
        match = { provider: "youtube", data: youtube.items[0] };
      }
    }
  }

  const youtube = match.provider === "youtube" ? match.data : await handleYouTubeSearch(source);

  return NextResponse.json({ fingerprint, match, audd, youtube });
}
