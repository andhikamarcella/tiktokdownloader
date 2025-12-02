'use client'

import { useState } from 'react'
import { Loader2, Sparkles } from 'lucide-react'

export default function CaptionAIPage() {
  const [caption, setCaption] = useState('')
  const [style, setStyle] = useState('viral')
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const run = async () => {
    setLoading(true)
    setError(null)
    try {
      const [clean, summarize, rewrite, translate] = await Promise.all([
        fetch('/api/ai/clean', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ caption }) }).then((r) => r.json()),
        fetch('/api/ai/summarize', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ caption }) }).then((r) => r.json()),
        fetch('/api/ai/rewrite', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ caption, style }) }).then((r) => r.json()),
        fetch('/api/ai/translate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ caption, target: 'en' }) }).then((r) => r.json())
      ])
      setResult({ cleaned: clean.cleaned, summary: summarize.summary, rewritten: rewrite.rewritten, translated: translate.translated })
    } catch (err: unknown) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Sparkles className="w-5 h-5" />
        <div>
          <p className="text-sm text-slate-300">Extract, clean, summarize, rewrite, translate</p>
          <h1 className="text-3xl font-bold">Caption AI</h1>
        </div>
      </div>
      <div className="glass p-4 rounded-2xl border border-white/10 space-y-3">
        <textarea value={caption} onChange={(e) => setCaption(e.target.value)} className="w-full glass p-3 rounded-xl" rows={5} placeholder="Paste caption from TikTok" />
        <select value={style} onChange={(e) => setStyle(e.target.value)} className="glass p-2 rounded-xl">
          <option value="aesthetic">Aesthetic</option>
          <option value="formal">Formal</option>
          <option value="funny">Funny</option>
          <option value="viral">Viral</option>
        </select>
        <button onClick={run} className="px-4 py-2 rounded-xl bg-white/10 flex items-center gap-2" disabled={loading}>
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Run AI'}
        </button>
        {error && <p className="text-sm text-rose-300">{error}</p>}
        {result && (
          <div className="grid sm:grid-cols-2 gap-2 text-sm">
            <div className="glass neu p-3 rounded-xl">
              <p className="text-xs text-slate-400">Cleaned</p>
              <p>{result.cleaned}</p>
            </div>
            <div className="glass neu p-3 rounded-xl">
              <p className="text-xs text-slate-400">Summary</p>
              <p>{result.summary}</p>
            </div>
            <div className="glass neu p-3 rounded-xl">
              <p className="text-xs text-slate-400">Rewrite</p>
              <p>{result.rewritten}</p>
            </div>
            <div className="glass neu p-3 rounded-xl">
              <p className="text-xs text-slate-400">Translated</p>
              <p>{result.translated}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
