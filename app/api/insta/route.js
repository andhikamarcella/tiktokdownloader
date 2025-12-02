import { NextResponse } from "next/server";

export const runtime = "edge";
export const dynamic = "force-dynamic";

// GET /api/insta?url={encodedURL}
// Proxies the RapidAPI Instagram downloader endpoint and returns its JSON.
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const targetUrl = searchParams.get("url");

  if (!targetUrl) {
    return NextResponse.json({ error: "Missing url query parameter" }, { status: 400 });
  }

  const rapidApiHost =
    process.env.RAPIDAPI_HOST || "instagram-downloader-download-instagram-stories-videos4.p.rapidapi.com";
  const rapidEndpoint = `https://${rapidApiHost}/convert?url=${encodeURIComponent(targetUrl)}`;

  try {
    const response = await fetch(rapidEndpoint, {
      method: "GET",
      headers: {
        "X-RapidAPI-Key": process.env.RAPIDAPI_KEY || "",
        "X-RapidAPI-Host": rapidApiHost,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      const message = await response.text();
      return NextResponse.json(
        { error: `RapidAPI error: ${response.status} ${message || response.statusText}` },
        { status: 500 }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
