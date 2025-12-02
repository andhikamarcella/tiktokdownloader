import { NextRequest, NextResponse } from 'next/server'
import { cleanCaption, summarizeCaption, rewriteCaption, translateCaption } from '../../../../lib/ai'

export const runtime = 'edge'

export async function POST(req: NextRequest) {
  const { caption, style = 'viral', target = 'en' } = await req.json()
  if (!caption) return NextResponse.json({ error: 'caption missing' }, { status: 400 })

  const cleaned = await cleanCaption(caption)
  return NextResponse.json({
    cleaned,
    summary: await summarizeCaption(cleaned),
    rewritten: await rewriteCaption(cleaned, style),
    translated: await translateCaption(cleaned, target)
  })
}
