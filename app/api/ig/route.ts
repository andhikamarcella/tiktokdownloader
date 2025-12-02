import { NextResponse } from "next/server";
import { normalizeSaveInsta, type SaveInstaResponse } from "../../../lib/instagram";

export const runtime = "edge";

// SaveInsta RapidAPI proxy
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
    const apiRes = await fetch(`https://saveinsta.p.rapidapi.com/download?url=${encodeURIComponent(url)}`, {
      method: "GET",
      headers: {
        "X-RapidAPI-Key": process.env.RAPIDAPI_KEY,
        "X-RapidAPI-Host": "saveinsta.p.rapidapi.com",
      },
      next: { revalidate: 0 },
    });

    if (!apiRes.ok) {
      const text = await apiRes.text();
      return NextResponse.json({ error: `SaveInsta failed: ${apiRes.status} ${text}` }, { status: apiRes.status });
    }

    const data = (await apiRes.json()) as SaveInstaResponse;
    const normalized = normalizeSaveInsta(data);

    if (!normalized.items.length) {
      return NextResponse.json({ error: "No downloadable media found" }, { status: 404 });
    }

    return NextResponse.json({
      title: normalized.title,
      author: normalized.author,
      items: normalized.items,
    });
  } catch (error) {
    console.error("SaveInsta proxy error", error);
    return NextResponse.json({ error: "Unexpected error calling SaveInsta" }, { status: 500 });
  }
}
