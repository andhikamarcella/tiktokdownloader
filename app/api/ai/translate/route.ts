import { NextResponse } from "next/server"
import { translateCaption } from "../../../../lib/ai"

export const runtime = "edge"

export async function POST(request: Request) {
  const { caption, target } = (await request.json()) as { caption?: string; target?: "en" | "id" }
  if (!caption) return NextResponse.json({ error: "Missing caption" }, { status: 400 })
  const translated = await translateCaption(caption, target ?? "en")
  return NextResponse.json({ translated })
}
