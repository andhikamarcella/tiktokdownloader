import { NextResponse } from "next/server";
import { fetchInstagramMedia } from "@/lib/instagram";

export const dynamic = "force-dynamic";

// RapidAPI-backed Instagram downloader proxy
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    const url = typeof body?.url === "string" ? body.url.trim() : "";

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    if (!process.env.RAPIDAPI_KEY) {
      return NextResponse.json({ error: "RAPIDAPI_KEY is not configured" }, { status: 500 });
    }

    const result = await fetchInstagramMedia(url);

    if (!result.items.length) {
      return NextResponse.json({ error: "No downloadable media found" }, { status: 404 });
    }

    return NextResponse.json(result, { status: 200, statusText: "OK" });
  } catch (error) {
    console.error("Instagram proxy error", error);
    return NextResponse.json({ error: "Unexpected Instagram lookup failure" }, { status: 500 });
  }
}
