import { NextResponse } from "next/server"
import { CaptionStyle, rewriteCaption } from "../../../../lib/ai"

export const runtime = "edge"

export async function POST(request: Request) {
  const { caption, style } = (await request.json()) as { caption?: string; style?: CaptionStyle }
  if (!caption) return NextResponse.json({ error: "Missing caption" }, { status: 400 })
  const rewritten = await rewriteCaption(caption, style ?? "viral")
  return NextResponse.json({ rewritten })
}
