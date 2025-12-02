'use client'

import { useState } from 'react'
import { Loader2, Repeat } from 'lucide-react'

const formats = [
  { value: 'webm', label: 'MP4 → WebM' },
  { value: 'gif', label: 'MP4 → GIF' },
  { value: '60fps', label: '60FPS AI-interpolated' },
  { value: 'livephoto', label: 'MP4 → Live Photo' }
]

export default function ConvertPage() {
  const [file, setFile] = useState<File | null>(null)
  const [format, setFormat] = useState('webm')
  const [loading, setLoading] = useState(false)
  const [output, setOutput] = useState<string>('')

  const handleConvert = async () => {
    if (!file) return
    setLoading(true)
    const form = new FormData()
    form.append('action', 'convert')
    form.append('format', format)
    form.append('file', file)
    const res = await fetch('/api/tools', { method: 'POST', body: form })
    const blob = await res.blob()
    setOutput(URL.createObjectURL(blob))
    setLoading(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Repeat className="w-5 h-5" />
        <div>
          <p className="text-sm text-slate-300">Convert formats with ffmpeg-wasm</p>
          <h1 className="text-3xl font-bold">Convert</h1>
        </div>
      </div>
      <div className="glass p-4 rounded-2xl border border-white/10 space-y-3">
        <input type="file" accept="video/mp4" onChange={(e) => setFile(e.target.files?.[0] || null)} />
        <select value={format} onChange={(e) => setFormat(e.target.value)} className="glass p-2 rounded-xl">
          {formats.map((f) => (
            <option key={f.value} value={f.value}>{f.label}</option>
          ))}
        </select>
        <button onClick={handleConvert} className="px-4 py-2 rounded-xl bg-white/10 flex items-center gap-2">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Convert'}
        </button>
        {output && <video src={output} controls className="w-full rounded-xl" />}
      </div>
    </div>
  )
}
