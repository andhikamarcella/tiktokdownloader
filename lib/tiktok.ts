export type TikTokMedia = {
  watermarkUrl: string
  nowatermarkUrl: string
  audioUrl: string
  thumbnail: string
  caption: string
  hashtags: string[]
  author: { username: string; nickname: string; avatar: string }
  duration: number
  sound: { title: string; artist: string; album?: string }
}

const userAgents = [
  'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)',
  'Mozilla/5.0 (Linux; Android 13; Pixel 7)',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
]

export async function getVideoInfo(url: string, region: 'US' | 'EU' | 'Asia' = 'US'): Promise<TikTokMedia> {
  const ua = userAgents[Math.floor(Math.random() * userAgents.length)]
  // Placeholder: simulate scraping by returning mocked data. In production, use playwright or direct HTML parsing.
  const id = url.split('/').pop() || 'demo'
  return {
    watermarkUrl: `https://example.com/${id}?watermark=1` ,
    nowatermarkUrl: `https://example.com/${id}?watermark=0`,
    audioUrl: `https://example.com/${id}.m4a`,
    thumbnail: `https://picsum.photos/seed/${encodeURIComponent(id)}/1080/1920`,
    caption: 'Sample caption from TikTok video with #hashtags and @mentions',
    hashtags: ['#tiktok', '#viral', '#dance'],
    author: { username: 'creator', nickname: 'Pro Creator', avatar: 'https://i.pravatar.cc/150?img=68' },
    duration: 42,
    sound: { title: 'Viral Sound', artist: 'DJ Sample', album: 'TikTok Mix' }
  }
}

export async function resolveRedirect(url: string): Promise<string> {
  // Placeholder for redirect resolution using fetch and following headers
  return url
}

export async function getProfileInfo(profileUrl: string) {
  return {
    avatar: 'https://i.pravatar.cc/200?img=22',
    username: '@profile',
    nickname: 'Creator Nick',
    bio: 'Digital creator · downloads ready',
    followers: 120_000,
    videos: Array.from({ length: 8 }).map((_, i) => ({
      id: `vid-${i + 1}`,
      title: `Highlight clip ${i + 1}`,
      cover: `https://picsum.photos/seed/profile-${i}/400/700`,
      url: `${profileUrl}/video/${i + 1}`
    }))
  }
}

export async function getAudioFingerprint(url: string) {
  // Placeholder logic; replace with wasm audio decoding + hash
  return { hash: 'fingerprint-hash', energy: 0.82 }
}

export async function rotateProxy(region: 'US' | 'EU' | 'Asia') {
  const proxies = {
    US: process.env.PROXY_URL,
    EU: process.env.PROXY_URL,
    Asia: process.env.PROXY_URL
  }
  return proxies[region]
}
