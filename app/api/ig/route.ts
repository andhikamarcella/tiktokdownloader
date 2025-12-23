import { NextResponse } from "next/server";
import { fetchInstagramMedia } from "../../../lib/instagram";

export const runtime = "nodejs";

// Instagram Downloader API (Scrape-first, RapidAPI fallback inside lib)
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const url = searchParams.get("url");

    if (!url) {
      return NextResponse.json(
        { error: "Missing url parameter" },
        { status: 400 }
      );
    }

    const result = await fetchInstagramMedia(url);

    if (!result.items || result.items.length === 0) {
      return NextResponse.json(
        { error: "No downloadable media found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        title: result.title,
        author: result.author,
        items: result.items,
        source: "scrape",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Instagram proxy error:", error);

    return NextResponse.json(
      { error: "Instagram lookup failed" },
      { status: 500 }
    );
  }
}
