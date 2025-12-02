import { TikTokMedia } from '../lib/tiktok'

export function exportAsJSON(data: TikTokMedia) {
  return JSON.stringify(data, null, 2)
}

export function exportAsTXT(data: TikTokMedia) {
  const sound = data.sound ? `${data.sound.title} - ${data.sound.artist}` : 'Unknown'
  return `${data.caption}\nHashtags: ${data.hashtags.join(' ')}\nSound: ${sound}`
}

export function exportHashtags(data: TikTokMedia) {
  return data.hashtags.join(' ')
}

export function exportSongInfo(data: TikTokMedia) {
  if (!data.sound) return 'Unknown sound'
  return `${data.sound.title} · ${data.sound.artist} (${data.sound.album ?? 'Single'})`
}

export function exportCSV(data: TikTokMedia) {
  const headers = ['caption', 'hashtags', 'sound', 'author', 'duration']
  const row = [
    JSON.stringify(data.caption),
    JSON.stringify(data.hashtags.join(' ')),
    JSON.stringify(exportSongInfo(data)),
    JSON.stringify(`${data.author.username} (${data.author.nickname})`),
    data.duration
  ]
  return `${headers.join(',')}\n${row.join(',')}`
}
