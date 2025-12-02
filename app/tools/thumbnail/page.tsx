'use client'

import { useState } from 'react'
import { Image as ImageIcon, Loader2 } from 'lucide-react'

export default function ThumbnailPage() {
  const [url, setUrl] = useState('')
  const [frames, setFrames] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const run = async () => {
    setLoading(true)
    const res = await fetch('/api/thumbnail/generate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url }) })
    setFrames(await res.json())
    setLoading(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <ImageIcon className="w-5 h-5" />
        <div>
          <p className="text-sm text-slate-300">Best frame detection</p>
          <h1 className="text-3xl font-bold">Thumbnail enhancer</h1>
        </div>
      </div>
      <div className="glass p-4 rounded-2xl border border-white/10 space-y-3">
        <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="TikTok video URL" className="w-full glass p-2 rounded-xl" />
        <button onClick={run} className="px-4 py-2 rounded-xl bg-white/10 flex items-center gap-2">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Scan frames'}
        </button>
        {frames && (
          <div className="space-y-3">
            <p className="text-sm">Best frame</p>
            <img src={frames.best.url} className="w-full rounded-xl" />
            <div className="grid sm:grid-cols-3 gap-2">
              {frames.frames.map((f: any) => (
                <img key={f.url} src={f.url} className="rounded-xl" />
              ))}
            </div>
            <div className="text-xs text-slate-400">Variants: {Object.values(frames.variants).join(', ')}</div>
          </div>
        )}
      </div>
    </div>
  )
}
