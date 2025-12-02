export type CaptionStyles = 'aesthetic' | 'formal' | 'funny' | 'viral'

export async function extractCaption(raw: string) {
  return raw.trim()
}

export async function cleanCaption(raw: string) {
  return raw.replace(/[#@][\w-]+/g, '').replace(/\s+/g, ' ').trim()
}

export async function summarizeCaption(raw: string) {
  return `Summary: ${cleanCaption(raw)}`
}

export async function rewriteCaption(raw: string, style: CaptionStyles) {
  const base = await cleanCaption(raw)
  const styles: Record<CaptionStyles, string> = {
    aesthetic: `${base} ✨ curated with soft vibes`,
    formal: `Formal: ${base}`,
    funny: `${base} 😂`,
    viral: `🚀 ${base} | tap to watch`
  }
  return styles[style]
}

export async function translateCaption(raw: string, target: 'en' | 'id') {
  return `[${target}] ${await cleanCaption(raw)}`
}

export async function detectMusicFromLLM(raw: string) {
  return { guess: 'LLM-detected vibe', confidence: 0.64 }
}
