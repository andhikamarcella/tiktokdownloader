import { NextResponse } from "next/server";
import { fetchInstagramMedia } from "../../../../lib/instagram";

export async function POST(req: Request) {
  try {
    const { url } = await req.json();
    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "Missing Instagram URL" }, { status: 400 });
    }
    const media = await fetchInstagramMedia(url);
    return NextResponse.json({ media });
  } catch (error) {
    console.error("Instagram lookup failed", error);
    return NextResponse.json({ error: "Lookup failed" }, { status: 500 });
  }
}
