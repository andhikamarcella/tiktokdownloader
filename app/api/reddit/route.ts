import { NextResponse } from "next/server";
import { fetchRedditMedia } from "../../../lib/reddit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get("url");

  if (!url) {
    return NextResponse.json({ error: "Missing url parameter" }, { status: 400 });
  }

  try {
    const media = await fetchRedditMedia(url);
    return NextResponse.json(media);
  } catch (error) {
    console.error("Reddit lookup error", error);
    return NextResponse.json({ error: (error as Error).message || "Unable to fetch Reddit media" }, { status: 500 });
  }
}
