import { NextResponse } from "next/server"
import { cleanCaption } from "../../../../lib/ai"

export const runtime = "edge"

export async function POST(request: Request) {
  const { caption } = (await request.json()) as { caption?: string }
  if (!caption) return NextResponse.json({ error: "Missing caption" }, { status: 400 })
  const cleaned = await cleanCaption(caption)
  return NextResponse.json({ cleaned })
}
