import { NextRequest, NextResponse } from 'next/server'
import { getProfileInfo } from '../../../../lib/tiktok'

export const runtime = 'edge'

export async function POST(req: NextRequest) {
  const { url } = await req.json()
  if (!url) return NextResponse.json({ error: 'profile url missing' }, { status: 400 })

  const profile = await getProfileInfo(url)
  return NextResponse.json(profile)
}
