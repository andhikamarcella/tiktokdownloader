export type CaptionStyle = "aesthetic" | "formal" | "funny" | "viral"

async function callGroq(system: string, prompt: string) {
  if (!process.env.GROQ_API_KEY) return null
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`
    },
    body: JSON.stringify({
      model: "mixtral-8x7b-32768",
      messages: [
        { role: "system", content: system },
        { role: "user", content: prompt }
      ],
      temperature: 0.4
    })
  })
  if (!res.ok) return null
  const json = (await res.json()) as { choices?: { message?: { content?: string } }[] }
  return json.choices?.[0]?.message?.content?.trim() ?? null
}

async function callGemini(prompt: string) {
  if (!process.env.GEMINI_API_KEY) return null
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    }
  )
  if (!res.ok) return null
  const json = (await res.json()) as { candidates?: { content?: { parts?: { text?: string }[] } }[] }
  const candidate = json.candidates?.[0]?.content?.parts?.[0]?.text
  return candidate?.trim() ?? null
}

export async function cleanCaption(text: string) {
  const cleaned = text.replace(/[#@][\w-]+/g, "").replace(/\s+/g, " ").trim()
  const ai = await callGroq("Clean hashtags and mentions", cleaned)
  return ai ?? cleaned
}

export async function summarizeCaption(text: string) {
  const clean = await cleanCaption(text)
  const groq = await callGroq("Summarize this TikTok caption for metadata", clean)
  if (groq) return groq
  const gemini = await callGemini(`Summarize briefly: ${clean}`)
  return gemini ?? `Summary: ${clean}`
}

export async function rewriteCaption(text: string, style: CaptionStyle) {
  const clean = await cleanCaption(text)
  const prompt = `Rewrite this TikTok caption in ${style} style with 1-2 sentences: ${clean}`
  const groq = await callGroq("Rewrite captions", prompt)
  if (groq) return groq
  const gemini = await callGemini(prompt)
  return gemini ?? `${clean} (${style})`
}

export async function translateCaption(text: string, target: "en" | "id") {
  const clean = await cleanCaption(text)
  const prompt = `Translate to ${target.toUpperCase()} while keeping emojis: ${clean}`
  const groq = await callGroq("Translate caption", prompt)
  if (groq) return groq
  const gemini = await callGemini(prompt)
  return gemini ?? `[${target}] ${clean}`
}

export async function buildCaptionSuite(text: string) {
  const [cleaned, summary, aesthetic, formal, funny, viral, en, id] = await Promise.all([
    cleanCaption(text),
    summarizeCaption(text),
    rewriteCaption(text, "aesthetic"),
    rewriteCaption(text, "formal"),
    rewriteCaption(text, "funny"),
    rewriteCaption(text, "viral"),
    translateCaption(text, "en"),
    translateCaption(text, "id")
  ])

  return { cleaned, summary, aesthetic, formal, funny, viral, en, id }
}
