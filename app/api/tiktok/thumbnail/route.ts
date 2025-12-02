import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

function generateFrames(seed: string) {
  return Array.from({ length: 5 }).map((_, i) => ({
    url: `https://picsum.photos/seed/${seed}-${i}/800/1200`,
    brightness: Math.random(),
    clarity: Math.random()
  }))
}

export async function POST(req: NextRequest) {
  const { url } = await req.json()
  if (!url) return NextResponse.json({ error: 'url missing' }, { status: 400 })

  const frames = generateFrames(encodeURIComponent(url))
  const best = frames.sort((a, b) => b.brightness + b.clarity - (a.brightness + a.clarity))[0]

  return NextResponse.json({
    best,
    frames,
    variants: {
      square: `${best.url}?w=800&h=800`,
      portrait: `${best.url}?w=1080&h=1920`,
      landscape: `${best.url}?w=1920&h=1080`
    }
  })
}
