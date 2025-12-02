import { NextResponse } from "next/server";
import { fetchInstagramMedia, normalizeSaveInsta, type SaveInstaItem, type SaveInstaResponse } from "../../../lib/instagram";

export const runtime = "edge";

const SAVEINSTA_HOST = "saveinsta.p.rapidapi.com";

async function trySaveInsta(url: string, apiKey: string): Promise<{ items: SaveInstaItem[]; title?: string; author?: string } | null> {
  // Some RapidAPI plans expose the endpoint at the root instead of /download. Try both.
  const endpoints = [
    `https://${SAVEINSTA_HOST}/download?url=${encodeURIComponent(url)}`,
    `https://${SAVEINSTA_HOST}/?url=${encodeURIComponent(url)}`,
  ];

  for (const endpoint of endpoints) {
    const apiRes = await fetch(endpoint, {
      method: "GET",
      headers: {
        "X-RapidAPI-Key": apiKey,
        "X-RapidAPI-Host": SAVEINSTA_HOST,
      },
      cache: "no-store",
    });

    if (!apiRes.ok) {
      // Try next endpoint variant on 404; otherwise bubble the failure
      if (apiRes.status === 404) continue;
      const text = await apiRes.text();
      throw new Error(`SaveInsta failed: ${apiRes.status} ${text}`);
    }

    const data = (await apiRes.json()) as SaveInstaResponse;
    const normalized = normalizeSaveInsta(data);
    if (normalized.items.length) {
      return normalized;
    }
  }

  return null;
}

// SaveInsta RapidAPI proxy with fallback to the Rapid Instagram host
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get("url");

  if (!url) {
    return NextResponse.json({ error: "Missing url parameter" }, { status: 400 });
  }
  if (!process.env.RAPIDAPI_KEY) {
    return NextResponse.json({ error: "RAPIDAPI_KEY is not configured" }, { status: 500 });
  }

  try {
    // Primary attempt: SaveInsta
    const saveInstaResult = await trySaveInsta(url, process.env.RAPIDAPI_KEY);
    if (saveInstaResult) {
      return NextResponse.json({
        title: saveInstaResult.title,
        author: saveInstaResult.author,
        items: saveInstaResult.items,
        source: "saveinsta",
      });
    }

    // Fallback: use the configured RapidAPI host from lib/instagram (convert endpoint)
    const rapidResult = await fetchInstagramMedia(url);
    if ((rapidResult.items?.length ?? 0) === 0) {
      return NextResponse.json({ error: "No downloadable media found" }, { status: 404 });
    }

    return NextResponse.json({
      title: rapidResult.title,
      author: rapidResult.author,
      items: rapidResult.items,
      source: "rapidapi",
    });
  } catch (error) {
    console.error("Instagram proxy error", error);
    return NextResponse.json({ error: (error as Error).message || "Unexpected error calling Instagram downloader" }, { status: 500 });
  }
}
