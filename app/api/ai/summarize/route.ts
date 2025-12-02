import { NextResponse } from "next/server"
import { summarizeCaption } from "../../../../lib/ai"

export const runtime = "edge"

export async function POST(request: Request) {
  const { caption } = (await request.json()) as { caption?: string }
  if (!caption) return NextResponse.json({ error: "Missing caption" }, { status: 400 })
  const summary = await summarizeCaption(caption)
  return NextResponse.json({ summary })
}
