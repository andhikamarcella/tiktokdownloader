import { NextResponse } from "next/server";

export const runtime = "edge";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get("url");

  if (!url) {
    return NextResponse.json(
      { error: "Missing media url" },
      { status: 400 }
    );
  }

  try {
    const res = await fetch(url, {
      headers: {
        // PENTING: bikin IG mikir ini browser beneran
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        Referer: "https://www.instagram.com/",
      },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: "Failed to fetch media" },
        { status: 500 }
      );
    }

    return new NextResponse(res.body, {
      headers: {
        "Content-Type":
          res.headers.get("content-type") ||
          "application/octet-stream",
        "Content-Disposition": "attachment",
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Download proxy failed" },
      { status: 500 }
    );
  }
}
