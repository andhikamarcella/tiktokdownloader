export type TikTokMedia = {
  nowatermarkUrl: string
  watermarkUrl: string
  audioUrl: string
  thumbnail: string
  caption: string
  hashtags: string[]
  author: { username: string; nickname?: string; avatar?: string }
  duration?: number
  sound?: { title: string; artist?: string; album?: string }
}

type ProviderResult = TikTokMedia & { provider: string }

const emptyMedia: TikTokMedia = {
  nowatermarkUrl: "",
  watermarkUrl: "",
  audioUrl: "",
  thumbnail: "",
  caption: "",
  hashtags: [],
  author: { username: "" }
}

function extractHashtags(text: string) {
  return (text.match(/#[\w-]+/g) ?? []).filter(Boolean)
}

async function fetchJson(url: string) {
  const res = await fetch(url, { headers: { "Content-Type": "application/json" } })
  if (!res.ok) throw new Error(`Request failed ${res.status}`)
  return res.json() as Promise<Record<string, any>>
}

function normalize(data: Record<string, any>, provider: string): ProviderResult {
  const caption = data.desc || data.caption || data.title || ""
  const hashtags = extractHashtags(caption)
  return {
    provider,
    nowatermarkUrl:
      data.nowm || data.nowatermark || data.play_url || data.video?.play_url || data.data?.play || data.data?.playUrl || "",
    watermarkUrl:
      data.wmplay || data.watermark || data.wmplay_url || data.wmplayUrl || data.video?.wmplay_url || data.data?.wmplay || "",
    audioUrl: data.music || data.music_url || data.musicUrl || data.audio || data.data?.music || "",
    thumbnail:
      data.cover || data.cover_hd || data.coverUrl || data.cover_url || data.thumbnail || data.data?.cover || data.video?.cover || "",
    caption,
    hashtags,
    author: {
      username: data.author?.unique_id || data.author?.uniqueId || data.author || data.creator || "",
      nickname: data.author?.nickname,
      avatar: data.author?.avatar || data.author?.avatarThumb || data.author?.avatarThumbHd
    },
    duration: Number(data.duration ?? data.video?.duration ?? 0) || undefined,
    sound: data.music_info || data.sound
      ? {
          title: data.music_info?.title || data.sound?.title || data.music_title || "",
          artist: data.music_info?.author || data.sound?.author || data.music_author || "",
          album: data.music_info?.album || data.sound?.album
        }
      : undefined
  }
}

async function fromTikMate(url: string): Promise<ProviderResult> {
  if (!process.env.TIKMATE_API_URL) throw new Error("TIKMATE_API_URL missing")
  const data = await fetchJson(`${process.env.TIKMATE_API_URL}?url=${encodeURIComponent(url)}`)
  const normalized = normalize({
    nowm: data?.video?.play_url || data?.play_url,
    wmplay: data?.video?.wmplay_url || data?.wmplay_url,
    music: data?.music_url || data?.music?.url,
    cover: data?.cover_url || data?.video?.cover,
    desc: data?.desc,
    author: data?.author,
    duration: data?.duration,
    music_info: data?.music
  }, "tikmate")
  return normalized
}

async function fromTikwm(url: string): Promise<ProviderResult> {
  if (!process.env.TIKWM_API_URL) throw new Error("TIKWM_API_URL missing")
  const data = await fetchJson(`${process.env.TIKWM_API_URL}?url=${encodeURIComponent(url)}`)
  const payload = data?.data ?? data
  const normalized = normalize({
    nowm: payload?.play || payload?.play_url,
    wmplay: payload?.wmplay || payload?.wmplay_url,
    music: payload?.music || payload?.music_url,
    cover: payload?.cover || payload?.cover_hd,
    desc: payload?.title || payload?.desc,
    author: payload?.author,
    duration: payload?.duration,
    music_info: payload?.music_info
  }, "tikwm")
  return normalized
}

async function fromTTSave(url: string): Promise<ProviderResult> {
  if (!process.env.TTSAVE_API_URL) throw new Error("TTSAVE_API_URL missing")
  const data = await fetchJson(`${process.env.TTSAVE_API_URL}?url=${encodeURIComponent(url)}`)
  const payload = data?.data ?? data
  const normalized = normalize({
    nowm: payload?.play || payload?.nowm,
    wmplay: payload?.wmplay,
    music: payload?.music,
    cover: payload?.cover,
    desc: payload?.desc || payload?.title,
    author: payload?.author,
    duration: payload?.duration,
    music_info: payload?.music_info
  }, "ttsave")
  return normalized
}

export async function getVideoInfo(tiktokUrl: string): Promise<ProviderResult> {
  const providers = [fromTikMate, fromTikwm, fromTTSave]
  for (const provider of providers) {
    try {
      const result = await provider(tiktokUrl)
      if (result.nowatermarkUrl || result.watermarkUrl) {
        return result
      }
    } catch (err) {
      console.warn("Provider failed", err)
      continue
    }
  }
  return { ...emptyMedia, provider: "fallback" }
}

export async function buildThumbnailFrames(thumbnail: string) {
  const frames = Array.from({ length: 5 }).map((_, idx) => ({
    url: thumbnail ? `${thumbnail}&frame=${idx}` : `https://picsum.photos/seed/frame-${idx}/600/900`,
    score: 0.7 + idx * 0.02
  }))
  const best = frames[0]
  const variants = {
    square: thumbnail ? `${thumbnail}?tr=w_600,h_600,c_fill` : frames[0].url,
    portrait: thumbnail ? `${thumbnail}?tr=w_720,h_1280,c_fill` : frames[1].url,
    landscape: thumbnail ? `${thumbnail}?tr=w_1280,h_720,c_fill` : frames[2].url
  }
  return { best, frames, variants }
}
