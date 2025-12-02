import { NextRequest, NextResponse } from 'next/server'
import { getAudioFingerprint } from '../../../../lib/tiktok'
import { detectMusicFromLLM } from '../../../../lib/ai'

export const runtime = 'edge'

async function spotifySearch(query: string) {
  return [{ title: `${query} - Spotify match`, album: 'Playlist Hits', year: 2024, accuracy: 0.71 }]
}

async function youtubeMusicSearch(query: string) {
  return [{ title: `${query} - YT Music`, album: 'Trending', year: 2023, accuracy: 0.66 }]
}

export async function POST(req: NextRequest) {
  const { url } = await req.json()
  if (!url) return NextResponse.json({ error: 'url missing' }, { status: 400 })

  const fingerprint = await getAudioFingerprint(url)
  const llm = await detectMusicFromLLM('audio sample')
  const [spotify, ytm] = await Promise.all([spotifySearch('tiktok'), youtubeMusicSearch('tiktok')])

  return NextResponse.json({ fingerprint, llm, spotify, youtubeMusic: ytm })
}
