import { NextRequest, NextResponse } from 'next/server'
import { getVideoInfo, resolveRedirect } from '../../../../lib/tiktok'
import { extractCaption, cleanCaption, summarizeCaption, rewriteCaption, translateCaption } from '../../../../lib/ai'

export const runtime = 'edge'

export async function POST(req: NextRequest) {
  const { url, region = 'US' } = await req.json()
  if (!url) return NextResponse.json({ error: 'Missing url' }, { status: 400 })

  const resolved = await resolveRedirect(url)
  const video = await getVideoInfo(resolved, region)
  const caption = await extractCaption(video.caption)

  const response = {
    resolvedUrl: resolved,
    media: video,
    captions: {
      raw: caption,
      clean: await cleanCaption(caption),
      summary: await summarizeCaption(caption),
      aesthetic: await rewriteCaption(caption, 'aesthetic'),
      formal: await rewriteCaption(caption, 'formal'),
      funny: await rewriteCaption(caption, 'funny'),
      viral: await rewriteCaption(caption, 'viral'),
      en: await translateCaption(caption, 'en'),
      id: await translateCaption(caption, 'id')
    }
  }

  return NextResponse.json(response)
}
