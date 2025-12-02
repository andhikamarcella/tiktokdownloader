import { NextResponse } from "next/server"
import { buildCaptionSuite } from "../../../../lib/ai"
import { getVideoInfo } from "../../../../lib/tiktok"

export const runtime = "edge"

export async function POST(request: Request) {
  try {
    const { url } = (await request.json()) as { url?: string }
    if (!url) return NextResponse.json({ error: "Missing url" }, { status: 400 })

    const media = await getVideoInfo(url)
    const captions = media.caption ? await buildCaptionSuite(media.caption) : null

    return NextResponse.json({ media, captions })
  } catch (error: unknown) {
    console.error(error)
    return NextResponse.json({ error: "Lookup failed" }, { status: 500 })
  }
}
