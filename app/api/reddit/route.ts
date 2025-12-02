import { NextResponse } from "next/server";
import { fetchRedditMedia } from "../../../lib/reddit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type AuthPayload = { url?: string; sessionCookie?: string; bearerToken?: string };

async function handleRequest(payload: AuthPayload) {
  const url = payload.url;

  if (!url) {
    return NextResponse.json(
      {
        success: false,
        type: "unknown",
        media: { video: null, audio: null, image: null, gallery: [] },
        resolvedUrl: "",
        error: "Missing url parameter",
      },
      { status: 400 },
    );
  }

  try {
    const media = await fetchRedditMedia(url, {
      sessionCookie: payload.sessionCookie,
      bearerToken: payload.bearerToken,
    });
    return NextResponse.json({
      success: true,
      ...media,
    });
  } catch (error) {
    console.error("Reddit lookup error", error);
    return NextResponse.json(
      {
        success: false,
        type: "unknown",
        media: { video: null, audio: null, image: null, gallery: [] },
        resolvedUrl: "",
        error: (error as Error).message || "Unable to fetch Reddit media",
      },
      { status: 500 },
    );
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  return handleRequest({
    url: searchParams.get("url") || undefined,
    sessionCookie: searchParams.get("sessionCookie") || undefined,
    bearerToken: searchParams.get("bearerToken") || undefined,
  });
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as AuthPayload;
  return handleRequest(body);
}
